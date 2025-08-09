import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token and get current user
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user: newUser, token: authToken } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      setUser(newUser);
      setToken(authToken);
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
      setToken(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { token: newToken } = response.data.data;

      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
    } catch (error) {
      // Refresh failed, logout user
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { };

