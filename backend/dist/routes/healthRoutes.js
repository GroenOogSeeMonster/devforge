"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const DatabaseService_1 = require("../services/DatabaseService");
const RedisService_1 = require("../services/RedisService");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const config_1 = require("../config/config");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
router.get('/', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv,
        version: process.env['npm_package_version'] || '1.0.0',
    });
}));
router.get('/detailed', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const startTime = Date.now();
    const healthChecks = {
        database: false,
        redis: false,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv,
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
        const dbHealth = await DatabaseService_1.databaseService.healthCheck();
        healthChecks.database = dbHealth;
        const redisHealth = await RedisService_1.redisService.healthCheck();
        healthChecks.redis = redisHealth;
        const responseTime = Date.now() - startTime;
        const isHealthy = healthChecks.database && healthChecks.redis;
        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            checks: healthChecks,
            responseTime: `${responseTime}ms`,
        });
    }
    catch (error) {
        logger_1.logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            checks: healthChecks,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: `${Date.now() - startTime}ms`,
        });
    }
}));
router.get('/database', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    try {
        const isHealthy = await DatabaseService_1.databaseService.healthCheck();
        const stats = DatabaseService_1.databaseService.getStats();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            database: {
                host: config_1.config.database.host,
                port: config_1.config.database.port,
                name: config_1.config.database.name,
                ssl: config_1.config.database.ssl,
                pool: stats,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Database health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            database: {
                host: config_1.config.database.host,
                port: config_1.config.database.port,
                name: config_1.config.database.name,
                ssl: config_1.config.database.ssl,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            timestamp: new Date().toISOString(),
        });
    }
}));
router.get('/redis', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    try {
        const isHealthy = await RedisService_1.redisService.healthCheck();
        const info = await RedisService_1.redisService.info();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            redis: {
                host: config_1.config.redis.host,
                port: config_1.config.redis.port,
                database: config_1.config.redis.db,
                info: {
                    version: info['redis_version'],
                    uptime: info['uptime_in_seconds'],
                    connected_clients: info['connected_clients'],
                    used_memory: info['used_memory_human'],
                    total_commands_processed: info['total_commands_processed'],
                },
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Redis health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            redis: {
                host: config_1.config.redis.host,
                port: config_1.config.redis.port,
                database: config_1.config.redis.db,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            timestamp: new Date().toISOString(),
        });
    }
}));
router.get('/system', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
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
            nodeEnv: config_1.config.nodeEnv,
            port: config_1.config.port,
            features: config_1.config.features,
        },
        timestamp: new Date().toISOString(),
    });
}));
router.get('/config', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    res.json({
        config: {
            nodeEnv: config_1.config.nodeEnv,
            port: config_1.config.port,
            frontendPort: config_1.config.frontendPort,
            socketPort: config_1.config.socketPort,
            database: {
                host: config_1.config.database.host,
                port: config_1.config.database.port,
                name: config_1.config.database.name,
                ssl: config_1.config.database.ssl,
                pool: config_1.config.database.pool,
            },
            redis: {
                host: config_1.config.redis.host,
                port: config_1.config.redis.port,
                db: config_1.config.redis.db,
            },
            features: config_1.config.features,
            monitoring: config_1.config.monitoring,
        },
        timestamp: new Date().toISOString(),
    });
}));
router.get('/ready', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    try {
        const dbReady = await DatabaseService_1.databaseService.healthCheck();
        const redisReady = await RedisService_1.redisService.healthCheck();
        if (dbReady && redisReady) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
            });
        }
        else {
            res.status(503).json({
                status: 'not ready',
                checks: {
                    database: dbReady,
                    redis: redisReady,
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Readiness check failed:', error);
        res.status(503).json({
            status: 'not ready',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
}));
router.get('/live', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}));
//# sourceMappingURL=healthRoutes.js.map