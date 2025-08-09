import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
            project?: any;
            membership?: any;
        }
    }
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export declare class AuthMiddleware {
    static verifyToken(token: string): Promise<JWTPayload>;
    static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    static requireRole: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void;
    static requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static requireUserOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
    static requireProjectAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static rateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static logout: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireUserOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireProjectAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const verifyToken: typeof AuthMiddleware.verifyToken;
export declare const generateToken: typeof AuthMiddleware.generateToken;
export declare const generateRefreshToken: typeof AuthMiddleware.generateRefreshToken;
export declare const hashPassword: typeof AuthMiddleware.hashPassword;
export declare const comparePassword: typeof AuthMiddleware.comparePassword;
//# sourceMappingURL=authMiddleware.d.ts.map