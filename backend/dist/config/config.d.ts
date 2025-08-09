export declare const config: {
    nodeEnv: string;
    port: number;
    frontendPort: number;
    socketPort: number;
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        url: string;
        ssl: boolean;
        pool: {
            min: number;
            max: number;
            idleTimeoutMillis: number;
            connectionTimeoutMillis: number;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        url: string;
        db: number;
    };
    auth: {
        jwtSecret: string;
        jwtExpiresIn: string;
        jwtRefreshExpiresIn: string;
        sessionSecret: string;
        bcryptRounds: number;
    };
    ai: {
        ollama: {
            url: string;
            model: string;
            timeout: number;
        };
        openai: {
            apiKey: string | undefined;
            model: string;
            maxTokens: number;
            temperature: number;
        };
        anthropic: {
            apiKey: string | undefined;
            model: string;
            maxTokens: number;
        };
    };
    docker: {
        host: string;
        apiVersion: string;
        containerMemoryLimit: string;
        containerCpuLimit: number;
        containerDiskLimit: string;
        containerNetwork: string;
    };
    security: {
        corsOrigin: string;
        rateLimitWindowMs: number;
        rateLimitMaxRequests: number;
        encryptionKey: string;
    };
    storage: {
        path: string;
        maxFileSize: string;
        allowedFileTypes: string[];
    };
    logging: {
        level: string;
        logFile: string;
        auditLogFile: string;
    };
    email: {
        host: string;
        port: number;
        user: string | undefined;
        password: string | undefined;
        from: string;
        secure: boolean;
    };
    monitoring: {
        enabled: boolean;
        port: number;
        prometheusEnabled: boolean;
        grafanaEnabled: boolean;
    };
    features: {
        aiAssistant: boolean;
        collaboration: boolean;
        databaseProvisioning: boolean;
        containerManagement: boolean;
        gitIntegration: boolean;
        deployment: boolean;
        monitoring: boolean;
    };
    development: {
        debug: boolean;
        hotReload: boolean;
        enableDevTools: boolean;
    };
    production: {
        sslEnabled: boolean;
        sslCertPath: string;
        sslKeyPath: string;
        domain: string;
        baseUrl: string;
    };
};
export declare const validateConfig: () => void;
export type Config = typeof config;
export type DatabaseConfig = typeof config.database;
export type RedisConfig = typeof config.redis;
export type AuthConfig = typeof config.auth;
export type AIConfig = typeof config.ai;
export type DockerConfig = typeof config.docker;
export type SecurityConfig = typeof config.security;
export type StorageConfig = typeof config.storage;
export type LoggingConfig = typeof config.logging;
export type EmailConfig = typeof config.email;
export type MonitoringConfig = typeof config.monitoring;
export type FeaturesConfig = typeof config.features;
export type DevelopmentConfig = typeof config.development;
export type ProductionConfig = typeof config.production;
//# sourceMappingURL=config.d.ts.map