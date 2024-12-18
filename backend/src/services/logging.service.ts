import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LoggingService {
  private logger = new Logger("AppLogger");
  private logDir = path.join(process.cwd(), "logs");
  private logFile = path.join(this.logDir, "app.log");

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
    this.writeToFile(`[INFO] [${context || "App"}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
    this.writeToFile(
      `[ERROR] [${context || "App"}] ${message}\n${trace || ""}`
    );
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
    this.writeToFile(`[WARN] [${context || "App"}] ${message}`);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
    this.writeToFile(`[DEBUG] [${context || "App"}] ${message}`);
  }
}
