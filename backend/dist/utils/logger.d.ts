import winston from 'winston';
export declare const logger: winston.Logger;
export declare const auditLog: (action: string, userId?: string, details?: any) => void;
export declare const securityLog: (event: string, details?: any) => void;
export declare const performanceLog: (operation: string, duration: number, details?: any) => void;
export declare const databaseLog: (operation: string, query?: string, duration?: number, details?: any) => void;
export declare const apiLog: (method: string, path: string, statusCode: number, duration: number, details?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map