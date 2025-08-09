import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { config } from '@config/config';
import { logger } from '@utils/logger';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing Redis connection...');

      const redisOptions: RedisClientOptions = {
        url: config.redis.url,
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          connectTimeout: 10000,
        },
        database: config.redis.db,
      };

      if (config.redis.password) {
        redisOptions.password = config.redis.password;
      }

      this.client = createClient(redisOptions as any) as unknown as RedisClientType;

      // Handle connection events
      this.client!.on('connect', () => {
        logger.info('Redis client connected');
      });

      this.client!.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client!.on('error', (error) => {
        logger.error('Redis client error:', error);
      });

      this.client!.on('end', () => {
        logger.info('Redis client disconnected');
        this.isInitialized = false;
      });

      // Connect to Redis
      await this.client.connect();

      this.isInitialized = true;
      logger.info('Redis connection established successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    if (!this.client || !this.isInitialized) {
      throw new Error('Redis not initialized');
    }
    return this.client;
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isInitialized = false;
      logger.info('Redis connection closed');
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client || !this.isInitialized) {
        return false;
      }

      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache operations
  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', { key, error });
      return null;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client!.setEx(key, ttl, serializedValue);
      } else {
        await this.client!.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Redis set error:', { key, error });
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client!.del(key);
    } catch (error) {
      logger.error('Redis del error:', { key, error });
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', { key, error });
      return false;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client!.expire(key, ttl);
    } catch (error) {
      logger.error('Redis expire error:', { key, ttl, error });
      throw error;
    }
  }

  // Hash operations
  public async hget(key: string, field: string): Promise<string | null> {
    try {
      const value = await this.client!.hGet(key, field as any);
      return value ?? null;
    } catch (error) {
      logger.error('Redis hget error:', { key, field, error });
      return null;
    }
  }

  public async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client!.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis hset error:', { key, field, error });
      throw error;
    }
  }

  public async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client!.hGetAll(key);
    } catch (error) {
      logger.error('Redis hgetall error:', { key, error });
      return {};
    }
  }

  public async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client!.hDel(key, field);
    } catch (error) {
      logger.error('Redis hdel error:', { key, field, error });
      throw error;
    }
  }

  // List operations
  public async lpush(key: string, value: string): Promise<void> {
    try {
      await this.client!.lPush(key, value);
    } catch (error) {
      logger.error('Redis lpush error:', { key, error });
      throw error;
    }
  }

  public async rpush(key: string, value: string): Promise<void> {
    try {
      await this.client!.rPush(key, value);
    } catch (error) {
      logger.error('Redis rpush error:', { key, error });
      throw error;
    }
  }

  public async lpop(key: string): Promise<string | null> {
    try {
      return await this.client!.lPop(key);
    } catch (error) {
      logger.error('Redis lpop error:', { key, error });
      return null;
    }
  }

  public async rpop(key: string): Promise<string | null> {
    try {
      return await this.client!.rPop(key);
    } catch (error) {
      logger.error('Redis rpop error:', { key, error });
      return null;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client!.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis lrange error:', { key, start, stop, error });
      return [];
    }
  }

  // Set operations
  public async sadd(key: string, member: string): Promise<void> {
    try {
      await this.client!.sAdd(key, member);
    } catch (error) {
      logger.error('Redis sadd error:', { key, member, error });
      throw error;
    }
  }

  public async srem(key: string, member: string): Promise<void> {
    try {
      await this.client!.sRem(key, member);
    } catch (error) {
      logger.error('Redis srem error:', { key, member, error });
      throw error;
    }
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client!.sMembers(key);
    } catch (error) {
      logger.error('Redis smembers error:', { key, error });
      return [];
    }
  }

  public async sismember(key: string, member: string): Promise<boolean> {
    try {
      return await this.client!.sIsMember(key, member);
    } catch (error) {
      logger.error('Redis sismember error:', { key, member, error });
      return false;
    }
  }

  // Session management
  public async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, data, ttl);
  }

  public async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }

  // Rate limiting
  public async incrementRateLimit(key: string, window: number): Promise<number> {
    try {
      const current = await this.client!.incr(key);
      if (current === 1) {
        await this.client!.expire(key, window);
      }
      return current;
    } catch (error) {
      logger.error('Redis rate limit increment error:', { key, error });
      return 0;
    }
  }

  public async getRateLimit(key: string): Promise<number> {
    try {
      const current = await this.client!.get(key);
      return current ? parseInt(current, 10) : 0;
    } catch (error) {
      logger.error('Redis rate limit get error:', { key, error });
      return 0;
    }
  }

  // Pub/Sub operations
  public async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.client!.publish(channel, message);
    } catch (error) {
      logger.error('Redis publish error:', { channel, error });
      throw error;
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.client!.subscribe(channel, callback);
    } catch (error) {
      logger.error('Redis subscribe error:', { channel, error });
      throw error;
    }
  }

  public async unsubscribe(channel: string): Promise<void> {
    try {
      await this.client!.unsubscribe(channel);
    } catch (error) {
      logger.error('Redis unsubscribe error:', { channel, error });
      throw error;
    }
  }

  // Utility methods
  public async flushdb(): Promise<void> {
    try {
      await this.client!.flushDb();
      logger.info('Redis database flushed');
    } catch (error) {
      logger.error('Redis flushdb error:', error);
      throw error;
    }
  }

  public async info(): Promise<Record<string, string>> {
    try {
      const info = await this.client!.info();
      const lines = info.split('\r\n');
      const result: Record<string, string> = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          result[key] = value;
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Redis info error:', error);
      return {};
    }
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();

// Static methods for convenience
export const initialize = () => redisService.initialize();
export const close = () => redisService.close();
export const getClient = () => redisService.getClient();
export const healthCheck = () => redisService.healthCheck();
