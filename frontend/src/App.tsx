import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

// Providers
import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';

// Layout
import { AppLayout } from './components/Layout/AppLayout';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ForgotPasswordForm } from './components/Auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm';
import { CodeEditorPage } from './pages/Editor/Editor';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
          <MantineProvider defaultColorScheme="dark" theme={{
            primaryColor: 'blue',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            headings: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' },
            components: { Button: { defaultProps: { size: 'md' } }, Card: { defaultProps: { withBorder: true } } },
          }}>
            <Notifications position="top-right" zIndex={1000} />
            
            <AuthProvider>
              <NotificationProvider>
                <Router>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <LoginForm />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PublicRoute>
                          <RegisterForm />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <PublicRoute>
                          <ForgotPasswordForm />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/reset-password"
                      element={
                        <PublicRoute>
                          <ResetPasswordForm />
                        </PublicRoute>
                      }
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Project Routes */}
                    <Route
                      path="/projects"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Projects Page (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:id"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Project Details (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Editor Routes */}
                    <Route
                      path="/editor"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <CodeEditorPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/editor/:projectId"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Project Editor (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Database Routes */}
                    <Route
                      path="/databases"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Database Management (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Container Routes */}
                    <Route
                      path="/containers"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Container Management (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Deployment Routes */}
                    <Route
                      path="/deployments"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Deployments (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Collaboration Routes */}
                    <Route
                      path="/collaboration"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Collaboration (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Template Routes */}
                    <Route
                      path="/templates"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Project Templates (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Recent Routes */}
                    <Route
                      path="/recent"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Recent Projects (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Settings Routes */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Settings (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Profile Routes */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Profile (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Notifications Routes */}
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Notifications (Coming Soon)</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all route */}
                    <Route
                      path="*"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <div>Page Not Found</div>
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
              </NotificationProvider>
            </AuthProvider>
          </MantineProvider>
        
        {/* React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App; 