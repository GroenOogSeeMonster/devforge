# DevForge Installation Guide

This guide will walk you through installing and setting up DevForge on your system.

## 📋 Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+), macOS 10.15+, or Windows 10/11 with WSL2
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 20GB free disk space
- **CPU**: 4 cores minimum (8 cores recommended)

### Required Software
- **Docker**: 20.10+ with Docker Compose 2.0+
- **Node.js**: 18+ and npm
- **Git**: 2.30+
- **Make**: For running setup scripts

## 🚀 Quick Installation

### 1. Clone the Repository
```bash
git clone https://github.com/devforge/devforge.git
cd devforge
```

### 2. Run Automated Setup
```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

### 3. Start DevForge
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Access DevForge
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

**Default Login:**
- Email: `admin@devforge.local`
- Password: `admin123`

## 🔧 Manual Installation

### Step 1: Install Dependencies

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y
```

#### CentOS/RHEL
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install git -y
```

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node@18

# Install Git
brew install git
```

#### Windows (WSL2)
```bash
# Install Docker Desktop for Windows
# Download from: https://www.docker.com/products/docker-desktop

# Install Node.js
# Download from: https://nodejs.org/

# Install Git
# Download from: https://git-scm.com/
```

### Step 2: Clone and Setup

```bash
# Clone repository
git clone https://github.com/devforge/devforge.git
cd devforge

# Create environment file
cp .env.example .env
```

### Step 3: Configure Environment

Edit `.env` file with your settings:

```env
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
POSTGRES_PASSWORD=your_secure_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# AI Services (Optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama:7b
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Docker Settings
DOCKER_HOST=unix:///var/run/docker.sock
CONTAINER_MEMORY_LIMIT=2g
CONTAINER_CPU_LIMIT=2
CONTAINER_DISK_LIMIT=10g

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=your_32_character_encryption_key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@devforge.local
```

### Step 4: Initialize Database

```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE devforge;"
sudo -u postgres psql -c "CREATE USER devforge WITH PASSWORD 'your_secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE devforge TO devforge;"

# Run database initialization
psql -h localhost -U devforge -d devforge -f scripts/init-db.sql
```

### Step 5: Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 🔒 Security Configuration

### 1. Change Default Passwords
```bash
# Change admin password
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "your_secure_password"
  }'
```

### 2. Configure SSL/TLS (Production)
```bash
# Generate SSL certificates
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Update .env
SSL_ENABLED=true
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

### 3. Configure Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload
```

## 🧪 Verification

### 1. Health Checks
```bash
# Application health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/health/database

# Redis health
curl http://localhost:3001/health/redis
```

### 2. Service Status
```bash
# Check all services
docker-compose ps

# Check service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

### 3. Test Login
```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@devforge.local",
    "password": "admin123"
  }'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill process or change ports in .env
```

#### 2. Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

#### 3. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U devforge -d devforge -c "SELECT 1;"

# View logs
docker-compose logs postgres
```

#### 4. Memory Issues
```bash
# Check available memory
free -h

# Increase swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 5. AI Service Not Working
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Pull AI model
docker exec -it ollama ollama pull codellama:7b

# Restart AI service
docker-compose restart ai-assistant
```

### Getting Help

1. **Check Logs**
   ```bash
   docker-compose logs -f [service_name]
   ```

2. **Restart Services**
   ```bash
   docker-compose restart
   ```

3. **Reset Everything**
   ```bash
   docker-compose down -v
   docker system prune -a
   ./scripts/setup.sh
   docker-compose up -d
   ```

4. **Community Support**
   - [GitHub Issues](https://github.com/devforge/devforge/issues)
   - [Discussions](https://github.com/devforge/devforge/discussions)
   - [Documentation](docs/)

## 🚀 Production Deployment

### 1. Production Environment Setup
```bash
# Set production environment
export NODE_ENV=production
export SSL_ENABLED=true
export DOMAIN=your-domain.com

# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo cp docker/nginx/nginx.conf /etc/nginx/sites-available/devforge
sudo ln -s /etc/nginx/sites-available/devforge /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Monitoring Setup
```bash
# Access monitoring
# Prometheus: http://your-domain.com:9090
# Grafana: http://your-domain.com:3000/grafana

# Default Grafana credentials
# Username: admin
# Password: admin
```

## 📊 Performance Tuning

### 1. Resource Limits
```env
# Adjust in .env
CONTAINER_MEMORY_LIMIT=4g
CONTAINER_CPU_LIMIT=4
```

### 2. Database Optimization
```sql
-- PostgreSQL tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

### 3. Redis Optimization
```bash
# Redis configuration
echo "maxmemory 512mb" >> /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
```

## 🔄 Updates and Maintenance

### 1. Update DevForge
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. Backup and Restore
```bash
# Backup database
docker exec postgres pg_dump -U devforge devforge > backup.sql

# Restore database
docker exec -i postgres psql -U devforge devforge < backup.sql
```

### 3. Log Rotation
```bash
# Configure log rotation
sudo cp docker/logrotate/devforge /etc/logrotate.d/
sudo systemctl restart logrotate
```

---

**Need Help?** Check our [Troubleshooting Guide](docs/TROUBLESHOOTING.md) or [create an issue](https://github.com/devforge/devforge/issues).
