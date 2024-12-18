import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { File } from "./file.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => File, (file) => file.user)
  files: File[];
}
