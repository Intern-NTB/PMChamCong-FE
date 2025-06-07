// src/components/common/NotificationProvider.jsx
import { createContext, useContext } from 'react';
import { notification } from 'antd';
import warning from 'antd/es/_util/warning';

const NotificationContext = createContext();

export const useAppNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [apiNotification, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={apiNotification}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
