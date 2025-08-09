# DevForge API Documentation

Complete API reference for DevForge, a self-hosted alternative to Replit with AI-powered development capabilities.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Projects](#project-endpoints)
  - [Files](#file-endpoints)
  - [Containers](#container-endpoints)
  - [Databases](#database-endpoints)
  - [AI Assistant](#ai-assistant-endpoints)
  - [Deployments](#deployment-endpoints)
  - [Health](#health-endpoints)

## Authentication

DevForge uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Error Handling

All API endpoints return consistent error responses:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Email is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Invalid or missing token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File uploads**: 10 requests per 15 minutes

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /auth/login

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true,
      "role": "user"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 604800
  }
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 604800
  }
}
```

#### POST /auth/logout

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### POST /auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /auth/reset-password

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Endpoints

#### GET /users/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isVerified": true,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /users/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Smith",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

#### PUT /users/password

Change user password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Project Endpoints

#### GET /projects

Get user's projects.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `language` (string): Filter by language
- `framework` (string): Filter by framework

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "My React App",
        "description": "A React application",
        "template": "react",
        "language": "javascript",
        "framework": "react",
        "isPublic": false,
        "isArchived": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /projects

Create a new project.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "A new project description",
  "template": "react",
  "language": "javascript",
  "framework": "react",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My New Project",
    "description": "A new project description",
    "template": "react",
    "language": "javascript",
    "framework": "react",
    "isPublic": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /projects/:id

Get project details.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My React App",
    "description": "A React application",
    "template": "react",
    "language": "javascript",
    "framework": "react",
    "isPublic": false,
    "isArchived": false,
    "owner": {
      "id": "uuid",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe"
    },
    "members": [
      {
        "id": "uuid",
        "username": "collaborator",
        "role": "member",
        "permissions": ["read", "write"]
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /projects/:id

Update project.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Project Name",
    "description": "Updated description",
    "isPublic": true,
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

#### DELETE /projects/:id

Delete project.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

#### POST /projects/:id/members

Add member to project.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "email": "collaborator@example.com",
  "role": "member",
  "permissions": ["read", "write"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "userId": "uuid",
    "role": "member",
    "permissions": ["read", "write"],
    "joinedAt": "2024-01-15T10:30:00Z"
  }
}
```

### File Endpoints

#### GET /projects/:projectId/files

Get project files.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `path` (string): Directory path (default: "/")

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid",
        "name": "index.js",
        "path": "/index.js",
        "size": 1024,
        "mimeType": "application/javascript",
        "isDirectory": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "uuid",
        "name": "src",
        "path": "/src",
        "isDirectory": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### GET /projects/:projectId/files/:fileId

Get file content.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "index.js",
    "path": "/index.js",
    "content": "console.log('Hello, World!');",
    "size": 1024,
    "mimeType": "application/javascript",
    "isDirectory": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /projects/:projectId/files

Create or update file.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "path": "/src/components/App.js",
  "content": "import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "App.js",
    "path": "/src/components/App.js",
    "content": "import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;",
    "size": 1024,
    "mimeType": "application/javascript",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE /projects/:projectId/files/:fileId

Delete file.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Container Endpoints

#### GET /projects/:projectId/containers

Get project containers.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "containers": [
      {
        "id": "uuid",
        "containerId": "docker-container-id",
        "name": "my-app",
        "image": "node:18-alpine",
        "status": "running",
        "portMappings": [
          {
            "host": 3000,
            "container": 3000
          }
        ],
        "environmentVariables": {
          "NODE_ENV": "development"
        },
        "resourceLimits": {
          "memory": "2g",
          "cpu": "2"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /projects/:projectId/containers

Create container.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "my-app",
  "image": "node:18-alpine",
  "portMappings": [
    {
      "host": 3000,
      "container": 3000
    }
  ],
  "environmentVariables": {
    "NODE_ENV": "development"
  },
  "resourceLimits": {
    "memory": "2g",
    "cpu": "2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "containerId": "docker-container-id",
    "name": "my-app",
    "image": "node:18-alpine",
    "status": "starting",
    "portMappings": [
      {
        "host": 3000,
        "container": 3000
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /projects/:projectId/containers/:containerId/start

Start container.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "startedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /projects/:projectId/containers/:containerId/stop

Stop container.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "stopped",
    "stoppedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE /projects/:projectId/containers/:containerId

Delete container.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Container deleted successfully"
}
```

### Database Endpoints

#### GET /projects/:projectId/databases

Get project databases.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "databases": [
      {
        "id": "uuid",
        "name": "my-database",
        "type": "postgresql",
        "version": "15",
        "connectionString": "postgresql://user:pass@host:5432/db",
        "status": "running",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /projects/:projectId/databases

Create database.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "my-database",
  "type": "postgresql",
  "version": "15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "my-database",
    "type": "postgresql",
    "version": "15",
    "connectionString": "postgresql://user:pass@host:5432/db",
    "status": "starting",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### AI Assistant Endpoints

#### POST /ai/chat

Send message to AI assistant.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "message": "Create a React component for a todo list",
  "projectId": "uuid",
  "model": "gpt-4",
  "context": {
    "files": ["/src/App.js", "/src/components/Todo.js"],
    "language": "javascript",
    "framework": "react"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Here's a React component for a todo list...",
    "model": "gpt-4",
    "usage": {
      "promptTokens": 150,
      "completionTokens": 200,
      "totalTokens": 350
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /ai/conversations

Get AI conversations.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `projectId` (string): Filter by project
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "title": "React Todo Component",
        "model": "gpt-4",
        "projectId": "uuid",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Deployment Endpoints

#### POST /projects/:projectId/deploy

Deploy project.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "environment": "production",
  "domain": "myapp.example.com",
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "deploying",
    "url": "https://myapp.example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /projects/:projectId/deployments

Get project deployments.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deployments": [
      {
        "id": "uuid",
        "status": "success",
        "url": "https://myapp.example.com",
        "environment": "production",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Health Endpoints

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "docker": "healthy"
    }
  }
}
```

## WebSocket Events

### Connection

Connect to WebSocket server:

```javascript
const socket = io('ws://localhost:3002', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Join Project Room

```javascript
socket.emit('join-project', 'project-id');
```

#### Leave Project Room

```javascript
socket.emit('leave-project', 'project-id');
```

#### File Changes

```javascript
// Listen for file changes
socket.on('file-changed', (data) => {
  console.log('File changed:', data);
});

// Emit file change
socket.emit('file-change', {
  projectId: 'project-id',
  fileId: 'file-id',
  content: 'new content'
});
```

#### User Presence

```javascript
// Listen for user presence
socket.on('user-joined', (data) => {
  console.log('User joined:', data);
});

socket.on('user-left', (data) => {
  console.log('User left:', data);
});
```

#### Real-time Collaboration

```javascript
// Cursor position
socket.emit('cursor-move', {
  projectId: 'project-id',
  position: { line: 10, column: 5 }
});

// Listen for cursor movements
socket.on('cursor-moved', (data) => {
  console.log('Cursor moved:', data);
});
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @devforge/sdk
```

```javascript
import { DevForgeClient } from '@devforge/sdk';

const client = new DevForgeClient({
  baseUrl: 'http://localhost:3001/api',
  token: 'your-jwt-token'
});

// Create project
const project = await client.projects.create({
  name: 'My Project',
  template: 'react'
});

// Get files
const files = await client.files.list(project.id);
```

### Python

```bash
pip install devforge-sdk
```

```python
from devforge import DevForgeClient

client = DevForgeClient(
    base_url='http://localhost:3001/api',
    token='your-jwt-token'
)

# Create project
project = client.projects.create({
    'name': 'My Project',
    'template': 'python'
})
```

## Examples

### Complete Project Creation Flow

```javascript
// 1. Register user
const user = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'username',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// 2. Create project
const project = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  },
  body: JSON.stringify({
    name: 'My React App',
    template: 'react',
    language: 'javascript',
    framework: 'react'
  })
});

// 3. Create files
await fetch(`/api/projects/${project.id}/files`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  },
  body: JSON.stringify({
    path: '/src/App.js',
    content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;'
  })
});

// 4. Start container
await fetch(`/api/projects/${project.id}/containers`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  },
  body: JSON.stringify({
    name: 'my-app',
    image: 'node:18-alpine',
    portMappings: [{ host: 3000, container: 3000 }]
  })
});
```

## Support

For API support:

1. Check the [GitHub Issues](https://github.com/devforge/devforge/issues)
2. Join our [Discord Community](https://discord.gg/devforge)
3. Email: api-support@devforge.com 