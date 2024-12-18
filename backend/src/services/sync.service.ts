import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { File } from "../entities/file.entity";
import { FileService } from "./file.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private fileService: FileService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePendingSync() {
    this.logger.log("Starting sync process for pending files...");

    const pendingFiles = await this.fileRepository.find({
      where: {
        syncStatus: "pending",
        lastSyncAttempt: LessThan(new Date(Date.now() - 5 * 60 * 1000)), // Files not attempted in last 5 minutes
      },
      relations: ["user"],
    });

    for (const file of pendingFiles) {
      try {
        await this.syncFile(file);
      } catch (error) {
        this.logger.error(`Failed to sync file ${file.id}: ${error.message}`);

        await this.fileRepository.update(file.id, {
          syncStatus: "failed",
          lastSyncAttempt: new Date(),
        });
      }
    }
  }

  private async syncFile(file: File) {
    try {
      // If file has localPath, upload it to S3
      if (file.localPath) {
        const uploadedFile = await this.fileService.uploadFileFromPath(
          file.localPath,
          file.user.id
        );

        await this.fileRepository.update(file.id, {
          path: uploadedFile.path,
          syncStatus: "synced",
          isSync: true,
          lastSyncAttempt: new Date(),
        });
      }
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async markForSync(fileId: string) {
    await this.fileRepository.update(fileId, {
      syncStatus: "pending",
      lastSyncAttempt: null,
    });
  }
}
