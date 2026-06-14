import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList, TabParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateFromNotificationData = (
  data?: Record<string, unknown> | null
): void => {
  if (!navigationRef.isReady()) {
    return;
  }

  const target = typeof data?.target === 'string' ? data.target : undefined;
  const eventId = typeof data?.eventId === 'string' ? data.eventId : undefined;

  if (target === 'event') {
    navigationRef.navigate(
      'Tabs',
      {
        screen: 'Event',
        params: eventId ? { eventId } : undefined,
      } satisfies {
        screen: keyof TabParamList;
        params?: TabParamList['Event'];
      }
    );
    return;
  }

  navigationRef.navigate('Notifications');
};
