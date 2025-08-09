"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.healthCheck = exports.transaction = exports.query = exports.close = exports.initialize = exports.databaseService = exports.DatabaseService = void 0;
const pg_1 = require("pg");
const config_1 = require("@config/config");
const logger_1 = require("@utils/logger");
class DatabaseService {
    constructor() {
        this.pool = null;
        this.isInitialized = false;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            logger_1.logger.info('Initializing database connection...');
            this.pool = new pg_1.Pool({
                host: config_1.config.database.host,
                port: config_1.config.database.port,
                database: config_1.config.database.name,
                user: config_1.config.database.user,
                password: config_1.config.database.password,
                ssl: config_1.config.database.ssl ? { rejectUnauthorized: false } : false,
                max: config_1.config.database.pool.max,
                min: config_1.config.database.pool.min,
                idleTimeoutMillis: config_1.config.database.pool.idleTimeoutMillis,
                connectionTimeoutMillis: config_1.config.database.pool.connectionTimeoutMillis,
            });
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.isInitialized = true;
            logger_1.logger.info('Database connection established successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize database connection:', error);
            throw error;
        }
    }
    async getClient() {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        return this.pool.connect();
    }
    async query(text, params) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            (0, logger_1.databaseLog)('query', text, duration, {
                rows: result.rowCount,
                success: true,
            });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            (0, logger_1.databaseLog)('query', text, duration, {
                error: error instanceof Error ? error.message : String(error),
                success: false,
            });
            logger_1.logger.error('Database query error:', { text, params, error });
            throw error;
        }
    }
    async transaction(callback) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.isInitialized = false;
            logger_1.logger.info('Database connection closed');
        }
    }
    async healthCheck() {
        try {
            if (!this.pool) {
                return false;
            }
            const result = await this.query('SELECT 1 as health');
            return result.rows[0]?.health === 1;
        }
        catch (error) {
            logger_1.logger.error('Database health check failed:', error);
            return false;
        }
    }
    getStats() {
        if (!this.pool) {
            return null;
        }
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
    async findOne(table, conditions) {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(' AND ');
        const query = `SELECT * FROM ${table} WHERE ${placeholders} LIMIT 1`;
        const result = await this.query(query, values);
        return result.rows[0] || null;
    }
    async findMany(table, conditions, options) {
        let query = `SELECT * FROM ${table}`;
        const values = [];
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
        const result = await this.query(query, values);
        return result.rows;
    }
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await this.query(query, values);
        return result.rows[0];
    }
    async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `${keys[index]} = $${index + 1}`).join(', ');
        const query = `UPDATE ${table} SET ${placeholders} WHERE id = $${values.length + 1} RETURNING *`;
        const result = await this.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    async delete(table, id) {
        const query = `DELETE FROM ${table} WHERE id = $1`;
        const result = await this.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
    async count(table, conditions) {
        let query = `SELECT COUNT(*) as count FROM ${table}`;
        const values = [];
        if (conditions && Object.keys(conditions).length > 0) {
            const keys = Object.keys(conditions);
            const placeholders = keys.map((_, index) => `$${index + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
            values.push(...Object.values(conditions));
        }
        const result = await this.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }
}
exports.DatabaseService = DatabaseService;
exports.databaseService = DatabaseService.getInstance();
const initialize = () => exports.databaseService.initialize();
exports.initialize = initialize;
const close = () => exports.databaseService.close();
exports.close = close;
const query = (text, params) => exports.databaseService.query(text, params);
exports.query = query;
const transaction = (callback) => exports.databaseService.transaction(callback);
exports.transaction = transaction;
const healthCheck = () => exports.databaseService.healthCheck();
exports.healthCheck = healthCheck;
const getStats = () => exports.databaseService.getStats();
exports.getStats = getStats;
//# sourceMappingURL=DatabaseService.js.map