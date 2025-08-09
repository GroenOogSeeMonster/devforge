"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = exports.generateRefreshToken = exports.generateToken = exports.verifyToken = exports.logout = exports.rateLimit = exports.requireProjectAccess = exports.requireUserOrAdmin = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.authenticate = exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("@config/config");
const logger_1 = require("@utils/logger");
const DatabaseService_1 = require("@services/DatabaseService");
const RedisService_1 = require("@services/RedisService");
class AuthMiddleware {
    static async verifyToken(token) {
        try {
            const secret = config_1.config.auth.jwtSecret;
            const decoded = (0, jsonwebtoken_1.verify)(token, secret);
            const isBlacklisted = await RedisService_1.redisService.exists(`blacklist:${token}`);
            if (isBlacklisted) {
                throw new Error('Token is blacklisted');
            }
            return decoded;
        }
        catch (error) {
            logger_1.logger.error('Token verification failed:', error);
            throw new Error('Invalid token');
        }
    }
    static generateToken(payload) {
        const secret = config_1.config.auth.jwtSecret;
        const options = { expiresIn: config_1.config.auth.jwtExpiresIn };
        return (0, jsonwebtoken_1.sign)(payload, secret, options);
    }
    static generateRefreshToken(payload) {
        const secret = config_1.config.auth.jwtSecret;
        const options = { expiresIn: config_1.config.auth.jwtRefreshExpiresIn };
        return (0, jsonwebtoken_1.sign)(payload, secret, options);
    }
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, config_1.config.auth.bcryptRounds);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
}
exports.AuthMiddleware = AuthMiddleware;
_a = AuthMiddleware;
AuthMiddleware.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, logger_1.securityLog)('authentication_failed', {
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
        const decoded = await _a.verifyToken(token);
        const user = await DatabaseService_1.databaseService.findOne('users', { id: decoded.userId });
        if (!user || !user.is_active) {
            (0, logger_1.securityLog)('authentication_failed', {
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
        req.user = user;
        req.token = token;
        (0, logger_1.securityLog)('authentication_success', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: user.id,
            email: user.email,
        });
        next();
    }
    catch (error) {
        (0, logger_1.securityLog)('authentication_failed', {
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
AuthMiddleware.optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        const decoded = await _a.verifyToken(token);
        const user = await DatabaseService_1.databaseService.findOne('users', { id: decoded.userId });
        if (user && user.is_active) {
            req.user = user;
            req.token = token;
        }
        next();
    }
    catch (error) {
        next();
    }
};
AuthMiddleware.requireRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
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
            (0, logger_1.securityLog)('authorization_failed', {
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
AuthMiddleware.requireAdmin = _a.requireRole('admin');
AuthMiddleware.requireUserOrAdmin = _a.requireRole(['user', 'admin']);
AuthMiddleware.requireProjectAccess = async (req, res, next) => {
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
        const project = await DatabaseService_1.databaseService.findOne('projects', { id: projectId });
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
        if (req.user.role === 'admin') {
            req.project = project;
            next();
            return;
        }
        if (project.owner_id === req.user.id) {
            req.project = project;
            next();
            return;
        }
        const membership = await DatabaseService_1.databaseService.findOne('project_members', {
            project_id: projectId,
            user_id: req.user.id,
        });
        if (membership) {
            req.project = project;
            req.membership = membership;
            next();
            return;
        }
        (0, logger_1.securityLog)('project_access_denied', {
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
    }
    catch (error) {
        logger_1.logger.error('Project access check failed:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to verify project access',
            },
        });
    }
};
AuthMiddleware.rateLimit = async (req, res, next) => {
    try {
        const key = `rate_limit:${req.ip}:${req.path}`;
        const window = Math.floor(config_1.config.security.rateLimitWindowMs / 1000);
        const current = await RedisService_1.redisService.incrementRateLimit(key, window);
        if (current > config_1.config.security.rateLimitMaxRequests) {
            (0, logger_1.securityLog)('rate_limit_exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
                current,
                limit: config_1.config.security.rateLimitMaxRequests,
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
        res.set({
            'X-RateLimit-Limit': config_1.config.security.rateLimitMaxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config_1.config.security.rateLimitMaxRequests - current).toString(),
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + window).toString(),
        });
        next();
    }
    catch (error) {
        logger_1.logger.error('Rate limiting failed:', error);
        next();
    }
};
AuthMiddleware.logout = async (req, _res, next) => {
    try {
        if (req.token) {
            const decoded = (0, jsonwebtoken_1.decode)(req.token);
            const exp = decoded.exp - Math.floor(Date.now() / 1000);
            if (exp > 0) {
                await RedisService_1.redisService.set(`blacklist:${req.token}`, true, exp);
            }
            (0, logger_1.securityLog)('user_logout', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id,
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Logout failed:', error);
        next();
    }
};
exports.authenticate = AuthMiddleware.authenticate;
exports.optionalAuth = AuthMiddleware.optionalAuth;
exports.requireRole = AuthMiddleware.requireRole;
exports.requireAdmin = AuthMiddleware.requireAdmin;
exports.requireUserOrAdmin = AuthMiddleware.requireUserOrAdmin;
exports.requireProjectAccess = AuthMiddleware.requireProjectAccess;
exports.rateLimit = AuthMiddleware.rateLimit;
exports.logout = AuthMiddleware.logout;
exports.verifyToken = AuthMiddleware.verifyToken;
exports.generateToken = AuthMiddleware.generateToken;
exports.generateRefreshToken = AuthMiddleware.generateRefreshToken;
exports.hashPassword = AuthMiddleware.hashPassword;
exports.comparePassword = AuthMiddleware.comparePassword;
//# sourceMappingURL=authMiddleware.js.map