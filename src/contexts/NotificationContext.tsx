import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import {
  clearManagedEventNotifications,
  defaultNotificationPreferences,
  dismissNotificationLocally,
  getDismissedNotificationIdentities,
  getLocalInboxNotifications,
  getNotificationIdentity,
  getPermissionState,
  getStoredNotificationPreferences,
  markLocalInboxNotificationAsRead,
  materializeDueNotifications,
  registerForPushNotificationsAsync,
  removeLocalInboxNotification,
  saveStoredNotificationPreferences,
  storeNotificationFromExpoPayload,
  syncManagedEventNotifications,
  type PushPermissionState,
} from '../services/deviceNotifications';
import {
  notificationsAPI,
  type AppNotification,
  type NotificationPreferences,
} from '../services/notificationsApi';
import { eventRegistrationAPI, eventsAPI } from '../services/eventsApi';
import { useAuth } from './AuthContext';
import { navigateFromNotificationData } from '../navigation/navigationRef';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  settings: NotificationPreferences;
  permissionStatus: PushPermissionState;
  expoPushToken: string | null;
  setUnreadCount: (count: number) => void;
  refreshNotifications: () => Promise<void>;
  refreshEventNotificationSync: () => Promise<void>;
  markNotificationAsRead: (notification: AppNotification) => Promise<void>;
  dismissNotification: (notification: AppNotification) => Promise<void>;
  updateSetting: (
    key: keyof NotificationPreferences,
    value: boolean
  ) => Promise<boolean>;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const sortNotifications = (items: AppNotification[]): AppNotification[] => {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<NotificationPreferences>(
    defaultNotificationPreferences
  );
  const [permissionStatus, setPermissionStatus] =
    useState<PushPermissionState>('undetermined');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const handledResponseIds = useRef<Set<string>>(new Set());
  const authBootstrapRef = useRef(false);

  const recomputeUnreadCount = useCallback((items: AppNotification[]) => {
    setUnreadCount(items.filter((item) => !item.isRead).length);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [backendNotifications, localNotifications, dismissedIds] = await Promise.all([
        notificationsAPI.getAll().catch(() => []),
        getLocalInboxNotifications(),
        getDismissedNotificationIdentities(),
      ]);

      const mergedNotifications = sortNotifications([
        ...backendNotifications.map((item) => ({
          ...item,
          source: 'backend' as const,
        })),
        ...localNotifications,
      ]).filter((item) => !dismissedIds.has(getNotificationIdentity(item)));

      setNotifications(mergedNotifications);
      recomputeUnreadCount(mergedNotifications);
    } catch (error) {
      console.error('[NotificationContext] refreshNotifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, recomputeUnreadCount]);

  const refreshEventNotificationSync = useCallback(async () => {
    if (!isAuthenticated) {
      await clearManagedEventNotifications();
      return;
    }

    try {
      const canScheduleDeviceNotifications =
        settings.pushNotification && permissionStatus === 'granted';

      const [events, registrations] = await Promise.all([
        eventsAPI.getAllEvents(),
        eventRegistrationAPI.getUserRegistrations(),
      ]);

      await syncManagedEventNotifications({
        events,
        registeredEventIds: registrations
          .filter((registration) => registration.status !== 'cancelled')
          .map((registration) => registration.eventId),
        preferences: settings,
        canScheduleDeviceNotifications,
      });
      await refreshNotifications();
    } catch (error) {
      console.error('[NotificationContext] refreshEventNotificationSync error:', error);
    }
  }, [isAuthenticated, permissionStatus, refreshNotifications, settings]);

  const syncPushTokenWithBackend = useCallback(
    async (token: string | null) => {
      if (!isAuthenticated || !token) {
        return;
      }

      await notificationsAPI.registerDeviceToken({
        token,
        platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
        deviceName: Device.modelName || undefined,
        appVersion: Constants.expoConfig?.version || undefined,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      });
    },
    [isAuthenticated]
  );

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    const result = await registerForPushNotificationsAsync();
    setPermissionStatus(result.status);

    if (result.token) {
      setExpoPushToken(result.token);
      await syncPushTokenWithBackend(result.token);
      return true;
    }

    setExpoPushToken(null);
    return false;
  }, [syncPushTokenWithBackend]);

  const markNotificationAsRead = useCallback(
    async (notification: AppNotification) => {
      try {
        if (notification.source === 'local') {
          await markLocalInboxNotificationAsRead(
            notification._id,
            notification.notificationKey
          );
        } else {
          await notificationsAPI.markAsRead(notification._id);
        }

        setNotifications((current) => {
          const next = current.map((item) =>
            item._id === notification._id && item.source === notification.source
              ? { ...item, isRead: true }
              : item
          );
          recomputeUnreadCount(next);
          return next;
        });
      } catch (error) {
        console.error('[NotificationContext] markNotificationAsRead error:', error);
      }
    },
    [recomputeUnreadCount]
  );

  const dismissNotification = useCallback(
    async (notification: AppNotification) => {
      try {
        await dismissNotificationLocally(notification);
        if (notification.source === 'local') {
          await removeLocalInboxNotification(notification._id, notification.notificationKey);
        }
        setNotifications((current) => {
          const next = current.filter(
            (item) =>
              !(
                item._id === notification._id &&
                item.source === notification.source &&
                item.notificationKey === notification.notificationKey
              )
          );
          recomputeUnreadCount(next);
          return next;
        });
      } catch (error) {
        console.error('[NotificationContext] dismissNotification error:', error);
      }
    },
    [recomputeUnreadCount]
  );

  const updateSetting = useCallback(
    async (
      key: keyof NotificationPreferences,
      value: boolean
    ): Promise<boolean> => {
      let resolvedValue = value;

      if (key === 'pushNotification' && value) {
        const granted = await requestPushPermission();
        resolvedValue = granted;
      }

      const nextSettings: NotificationPreferences = {
        ...settings,
        [key]: resolvedValue,
      };

      setSettings(nextSettings);
      await saveStoredNotificationPreferences(nextSettings);
      await notificationsAPI.updatePreferences(nextSettings);

      if (key === 'pushNotification' && !resolvedValue && expoPushToken) {
        await notificationsAPI.unregisterDeviceToken(expoPushToken);
        setExpoPushToken(null);
      }

      if (
        key === 'pushNotification' ||
        key === 'monthlyEvents' ||
        key === 'eventReminder'
      ) {
        await refreshEventNotificationSync();
      }

      if (!resolvedValue && key === 'pushNotification') {
        await clearManagedEventNotifications();
      }

      return resolvedValue;
    },
    [
      expoPushToken,
      refreshEventNotificationSync,
      requestPushPermission,
      settings,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const [storedSettings, permissions] = await Promise.all([
          getStoredNotificationPreferences(),
          Notifications.getPermissionsAsync(),
        ]);

        if (!isMounted) {
          return;
        }

        setSettings(storedSettings);
        setPermissionStatus(getPermissionState(permissions.status));
        initializedRef.current = true;
      } catch (error) {
        console.error('[NotificationContext] initialize error:', error);
      } finally {
        if (isMounted && !isAuthenticated) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        void (async () => {
          await storeNotificationFromExpoPayload(notification);
          await refreshNotifications();
        })();
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notification = response.notification;
        const responseId = notification.request.identifier;
        if (handledResponseIds.current.has(responseId)) {
          return;
        }

        handledResponseIds.current.add(responseId);

        void (async () => {
          await storeNotificationFromExpoPayload(notification);
          await markLocalInboxNotificationAsRead(
            notification.request.identifier,
            typeof notification.request.content.data?.managedNotificationKey === 'string'
              ? notification.request.content.data.managedNotificationKey
              : undefined
          );
          await refreshNotifications();
          navigateFromNotificationData(
            notification.request.content.data as Record<string, unknown>
          );
        })();
      });

    void (async () => {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (!lastResponse) {
        return;
      }

      const responseId = lastResponse.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) {
        return;
      }

      handledResponseIds.current.add(responseId);
      navigateFromNotificationData(
        lastResponse.notification.request.content.data as Record<string, unknown>
      );
    })();

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      authBootstrapRef.current = false;
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      void clearManagedEventNotifications();
      return;
    }

    if (authBootstrapRef.current) {
      return;
    }

    authBootstrapRef.current = true;

    void (async () => {
      setLoading(true);

      const backendSettings = await notificationsAPI.getPreferences();
      if (backendSettings) {
        const mergedSettings = {
          ...defaultNotificationPreferences,
          ...settings,
          ...backendSettings,
        };
        setSettings(mergedSettings);
        await saveStoredNotificationPreferences(mergedSettings);
      }

      await materializeDueNotifications();
      await refreshNotifications();
    })();
  }, [isAuthenticated, refreshNotifications, settings]);

  useEffect(() => {
    if (!initializedRef.current || !isAuthenticated) {
      return;
    }

    if (settings.pushNotification && permissionStatus !== 'granted' && !expoPushToken) {
      void requestPushPermission();
      return;
    }

    if (settings.pushNotification && permissionStatus === 'granted' && expoPushToken) {
      void syncPushTokenWithBackend(expoPushToken);
    }
  }, [
    expoPushToken,
    isAuthenticated,
    permissionStatus,
    requestPushPermission,
    settings.pushNotification,
    syncPushTokenWithBackend,
  ]);

  useEffect(() => {
    if (!initializedRef.current || !isAuthenticated) {
      return;
    }

    void refreshEventNotificationSync();
  }, [
    isAuthenticated,
    permissionStatus,
    refreshEventNotificationSync,
    settings.eventReminder,
    settings.monthlyEvents,
    settings.pushNotification,
  ]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshing,
        settings,
        permissionStatus,
        expoPushToken,
        setUnreadCount,
        refreshNotifications,
        refreshEventNotificationSync,
        markNotificationAsRead,
        dismissNotification,
        updateSetting,
        requestPushPermission,
      }}
    >
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
