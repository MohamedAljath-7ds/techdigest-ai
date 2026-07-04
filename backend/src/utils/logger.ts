import winston from 'winston';
import { PrismaClient, LogLevel } from '@prisma/client';

export const prisma = new PrismaClient();

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [new winston.transports.Console()],
});

export async function persistLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  logger.log(level.toLowerCase(), message, context);
  try {
    await prisma.appLog.create({
      data: { level, message, context: context ? (context as object) : undefined },
    });
  } catch {
    // Avoid recursive logging failures
  }
}
