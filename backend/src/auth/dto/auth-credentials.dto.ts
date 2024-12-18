import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class AuthCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
