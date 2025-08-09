# DevForge Setup Guide

This guide will help you set up DevForge on your system. DevForge is a complete open-source, self-hosted alternative to Replit with AI-powered development capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows (with WSL2)
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 20GB free disk space
- **CPU**: 4 cores minimum (8 cores recommended)
- **Network**: Stable internet connection

### Software Requirements

- **Docker**: 20.10+ and Docker Compose 2.0+
- **Git**: 2.30+
- **Node.js**: 18.0+ (for development)
- **Make**: (optional, for using Makefile commands)

### Hardware Recommendations

For optimal performance, especially with AI features:

- **GPU**: NVIDIA GPU with 8GB+ VRAM (for Ollama)
- **RAM**: 32GB+ for large projects
- **Storage**: SSD with 100GB+ free space
- **Network**: 100Mbps+ connection

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/devforge/devforge.git
cd devforge
```

### 2. Run Setup Script

```bash
# Make setup script executable (Linux/macOS)
chmod +x scripts/setup.sh

# Run setup script
./scripts/setup.sh
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Access DevForge

- **Main Application**: https://localhost
- **API Documentation**: https://localhost/api-docs
- **Grafana Dashboard**: http://localhost:3006 (admin/admin)
- **MailHog**: http://localhost:8025

### 5. Default Credentials

- **Email**: admin@devforge.local
- **Password**: admin123

## Detailed Installation

### Manual Setup (Alternative to Setup Script)

If you prefer to set up manually or the setup script fails:

#### 1. Create Environment File

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```bash
# Required: Update these values
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key

# Optional: AI Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### 2. Create Directories

```bash
mkdir -p storage/{projects,uploads,temp}
mkdir -p logs
mkdir -p ssl
mkdir -p nginx/ssl
mkdir -p monitoring/{grafana/{dashboards,datasources},prometheus}
```

#### 3. Generate SSL Certificates

```bash
# Development certificates
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=DevForge/CN=localhost"

# Copy to nginx directory
cp ssl/* nginx/ssl/
```

#### 4. Build and Start Services

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Configuration

### Environment Variables

Key configuration options in `.env`:

#### Application Settings
```bash
NODE_ENV=development          # development, production, test
PORT=3000                     # Frontend port
API_PORT=3001                 # Backend API port
SOCKET_PORT=3002              # WebSocket port
```

#### Database Configuration
```bash
POSTGRES_DB=devforge          # Database name
POSTGRES_USER=devforge        # Database user
POSTGRES_PASSWORD=devforge_password  # Database password
REDIS_PASSWORD=               # Redis password (optional)
```

#### AI Assistant Configuration
```bash
# Ollama (Primary - Local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama:7b

# OpenAI (Fallback)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Anthropic (Fallback)
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### Security Settings
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
```

#### Container Settings
```bash
CONTAINER_MEMORY_LIMIT=2g    # Memory limit per container
CONTAINER_CPU_LIMIT=2         # CPU limit per container
CONTAINER_DISK_LIMIT=10g      # Disk limit per container
```

### Feature Flags

Enable/disable features:

```bash
ENABLE_AI_ASSISTANT=true
ENABLE_COLLABORATION=true
ENABLE_DATABASE_PROVISIONING=true
ENABLE_CONTAINER_MANAGEMENT=true
ENABLE_GIT_INTEGRATION=true
ENABLE_DEPLOYMENT=true
ENABLE_MONITORING=true
```

### SSL/TLS Configuration

For production, configure proper SSL certificates:

```bash
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts

If ports are already in use:

```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Stop conflicting services or change ports in .env
```

#### 2. Docker Permission Issues

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart docker service
sudo systemctl restart docker

# Log out and back in, or run:
newgrp docker
```

#### 3. Database Connection Issues

```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### 4. AI Assistant Not Working

```bash
# Check Ollama service
docker-compose logs ollama

# Pull AI model
docker exec devforge-ollama ollama pull codellama:7b

# Check model status
docker exec devforge-ollama ollama list
```

#### 5. Memory Issues

If you encounter memory issues:

```bash
# Increase Docker memory limit
# In Docker Desktop: Settings > Resources > Memory

# Or reduce container limits in .env
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=1
```

### Logs and Debugging

#### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

#### Check Service Health

```bash
# Health check endpoints
curl http://localhost:3001/health
curl http://localhost:3000/

# Service status
docker-compose ps
```

#### Database Debugging

```bash
# Connect to database
docker exec -it devforge-postgres psql -U devforge -d devforge

# Check tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;
```

## Production Deployment

### Security Checklist

- [ ] Change default passwords
- [ ] Configure proper SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Use secrets management
- [ ] Enable audit logging

### Performance Optimization

#### Resource Allocation

```bash
# Increase resource limits for production
CONTAINER_MEMORY_LIMIT=4g
CONTAINER_CPU_LIMIT=4
CONTAINER_DISK_LIMIT=20g
```

#### Database Optimization

```bash
# PostgreSQL settings for production
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
POSTGRES_WORK_MEM=4MB
POSTGRES_MAINTENANCE_WORK_MEM=64MB
```

#### Caching Configuration

```bash
# Redis settings
REDIS_MAXMEMORY=512mb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

### Backup Strategy

#### Database Backup

```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec devforge-postgres pg_dump -U devforge devforge > backup_$DATE.sql
gzip backup_$DATE.sql
EOF

chmod +x scripts/backup.sh
```

#### File Storage Backup

```bash
# Backup storage directory
tar -czf storage_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage/
```

### Monitoring Setup

#### Prometheus Configuration

```bash
# Add custom metrics
# Edit monitoring/prometheus.yml
```

#### Grafana Dashboards

```bash
# Import dashboards
# Copy dashboard JSON files to monitoring/grafana/dashboards/
```

### Scaling Considerations

#### Horizontal Scaling

```bash
# Use Docker Swarm or Kubernetes
docker swarm init
docker stack deploy -c docker-compose.prod.yml devforge
```

#### Load Balancing

```bash
# Configure nginx load balancer
# Edit nginx/nginx.conf for multiple backend instances
```

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs: `docker-compose logs -f`
3. Check the [GitHub Issues](https://github.com/devforge/devforge/issues)
4. Join our [Discord Community](https://discord.gg/devforge)

## Next Steps

After successful installation:

1. [User Guide](USER_GUIDE.md) - Learn how to use DevForge
2. [API Documentation](API.md) - Explore the API
3. [Development Guide](DEVELOPMENT.md) - Contribute to DevForge
4. [Security Guide](SECURITY.md) - Security best practices 