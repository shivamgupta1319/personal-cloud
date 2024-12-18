import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileController } from "../controllers/file.controller";
import { FileService } from "../services/file.service";
import { File } from "../entities/file.entity";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
