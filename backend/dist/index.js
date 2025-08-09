"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const config_1 = require("@config/config");
const logger_1 = require("@utils/logger");
const errorHandler_1 = require("@middleware/errorHandler");
const authMiddleware_1 = require("@middleware/authMiddleware");
const authRoutes_1 = require("@routes/authRoutes");
const healthRoutes_1 = require("@routes/healthRoutes");
const DatabaseService_1 = require("@services/DatabaseService");
const RedisService_1 = require("@services/RedisService");
class DevForgeServer {
    constructor() {
        this.port = config_1.config.port;
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: config_1.config.security.corsOrigin,
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        if (process.env['NODE_ENV'] !== 'test') {
            this.initializeServices();
        }
        this.setupMiddleware();
        this.setupRoutes();
        if (process.env['NODE_ENV'] !== 'test') {
            this.setupSocketIO();
        }
        this.setupErrorHandling();
    }
    async initializeServices() {
        try {
            (0, config_1.validateConfig)();
            await DatabaseService_1.databaseService.initialize();
            logger_1.logger.info('Database connection established');
            await RedisService_1.redisService.initialize();
            logger_1.logger.info('Redis connection established');
            const { createAdapter } = require('@socket.io/redis-adapter');
            const pubClient = RedisService_1.redisService.getClient();
            const subClient = pubClient.duplicate();
            this.io.adapter(createAdapter(pubClient, subClient));
            logger_1.logger.info('All services initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize services:', error);
            process.exit(1);
        }
    }
    setupMiddleware() {
        this.app.use(errorHandler_1.requestTimer);
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));
        this.app.use((0, cors_1.default)({
            origin: config_1.config.security.corsOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        this.app.use((0, compression_1.default)());
        this.app.use((0, morgan_1.default)('combined', {
            stream: {
                write: (message) => logger_1.logger.info(message.trim())
            }
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        if (process.env['NODE_ENV'] !== 'test') {
            this.app.use(authMiddleware_1.rateLimit);
        }
        this.app.use('/static', express_1.default.static('public'));
        this.app.use('/health', healthRoutes_1.healthRoutes);
    }
    setupRoutes() {
        this.app.use('/api/auth', authRoutes_1.authRoutes);
        this.app.get('/api', (_req, res) => {
            res.json({
                name: 'DevForge API',
                version: '1.0.0',
                description: 'Self-hosted development environment API',
                endpoints: {
                    auth: '/api/auth',
                    health: '/health',
                }
            });
        });
    }
    setupSocketIO() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth["token"] || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const decoded = require('jsonwebtoken').verify(token, config_1.config.auth.jwtSecret);
                socket.data.user = decoded;
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            logger_1.logger.info('Client connected:', {
                userId: socket.data.user?.userId,
                socketId: socket.id,
            });
            if (socket.data.user?.userId) {
                socket.join(`user:${socket.data.user.userId}`);
            }
            socket.on('join-project', (projectId) => {
                socket.join(`project:${projectId}`);
                logger_1.logger.info('User joined project:', {
                    userId: socket.data.user?.userId,
                    projectId,
                    socketId: socket.id,
                });
            });
            socket.on('leave-project', (projectId) => {
                socket.leave(`project:${projectId}`);
                logger_1.logger.info('User left project:', {
                    userId: socket.data.user?.userId,
                    projectId,
                    socketId: socket.id,
                });
            });
            socket.on('file-change', (data) => {
                socket.to(`project:${data.projectId}`).emit('file-changed', {
                    ...data,
                    userId: socket.data.user?.userId,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on('cursor-move', (data) => {
                socket.to(`project:${data.projectId}`).emit('cursor-moved', {
                    ...data,
                    userId: socket.data.user?.userId,
                    timestamp: new Date().toISOString(),
                });
            });
            socket.on('disconnect', () => {
                logger_1.logger.info('Client disconnected:', {
                    userId: socket.data.user?.userId,
                    socketId: socket.id,
                });
            });
        });
        logger_1.logger.info('Socket.IO setup completed');
    }
    setupErrorHandling() {
        (0, errorHandler_1.setupGlobalErrorHandlers)();
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        try {
            this.server.listen(this.port, () => {
                logger_1.logger.info(`DevForge server started on port ${this.port}`);
                logger_1.logger.info(`Environment: ${config_1.config.nodeEnv}`);
                logger_1.logger.info(`API Documentation: http://localhost:${this.port}/api`);
                logger_1.logger.info(`Health Check: http://localhost:${this.port}/health`);
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async stop() {
        try {
            logger_1.logger.info('Shutting down server...');
            this.io.close();
            this.server.close();
            await DatabaseService_1.databaseService.close();
            await RedisService_1.redisService.close();
            logger_1.logger.info('Server shutdown completed');
        }
        catch (error) {
            logger_1.logger.error('Error during shutdown:', error);
        }
    }
}
const server = new DevForgeServer();
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await server.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await server.stop();
    process.exit(0);
});
server.start().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
exports.app = server["app"];
exports.default = server;
//# sourceMappingURL=index.js.map