#!/bin/bash

# DevForge Setup Script
# This script initializes the DevForge environment with all required packages and configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        elif command_exists dnf; then
            echo "fedora"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to install packages based on OS
install_packages() {
    local os=$(detect_os)
    print_status "Installing required packages for $os..."
    
    case $os in
        "ubuntu"|"debian")
            print_step "Updating package list..."
            sudo apt-get update
            
            print_step "Installing required packages..."
            sudo apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                openssl \
                ca-certificates \
                gnupg \
                lsb-release \
                software-properties-common \
                apt-transport-https
            ;;
        "centos"|"rhel")
            print_step "Installing required packages..."
            sudo yum install -y \
                curl \
                wget \
                git \
                gcc \
                gcc-c++ \
                make \
                openssl \
                ca-certificates \
                gnupg2
            ;;
        "fedora")
            print_step "Installing required packages..."
            sudo dnf install -y \
                curl \
                wget \
                git \
                gcc \
                gcc-c++ \
                make \
                openssl \
                ca-certificates \
                gnupg2
            ;;
        "macos")
            if ! command_exists brew; then
                print_step "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            print_step "Installing required packages..."
            brew install \
                curl \
                wget \
                git \
                openssl \
                ca-certificates \
                gnupg
            ;;
        *)
            print_warning "Unsupported OS: $os. Please install required packages manually."
            return 1
            ;;
    esac
    
    print_success "Package installation completed"
}

# Function to install Docker
install_docker() {
    if command_exists docker; then
        print_warning "Docker is already installed"
        return 0
    fi
    
    print_status "Installing Docker..."
    local os=$(detect_os)
    
    case $os in
        "ubuntu"|"debian")
            # Add Docker's official GPG key
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg lsb-release
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # Add repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Install Docker
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        "centos"|"rhel")
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        "fedora")
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        "macos")
            print_step "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
            return 1
            ;;
        *)
            print_error "Unsupported OS for Docker installation: $os"
            return 1
            ;;
    esac
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and back in for group changes to take effect"
}

# Function to install Node.js
install_nodejs() {
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 18 ]; then
            print_warning "Node.js 18+ is already installed"
            return 0
        else
            print_warning "Node.js version $node_version is installed, but version 18+ is required"
        fi
    fi
    
    print_status "Installing Node.js 18+..."
    local os=$(detect_os)
    
    case $os in
        "ubuntu"|"debian")
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "centos"|"rhel"|"fedora")
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        "macos")
            brew install node@18
            brew link node@18 --force
            ;;
        *)
            print_error "Unsupported OS for Node.js installation: $os"
            return 1
            ;;
    esac
    
    print_success "Node.js installed successfully"
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    local missing_packages=()
    
    # Check for required commands
    for cmd in curl wget git openssl; do
        if ! command_exists $cmd; then
            missing_packages+=($cmd)
        fi
    done
    
    # Check Docker
    if ! command_exists docker; then
        print_warning "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_warning "Docker Compose is not installed"
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_warning "Node.js is not installed"
    else
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            print_warning "Node.js version 18+ is required (current: $node_version)"
        fi
    fi
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        print_warning "Missing packages: ${missing_packages[*]}"
        print_status "Installing missing packages..."
        install_packages
    fi
    
    print_success "System requirements check completed"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create main directories
    mkdir -p storage/{projects,uploads,temp,templates}
    mkdir -p logs
    mkdir -p ssl
    mkdir -p nginx/ssl
    mkdir -p monitoring/{grafana/{dashboards,datasources},prometheus}
    mkdir -p scripts
    mkdir -p docs
    
    # Create template subdirectories
    mkdir -p storage/templates/{nodejs,react,python,go,rust,php,java}
    
    print_success "Directories created successfully"
}

# Function to setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Environment file created from template"
        else
            print_error ".env.example not found. Creating default .env file..."
            create_default_env
        fi
    else
        print_warning ".env file already exists. Skipping..."
    fi
}

