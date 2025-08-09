import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            { refreshToken }
          );

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  me: () =>
    api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  resendVerification: () =>
    api.post('/auth/resend-verification'),
};

export const projectsAPI = {
  getAll: (params?: any) =>
    api.get('/projects', { params }),
  
  getById: (id: string) =>
    api.get(`/projects/${id}`),
  
  create: (projectData: any) =>
    api.post('/projects', projectData),
  
  update: (id: string, projectData: any) =>
    api.put(`/projects/${id}`, projectData),
  
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  
  getTemplates: () =>
    api.get('/projects/templates'),
  
  clone: (id: string, newName: string) =>
    api.post(`/projects/${id}/clone`, { name: newName }),
  
  getMembers: (id: string) =>
    api.get(`/projects/${id}/members`),
  
  addMember: (id: string, memberData: any) =>
    api.post(`/projects/${id}/members`, memberData),
  
  removeMember: (id: string, memberId: string) =>
    api.delete(`/projects/${id}/members/${memberId}`),
  
  updateMemberRole: (id: string, memberId: string, role: string) =>
    api.patch(`/projects/${id}/members/${memberId}`, { role }),
};

export const filesAPI = {
  getAll: (projectId: string) =>
    api.get(`/projects/${projectId}/files`),
  
  getById: (projectId: string, fileId: string) =>
    api.get(`/projects/${projectId}/files/${fileId}`),
  
  create: (projectId: string, fileData: any) =>
    api.post(`/projects/${projectId}/files`, fileData),
  
  update: (projectId: string, fileId: string, fileData: any) =>
    api.put(`/projects/${projectId}/files/${fileId}`, fileData),
  
  delete: (projectId: string, fileId: string) =>
    api.delete(`/projects/${projectId}/files/${fileId}`),
  
  getVersions: (projectId: string, fileId: string) =>
    api.get(`/projects/${projectId}/files/${fileId}/versions`),
  
  restoreVersion: (projectId: string, fileId: string, versionId: string) =>
    api.post(`/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`),
};

export const containersAPI = {
  getAll: (projectId: string) =>
    api.get(`/projects/${projectId}/containers`),
  
  getById: (projectId: string, containerId: string) =>
    api.get(`/projects/${projectId}/containers/${containerId}`),
  
  create: (projectId: string, containerData: any) =>
    api.post(`/projects/${projectId}/containers`, containerData),
  
  start: (projectId: string, containerId: string) =>
    api.post(`/projects/${projectId}/containers/${containerId}/start`),
  
  stop: (projectId: string, containerId: string) =>
    api.post(`/projects/${projectId}/containers/${containerId}/stop`),
  
  restart: (projectId: string, containerId: string) =>
    api.post(`/projects/${projectId}/containers/${containerId}/restart`),
  
  delete: (projectId: string, containerId: string) =>
    api.delete(`/projects/${projectId}/containers/${containerId}`),
  
  getLogs: (projectId: string, containerId: string) =>
    api.get(`/projects/${projectId}/containers/${containerId}/logs`),
  
  getStats: (projectId: string, containerId: string) =>
    api.get(`/projects/${projectId}/containers/${containerId}/stats`),
};

export const databasesAPI = {
  getAll: (projectId: string) =>
    api.get(`/projects/${projectId}/databases`),
  
  getById: (projectId: string, databaseId: string) =>
    api.get(`/projects/${projectId}/databases/${databaseId}`),
  
  create: (projectId: string, databaseData: any) =>
    api.post(`/projects/${projectId}/databases`, databaseData),
  
  update: (projectId: string, databaseId: string, databaseData: any) =>
    api.put(`/projects/${projectId}/databases/${databaseId}`, databaseData),
  
  delete: (projectId: string, databaseId: string) =>
    api.delete(`/projects/${projectId}/databases/${databaseId}`),
  
  start: (projectId: string, databaseId: string) =>
    api.post(`/projects/${projectId}/databases/${databaseId}/start`),
  
  stop: (projectId: string, databaseId: string) =>
    api.post(`/projects/${projectId}/databases/${databaseId}/stop`),
  
  backup: (projectId: string, databaseId: string) =>
    api.post(`/projects/${projectId}/databases/${databaseId}/backup`),
  
  restore: (projectId: string, databaseId: string, backupId: string) =>
    api.post(`/projects/${projectId}/databases/${databaseId}/restore`, { backupId }),
  
  getConnectionString: (projectId: string, databaseId: string) =>
    api.get(`/projects/${projectId}/databases/${databaseId}/connection-string`),
};

export const aiAPI = {
  getConversations: (projectId?: string) =>
    api.get('/ai/conversations', { params: { projectId } }),
  
  getConversation: (conversationId: string) =>
    api.get(`/ai/conversations/${conversationId}`),
  
  createConversation: (conversationData: any) =>
    api.post('/ai/conversations', conversationData),
  
  deleteConversation: (conversationId: string) =>
    api.delete(`/ai/conversations/${conversationId}`),
  
  sendMessage: (conversationId: string, message: string, context?: any) =>
    api.post(`/ai/conversations/${conversationId}/messages`, { message, context }),
  
  getModels: () =>
    api.get('/ai/models'),
  
  generateCode: (prompt: string, language: string, context?: any) =>
    api.post('/ai/generate-code', { prompt, language, context }),
  
  explainCode: (code: string, language: string) =>
    api.post('/ai/explain-code', { code, language }),
  
  fixCode: (code: string, language: string, error?: string) =>
    api.post('/ai/fix-code', { code, language, error }),
  
  optimizeCode: (code: string, language: string) =>
    api.post('/ai/optimize-code', { code, language }),
  
  generateTests: (code: string, language: string) =>
    api.post('/ai/generate-tests', { code, language }),
};

export const deploymentsAPI = {
  getAll: (projectId: string) =>
    api.get(`/projects/${projectId}/deployments`),
  
  getById: (projectId: string, deploymentId: string) =>
    api.get(`/projects/${projectId}/deployments/${deploymentId}`),
  
  create: (projectId: string, deploymentData: any) =>
    api.post(`/projects/${projectId}/deployments`, deploymentData),
  
  update: (projectId: string, deploymentId: string, deploymentData: any) =>
    api.put(`/projects/${projectId}/deployments/${deploymentId}`, deploymentData),
  
  delete: (projectId: string, deploymentId: string) =>
    api.delete(`/projects/${projectId}/deployments/${deploymentId}`),
  
  deploy: (projectId: string, deploymentId: string) =>
    api.post(`/projects/${projectId}/deployments/${deploymentId}/deploy`),
  
  stop: (projectId: string, deploymentId: string) =>
    api.post(`/projects/${projectId}/deployments/${deploymentId}/stop`),
  
  getLogs: (projectId: string, deploymentId: string) =>
    api.get(`/projects/${projectId}/deployments/${deploymentId}/logs`),
  
  getStatus: (projectId: string, deploymentId: string) =>
    api.get(`/projects/${projectId}/deployments/${deploymentId}/status`),
};

export const notificationsAPI = {
  getAll: () =>
    api.get('/notifications'),
  
  getById: (id: string) =>
    api.get(`/notifications/${id}`),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
  
  clearAll: () =>
    api.delete('/notifications'),
};

export const healthAPI = {
  check: () =>
    api.get('/health'),
  
  detailed: () =>
    api.get('/health/detailed'),
  
  database: () =>
    api.get('/health/database'),
  
  redis: () =>
    api.get('/health/redis'),
  
  system: () =>
    api.get('/health/system'),
};

export default api;
