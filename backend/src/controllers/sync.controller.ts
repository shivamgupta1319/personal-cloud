import { Controller, Post, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SyncService } from "../services/sync.service";

@Controller("sync")
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post(":fileId")
  async syncFile(@Param("fileId") fileId: string) {
    return this.syncService.markForSync(fileId);
  }
}