# Function to create default .env file
create_default_env() {
    cat > .env << 'EOF'
# DevForge Environment Configuration

# Application Settings
NODE_ENV=development
API_PORT=3001
FRONTEND_PORT=3000
SOCKET_PORT=3002

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=devforge
POSTGRES_USER=devforge
POSTGRES_PASSWORD=devforge_password
POSTGRES_URL=postgresql://devforge:devforge_password@localhost:5432/devforge

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
SESSION_SECRET=your-session-secret-key-change-this-in-production
BCRYPT_ROUNDS=12

# AI Services
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama:7b
OLLAMA_TIMEOUT=30000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_API_VERSION=1.41
CONTAINER_MEMORY_LIMIT=2g
CONTAINER_CPU_LIMIT=2
CONTAINER_DISK_LIMIT=10g
CONTAINER_NETWORK=devforge-network

# Security Settings
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=your-32-character-encryption-key

# File Storage
STORAGE_PATH=./storage
MAX_FILE_SIZE=100mb
ALLOWED_FILE_TYPES=js,ts,jsx,tsx,py,java,cpp,c,go,rs,php,rb,html,css,scss,json,yaml,yml,md,txt

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/devforge.log
AUDIT_LOG_FILE=./logs/audit.log

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@devforge.local

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Feature Flags
ENABLE_AI_ASSISTANT=true
ENABLE_COLLABORATION=true
ENABLE_DATABASE_PROVISIONING=true
ENABLE_CONTAINER_MANAGEMENT=true
ENABLE_GIT_INTEGRATION=true
ENABLE_DEPLOYMENT=true
ENABLE_MONITORING=true

# Development Settings
DEBUG=true
HOT_RELOAD=true
ENABLE_DEV_TOOLS=true

# Production Settings
SSL_ENABLED=false
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
DOMAIN=localhost
BASE_URL=http://localhost:3000
EOF

    print_success "Default .env file created"
}

# Function to generate SSL certificates for development
generate_ssl_certs() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        mkdir -p ssl
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=DevForge/CN=localhost"
        print_success "SSL certificates generated"
    else
        print_warning "SSL certificates already exist. Skipping..."
    fi
}

# Function to setup database initialization script
setup_database() {
    print_status "Setting up database initialization script..."
    
    # Do not overwrite if file already exists (prevents schema regression)
    if [ -f scripts/init-db.sql ]; then
        print_warning "scripts/init-db.sql already exists. Skipping creation."
        return 0
    fi
    
    cat > scripts/init-db.sql << 'EOF'
-- DevForge Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template VARCHAR(100) DEFAULT 'blank',
    language VARCHAR(50),
    framework VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    content TEXT,
    size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    is_directory BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create containers table
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    container_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped',
    port_mappings JSONB DEFAULT '[]',
    environment_variables JSONB DEFAULT '{}',
    resource_limits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create databases table
CREATE TABLE IF NOT EXISTS databases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    version VARCHAR(50),
    connection_string TEXT,
    credentials JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'stopped',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255),
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_parent ON files(parent_id);
CREATE INDEX IF NOT EXISTS idx_containers_project ON containers(project_id);
CREATE INDEX IF NOT EXISTS idx_databases_project ON databases(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_databases_updated_at BEFORE UPDATE ON databases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_verified, is_active)
VALUES (
    'admin@devforge.local',
    'admin',
    crypt('admin123', gen_salt('bf')),
    'Admin',
    'User',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert default project templates
INSERT INTO projects (name, description, owner_id, template, language, framework, is_public)
SELECT 
    'Welcome to DevForge',
    'Get started with your first project',
    u.id,
    'welcome',
    'javascript',
    'vanilla',
    TRUE
FROM users u WHERE u.email = 'admin@devforge.local'
ON CONFLICT DO NOTHING;
EOF

    print_success "Database initialization script created"
}

