import apiClient from './api';

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

const transformNotification = (data: any): AppNotification => ({
  _id: data._id || data.id,
  userId: data.userId || '',
  title: data.title || '',
  message: data.message || data.description || '',
  type: data.type || 'info',
  isRead: data.isRead ?? false,
  metadata: data.metadata || {},
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt,
});

export const notificationsAPI = {
  getAll: async (): Promise<AppNotification[]> => {
    const response = await apiClient.get('/notifications');
    const items = response.data?.data || response.data || [];
    return Array.isArray(items) ? items.map(transformNotification) : [];
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  create: async (data: {
    title: string;
    message: string;
    type?: string;
    metadata?: Record<string, any>;
  }): Promise<AppNotification> => {
    const response = await apiClient.post('/notifications/create', data);
    return transformNotification(response.data?.data || response.data);
  },
};
