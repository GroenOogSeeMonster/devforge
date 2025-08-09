import { Request, Response, NextFunction } from 'express';
import { sign, verify, decode, Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@config/config';
import { logger, securityLog } from '@utils/logger';
import { databaseService } from '@services/DatabaseService';
import { UserRow, ProjectRow, ProjectMemberRow } from '@db/db';
import { redisService } from '@services/RedisService';

// Extend Express Request interface to include user
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

export class AuthMiddleware {
  // Verify JWT token
  public static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const secret: Secret = config.auth.jwtSecret as Secret;
      const decoded = verify(token, secret) as JwtPayload as JWTPayload;
      
      // Check if token is blacklisted
      const isBlacklisted = await redisService.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new Error('Token is blacklisted');
      }

      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  // Generate JWT token
  public static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret: Secret = config.auth.jwtSecret as Secret;
    const options: SignOptions = { expiresIn: config.auth.jwtExpiresIn as any };
    return sign(payload as any, secret, options);
  }

  // Generate refresh token
  public static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret: Secret = config.auth.jwtSecret as Secret;
    const options: SignOptions = { expiresIn: config.auth.jwtRefreshExpiresIn as any };
    return sign(payload as any, secret, options);
  }

  // Hash password
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.auth.bcryptRounds);
  }

  // Compare password
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Main authentication middleware
  public static authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        securityLog('authentication_failed', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          reason: 'Missing or invalid authorization header',
        });
        
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Access token required',
          },
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await AuthMiddleware.verifyToken(token);

      // Get user from database
      const user = await databaseService.findOne<UserRow>('users', { id: decoded.userId });
      
      if (!user || !user.is_active) {
        securityLog('authentication_failed', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: decoded.userId,
          reason: 'User not found or inactive',
        });

        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found or inactive',
          },
        });
        return;
      }

      // Add user to request
      req.user = user;
      req.token = token;

      securityLog('authentication_success', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user.id,
        email: user.email,
      });

      next();
    } catch (error) {
      securityLog('authentication_failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reason: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }
  };

  // Optional authentication middleware (doesn't fail if no token)
  public static optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await AuthMiddleware.verifyToken(token);

      // Get user from database
      const user = await databaseService.findOne<UserRow>('users', { id: decoded.userId });
      
      if (user && user.is_active) {
        req.user = user;
        req.token = token;
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  // Role-based access control middleware
  public static requireRole = (roles: string | string[]) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        securityLog('authorization_failed', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          resource: req.path,
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        });
        return;
      }

      next();
    };
  };

  // Admin only middleware
  public static requireAdmin = AuthMiddleware.requireRole('admin');

  // User or admin middleware
  public static requireUserOrAdmin = AuthMiddleware.requireRole(['user', 'admin']);

  // Project ownership middleware
  public static requireProjectAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params['projectId'];
      
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Project ID required',
          },
        });
        return;
      }

      // Check if user is project owner or member
      const project = await databaseService.findOne<ProjectRow>('projects', { id: projectId });
      
      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      // Admin can access all projects
      if (req.user.role === 'admin') {
        req.project = project;
        next();
        return;
      }

      // Check if user is project owner
      if (project.owner_id === req.user.id) {
        req.project = project;
        next();
        return;
      }

      // Check if user is project member
      const membership = await databaseService.findOne<ProjectMemberRow>('project_members', {
        project_id: projectId,
        user_id: req.user.id,
      });

      if (membership) {
        req.project = project;
        req.membership = membership;
        next();
        return;
      }

      securityLog('project_access_denied', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user.id,
        projectId,
        reason: 'Not owner or member',
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to project',
        },
      });
    } catch (error) {
      logger.error('Project access check failed:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify project access',
        },
      });
    }
  };

  // Rate limiting middleware
  public static rateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `rate_limit:${req.ip}:${req.path}`;
      const window = Math.floor(config.security.rateLimitWindowMs / 1000);
      
      const current = await redisService.incrementRateLimit(key, window);
      
      if (current > config.security.rateLimitMaxRequests) {
        securityLog('rate_limit_exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
          current,
          limit: config.security.rateLimitMaxRequests,
        });

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
          },
        });
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.security.rateLimitMaxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, config.security.rateLimitMaxRequests - current).toString(),
        'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + window).toString(),
      });

      next();
    } catch (error) {
      logger.error('Rate limiting failed:', error);
      next(); // Continue without rate limiting if Redis fails
    }
  };

  // Logout middleware (blacklist token)
  public static logout = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.token) {
        // Add token to blacklist with expiration
        const decoded = decode(req.token) as JWTPayload;
        const exp = decoded.exp - Math.floor(Date.now() / 1000);
        
        if (exp > 0) {
          await redisService.set(`blacklist:${req.token}`, true, exp);
        }

        securityLog('user_logout', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id,
        });
      }

      next();
    } catch (error) {
      logger.error('Logout failed:', error);
      next();
    }
  };
}

// Export middleware functions
export const authenticate = AuthMiddleware.authenticate;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const requireRole = AuthMiddleware.requireRole;
export const requireAdmin = AuthMiddleware.requireAdmin;
export const requireUserOrAdmin = AuthMiddleware.requireUserOrAdmin;
export const requireProjectAccess = AuthMiddleware.requireProjectAccess;
export const rateLimit = AuthMiddleware.rateLimit;
export const logout = AuthMiddleware.logout;

// Export utility functions
export const verifyToken = AuthMiddleware.verifyToken;
export const generateToken = AuthMiddleware.generateToken;
export const generateRefreshToken = AuthMiddleware.generateRefreshToken;
export const hashPassword = AuthMiddleware.hashPassword;
export const comparePassword = AuthMiddleware.comparePassword;