# Function to setup monitoring configuration
setup_monitoring() {
    print_status "Setting up monitoring configuration..."
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'devforge-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'

  - job_name: 'devforge-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'

  - job_name: 'devforge-ai-assistant'
    static_configs:
      - targets: ['ai-assistant:3003']
    metrics_path: '/metrics'

  - job_name: 'devforge-workspace-manager'
    static_configs:
      - targets: ['workspace-manager:3004']
    metrics_path: '/metrics'

  - job_name: 'devforge-database-provisioner'
    static_configs:
      - targets: ['database-provisioner:3005']
    metrics_path: '/metrics'

  - job_name: 'devforge-realtime-server'
    static_configs:
      - targets: ['realtime-server:3002']
    metrics_path: '/metrics'
EOF

    # Grafana datasource configuration
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    print_success "Monitoring configuration created"
}

# Function to setup nginx configuration
setup_nginx() {
    print_status "Setting up nginx configuration..."
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:3001;
    }

    upstream realtime {
        server realtime-server:3002;
    }

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name localhost;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Authentication endpoints (stricter rate limiting)
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket for real-time features
        location /socket.io/ {
            proxy_pass http://realtime;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400;
        }

        # Static files
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://frontend;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    print_success "Nginx configuration created"
}

# Function to setup project templates
setup_templates() {
    print_status "Setting up project templates..."
    
    # Ensure template directories exist
    mkdir -p storage/templates/{nodejs,react,python,go,rust,php,java}
    
    # Node.js template
    cat > storage/templates/nodejs/package.json << 'EOF'
{
  "name": "devforge-nodejs-project",
  "version": "1.0.0",
  "description": "A Node.js project created with DevForge",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  },
  "keywords": ["devforge", "nodejs", "express"],
  "author": "DevForge User",
  "license": "MIT"
}
EOF

    cat > storage/templates/nodejs/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from DevForge!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

    cat > storage/templates/nodejs/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

    # React template
    cat > storage/templates/react/package.json << 'EOF'
{
  "name": "devforge-react-project",
  "version": "1.0.0",
  "description": "A React project created with DevForge",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

    mkdir -p storage/templates/react/src
    cat > storage/templates/react/src/App.js << 'EOF'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to DevForge!</h1>
        <p>Your React project is ready to go.</p>
        <a
          className="App-link"
          href="https://github.com/devforge/devforge"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about DevForge
        </a>
      </header>
    </div>
  );
}

export default App;
EOF

# Function to scaffold missing microservice directories (minimal runnable placeholders)
setup_services() {
    print_status "Scaffolding microservice directories..."

    mkdir -p services/ai-assistant services/workspace-manager services/database-provisioner services/realtime-server

    # ai-assistant
    if [ ! -f services/ai-assistant/package.json ]; then
        cat > services/ai-assistant/package.json << 'EOF'
{
  "name": "devforge-ai-assistant",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.1"
  }
}
EOF
        mkdir -p services/ai-assistant/src
        cat > services/ai-assistant/src/index.ts << 'EOF'
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`AI Assistant listening on ${port}`));
EOF
        cat > services/ai-assistant/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
EOF
        cat > services/ai-assistant/Dockerfile << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
EOF
    fi

    # workspace-manager
    if [ ! -f services/workspace-manager/package.json ]; then
        cat > services/workspace-manager/package.json << 'EOF'
{
  "name": "devforge-workspace-manager",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dockerode": "^4.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.1"
  }
}
EOF
        mkdir -p services/workspace-manager/src
        cat > services/workspace-manager/src/index.ts << 'EOF'
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`Workspace Manager listening on ${port}`));
EOF
        cat > services/workspace-manager/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
EOF
        cat > services/workspace-manager/Dockerfile << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3004
CMD ["npm", "start"]
EOF
    fi

    # database-provisioner
    if [ ! -f services/database-provisioner/package.json ]; then
        cat > services/database-provisioner/package.json << 'EOF'
{
  "name": "devforge-database-provisioner",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.1"
  }
}
EOF
        mkdir -p services/database-provisioner/src
        cat > services/database-provisioner/src/index.ts << 'EOF'
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

app.listen(port, () => console.log(`Database Provisioner listening on ${port}`));
EOF
        cat > services/database-provisioner/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
EOF
        cat > services/database-provisioner/Dockerfile << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
