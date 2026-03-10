// types/notification.types.ts
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  actionText?: string;
  actionColor?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  isNew?: boolean;
  createdAt?: Date;
}

export type NotificationType =
  | 'album'
  | 'donation'
  | 'devotion'
  | 'book'
  | 'sermon'
  | 'reminder'
  | 'campaign'
  | 'event'
  | 'prayer';

export interface NotificationSettings {
  emailNotification: boolean;
  pushNotification: boolean;
  inAppNotification: boolean;
}

// utils/notificationUtils.ts
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    album: 'musical-notes',
    donation: 'heart',
    devotion: 'book',
    book: 'book-outline',
    sermon: 'play-circle',
    reminder: 'notifications',
    campaign: 'people',
    event: 'calendar',
    prayer: 'hands-outline',
  };
  return iconMap[type];
};

export const getNotificationColors = (
  type: NotificationType
): { iconColor: string; iconBg: string; actionColor?: string } => {
  const colorMap: Record<
    NotificationType,
    { iconColor: string; iconBg: string; actionColor?: string }
  > = {
    album: { iconColor: '#4C6FFF', iconBg: '#E8ECFF', actionColor: '#4C6FFF' },
    donation: { iconColor: '#FF6B6B', iconBg: '#FFE8E8', actionColor: '#FF6B6B' },
    devotion: { iconColor: '#4CAF50', iconBg: '#E8F5E9' },
    book: { iconColor: '#4C6FFF', iconBg: '#E8ECFF', actionColor: '#4C6FFF' },
    sermon: { iconColor: '#9C27B0', iconBg: '#F3E5F5', actionColor: '#4C6FFF' },
    reminder: { iconColor: '#FF9800', iconBg: '#FFF3E0' },
    campaign: { iconColor: '#4CAF50', iconBg: '#E8F5E9' },
    event: { iconColor: '#2196F3', iconBg: '#E3F2FD' },
    prayer: { iconColor: '#9C27B0', iconBg: '#F3E5F5' },
  };
  return colorMap[type];
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hrs`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} days`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} wks`;
};

// services/notificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationSettings } from '../types/notification.types';

const NOTIFICATIONS_KEY = '@notifications';
const SETTINGS_KEY = '@notification_settings';

export const notificationService = {
  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Save notifications
  async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, isNew: false } : n
      );
      await this.saveNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Clear all notifications
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data
        ? JSON.parse(data)
        : {
            emailNotification: false,
            pushNotification: true,
            inAppNotification: true,
          };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        emailNotification: false,
        pushNotification: true,
        inAppNotification: true,
      };
    }
  },

  // Save notification settings
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Fetch notifications from API
  async fetchFromAPI(): Promise<Notification[]> {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications from API:', error);
      return [];
    }
  },
};

// Example API response format:
/*
{
  "notifications": [
    {
      "id": "1",
      "type": "album",
      "title": "Worship album",
      "description": "Discover inspiring new worship albums...",
      "time": "2024-01-04T10:30:00Z",
      "actionText": "Buy now",
      "isNew": true
    }
  ]
}
*/

export default notificationService;
