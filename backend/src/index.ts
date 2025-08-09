import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';

// Import configurations
import { config, validateConfig } from '@config/config';
import { logger } from '@utils/logger';
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers, requestTimer } from '@middleware/errorHandler';
import { rateLimit } from '@middleware/authMiddleware';

// Import routes
import { authRoutes } from '@routes/authRoutes';
import { healthRoutes } from '@routes/healthRoutes';

// Import services
import { databaseService } from '@services/DatabaseService';
import { redisService } from '@services/RedisService';

class DevForgeServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.port = config.port;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.security.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Avoid connecting external services during tests
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

  private async initializeServices(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();

      // Initialize database connection
      await databaseService.initialize();
      logger.info('Database connection established');

      // Initialize Redis connection
      await redisService.initialize();
      logger.info('Redis connection established');

      // Setup Socket.IO Redis adapter
      // Lazy import to avoid test-time resolution
      const { createAdapter } = require('@socket.io/redis-adapter');
      const pubClient = redisService.getClient();
      const subClient = pubClient.duplicate();
      this.io.adapter(createAdapter(pubClient, subClient));

      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  private setupMiddleware(): void {
    // Request timing
    this.app.use(requestTimer);

    // Security middleware
    this.app.use(helmet({
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

    // CORS
    this.app.use(cors({
      origin: config.security.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting (skip during tests to avoid Redis dependency)
    if (process.env['NODE_ENV'] !== 'test') {
      this.app.use(rateLimit);
    }

    // Static files
    this.app.use('/static', express.static('public'));

    // Health check (no auth required)
    this.app.use('/health', healthRoutes);
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    
    // TODO: Add other routes as they are implemented
    // this.app.use('/api/users', authenticate, userRoutes);
    // this.app.use('/api/projects', authenticate, projectRoutes);
    // this.app.use('/api/files', authenticate, fileRoutes);
    // this.app.use('/api/containers', authenticate, containerRoutes);
    // this.app.use('/api/databases', authenticate, databaseRoutes);
    // this.app.use('/api/ai', authenticate, aiRoutes);
    // this.app.use('/api/deployments', authenticate, deploymentRoutes);

    // API documentation
    this.app.get('/api', (_req, res) => {
      res.json({
        name: 'DevForge API',
        version: '1.0.0',
        description: 'Self-hosted development environment API',
        endpoints: {
          auth: '/api/auth',
          health: '/health',
          // Add other endpoints as they are implemented
        }
      });
    });
  }

  private setupSocketIO(): void {
    // Authentication middleware for Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = (socket.handshake.auth as any)["token"] || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        // Verify token (simplified for now)
        const decoded = require('jsonwebtoken').verify(token, config.auth.jwtSecret);
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      logger.info('Client connected:', {
        userId: socket.data.user?.userId,
        socketId: socket.id,
      });

      // Join user's room
      if (socket.data.user?.userId) {
        socket.join(`user:${socket.data.user.userId}`);
      }

      // Handle project collaboration
      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.info('User joined project:', {
          userId: socket.data.user?.userId,
          projectId,
          socketId: socket.id,
        });
      });

      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        logger.info('User left project:', {
          userId: socket.data.user?.userId,
          projectId,
          socketId: socket.id,
        });
      });

      // Handle file changes
      socket.on('file-change', (data) => {
        socket.to(`project:${data.projectId}`).emit('file-changed', {
          ...data,
          userId: socket.data.user?.userId,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle cursor position
      socket.on('cursor-move', (data) => {
        socket.to(`project:${data.projectId}`).emit('cursor-moved', {
          ...data,
          userId: socket.data.user?.userId,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('Client disconnected:', {
          userId: socket.data.user?.userId,
          socketId: socket.id,
        });
      });
    });

    logger.info('Socket.IO setup completed');
  }

  private setupErrorHandling(): void {
    // Global error handlers
    setupGlobalErrorHandlers();

    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      this.server.listen(this.port, () => {
        logger.info(`DevForge server started on port ${this.port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`API Documentation: http://localhost:${this.port}/api`);
        logger.info(`Health Check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      logger.info('Shutting down server...');
      
      // Close Socket.IO
      this.io.close();
      
      // Close HTTP server
      this.server.close();
      
      // Close database connection
      await databaseService.close();
      
      // Close Redis connection
      await redisService.close();
      
      logger.info('Server shutdown completed');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Create and start server
const server = new DevForgeServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

// Start the server
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Expose app and io for testing
export const app = (server as any)["app"]; // access for tests
export default server; 