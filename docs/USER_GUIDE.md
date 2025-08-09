# DevForge User Guide

Welcome to DevForge! This guide will help you get started and make the most of your AI-powered development environment.

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Project Management](#project-management)
- [Code Editor](#code-editor)
- [AI Assistant](#ai-assistant)
- [Terminal](#terminal)
- [Database Management](#database-management)
- [Container Management](#container-management)
- [Collaboration](#collaboration)
- [Deployment](#deployment)
- [Settings & Configuration](#settings--configuration)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First Login

1. **Access DevForge**: Open your browser and navigate to your DevForge instance
2. **Default Credentials**:
   - Email: `admin@devforge.local`
   - Password: `admin123`
3. **Change Password**: After first login, you'll be prompted to change your password

### Account Setup

1. **Profile Configuration**:
   - Click your avatar in the top-right corner
   - Select "Profile Settings"
   - Update your personal information
   - Upload a profile picture

2. **Preferences**:
   - Set your preferred theme (Dark/Light)
   - Configure editor settings
   - Set default language preferences

## Dashboard Overview

The DevForge dashboard provides a comprehensive overview of your development environment.

### Main Sections

#### 1. Project Grid
- **Recent Projects**: Quick access to your recently worked on projects
- **Create New**: Start a new project with templates
- **Search & Filter**: Find projects by name, language, or framework

#### 2. Quick Actions
- **New Project**: Create a project from scratch
- **Import Project**: Import from Git repository
- **Templates**: Browse project templates

#### 3. Activity Feed
- **Recent Activity**: See your latest file changes, commits, and deployments
- **Collaboration**: View team member activities
- **Notifications**: System and project notifications

#### 4. Resource Usage
- **Container Status**: Monitor running containers
- **Database Usage**: Track database connections
- **Storage**: View project storage usage

## Project Management

### Creating a New Project

1. **From Dashboard**:
   - Click "Create New Project"
   - Choose a template or start from scratch
   - Enter project details

2. **Available Templates**:
   - **React**: Full-stack React application
   - **Node.js**: Express.js backend
   - **Python**: Flask/Django applications
   - **Vue.js**: Vue.js frontend
   - **Angular**: Angular application
   - **Blank**: Empty project

3. **Project Configuration**:
   ```json
   {
     "name": "My Awesome Project",
     "description": "A description of my project",
     "template": "react",
     "language": "javascript",
     "framework": "react",
     "isPublic": false
   }
   ```

### Project Settings

#### General Settings
- **Project Name**: Update project name and description
- **Visibility**: Make project public or private
- **Archiving**: Archive inactive projects

#### Collaboration
- **Team Members**: Add/remove collaborators
- **Permissions**: Set role-based access
- **Invitations**: Send project invitations

#### Git Integration
- **Repository**: Connect to Git repository
- **Branches**: Manage Git branches
- **Commits**: View commit history

## Code Editor

DevForge features a powerful, VS Code-inspired editor with advanced capabilities.

### Editor Features

#### 1. File Explorer
- **Tree View**: Hierarchical file structure
- **Search**: Find files quickly
- **Context Menu**: Right-click for file operations

#### 2. Multi-tab Editing
- **Tab Management**: Multiple files open simultaneously
- **Split View**: Side-by-side editing
- **Tab Groups**: Organize related files

#### 3. Syntax Highlighting
- **Languages**: 20+ programming languages
- **Themes**: Multiple color schemes
- **Customization**: Personalize editor appearance

#### 4. IntelliSense
- **Auto-completion**: Smart code suggestions
- **Error Detection**: Real-time error highlighting
- **Go to Definition**: Navigate to function definitions

### Advanced Features

#### 1. Find and Replace
- **Search**: Find text across files
- **Regex**: Regular expression support
- **Replace**: Batch text replacement

#### 2. Code Folding
- **Collapse**: Hide code blocks
- **Expand**: Show hidden code
- **Custom Folding**: Define foldable regions

#### 3. Minimap
- **Overview**: File structure visualization
- **Navigation**: Quick file navigation
- **Scroll**: Visual scroll indicator

### Editor Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Save | `Ctrl + S` | `Cmd + S` |
| Find | `Ctrl + F` | `Cmd + F` |
| Replace | `Ctrl + H` | `Cmd + H` |
| Go to Line | `Ctrl + G` | `Cmd + G` |
| Format Code | `Shift + Alt + F` | `Shift + Option + F` |
| Comment | `Ctrl + /` | `Cmd + /` |
| Duplicate Line | `Shift + Alt + ↓` | `Shift + Option + ↓` |
| Move Line | `Alt + ↑/↓` | `Option + ↑/↓` |

## AI Assistant

DevForge includes a powerful AI assistant to help with coding tasks.

### Getting Started with AI

#### 1. Access AI Assistant
- **Panel**: Open AI panel from sidebar
- **Chat Interface**: Natural language interaction
- **Context Awareness**: AI understands your project

#### 2. AI Capabilities

##### Code Generation
```
User: "Create a React component for a todo list"
AI: Generates complete React component with state management
```

##### Code Explanation
```
User: "Explain this function"
AI: Provides detailed explanation of code logic
```

##### Bug Detection
```
User: "Find bugs in this code"
AI: Identifies potential issues and suggests fixes
```

##### Code Optimization
```
User: "Optimize this function"
AI: Suggests performance improvements
```

### AI Models

#### 1. Ollama (Local)
- **Model**: CodeLlama 7B
- **Speed**: Fast local processing
- **Privacy**: No data sent to external services
- **Cost**: Free

#### 2. OpenAI (Cloud)
- **Model**: GPT-4
- **Capability**: Advanced reasoning
- **Context**: Large context window
- **Cost**: Pay-per-use

#### 3. Anthropic (Cloud)
- **Model**: Claude 3 Sonnet
- **Capability**: Code-focused responses
- **Safety**: Built-in safety measures
- **Cost**: Pay-per-use

### AI Best Practices

#### 1. Clear Prompts
```
❌ Bad: "Fix this"
✅ Good: "Fix the memory leak in this React component"
```

#### 2. Provide Context
```
User: "Create a function to validate email addresses"
Context: Include current file, language, and framework
```

#### 3. Iterative Refinement
```
1. Generate initial code
2. Ask for improvements
3. Request specific modifications
4. Test and validate
```

## Terminal

DevForge includes a full-featured terminal for command-line operations.

### Terminal Features

#### 1. Multiple Tabs
- **Tab Management**: Multiple terminal sessions
- **Split Panes**: Side-by-side terminals
- **Tab Naming**: Custom tab names

#### 2. Command History
- **History**: Access previous commands
- **Search**: Search command history
- **Favorites**: Save frequently used commands

#### 3. File System Access
- **Navigation**: Full file system access
- **File Operations**: Create, edit, delete files
- **Permissions**: Proper file permissions

### Common Commands

#### Package Management
```bash
# Node.js
npm install package-name
npm run dev

# Python
pip install package-name
python app.py

# Ruby
gem install package-name
ruby app.rb
```

#### Git Operations
```bash
git add .
git commit -m "Update feature"
git push origin main
git pull origin main
```

#### File Operations
```bash
# List files
ls -la

# Create directory
mkdir new-directory

# Copy files
cp source destination

# Move files
mv old-name new-name
```

## Database Management

DevForge provides integrated database management with one-click provisioning.

### Supported Databases

#### 1. PostgreSQL
- **Versions**: 13, 14, 15
- **Features**: ACID compliance, JSON support
- **Use Cases**: Web applications, analytics

#### 2. MySQL
- **Versions**: 8.0
- **Features**: High performance, replication
- **Use Cases**: Web applications, e-commerce

#### 3. MongoDB
- **Versions**: 6.0, 7.0
- **Features**: Document storage, scalability
- **Use Cases**: Content management, real-time apps

#### 4. Redis
- **Versions**: 7.0
- **Features**: In-memory caching, pub/sub
- **Use Cases**: Caching, session storage

### Database Operations

#### 1. Create Database
1. **Project Settings** → **Databases**
2. **Create New Database**
3. **Select Type and Version**
4. **Configure Settings**

#### 2. Database GUI
- **Query Editor**: Write and execute SQL queries
- **Schema Viewer**: Visualize database structure
- **Data Browser**: Browse and edit data
- **Query History**: Track executed queries

#### 3. Connection Management
- **Connection String**: Copy connection details
- **Credentials**: Manage database credentials
- **Security**: Configure access controls

### Database Examples

#### PostgreSQL Setup
```sql
-- Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (email, name) VALUES ('user@example.com', 'John Doe');

-- Query data
SELECT * FROM users WHERE email = 'user@example.com';
```

#### MongoDB Setup
```javascript
// Create collection
db.createCollection('users');

// Insert document
db.users.insertOne({
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: new Date()
});

// Query documents
db.users.find({ email: 'user@example.com' });
```

## Container Management

DevForge provides Docker container management for your applications.

### Container Features

#### 1. One-Click Deployment
- **Automatic Setup**: Container configuration
- **Port Mapping**: Automatic port assignment
- **Environment Variables**: Easy configuration

#### 2. Resource Monitoring
- **CPU Usage**: Real-time CPU monitoring
- **Memory Usage**: Memory consumption tracking
- **Disk Usage**: Storage utilization
- **Network**: Network activity monitoring

#### 3. Container Operations
- **Start/Stop**: Control container lifecycle
- **Restart**: Restart containers
- **Logs**: View container logs
- **Shell**: Access container shell

### Container Configuration

#### 1. Dockerfile Generation
```dockerfile
# Example Node.js Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Environment Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
```

#### 3. Port Mapping
```json
{
  "host": 3000,
  "container": 3000
}
```

### Container Examples

#### Node.js Application
```bash
# Start container
docker run -d \
  --name my-app \
  -p 3000:3000 \
  -e NODE_ENV=development \
  my-app:latest

# View logs
docker logs my-app

# Access shell
docker exec -it my-app sh
```

#### Python Application
```bash
# Start container
docker run -d \
  --name python-app \
  -p 8000:8000 \
  -e FLASK_ENV=development \
  python-app:latest

# View logs
docker logs python-app
```

## Collaboration

DevForge supports real-time collaboration for team development.

### Collaboration Features

#### 1. Real-time Editing
- **Live Updates**: See changes as they happen
- **Cursor Tracking**: View other users' cursors
- **Conflict Resolution**: Automatic merge conflicts

#### 2. User Presence
- **Online Status**: See who's online
- **Activity Indicators**: Track user activity
- **User Avatars**: Visual user identification

#### 3. Comments and Annotations
- **Inline Comments**: Add comments to code
- **Code Reviews**: Review and approve changes
- **Suggestions**: Suggest code improvements

### Collaboration Workflow

#### 1. Invite Team Members
1. **Project Settings** → **Collaborators**
2. **Invite User** → Enter email address
3. **Set Permissions** → Choose role and permissions
4. **Send Invitation** → User receives email

#### 2. Real-time Collaboration
```javascript
// User joins project
socket.emit('join-project', 'project-id');

// File changes are broadcast
socket.on('file-changed', (data) => {
  console.log('File changed by:', data.user);
  updateEditor(data.content);
});

// Cursor movements
socket.emit('cursor-move', {
  position: { line: 10, column: 5 }
});
```

#### 3. Conflict Resolution
- **Automatic Merging**: Simple conflicts resolved automatically
- **Manual Resolution**: Complex conflicts require manual intervention
- **Version History**: Track all changes and conflicts

### Collaboration Best Practices

#### 1. Communication
- **Use Comments**: Add context to changes
- **Coordinate**: Communicate before major changes
- **Review**: Regular code reviews

#### 2. File Management
- **Avoid Conflicts**: Work on different files when possible
- **Save Frequently**: Regular saves prevent data loss
- **Backup**: Keep local backups

#### 3. Team Coordination
- **Roles**: Define clear roles and responsibilities
- **Workflow**: Establish collaboration workflow
- **Tools**: Use built-in collaboration tools

## Deployment

DevForge provides seamless deployment capabilities for your applications.

### Deployment Options

#### 1. One-Click Deployment
- **Automatic Build**: Build process automation
- **Environment Setup**: Production environment configuration
- **Domain Assignment**: Automatic domain assignment

#### 2. Custom Domains
- **Domain Configuration**: Set custom domain names
- **SSL Certificates**: Automatic SSL certificate generation
- **DNS Management**: DNS record management

#### 3. Environment Management
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Deployment Process

#### 1. Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}
```

#### 2. Deployment Settings
```json
{
  "environment": "production",
  "domain": "myapp.example.com",
  "ssl": true,
  "autoDeploy": true
}
```

#### 3. Deployment Monitoring
- **Build Status**: Track build progress
- **Deployment Logs**: View deployment logs
- **Health Checks**: Monitor application health

### Deployment Examples

#### React Application
```bash
# Build process
npm run build

# Deploy to production
curl -X POST /api/projects/{id}/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{
    "environment": "production",
    "domain": "myapp.example.com"
  }'
```

#### Node.js Application
```bash
# Build process
npm run build

# Deploy to production
curl -X POST /api/projects/{id}/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{
    "environment": "production",
    "domain": "api.example.com"
  }'
```

## Settings & Configuration

### User Settings

#### 1. Profile Settings
- **Personal Information**: Update name, email, avatar
- **Preferences**: Theme, language, timezone
- **Notifications**: Email and in-app notifications

#### 2. Editor Settings
```json
{
  "theme": "dark",
  "fontSize": 14,
  "fontFamily": "Fira Code",
  "tabSize": 2,
  "insertSpaces": true,
  "wordWrap": "on"
}
```

#### 3. AI Settings
- **Model Preference**: Choose default AI model
- **Context Length**: Set context window size
- **Response Style**: Configure AI response format

### Project Settings

#### 1. General Settings
- **Project Information**: Name, description, visibility
- **Git Integration**: Repository configuration
- **Collaboration**: Team member management

#### 2. Environment Settings
```json
{
  "variables": {
    "NODE_ENV": "development",
    "API_URL": "http://localhost:3001",
    "DATABASE_URL": "postgresql://..."
  },
  "secrets": {
    "API_KEY": "encrypted-api-key",
    "JWT_SECRET": "encrypted-jwt-secret"
  }
}
```

#### 3. Build Settings
```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## Keyboard Shortcuts

### Global Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Project | `Ctrl + Shift + N` | `Cmd + Shift + N` |
| Open Project | `Ctrl + O` | `Cmd + O` |
| Save All | `Ctrl + K S` | `Cmd + K S` |
| Quick Open | `Ctrl + P` | `Cmd + P` |
| Command Palette | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| Toggle Sidebar | `Ctrl + B` | `Cmd + B` |
| Toggle Terminal | `Ctrl + `` | `Cmd + `` |

### Editor Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Save | `Ctrl + S` | `Cmd + S` |
| Find | `Ctrl + F` | `Cmd + F` |
| Replace | `Ctrl + H` | `Cmd + H` |
| Go to Line | `Ctrl + G` | `Cmd + G` |
| Format Code | `Shift + Alt + F` | `Shift + Option + F` |
| Comment | `Ctrl + /` | `Cmd + /` |
| Duplicate Line | `Shift + Alt + ↓` | `Shift + Option + ↓` |
| Move Line | `Alt + ↑/↓` | `Option + ↑/↓` |
| Multi-cursor | `Ctrl + Alt + ↑/↓` | `Cmd + Option + ↑/↓` |

### Terminal Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Terminal | `Ctrl + Shift + `` | `Cmd + Shift + `` |
| Split Terminal | `Ctrl + Shift + 5` | `Cmd + Shift + 5` |
| Close Terminal | `Ctrl + Shift + W` | `Cmd + Shift + W` |
| Clear Terminal | `Ctrl + L` | `Cmd + L` |
| Copy | `Ctrl + C` | `Cmd + C` |
| Paste | `Ctrl + V` | `Cmd + V` |

## Troubleshooting

### Common Issues

#### 1. Editor Not Loading
**Symptoms**: Editor shows loading spinner indefinitely
**Solutions**:
- Refresh the page
- Clear browser cache
- Check internet connection
- Restart the application

#### 2. Terminal Not Working
**Symptoms**: Terminal shows "Connection failed"
**Solutions**:
- Check container status
- Restart container
- Verify permissions
- Check system resources

#### 3. AI Assistant Not Responding
**Symptoms**: AI assistant shows "Service unavailable"
**Solutions**:
- Check AI service status
- Verify API keys
- Restart AI service
- Check model availability

#### 4. File Sync Issues
**Symptoms**: Changes not saving or syncing
**Solutions**:
- Check file permissions
- Verify storage space
- Restart file service
- Check network connection

### Performance Issues

#### 1. Slow Editor
**Solutions**:
- Close unnecessary tabs
- Reduce file size
- Disable extensions
- Increase system resources

#### 2. High Memory Usage
**Solutions**:
- Restart containers
- Clear cache
- Optimize code
- Increase memory limits

#### 3. Slow AI Responses
**Solutions**:
- Use local AI model
- Reduce context size
- Optimize prompts
- Check network speed

### Getting Help

#### 1. Documentation
- **User Guide**: This comprehensive guide
- **API Documentation**: Technical API reference
- **Video Tutorials**: Step-by-step video guides

#### 2. Community Support
- **Discord**: Join our Discord community
- **GitHub Issues**: Report bugs and request features
- **Forum**: Community discussions

#### 3. Direct Support
- **Email**: support@devforge.com
- **Live Chat**: Available during business hours
- **Video Call**: Schedule a support session

### Best Practices

#### 1. Regular Backups
- **Auto-save**: Enable auto-save feature
- **Version Control**: Use Git for version control
- **Cloud Backup**: Regular cloud backups

#### 2. Resource Management
- **Close Unused Tabs**: Keep editor clean
- **Monitor Resources**: Watch system usage
- **Optimize Code**: Write efficient code

#### 3. Security
- **Strong Passwords**: Use secure passwords
- **2FA**: Enable two-factor authentication
- **Regular Updates**: Keep system updated

---

## Conclusion

DevForge provides a comprehensive development environment with AI-powered assistance, real-time collaboration, and seamless deployment capabilities. This guide covers the essential features to help you get started and make the most of your development experience.

For additional support and resources:

- **Documentation**: [docs.devforge.com](https://docs.devforge.com)
- **Community**: [discord.gg/devforge](https://discord.gg/devforge)
- **Support**: [support@devforge.com](mailto:support@devforge.com)

Happy coding with DevForge! 🚀 