# DevForge 🚀

**DevForge** is a complete, open-source, self-hosted alternative to Replit. It provides a comprehensive development environment with AI-powered assistance, real-time collaboration, container management, database provisioning, and deployment capabilities.

## ✨ Features

### 🎯 Core Features
- **Modern Web IDE**: VS Code-inspired interface with syntax highlighting, IntelliSense, and Git integration
- **AI-Powered Development**: Natural language to code, bug detection, optimization, and unit test generation
- **Real-time Collaboration**: Live code editing, cursor tracking, and shared terminals
- **Container Management**: Automatic provisioning, resource monitoring, and secure isolation
- **Database Services**: One-click PostgreSQL, MySQL, MongoDB, and Redis provisioning
- **Deployment Pipeline**: Automated builds, testing, and deployment to multiple environments

### 🔧 Technical Stack
- **Frontend**: React 18, TypeScript, Mantine UI, CodeMirror 6
- **Backend**: Node.js, Express, WebSocket, JWT Authentication
- **AI Integration**: Ollama (local), OpenAI, Anthropic APIs
- **Databases**: PostgreSQL (primary), MySQL, MongoDB, Redis
- **Containerization**: Docker, Docker Compose, gVisor (secure isolation)
- **Real-time**: Socket.IO with Redis adapter
- **Monitoring**: Prometheus, Grafana, comprehensive logging

### 🛡️ Security Features
- Container isolation with user namespaces
- Read-only root filesystems
- Network segmentation
- Input validation and sanitization
- Rate limiting and CSRF protection
- Audit logging and security monitoring
- JWT-based authentication with refresh tokens

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devforge/devforge.git
   cd devforge
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access DevForge**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Default Credentials
- **Admin User**: `admin@devforge.local`
- **Password**: `admin123`

## 📁 Project Structure

```
devforge/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   └── scripts/            # Database and setup scripts
├── services/               # Microservices
│   ├── ai-assistant/       # AI integration service
│   ├── workspace-manager/  # Project workspace management
│   ├── database-provisioner/ # Database provisioning
│   └── realtime-server/    # Real-time collaboration
├── docker/                 # Docker configurations
├── infrastructure/         # Infrastructure as code
├── scripts/               # Setup and deployment scripts
├── tests/                 # Test suites
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Application
NODE_ENV=development
API_PORT=3001
FRONTEND_PORT=3000
SOCKET_PORT=3002

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=devforge
POSTGRES_USER=devforge
POSTGRES_PASSWORD=devforge_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Services
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama:7b
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
CONTAINER_MEMORY_LIMIT=2g
CONTAINER_CPU_LIMIT=2
```

### AI Configuration

DevForge supports multiple AI providers:

1. **Ollama (Local)**: Free, self-hosted AI models
2. **OpenAI**: GPT-4, GPT-3.5-turbo
3. **Anthropic**: Claude models

Configure your preferred provider in the `.env` file.

## 🎨 Customization

### Themes and Styling
- Customize the UI theme in `frontend/src/App.tsx`
- Modify Mantine theme configuration
- Add custom CSS in `frontend/src/styles/`

### Extensions and Plugins
- Add CodeMirror extensions in the editor
- Implement custom AI providers
- Extend the API with new endpoints

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Test Coverage
- Unit tests: 80%+ coverage
- Integration tests: API endpoints
- E2E tests: User workflows
- Security tests: Vulnerability scanning

## 📊 Monitoring

### Health Checks
- Application health: `/health`
- Database status: `/health/database`
- Redis status: `/health/redis`
- System metrics: `/health/system`

### Metrics and Logging
- Prometheus metrics: `/metrics`
- Grafana dashboards: http://localhost:3000/grafana
- Application logs: `./logs/devforge.log`
- Audit logs: `./logs/audit.log`

## 🔒 Security

### Security Features
- **Container Isolation**: User namespaces and read-only filesystems
- **Network Security**: Segmentation and firewall rules
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: 100 requests per minute per IP
- **Audit Logging**: All actions logged for compliance

### Security Best Practices
1. Change default passwords immediately
2. Use strong JWT secrets
3. Enable SSL/TLS in production
4. Regular security updates
5. Monitor audit logs

## 🚀 Deployment

### Production Deployment

1. **Prepare production environment**
   ```bash
   export NODE_ENV=production
   export SSL_ENABLED=true
   export DOMAIN=your-domain.com
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configure reverse proxy (Nginx)**
   ```bash
   # Copy nginx configuration
   cp docker/nginx/nginx.conf /etc/nginx/sites-available/devforge
   sudo ln -s /etc/nginx/sites-available/devforge /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

### Kubernetes Deployment
```bash
kubectl apply -f infrastructure/k8s/
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for commit messages
- Comprehensive documentation

## 📚 Documentation

- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Security Guide](docs/SECURITY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres
   # View logs
   docker-compose logs postgres
   ```

2. **Container startup issues**
   ```bash
   # Check Docker daemon
   docker info
   # View container logs
   docker-compose logs
   ```

3. **AI service not responding**
   ```bash
   # Check Ollama status
   curl http://localhost:11434/api/tags
   # Restart AI service
   docker-compose restart ai-assistant
   ```

### Getting Help
- [Issues](https://github.com/devforge/devforge/issues)
- [Discussions](https://github.com/devforge/devforge/discussions)
- [Documentation](docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mantine](https://mantine.dev/) for the UI components
- [CodeMirror](https://codemirror.net/) for the code editor
- [Ollama](https://ollama.ai/) for local AI models
- [Docker](https://www.docker.com/) for containerization
- [PostgreSQL](https://www.postgresql.org/) for the database

## 📈 Roadmap

- [ ] Advanced AI features (code generation, refactoring)
- [ ] Multi-language support
- [ ] Advanced collaboration features
- [ ] Mobile application
- [ ] Enterprise features (SSO, LDAP)
- [ ] Plugin system
- [ ] Advanced monitoring and analytics

---

**DevForge** - Build, collaborate, and deploy with AI-powered assistance. 🚀

Made with ❤️ by the DevForge community.