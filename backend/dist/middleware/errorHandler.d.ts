import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
    details?: any;
}
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class ValidationError extends CustomError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends CustomError {
    constructor(message?: string);
}
export declare class AuthorizationError extends CustomError {
    constructor(message?: string);
}
export declare class NotFoundError extends CustomError {
    constructor(message?: string);
}
export declare class ConflictError extends CustomError {
    constructor(message?: string);
}
export declare class RateLimitError extends CustomError {
    constructor(message?: string);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requestTimer: (req: Request, _res: Response, next: NextFunction) => void;
export declare const setupGlobalErrorHandlers: () => void;
export declare const formatValidationError: (errors: any[]) => ValidationError;
export declare const handleDatabaseError: (error: any) => CustomError;
export declare const handleJWTError: (error: any) => AuthenticationError;
//# sourceMappingURL=errorHandler.d.ts.map