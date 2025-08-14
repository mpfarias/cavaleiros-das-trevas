import { useState, useEffect, useCallback } from 'react';
import { NOTIFICATION_CONFIG } from '../constants/character';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = useCallback((message: string, severity: NotificationSeverity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        hideNotification();
      }, NOTIFICATION_CONFIG.autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [notification.open, hideNotification]);

  return {
    notification,
    showNotification,
    hideNotification
  };
};