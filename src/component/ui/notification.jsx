// src/components/common/NotificationProvider.jsx
import { createContext, useContext } from 'react';
import { notification } from 'antd';

const NotificationContext = createContext();

export const useAppNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
