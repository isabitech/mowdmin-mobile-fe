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
  source?: 'backend' | 'local';
  notificationKey?: string;
}

export interface NotificationPreferences {
  emailNotification: boolean;
  pushNotification: boolean;
  inAppNotification: boolean;
  monthlyEvents: boolean;
  eventReminder: boolean;
}

export interface DevicePushRegistrationPayload {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
  appVersion?: string;
  locale?: string;
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
  source: 'backend',
  notificationKey: data.notificationKey,
});

const isMissingOptionalEndpoint = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 404 || status === 405 || !status;
};

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

  getPreferences: async (): Promise<Partial<NotificationPreferences> | null> => {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data?.data || response.data || null;
    } catch (error: any) {
      if (isMissingOptionalEndpoint(error)) {
        console.log('[NotificationsAPI] Preferences endpoint not available yet');
        return null;
      }
      console.error('[NotificationsAPI] getPreferences error:', error.message);
      return null;
    }
  },

  updatePreferences: async (preferences: NotificationPreferences): Promise<boolean> => {
    try {
      await apiClient.put('/notifications/preferences', preferences);
      return true;
    } catch (error: any) {
      if (isMissingOptionalEndpoint(error)) {
        console.log('[NotificationsAPI] Preferences update endpoint not available yet');
        return false;
      }
      console.error('[NotificationsAPI] updatePreferences error:', error.message);
      return false;
    }
  },

  registerDeviceToken: async (payload: DevicePushRegistrationPayload): Promise<boolean> => {
    try {
      await apiClient.post('/notifications/devices/register', payload);
      return true;
    } catch (error: any) {
      if (isMissingOptionalEndpoint(error)) {
        console.log('[NotificationsAPI] Device registration endpoint not available yet');
        return false;
      }
      console.error('[NotificationsAPI] registerDeviceToken error:', error.message);
      return false;
    }
  },

  unregisterDeviceToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post('/notifications/devices/unregister', { token });
      return true;
    } catch (error: any) {
      if (isMissingOptionalEndpoint(error)) {
        console.log('[NotificationsAPI] Device unregister endpoint not available yet');
        return false;
      }
      console.error('[NotificationsAPI] unregisterDeviceToken error:', error.message);
      return false;
    }
  },
};
