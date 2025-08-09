import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from '@config/config';
import { logger, databaseLog } from '@utils/logger';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing database connection...');

      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: config.database.pool.max,
        min: config.database.pool.min,
        idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
        connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isInitialized = true;
      logger.info('Database connection established successfully');
    } catch (error) {
      logger.error('Failed to initialize database connection:', error);
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return this.pool.connect();
  }

  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      databaseLog('query', text, duration, {
        rows: result.rowCount,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      databaseLog('query', text, duration, {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });

      logger.error('Database query error:', { text, params, error });
      throw error;
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      logger.info('Database connection closed');
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) {
        return false;
      }

      const result = await this.query('SELECT 1 as health');
      return result.rows[0]?.health === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Get connection stats
  public getStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  // Utility methods for common operations
  public async findOne<T extends QueryResultRow>(table: string, conditions: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(' AND ');
    
    const query = `SELECT * FROM ${table} WHERE ${placeholders} LIMIT 1`;
    const result = await this.query<T>(query, values);
    
    return result.rows[0] || null;
  }

  public async findMany<T extends QueryResultRow>(table: string, conditions?: Record<string, any>, options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  }): Promise<T[]> {
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];
    let paramIndex = 1;

    if (conditions && Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const placeholders = keys.map(() => `$${paramIndex++}`).join(' AND ');
      query += ` WHERE ${placeholders}`;
      values.push(...Object.values(conditions));
    }

    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }

    if (options?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(options.limit);
    }

    if (options?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(options.offset);
    }

    const result = await this.query<T>(query, values);
    return result.rows;
  }

  public async insert<T extends QueryResultRow>(table: string, data: Record<string, any>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.query<T>(query, values);
    
    return result.rows[0];
  }

  public async update<T extends QueryResultRow>(table: string, id: string | number, data: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `${keys[index]} = $${index + 1}`).join(', ');
    
    const query = `UPDATE ${table} SET ${placeholders} WHERE id = $${values.length + 1} RETURNING *`;
    const result = await this.query<T>(query, [...values, id]);
    
    return result.rows[0] || null;
  }

  public async delete(table: string, id: string | number): Promise<boolean> {
    const query = `DELETE FROM ${table} WHERE id = $1`;
    const result = await this.query(query, [id]);
    
    return (result.rowCount || 0) > 0;
  }

  public async count(table: string, conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(' AND ');
      query += ` WHERE ${placeholders}`;
      values.push(...Object.values(conditions));
    }

    const result = await this.query<{ count: string }>(query, values);
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Static methods for convenience
export const initialize = () => databaseService.initialize();
export const close = () => databaseService.close();
export const query = <T extends QueryResultRow = any>(text: string, params?: any[]) => databaseService.query<T>(text, params);
export const transaction = <T>(callback: (client: PoolClient) => Promise<T>) => databaseService.transaction(callback);
export const healthCheck = () => databaseService.healthCheck();
export const getStats = () => databaseService.getStats();
