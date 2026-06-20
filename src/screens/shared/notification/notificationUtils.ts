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
  monthlyEvents?: boolean;
  eventReminder?: boolean;
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
