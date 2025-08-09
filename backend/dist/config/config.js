"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['API_PORT'] || '3001', 10),
    frontendPort: parseInt(process.env['FRONTEND_PORT'] || '3000', 10),
    socketPort: parseInt(process.env['SOCKET_PORT'] || '3002', 10),
    database: {
        host: process.env['POSTGRES_HOST'] || 'localhost',
        port: parseInt(process.env['POSTGRES_PORT'] || '5432', 10),
        name: process.env['POSTGRES_DB'] || 'devforge',
        user: process.env['POSTGRES_USER'] || 'devforge',
        password: process.env['POSTGRES_PASSWORD'] || 'devforge_password',
        url: process.env['POSTGRES_URL'] || 'postgresql://devforge:devforge_password@localhost:5432/devforge',
        ssl: process.env['NODE_ENV'] === 'production',
        pool: {
            min: 2,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        },
    },
    redis: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
        password: process.env['REDIS_PASSWORD'] || undefined,
        url: process.env['REDIS_URL'] || 'redis://localhost:6379',
        db: 0,
    },
    auth: {
        jwtSecret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
        jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
        jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '30d',
        sessionSecret: process.env['SESSION_SECRET'] || 'your-session-secret-key-change-this-in-production',
        bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
    },
    ai: {
        ollama: {
            url: process.env['OLLAMA_URL'] || 'http://localhost:11434',
            model: process.env['OLLAMA_MODEL'] || 'codellama:7b',
            timeout: parseInt(process.env['OLLAMA_TIMEOUT'] || '30000', 10),
        },
        openai: {
            apiKey: process.env['OPENAI_API_KEY'],
            model: process.env['OPENAI_MODEL'] || 'gpt-4',
            maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '4000', 10),
            temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.7'),
        },
        anthropic: {
            apiKey: process.env['ANTHROPIC_API_KEY'],
            model: process.env['ANTHROPIC_MODEL'] || 'claude-3-sonnet-20240229',
            maxTokens: parseInt(process.env['ANTHROPIC_MAX_TOKENS'] || '4000', 10),
        },
    },
    docker: {
        host: process.env['DOCKER_HOST'] || 'unix:///var/run/docker.sock',
        apiVersion: process.env['DOCKER_API_VERSION'] || '1.41',
        containerMemoryLimit: process.env['CONTAINER_MEMORY_LIMIT'] || '2g',
        containerCpuLimit: parseInt(process.env['CONTAINER_CPU_LIMIT'] || '2', 10),
        containerDiskLimit: process.env['CONTAINER_DISK_LIMIT'] || '10g',
        containerNetwork: process.env['CONTAINER_NETWORK'] || 'devforge-network',
    },
    security: {
        corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
        rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
        rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
        encryptionKey: process.env['ENCRYPTION_KEY'] || 'your-32-character-encryption-key',
    },
    storage: {
        path: process.env['STORAGE_PATH'] || './storage',
        maxFileSize: process.env['MAX_FILE_SIZE'] || '100mb',
        allowedFileTypes: (process.env['ALLOWED_FILE_TYPES'] || 'js,ts,jsx,tsx,py,java,cpp,c,go,rs,php,rb,html,css,scss,json,yaml,yml,md,txt').split(','),
    },
    logging: {
        level: process.env['LOG_LEVEL'] || 'info',
        logFile: process.env['LOG_FILE'] || './logs/devforge.log',
        auditLogFile: process.env['AUDIT_LOG_FILE'] || './logs/audit.log',
    },
    email: {
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: parseInt(process.env['SMTP_PORT'] || '587', 10),
        user: process.env['SMTP_USER'],
        password: process.env['SMTP_PASSWORD'],
        from: process.env['EMAIL_FROM'] || 'noreply@devforge.local',
        secure: false,
    },
    monitoring: {
        enabled: process.env['ENABLE_METRICS'] === 'true',
        port: parseInt(process.env['METRICS_PORT'] || '9090', 10),
        prometheusEnabled: process.env['PROMETHEUS_ENABLED'] === 'true',
        grafanaEnabled: process.env['GRAFANA_ENABLED'] === 'true',
    },
    features: {
        aiAssistant: process.env['ENABLE_AI_ASSISTANT'] !== 'false',
        collaboration: process.env['ENABLE_COLLABORATION'] !== 'false',
        databaseProvisioning: process.env['ENABLE_DATABASE_PROVISIONING'] !== 'false',
        containerManagement: process.env['ENABLE_CONTAINER_MANAGEMENT'] !== 'false',
        gitIntegration: process.env['ENABLE_GIT_INTEGRATION'] !== 'false',
        deployment: process.env['ENABLE_DEPLOYMENT'] !== 'false',
        monitoring: process.env['ENABLE_MONITORING'] !== 'false',
    },
    development: {
        debug: process.env['DEBUG'] === 'true',
        hotReload: process.env['HOT_RELOAD'] === 'true',
        enableDevTools: process.env['ENABLE_DEV_TOOLS'] === 'true',
    },
    production: {
        sslEnabled: process.env['SSL_ENABLED'] === 'true',
        sslCertPath: process.env['SSL_CERT_PATH'] || './ssl/cert.pem',
        sslKeyPath: process.env['SSL_KEY_PATH'] || './ssl/key.pem',
        domain: process.env['DOMAIN'] || 'localhost',
        baseUrl: process.env['BASE_URL'] || 'http://localhost:3000',
    },
};
const validateConfig = () => {
    const required = [
        'auth.jwtSecret',
        'auth.sessionSecret',
        'security.encryptionKey',
    ];
    const getValue = (path) => {
        return path.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), exports.config);
    };
    const missing = required.filter((key) => {
        const value = getValue(key);
        if (typeof value === 'string') {
            return value.trim() === '' || value.includes('change-this-in-production');
        }
        return !value;
    });
    if (missing.length > 0) {
        throw new Error(`Missing or invalid required configuration: ${missing.join(', ')}`);
    }
};
exports.validateConfig = validateConfig;
//# sourceMappingURL=config.js.map