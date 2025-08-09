import { Request, Response, NextFunction } from 'express';
import { logger, apiLog } from '@utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: any;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error classes
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const startTime = (req as any).startTime || Date.now();
  const duration = Date.now() - startTime;

  // Log the error
  logger.error('Error occurred:', {
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

  // Log API request with error
  apiLog(req.method, req.path, error.statusCode || 500, duration, {
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: error.message,
  });

  // Determine status code
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  // Create error response
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

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Not found handler middleware
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  
  logger.warn('Route not found:', {
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

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request timing middleware
export const requestTimer = (req: Request, _res: Response, next: NextFunction): void => {
  (req as any).startTime = Date.now();
  next();
};

// Global error handlers for uncaught exceptions
export const setupGlobalErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    // Gracefully shutdown the server
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection:', {
      reason: reason instanceof Error ? {
        message: reason.message,
        stack: reason.stack,
      } : reason,
      promise: promise.toString(),
    });

    // Gracefully shutdown the server
    process.exit(1);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Handle SIGINT
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

// Validation error formatter
export const formatValidationError = (errors: any[]): ValidationError => {
  const details = errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value,
  }));

  return new ValidationError('Validation failed', details);
};

// Database error handler
export const handleDatabaseError = (error: any): CustomError => {
  // PostgreSQL specific error handling
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return new ConflictError('Resource already exists');
      case '23503': // foreign_key_violation
        return new ValidationError('Referenced resource does not exist');
      case '23502': // not_null_violation
        return new ValidationError('Required field is missing');
      case '23514': // check_violation
        return new ValidationError('Field value violates constraint');
      case '42P01': // undefined_table
        return new NotFoundError('Database table not found');
      case '42703': // undefined_column
        return new ValidationError('Database column not found');
      default:
        return new CustomError('Database error occurred', 500, 'DATABASE_ERROR');
    }
  }

  return new CustomError('Database error occurred', 500, 'DATABASE_ERROR');
};

// JWT error handler
export const handleJWTError = (error: any): AuthenticationError => {
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

// Export error classes and utilities (classes are already exported above)
