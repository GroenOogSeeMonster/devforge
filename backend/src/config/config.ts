import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Application settings
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['API_PORT'] || '3001', 10),
  frontendPort: parseInt(process.env['FRONTEND_PORT'] || '3000', 10),
  socketPort: parseInt(process.env['SOCKET_PORT'] || '3002', 10),

  // Database configuration
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

  // Redis configuration
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || undefined,
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    db: 0,
  },

  // Authentication
  auth: {
    jwtSecret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '30d',
    sessionSecret: process.env['SESSION_SECRET'] || 'your-session-secret-key-change-this-in-production',
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
  },

  // AI Assistant configuration
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

  // Docker configuration
  docker: {
    host: process.env['DOCKER_HOST'] || 'unix:///var/run/docker.sock',
    apiVersion: process.env['DOCKER_API_VERSION'] || '1.41',
    containerMemoryLimit: process.env['CONTAINER_MEMORY_LIMIT'] || '2g',
    containerCpuLimit: parseInt(process.env['CONTAINER_CPU_LIMIT'] || '2', 10),
    containerDiskLimit: process.env['CONTAINER_DISK_LIMIT'] || '10g',
    containerNetwork: process.env['CONTAINER_NETWORK'] || 'devforge-network',
  },

  // Security settings
  security: {
    corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    encryptionKey: process.env['ENCRYPTION_KEY'] || 'your-32-character-encryption-key',
  },

  // File storage
  storage: {
    path: process.env['STORAGE_PATH'] || './storage',
    maxFileSize: process.env['MAX_FILE_SIZE'] || '100mb',
    allowedFileTypes: (process.env['ALLOWED_FILE_TYPES'] || 'js,ts,jsx,tsx,py,java,cpp,c,go,rs,php,rb,html,css,scss,json,yaml,yml,md,txt').split(','),
  },

  // Logging
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    logFile: process.env['LOG_FILE'] || './logs/devforge.log',
    auditLogFile: process.env['AUDIT_LOG_FILE'] || './logs/audit.log',
  },

  // Email configuration
  email: {
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
    user: process.env['SMTP_USER'],
    password: process.env['SMTP_PASSWORD'],
    from: process.env['EMAIL_FROM'] || 'noreply@devforge.local',
    secure: false,
  },

  // Monitoring
  monitoring: {
    enabled: process.env['ENABLE_METRICS'] === 'true',
    port: parseInt(process.env['METRICS_PORT'] || '9090', 10),
    prometheusEnabled: process.env['PROMETHEUS_ENABLED'] === 'true',
    grafanaEnabled: process.env['GRAFANA_ENABLED'] === 'true',
  },

  // Feature flags
  features: {
    aiAssistant: process.env['ENABLE_AI_ASSISTANT'] !== 'false',
    collaboration: process.env['ENABLE_COLLABORATION'] !== 'false',
    databaseProvisioning: process.env['ENABLE_DATABASE_PROVISIONING'] !== 'false',
    containerManagement: process.env['ENABLE_CONTAINER_MANAGEMENT'] !== 'false',
    gitIntegration: process.env['ENABLE_GIT_INTEGRATION'] !== 'false',
    deployment: process.env['ENABLE_DEPLOYMENT'] !== 'false',
    monitoring: process.env['ENABLE_MONITORING'] !== 'false',
  },

  // Development settings
  development: {
    debug: process.env['DEBUG'] === 'true',
    hotReload: process.env['HOT_RELOAD'] === 'true',
    enableDevTools: process.env['ENABLE_DEV_TOOLS'] === 'true',
  },

  // Production settings
  production: {
    sslEnabled: process.env['SSL_ENABLED'] === 'true',
    sslCertPath: process.env['SSL_CERT_PATH'] || './ssl/cert.pem',
    sslKeyPath: process.env['SSL_KEY_PATH'] || './ssl/key.pem',
    domain: process.env['DOMAIN'] || 'localhost',
    baseUrl: process.env['BASE_URL'] || 'http://localhost:3000',
  },
};

// Validate required configuration
export const validateConfig = (): void => {
  const required = [
    'auth.jwtSecret',
    'auth.sessionSecret',
    'security.encryptionKey',
  ];

  const getValue = (path: string): unknown => {
    return path.split('.').reduce((obj: any, k: string) => (obj ? obj[k] : undefined), config as any);
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

// Export types for configuration
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
