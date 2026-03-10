import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const incrementUnread = () => setUnreadCount(prev => prev + 1);
  const decrementUnread = () => setUnreadCount(prev => Math.max(0, prev - 1));

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, incrementUnread, decrementUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
