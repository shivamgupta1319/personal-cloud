import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { User } from "./entities/user.entity";
import { File } from "./entities/file.entity";
import { SyncService } from "./services/sync.service";
import { FileService } from "./services/file.service";
import { FileController } from "./controllers/file.controller";
import { SyncController } from "./controllers/sync.controller";
import { FileModule } from "./file/file.module";
import { LoggingModule } from "./logging/logging.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggingModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [User, File],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    FileModule,
    TypeOrmModule.forFeature([File]),
  ],
  controllers: [FileController, SyncController],
  providers: [FileService, SyncService],
})
export class AppModule {}
