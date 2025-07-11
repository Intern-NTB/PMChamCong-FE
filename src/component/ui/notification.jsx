import { createContext, useContext } from 'react';
import { notification } from 'antd';

const NotificationContext = createContext();

export const useAppNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [apiNotification, contextHolder] = notification.useNotification();

  const notifyByStatus = ({ status, message, description, ...rest }) => {
    let type = 'info';
    if (status && String(status).startsWith('2')) {
      type = 'success';
    } else if (status && (String(status).startsWith('4') || String(status).startsWith('5'))) {
      type = 'error';
    } else {
      type = 'error'; // Nếu không có status hoặc status không xác định, luôn báo lỗi
    }
    apiNotification[type]({ message, description, ...rest });
  };

  const notificationValue = {
    ...apiNotification,
    notifyByStatus,
  };

  return (
    <NotificationContext.Provider value={notificationValue}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
