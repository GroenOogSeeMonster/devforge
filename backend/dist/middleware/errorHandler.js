"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJWTError = exports.handleDatabaseError = exports.formatValidationError = exports.setupGlobalErrorHandlers = exports.requestTimer = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.CustomError = void 0;
const logger_1 = require("../utils/logger");
class CustomError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends CustomError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends CustomError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitError = RateLimitError;
const errorHandler = (error, req, res, _next) => {
    const startTime = req.startTime || Date.now();
    const duration = Date.now() - startTime;
    logger_1.logger.error('Error occurred:', {
        error: {
            message: error.message,
            stack: error.stack,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details,
        },
        request: {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
        },
        duration,
    });
    (0, logger_1.apiLog)(req.method, req.path, error.statusCode || 500, duration, {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message,
    });
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const errorResponse = {
        success: false,
        error: {
            code,
            message: error.message || 'An unexpected error occurred',
            ...(error.details && { details: error.details }),
            ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    logger_1.logger.warn('Route not found:', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: error.message,
        },
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const requestTimer = (req, _res, next) => {
    req.startTime = Date.now();
    next();
};
exports.requestTimer = requestTimer;
const setupGlobalErrorHandlers = () => {
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught Exception:', {
            error: {
                message: error.message,
                stack: error.stack,
            },
        });
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.logger.error('Unhandled Rejection:', {
            reason: reason instanceof Error ? {
                message: reason.message,
                stack: reason.stack,
            } : reason,
            promise: promise.toString(),
        });
        process.exit(1);
    });
    process.on('SIGTERM', () => {
        logger_1.logger.info('SIGTERM received, shutting down gracefully');
        process.exit(0);
    });
    process.on('SIGINT', () => {
        logger_1.logger.info('SIGINT received, shutting down gracefully');
        process.exit(0);
    });
};
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
const formatValidationError = (errors) => {
    const details = errors.map(error => ({
        field: error.path,
        message: error.message,
        value: error.value,
    }));
    return new ValidationError('Validation failed', details);
};
exports.formatValidationError = formatValidationError;
const handleDatabaseError = (error) => {
    if (error.code) {
        switch (error.code) {
            case '23505':
                return new ConflictError('Resource already exists');
            case '23503':
                return new ValidationError('Referenced resource does not exist');
            case '23502':
                return new ValidationError('Required field is missing');
            case '23514':
                return new ValidationError('Field value violates constraint');
            case '42P01':
                return new NotFoundError('Database table not found');
            case '42703':
                return new ValidationError('Database column not found');
            default:
                return new CustomError('Database error occurred', 500, 'DATABASE_ERROR');
        }
    }
    return new CustomError('Database error occurred', 500, 'DATABASE_ERROR');
};
exports.handleDatabaseError = handleDatabaseError;
const handleJWTError = (error) => {
    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Invalid token');
    }
    if (error.name === 'NotBeforeError') {
        return new AuthenticationError('Token not active');
    }
    return new AuthenticationError('Token verification failed');
};
exports.handleJWTError = handleJWTError;
//# sourceMappingURL=errorHandler.js.map