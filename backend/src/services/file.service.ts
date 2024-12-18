import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { File } from "../entities/file.entity";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";
import { Multer } from "multer";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface FileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

@Injectable()
export class FileService {
  private s3Client: S3Client;
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });

    this.uploadDir = path.join(process.cwd(), "uploads");
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      throw new Error("Failed to create upload directory");
    }
  }

  private determineCategory(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("powerpoint") ||
      mimeType.includes("msword") ||
      mimeType.includes("officedocument") ||
      mimeType.includes("text/plain") ||
      mimeType.includes("application/vnd.openxmlformats-officedocument")
    ) {
      return "document";
    }
    return "other";
  }

  async generateSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get("AWS_S3_BUCKET"),
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async uploadFile(
    file: FileType,
    userId: string,
    offlineMode = false
  ): Promise<File> {
    const category = this.determineCategory(file.mimetype);

    if (offlineMode) {
      return this.saveLocally(file, userId, category);
    }

    return this.uploadToS3(file, userId, category);
  }

  private async saveLocally(
    file: FileType,
    userId: string,
    category: string
  ): Promise<File> {
    const filename = `${Date.now()}-${file.originalname}`;
    const localPath = path.join(this.uploadDir, filename);

    await fs.writeFile(localPath, file.buffer);

    const fileEntity = this.fileRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      localPath,
      category,
      syncStatus: "pending",
      isSync: false,
      user: { id: userId },
    });

    return this.fileRepository.save(fileEntity);
  }

  private async uploadToS3(
    file: FileType,
    userId: string,
    category: string
  ): Promise<File> {
    const key = `${userId}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get("AWS_S3_BUCKET"),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const signedUrl = await this.generateSignedUrl(key);

    const fileEntity = this.fileRepository.create({
      filename: key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: signedUrl,
      category,
      syncStatus: "synced",
      isSync: true,
      user: { id: userId },
    });

    return this.fileRepository.save(fileEntity);
  }

  async uploadFileFromPath(localPath: string, userId: string): Promise<File> {
    const fileBuffer = await fs.readFile(localPath);
    const filename = path.basename(localPath);

    const file: FileType = {
      fieldname: "file",
      originalname: filename,
      encoding: "7bit",
      mimetype: "application/octet-stream",
      size: (await fs.stat(localPath)).size,
      buffer: fileBuffer,
    };

    return this.uploadToS3(file, userId, this.determineCategory(file.mimetype));
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, user: { id: userId } },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.path) {
      const key = file.filename;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get("AWS_S3_BUCKET"),
          Key: key,
        })
      );
    }

    if (file.localPath) {
      try {
        await fs.unlink(file.localPath);
      } catch (error) {
        console.error("Error deleting local file:", error);
      }
    }

    await this.fileRepository.remove(file);
  }
}
