import { Router } from 'express';
import { databaseService } from '@services/DatabaseService';
import { redisService } from '@services/RedisService';
import { logger } from '@utils/logger';
import { asyncHandler } from '@middleware/errorHandler';
import { config } from '@config/config';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (_req: any, res: any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env['npm_package_version'] || '1.0.0',
  });
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (_req: any, res: any) => {
  const startTime = Date.now();
  const healthChecks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env['npm_package_version'] || '1.0.0',
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
      rss: process.memoryUsage().rss,
    },
    cpu: process.cpuUsage(),
  };

  try {
    // Check database
    const dbHealth = await databaseService.healthCheck();
    healthChecks.database = dbHealth;

    // Check Redis
    const redisHealth = await redisService.healthCheck();
    healthChecks.redis = redisHealth;

    const responseTime = Date.now() - startTime;

    // Determine overall health
    const isHealthy = healthChecks.database && healthChecks.redis;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      checks: healthChecks,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - startTime}ms`,
    });
  }
}));

// Database health check
router.get('/database', asyncHandler(async (_req: any, res: any) => {
  try {
    const isHealthy = await databaseService.healthCheck();
    const stats = databaseService.getStats();

    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: {
        host: config.database.host,
        port: config.database.port,
        name: config.database.name,
        ssl: config.database.ssl,
        pool: stats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      database: {
        host: config.database.host,
        port: config.database.port,
        name: config.database.name,
        ssl: config.database.ssl,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
}));

// Redis health check
router.get('/redis', asyncHandler(async (_req: any, res: any) => {
  try {
    const isHealthy = await redisService.healthCheck();
    const info = await redisService.info();

    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        database: config.redis.db,
        info: {
          version: (info as any)['redis_version'],
          uptime: (info as any)['uptime_in_seconds'],
          connected_clients: (info as any)['connected_clients'],
          used_memory: (info as any)['used_memory_human'],
          total_commands_processed: (info as any)['total_commands_processed'],
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Redis health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        database: config.redis.db,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    });
  }
}));

// System information
router.get('/system', asyncHandler(async (_req: any, res: any) => {
  const os = require('os');
  
  res.json({
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      uptime: os.uptime(),
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
    },
    environment: {
      nodeEnv: config.nodeEnv,
      port: config.port,
      features: config.features,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Configuration check (without sensitive data)
router.get('/config', asyncHandler(async (_req: any, res: any) => {
  res.json({
    config: {
      nodeEnv: config.nodeEnv,
      port: config.port,
      frontendPort: config.frontendPort,
      socketPort: config.socketPort,
      database: {
        host: config.database.host,
        port: config.database.port,
        name: config.database.name,
        ssl: config.database.ssl,
        pool: config.database.pool,
      },
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      },
      features: config.features,
      monitoring: config.monitoring,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (_req: any, res: any) => {
  try {
    const dbReady = await databaseService.healthCheck();
    const redisReady = await redisService.healthCheck();

    if (dbReady && redisReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        checks: {
          database: dbReady,
          redis: redisReady,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', asyncHandler(async (_req: any, res: any) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}));

export { router as healthRoutes };
