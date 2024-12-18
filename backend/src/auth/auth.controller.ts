import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoggingService } from "../services/logging.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private loggingService: LoggingService
  ) {}

  @Post("/signup")
  async signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto
  ): Promise<void> {
    this.loggingService.log(
      `Signup attempt for user: ${authCredentialsDto.email}`,
      "AuthController"
    );
    try {
      await this.authService.signUp(authCredentialsDto);
      this.loggingService.log(
        `Successful signup for user: ${authCredentialsDto.email}`,
        "AuthController"
      );
    } catch (error) {
      this.loggingService.error(
        `Signup failed for user: ${authCredentialsDto.email}`,
        error.stack,
        "AuthController"
      );
      throw error;
    }
  }

  @Post("/signin")
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto
  ): Promise<{ accessToken: string }> {
    this.loggingService.log(
      `Signin attempt for user: ${authCredentialsDto.email}`,
      "AuthController"
    );
    try {
      const result = await this.authService.signIn(authCredentialsDto);
      this.loggingService.log(
        `Successful signin for user: ${authCredentialsDto.email}`,
        "AuthController"
      );
      return result;
    } catch (error) {
      this.loggingService.error(
        `Signin failed for user: ${authCredentialsDto.email}`,
        error.stack,
        "AuthController"
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/me")
  getProfile(@Request() req) {
    this.loggingService.log(
      `Profile request for user: ${req.user.email}`,
      "AuthController"
    );
    return req.user;
  }
}
