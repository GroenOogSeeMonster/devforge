import { useState, useEffect, createContext, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { api } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationList, setNotificationList] = useState<Notification[]>([]);

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  useEffect(() => {
    // Load notifications from API
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotificationList(response.data.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const showNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Add to local state
    setNotificationList(prev => [newNotification, ...prev]);

    // Show Mantine notification
    notifications.show({
      id: newNotification.id,
      title: newNotification.title,
      message: newNotification.message,
      color: getNotificationColor(newNotification.type),
      autoClose: newNotification.type === 'error' ? false : 5000,
    });

    // Save to API
    saveNotificationToAPI(newNotification);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  const saveNotificationToAPI = async (notification: Notification) => {
    try {
      await api.post('/notifications', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
      });
    } catch (error) {
      console.error('Failed to save notification to API:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotificationList(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotificationList(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotificationList(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotificationList([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const value: NotificationContextType = {
    notifications: notificationList,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}


