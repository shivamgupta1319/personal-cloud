import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FileService } from "../services/file.service";

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  @Get()
  async getUserFiles(@Request() req) {
    return this.fileService.getUserFiles(req.user.id);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.fileService.uploadFile(file, req.user.id);
  }

  @Delete(":id")
  async deleteFile(@Param("id") id: string, @Request() req) {
    return this.fileService.deleteFile(id, req.user.id);
  }
}
