"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.getClient = exports.close = exports.initialize = exports.redisService = exports.RedisService = void 0;
const redis_1 = require("redis");
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class RedisService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            logger_1.logger.info('Initializing Redis connection...');
            const redisOptions = {
                url: config_1.config.redis.url,
                socket: {
                    host: config_1.config.redis.host,
                    port: config_1.config.redis.port,
                    connectTimeout: 10000,
                },
                database: config_1.config.redis.db,
            };
            if (config_1.config.redis.password) {
                redisOptions.password = config_1.config.redis.password;
            }
            this.client = (0, redis_1.createClient)(redisOptions);
            this.client.on('connect', () => {
                logger_1.logger.info('Redis client connected');
            });
            this.client.on('ready', () => {
                logger_1.logger.info('Redis client ready');
            });
            this.client.on('error', (error) => {
                logger_1.logger.error('Redis client error:', error);
            });
            this.client.on('end', () => {
                logger_1.logger.info('Redis client disconnected');
                this.isInitialized = false;
            });
            await this.client.connect();
            this.isInitialized = true;
            logger_1.logger.info('Redis connection established successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Redis connection:', error);
            throw error;
        }
    }
    getClient() {
        if (!this.client || !this.isInitialized) {
            throw new Error('Redis not initialized');
        }
        return this.client;
    }
    async close() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isInitialized = false;
            logger_1.logger.info('Redis connection closed');
        }
    }
    async healthCheck() {
        try {
            if (!this.client || !this.isInitialized) {
                return false;
            }
            await this.client.ping();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            logger_1.logger.error('Redis get error:', { key, error });
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.client.setEx(key, ttl, serializedValue);
            }
            else {
                await this.client.set(key, serializedValue);
            }
        }
        catch (error) {
            logger_1.logger.error('Redis set error:', { key, error });
            throw error;
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            logger_1.logger.error('Redis del error:', { key, error });
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error('Redis exists error:', { key, error });
            return false;
        }
    }
    async expire(key, ttl) {
        try {
            await this.client.expire(key, ttl);
        }
        catch (error) {
            logger_1.logger.error('Redis expire error:', { key, ttl, error });
            throw error;
        }
    }
    async hget(key, field) {
        try {
            const value = await this.client.hGet(key, field);
            return value ?? null;
        }
        catch (error) {
            logger_1.logger.error('Redis hget error:', { key, field, error });
            return null;
        }
    }
    async hset(key, field, value) {
        try {
            await this.client.hSet(key, field, value);
        }
        catch (error) {
            logger_1.logger.error('Redis hset error:', { key, field, error });
            throw error;
        }
    }
    async hgetall(key) {
        try {
            return await this.client.hGetAll(key);
        }
        catch (error) {
            logger_1.logger.error('Redis hgetall error:', { key, error });
            return {};
        }
    }
    async hdel(key, field) {
        try {
            await this.client.hDel(key, field);
        }
        catch (error) {
            logger_1.logger.error('Redis hdel error:', { key, field, error });
            throw error;
        }
    }
    async lpush(key, value) {
        try {
            await this.client.lPush(key, value);
        }
        catch (error) {
            logger_1.logger.error('Redis lpush error:', { key, error });
            throw error;
        }
    }
    async rpush(key, value) {
        try {
            await this.client.rPush(key, value);
        }
        catch (error) {
            logger_1.logger.error('Redis rpush error:', { key, error });
            throw error;
        }
    }
    async lpop(key) {
        try {
            return await this.client.lPop(key);
        }
        catch (error) {
            logger_1.logger.error('Redis lpop error:', { key, error });
            return null;
        }
    }
    async rpop(key) {
        try {
            return await this.client.rPop(key);
        }
        catch (error) {
            logger_1.logger.error('Redis rpop error:', { key, error });
            return null;
        }
    }
    async lrange(key, start, stop) {
        try {
            return await this.client.lRange(key, start, stop);
        }
        catch (error) {
            logger_1.logger.error('Redis lrange error:', { key, start, stop, error });
            return [];
        }
    }
    async sadd(key, member) {
        try {
            await this.client.sAdd(key, member);
        }
        catch (error) {
            logger_1.logger.error('Redis sadd error:', { key, member, error });
            throw error;
        }
    }
    async srem(key, member) {
        try {
            await this.client.sRem(key, member);
        }
        catch (error) {
            logger_1.logger.error('Redis srem error:', { key, member, error });
            throw error;
        }
    }
    async smembers(key) {
        try {
            return await this.client.sMembers(key);
        }
        catch (error) {
            logger_1.logger.error('Redis smembers error:', { key, error });
            return [];
        }
    }
    async sismember(key, member) {
        try {
            return await this.client.sIsMember(key, member);
        }
        catch (error) {
            logger_1.logger.error('Redis sismember error:', { key, member, error });
            return false;
        }
    }
    async setSession(sessionId, data, ttl = 3600) {
        const key = `session:${sessionId}`;
        await this.set(key, data, ttl);
    }
    async getSession(sessionId) {
        const key = `session:${sessionId}`;
        return await this.get(key);
    }
    async deleteSession(sessionId) {
        const key = `session:${sessionId}`;
        await this.del(key);
    }
    async incrementRateLimit(key, window) {
        try {
            const current = await this.client.incr(key);
            if (current === 1) {
                await this.client.expire(key, window);
            }
            return current;
        }
        catch (error) {
            logger_1.logger.error('Redis rate limit increment error:', { key, error });
            return 0;
        }
    }
    async getRateLimit(key) {
        try {
            const current = await this.client.get(key);
            return current ? parseInt(current, 10) : 0;
        }
        catch (error) {
            logger_1.logger.error('Redis rate limit get error:', { key, error });
            return 0;
        }
    }
    async publish(channel, message) {
        try {
            return await this.client.publish(channel, message);
        }
        catch (error) {
            logger_1.logger.error('Redis publish error:', { channel, error });
            throw error;
        }
    }
    async subscribe(channel, callback) {
        try {
            await this.client.subscribe(channel, callback);
        }
        catch (error) {
            logger_1.logger.error('Redis subscribe error:', { channel, error });
            throw error;
        }
    }
    async unsubscribe(channel) {
        try {
            await this.client.unsubscribe(channel);
        }
        catch (error) {
            logger_1.logger.error('Redis unsubscribe error:', { channel, error });
            throw error;
        }
    }
    async flushdb() {
        try {
            await this.client.flushDb();
            logger_1.logger.info('Redis database flushed');
        }
        catch (error) {
            logger_1.logger.error('Redis flushdb error:', error);
            throw error;
        }
    }
    async info() {
        try {
            const info = await this.client.info();
            const lines = info.split('\r\n');
            const result = {};
            for (const line of lines) {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    result[key] = value;
                }
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Redis info error:', error);
            return {};
        }
    }
}
exports.RedisService = RedisService;
exports.redisService = RedisService.getInstance();
const initialize = () => exports.redisService.initialize();
exports.initialize = initialize;
const close = () => exports.redisService.close();
exports.close = close;
const getClient = () => exports.redisService.getClient();
exports.getClient = getClient;
const healthCheck = () => exports.redisService.healthCheck();
exports.healthCheck = healthCheck;
//# sourceMappingURL=RedisService.js.map