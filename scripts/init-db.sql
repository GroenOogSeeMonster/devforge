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
