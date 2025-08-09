import { PoolClient, QueryResult, QueryResultRow } from 'pg';
export declare class DatabaseService {
    private static instance;
    private pool;
    private isInitialized;
    private constructor();
    static getInstance(): DatabaseService;
    initialize(): Promise<void>;
    getClient(): Promise<PoolClient>;
    query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    healthCheck(): Promise<boolean>;
    getStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    } | null;
    findOne<T extends QueryResultRow>(table: string, conditions: Record<string, any>): Promise<T | null>;
    findMany<T extends QueryResultRow>(table: string, conditions?: Record<string, any>, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDirection?: 'ASC' | 'DESC';
    }): Promise<T[]>;
    insert<T extends QueryResultRow>(table: string, data: Record<string, any>): Promise<T>;
    update<T extends QueryResultRow>(table: string, id: string | number, data: Record<string, any>): Promise<T | null>;
    delete(table: string, id: string | number): Promise<boolean>;
    count(table: string, conditions?: Record<string, any>): Promise<number>;
}
export declare const databaseService: DatabaseService;
export declare const initialize: () => Promise<void>;
export declare const close: () => Promise<void>;
export declare const query: <T extends QueryResultRow = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
export declare const healthCheck: () => Promise<boolean>;
export declare const getStats: () => {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
} | null;
//# sourceMappingURL=DatabaseService.d.ts.map