EOF
    fi

    # realtime-server
    if [ ! -f services/realtime-server/package.json ]; then
        cat > services/realtime-server/package.json << 'EOF'
{
  "name": "devforge-realtime-server",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.1"
  }
}
EOF
        mkdir -p services/realtime-server/src
        cat > services/realtime-server/src/index.ts << 'EOF'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = Number(process.env.PORT) || 3002;

io.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Connected to DevForge realtime server' });
});

app.get('/health', (_req, res) => res.json({ status: 'healthy' }));

server.listen(port, () => console.log(`Realtime server listening on ${port}`));
EOF
        cat > services/realtime-server/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
EOF
        cat > services/realtime-server/Dockerfile << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
EOF
    fi

    print_success "Microservice scaffolding completed"
}

    cat > storage/templates/react/src/App.css << 'EOF'
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #61dafb;
}
EOF

    # Python template
    cat > storage/templates/python/requirements.txt << 'EOF'
flask==2.3.3
flask-cors==4.0.0
python-dotenv==1.0.0
EOF

    cat > storage/templates/python/app.py << 'EOF'
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from DevForge!',
        'timestamp': datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
EOF

    print_success "Project templates created"
}

# Function to check Docker daemon
check_docker() {
    print_status "Checking Docker daemon..."
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "Docker daemon is running"
}

# Function to pull required images
pull_images() {
    print_status "Pulling required Docker images..."
    
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    docker pull nginx:alpine
    docker pull prom/prometheus:latest
    docker pull grafana/grafana:latest
    docker pull mailhog/mailhog:latest
    
    print_success "Docker images pulled successfully"
}

# Function to install npm packages
install_npm_packages() {
    print_status "Installing npm packages..."
    
    # Install root packages
    if [ -f package.json ]; then
        npm install --legacy-peer-deps
    fi
    
    # Install frontend packages
    if [ -f frontend/package.json ]; then
        cd frontend
        npm install --legacy-peer-deps
        cd ..
    fi
    
    # Install backend packages
    if [ -f backend/package.json ]; then
        cd backend
        npm install --legacy-peer-deps
        cd ..
    fi
    
    # Install service packages if present
    for svc in services/ai-assistant services/workspace-manager services/database-provisioner services/realtime-server; do
        if [ -f "$svc/package.json" ]; then
            cd "$svc"
            npm install --legacy-peer-deps || true
            cd - >/dev/null 2>&1
        fi
    done
    
    print_success "npm packages installed successfully"
}

# Main setup function
main() {
    # Flags
    AUTO_YES=0
    for arg in "$@"; do
        case $arg in
            -y|--yes)
                AUTO_YES=1
                shift
                ;;
        esac
    done
    echo "=========================================="
    echo "    DevForge Setup Script"
    echo "=========================================="
    echo ""
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root. Some operations may not work correctly."
    fi
    
    check_requirements
    
    # Ask user if they want to install missing packages, unless auto-yes is enabled
    if ! command_exists docker || ! command_exists node; then
        if [ "$AUTO_YES" -eq 1 ]; then
            if ! command_exists docker; then
                install_docker
            fi
            if ! command_exists node; then
                install_nodejs
            fi
        else
            echo ""
            read -p "Do you want to install missing packages (Docker, Node.js)? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if ! command_exists docker; then
                    install_docker
                fi
                if ! command_exists node; then
                    install_nodejs
                fi
            fi
        fi
    fi
    
    check_docker
    create_directories
    setup_environment
    generate_ssl_certs
    setup_database
    setup_monitoring
    setup_nginx
    setup_templates
    setup_services
    pull_images
    
    # Install npm packages if Node.js is available
    if command_exists node && command_exists npm; then
        install_npm_packages
    else
        print_warning "Node.js/npm not available. Skipping npm package installation."
    fi
    
    echo ""
    echo "=========================================="
    print_success "DevForge setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review and update .env file with your configuration"
    echo "2. Run: docker-compose up -d"
    echo "3. Access DevForge at: https://localhost"
    echo "4. Default admin credentials: admin@devforge.local / admin123"
    echo ""
    echo "For more information, see docs/SETUP.md"
    echo ""
}

# Run main function
main "$@" 