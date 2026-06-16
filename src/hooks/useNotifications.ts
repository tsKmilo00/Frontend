import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../types';
import { apiService } from '../services/api';
import { notificationStorage } from '../services/notificationStorage';
import { useAuth } from './useAuth';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addLocalNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const isSyncingRef = useRef<boolean>(false);

  const updateLocalState = useCallback(() => {
    const all = notificationStorage.getAll();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(all);
    setUnreadCount(notificationStorage.getUnreadCount());
  }, []);

  useEffect(() => {
    updateLocalState();
    setIsLoading(false);
  }, [updateLocalState]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const remoteList = await apiService.getNotifications();
      
      remoteList.forEach((remoteVal) => {
        const localVal = notificationStorage.getAll().find(n => n.id === remoteVal.id);
        if (!localVal) {
          notificationStorage.add({ ...remoteVal, sincronizado: true });
        } else {
          if (localVal.sincronizado) {
            notificationStorage.update(remoteVal.id, {
              leida: remoteVal.leida,
              titulo: remoteVal.titulo,
              descripcion: remoteVal.descripcion,
              tipo: remoteVal.tipo,
              datos: remoteVal.datos,
            });
          }
        }
      });
      
      updateLocalState();
      setError(null);
    } catch (err: any) {
      // Suppress network errors for sync as per instructions
    }
  }, [isAuthenticated, updateLocalState]);

  const syncUnsynced = useCallback(async () => {
    if (!isAuthenticated || isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    try {
      const unsynced = notificationStorage.getUnsynced();
      for (const n of unsynced) {
        try {
          if (n.leida) {
            await apiService.markNotificationAsRead(n.id);
          }
          notificationStorage.markAsSynced(n.id);
        } catch (err) {
          // Silently fail and let the next poll retry
        }
      }
      updateLocalState();
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated, updateLocalState]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications().then(() => syncUnsynced());

    const interval = setInterval(() => {
      fetchNotifications().then(() => syncUnsynced());
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications, syncUnsynced]);

  const markAsRead = async (notificationId: string) => {
    notificationStorage.markAsRead(notificationId);
    updateLocalState();

    try {
      await apiService.markNotificationAsRead(notificationId);
      notificationStorage.markAsSynced(notificationId);
      updateLocalState();
    } catch (err) {
      // Keep it unsynced, the background job will retry
    }
  };

  const markAllAsRead = async () => {
    notificationStorage.markAllAsRead();
    updateLocalState();

    try {
      await apiService.markAllNotificationsAsRead();
      const all = notificationStorage.getAll();
      all.forEach(n => {
        if (n.leida && !n.sincronizado) {
          notificationStorage.markAsSynced(n.id);
        }
      });
      updateLocalState();
    } catch (err) {
      // Background job will sync it
    }
  };

  const addLocalNotification = useCallback((notification: Notification) => {
    notificationStorage.add(notification);
    updateLocalState();
  }, [updateLocalState]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addLocalNotification
  };

  return React.createElement(NotificationsContext.Provider, { value }, children);
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
