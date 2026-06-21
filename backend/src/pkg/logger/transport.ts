import path from "path";
import { createLogger, format, transports, Logger } from "winston";
import "winston-daily-rotate-file";

const SERVICE_NAME = process.env.SERVICE_NAME ?? "spending-tracker";

export function createLogTransport(): Logger {
  const logsDir = path.join(process.cwd(), "logs");

  const dailyRotate = new (transports as any).DailyRotateFile({
    filename: path.join(logsDir, `${SERVICE_NAME}-output-%DATE%.log`),
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxFiles: "7d",
    maxSize: "20m",
  });

  return createLogger({
    level: "debug",
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [
      dailyRotate,
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
        level: "debug",
      }),
    ],
    handleExceptions: true,
  });
}
