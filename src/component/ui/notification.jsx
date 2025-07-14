import { createContext, useContext, useEffect } from 'react';
import { notification } from 'antd';
import { setNotificationApi } from '../../config/utils/notification_instance';

const NotificationContext = createContext();

export const useAppNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useAppNotification must be used within NotificationProvider');
    return null;
  }
  return context;
};

export function NotificationProvider({ children }) {
  const [apiNotification, contextHolder] = notification.useNotification();

  useEffect(() => {
    // Thiết lập notification instance cho axios
    if (apiNotification) {
      setNotificationApi(apiNotification);
    }
  }, [apiNotification]);

  // Đảm bảo contextHolder được render
  if (!contextHolder) {
    return null;
  }

  return (
    <NotificationContext.Provider value={apiNotification}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
