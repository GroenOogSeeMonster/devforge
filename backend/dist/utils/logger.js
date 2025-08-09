"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLog = exports.databaseLog = exports.performanceLog = exports.securityLog = exports.auditLog = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const config_1 = require("../config/config");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
const transports = [];
transports.push(new winston_1.default.transports.Console({
    level: config_1.config.development.debug ? 'debug' : 'info',
    format: consoleFormat,
}));
transports.push(new winston_daily_rotate_file_1.default({
    filename: config_1.config.logging.logFile,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: config_1.config.logging.level,
    format: logFormat,
}));
transports.push(new winston_daily_rotate_file_1.default({
    filename: config_1.config.logging.auditLogFile,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info',
    format: logFormat,
}));
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    format: logFormat,
    transports,
    exitOnError: false,
});
exports.logger.exceptions.handle(new winston_daily_rotate_file_1.default({
    filename: './logs/exceptions.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
}));
exports.logger.rejections.handle(new winston_daily_rotate_file_1.default({
    filename: './logs/rejections.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
}));
const auditLog = (action, userId, details) => {
    exports.logger.info('AUDIT', {
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
exports.auditLog = auditLog;
const securityLog = (event, details) => {
    exports.logger.warn('SECURITY', {
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
exports.securityLog = securityLog;
const performanceLog = (operation, duration, details) => {
    exports.logger.info('PERFORMANCE', {
        operation,
        duration,
        timestamp: new Date().toISOString(),
        userId: details?.userId,
        resource: details?.resource,
        success: details?.success,
        error: details?.error,
    });
};
exports.performanceLog = performanceLog;
const databaseLog = (operation, query, duration, details) => {
    exports.logger.debug('DATABASE', {
        operation,
        query,
        duration,
        timestamp: new Date().toISOString(),
        table: details?.table,
        rows: details?.rows,
        error: details?.error,
    });
};
exports.databaseLog = databaseLog;
const apiLog = (method, path, statusCode, duration, details) => {
    const level = statusCode >= 400 ? 'warn' : 'info';
    exports.logger.log(level, 'API', {
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
exports.apiLog = apiLog;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map