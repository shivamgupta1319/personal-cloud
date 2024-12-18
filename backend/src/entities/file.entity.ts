import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ default: false })
  isSync: boolean;

  @Column({ nullable: true })
  localPath: string;

  @Column({
    type: "enum",
    enum: ["document", "image", "video", "audio", "other"],
  })
  category: string;

  @Column({ default: "pending" })
  syncStatus: "pending" | "synced" | "failed";

  @Column({ nullable: true })
  lastSyncAttempt: Date;

  @ManyToOne(() => User, (user) => user.files)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
