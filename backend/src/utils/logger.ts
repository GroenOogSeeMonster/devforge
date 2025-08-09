import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@config/config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: config.development.debug ? 'debug' : 'info',
    format: consoleFormat,
  })
);

// File transport for general logs
transports.push(
  new DailyRotateFile({
    filename: config.logging.logFile,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: config.logging.level,
    format: logFormat,
  })
);

// File transport for audit logs
transports.push(
  new DailyRotateFile({
    filename: config.logging.auditLogFile,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info',
    format: logFormat,
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new DailyRotateFile({
    filename: './logs/exceptions.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new DailyRotateFile({
    filename: './logs/rejections.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  })
);

// Audit logging function
export const auditLog = (action: string, userId?: string, details?: any) => {
  logger.info('AUDIT', {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ip: details?.ip,
    userAgent: details?.userAgent,
    resource: details?.resource,
    resourceId: details?.resourceId,
    success: details?.success,
    error: details?.error,
  });
};

// Security logging function
export const securityLog = (event: string, details?: any) => {
  logger.warn('SECURITY', {
    event,
    timestamp: new Date().toISOString(),
    ip: details?.ip,
    userAgent: details?.userAgent,
    userId: details?.userId,
    action: details?.action,
    resource: details?.resource,
    severity: details?.severity || 'medium',
    blocked: details?.blocked || false,
  });
};

// Performance logging function
export const performanceLog = (operation: string, duration: number, details?: any) => {
  logger.info('PERFORMANCE', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    userId: details?.userId,
    resource: details?.resource,
    success: details?.success,
    error: details?.error,
  });
};

// Database logging function
export const databaseLog = (operation: string, query?: string, duration?: number, details?: any) => {
  logger.debug('DATABASE', {
    operation,
    query,
    duration,
    timestamp: new Date().toISOString(),
    table: details?.table,
    rows: details?.rows,
    error: details?.error,
  });
};

// API logging function
export const apiLog = (method: string, path: string, statusCode: number, duration: number, details?: any) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  
  logger.log(level, 'API', {
    method,
    path,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
    userId: details?.userId,
    ip: details?.ip,
    userAgent: details?.userAgent,
    error: details?.error,
  });
};

// Export logger instance and utility functions
export default logger;
