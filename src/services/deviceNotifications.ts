import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Event } from './eventsApi';
import type { AppNotification, NotificationPreferences } from './notificationsApi';

export type PushPermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

interface ManagedNotificationEntry {
  key: string;
  notificationId: string;
  title: string;
  body: string;
  triggerAt: string;
  type: string;
  metadata: Record<string, unknown>;
}

interface NotificationDraft {
  key: string;
  title: string;
  body: string;
  triggerAt: Date;
  type: string;
  metadata: Record<string, unknown>;
}

const NOTIFICATION_CHANNEL_ID = 'events';
const PREFERENCES_STORAGE_KEY = '@notifications:preferences';
const LOCAL_INBOX_STORAGE_KEY = '@notifications:localInbox';
const MANAGED_SCHEDULES_STORAGE_KEY = '@notifications:managedSchedules';
const DELIVERED_KEYS_STORAGE_KEY = '@notifications:deliveredManagedKeys';
const DISMISSED_IDS_STORAGE_KEY = '@notifications:dismissedIds';
const MAX_MONTHLY_DIGESTS = 6;
const MAX_IMMEDIATE_DELAY_MS = 5000;

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotification: false,
  pushNotification: true,
  inAppNotification: true,
  monthlyEvents: true,
  eventReminder: true,
};

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`[DeviceNotifications] Failed reading ${key}:`, error);
    return fallback;
  }
};

const writeJson = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[DeviceNotifications] Failed writing ${key}:`, error);
  }
};

const normalizeDate = (date: Date): string => {
  return new Date(date).toISOString();
};

const sortNotifications = (items: AppNotification[]): AppNotification[] => {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const parseTime = (time: string): { hours: number; minutes: number } | null => {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) {
    return null;
  }

  const [, hourText, minuteText = '0', meridiem] = match;
  let hours = Number(hourText);
  const minutes = Number(minuteText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (meridiem) {
    const normalizedMeridiem = meridiem.toUpperCase();
    if (normalizedMeridiem === 'PM' && hours < 12) {
      hours += 12;
    }
    if (normalizedMeridiem === 'AM' && hours === 12) {
      hours = 0;
    }
  }

  return { hours, minutes };
};

const getEventDateTime = (event: Event): Date | null => {
  const baseDate = new Date(event.date);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const parsedTime = parseTime(event.time || '');
  if (!parsedTime) {
    return baseDate;
  }

  baseDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return baseDate;
};

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const buildNotificationIdentity = (
  notification: Pick<AppNotification, '_id' | 'source' | 'notificationKey'>
): string => {
  const source = notification.source || 'backend';
  const localKey = notification.notificationKey || notification._id;
  return `${source}:${localKey}`;
};

const buildLocalNotification = ({
  id,
  title,
  body,
  type,
  createdAt,
  metadata,
  notificationKey,
}: {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  notificationKey?: string;
}): AppNotification => ({
  _id: id,
  userId: '',
  title,
  message: body,
  type,
  isRead: false,
  metadata,
  createdAt,
  updatedAt: createdAt,
  source: 'local',
  notificationKey,
});

const getManagedSchedules = async (): Promise<ManagedNotificationEntry[]> => {
  return readJson<ManagedNotificationEntry[]>(MANAGED_SCHEDULES_STORAGE_KEY, []);
};

const saveManagedSchedules = async (entries: ManagedNotificationEntry[]): Promise<void> => {
  await writeJson(MANAGED_SCHEDULES_STORAGE_KEY, entries);
};

const getDeliveredKeys = async (): Promise<string[]> => {
  return readJson<string[]>(DELIVERED_KEYS_STORAGE_KEY, []);
};

const saveDeliveredKeys = async (keys: string[]): Promise<void> => {
  await writeJson(DELIVERED_KEYS_STORAGE_KEY, Array.from(new Set(keys)));
};

const getDismissedIdentities = async (): Promise<string[]> => {
  return readJson<string[]>(DISMISSED_IDS_STORAGE_KEY, []);
};

export const getStoredNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const stored = await readJson<Partial<NotificationPreferences>>(
    PREFERENCES_STORAGE_KEY,
    defaultNotificationPreferences
  );
  return {
    ...defaultNotificationPreferences,
    ...stored,
  };
};

export const saveStoredNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<void> => {
  await writeJson(PREFERENCES_STORAGE_KEY, preferences);
};

export const getLocalInboxNotifications = async (): Promise<AppNotification[]> => {
  const items = await readJson<AppNotification[]>(LOCAL_INBOX_STORAGE_KEY, []);
  return sortNotifications(
    items.map((item) => ({
      ...item,
      source: 'local',
    }))
  );
};

const saveLocalInboxNotifications = async (items: AppNotification[]): Promise<void> => {
  await writeJson(LOCAL_INBOX_STORAGE_KEY, sortNotifications(items));
};

const upsertLocalInboxNotification = async (notification: AppNotification): Promise<void> => {
  const items = await getLocalInboxNotifications();
  const identity = buildNotificationIdentity(notification);
  const nextItems = items.filter(
    (item) => buildNotificationIdentity(item) !== identity
  );
  nextItems.push({
    ...notification,
    source: 'local',
  });
  await saveLocalInboxNotifications(nextItems);
};

export const markLocalInboxNotificationAsRead = async (
  notificationId: string,
  notificationKey?: string
): Promise<void> => {
  const items = await getLocalInboxNotifications();
  const nextItems = items.map((item) => {
    const isTarget =
      item._id === notificationId ||
      (!!notificationKey && item.notificationKey === notificationKey);
    return isTarget ? { ...item, isRead: true } : item;
  });
  await saveLocalInboxNotifications(nextItems);
};

export const removeLocalInboxNotification = async (
  notificationId: string,
  notificationKey?: string
): Promise<void> => {
  const items = await getLocalInboxNotifications();
  const nextItems = items.filter((item) => {
    if (item._id === notificationId) {
      return false;
    }
    if (notificationKey && item.notificationKey === notificationKey) {
      return false;
    }
    return true;
  });
  await saveLocalInboxNotifications(nextItems);
};

export const dismissNotificationLocally = async (
  notification: Pick<AppNotification, '_id' | 'source' | 'notificationKey'>
): Promise<void> => {
  const current = await getDismissedIdentities();
  current.push(buildNotificationIdentity(notification));
  await writeJson(DISMISSED_IDS_STORAGE_KEY, Array.from(new Set(current)));
};

export const getDismissedNotificationIdentities = async (): Promise<Set<string>> => {
  const ids = await getDismissedIdentities();
  return new Set(ids);
};

export const getNotificationIdentity = buildNotificationIdentity;

export const getPermissionState = (
  status?: Notifications.NotificationPermissionsStatus['status'] | null
): PushPermissionState => {
  if (!status) {
    return 'undetermined';
  }
  if (status === 'granted' || status === 'denied' || status === 'undetermined') {
    return status;
  }
  return 'undetermined';
};

export const ensureNotificationChannelAsync = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Events',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4C6FFF',
    sound: 'default',
  });
};

const getExpoProjectId = (): string | undefined => {
  const easProjectId =
    Constants.easConfig?.projectId ||
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;
  return easProjectId;
};

export const registerForPushNotificationsAsync = async (): Promise<{
  status: PushPermissionState;
  token: string | null;
}> => {
  if (!Device.isDevice) {
    return { status: 'unavailable', token: null };
  }

  await ensureNotificationChannelAsync();

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = getPermissionState(existingPermissions.status);

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: false,
      },
    });
    finalStatus = getPermissionState(requestedPermissions.status);
  }

  if (finalStatus !== 'granted') {
    return { status: finalStatus, token: null };
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn('[DeviceNotifications] Expo project ID missing, push token skipped.');
    return { status: finalStatus, token: null };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: finalStatus, token: token.data };
  } catch (error) {
    console.error('[DeviceNotifications] Failed to get Expo push token:', error);
    return { status: finalStatus, token: null };
  }
};

const buildMonthlyDigestNotifications = (
  events: Event[],
  now: Date
): NotificationDraft[] => {
  const grouped = new Map<string, Event[]>();

  events.forEach((event) => {
    const eventDate = getEventDateTime(event);
    if (!eventDate || eventDate.getTime() < now.getTime()) {
      return;
    }

    const monthKey = getMonthKey(eventDate);
    const current = grouped.get(monthKey) || [];
    current.push(event);
    grouped.set(monthKey, current);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, MAX_MONTHLY_DIGESTS)
    .map(([monthKey, monthEvents]) => {
      const eventDate = getEventDateTime(monthEvents[0]) || now;
      const isCurrentMonth =
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear();

      const triggerAt = isCurrentMonth
        ? new Date(now.getTime() + MAX_IMMEDIATE_DELAY_MS)
        : new Date(eventDate.getFullYear(), eventDate.getMonth(), 1, 9, 0, 0, 0);

      const count = monthEvents.length;
      const monthLabel = getMonthLabel(eventDate);

      return {
        key: `managed-monthly-${monthKey}`,
        title: `Events for ${monthLabel}`,
        body: `${count} event${count === 1 ? '' : 's'} are scheduled for ${monthLabel}. Tap to view the calendar.`,
        triggerAt,
        type: 'event',
        metadata: {
          target: 'event',
          monthKey,
          managedNotificationKey: `managed-monthly-${monthKey}`,
        },
      };
    });
};

const buildEventReminderNotifications = (
  events: Event[],
  registeredEventIds: string[],
  now: Date
): NotificationDraft[] => {
  const registeredSet = new Set(registeredEventIds);
  const drafts: NotificationDraft[] = [];

  events.forEach((event) => {
    if (!registeredSet.has(event.id)) {
      return;
    }

    const eventDate = getEventDateTime(event);
    if (!eventDate) {
      return;
    }

    const offsets = [
      { suffix: '24h', milliseconds: 24 * 60 * 60 * 1000, label: 'tomorrow' },
      { suffix: '2h', milliseconds: 2 * 60 * 60 * 1000, label: 'in 2 hours' },
    ];

    offsets.forEach((offset) => {
      const triggerAt = new Date(eventDate.getTime() - offset.milliseconds);
      if (triggerAt.getTime() <= now.getTime() + 60 * 1000) {
        return;
      }

      drafts.push({
        key: `managed-event-${event.id}-${offset.suffix}`,
        title: `Reminder: ${event.title}`,
        body: `${event.title} starts ${offset.label} at ${event.time}.`,
        triggerAt,
        type: 'reminder',
        metadata: {
          target: 'event',
          eventId: event.id,
          managedNotificationKey: `managed-event-${event.id}-${offset.suffix}`,
        },
      });
    });
  });

  return drafts;
};

const createLocalNotificationFromManagedEntry = (
  entry: ManagedNotificationEntry
): AppNotification => {
  return buildLocalNotification({
    id: entry.notificationId,
    title: entry.title,
    body: entry.body,
    type: entry.type,
    createdAt: entry.triggerAt,
    metadata: entry.metadata,
    notificationKey: entry.key,
  });
};

export const materializeDueNotifications = async (
  now: Date = new Date()
): Promise<void> => {
  const [entries, deliveredKeys] = await Promise.all([
    getManagedSchedules(),
    getDeliveredKeys(),
  ]);

  const deliveredSet = new Set(deliveredKeys);
  const futureEntries: ManagedNotificationEntry[] = [];

  for (const entry of entries) {
    if (new Date(entry.triggerAt).getTime() <= now.getTime()) {
      if (!deliveredSet.has(entry.key)) {
        await upsertLocalInboxNotification(createLocalNotificationFromManagedEntry(entry));
        deliveredSet.add(entry.key);
      }
      continue;
    }

    futureEntries.push(entry);
  }

  await Promise.all([
    saveManagedSchedules(futureEntries),
    saveDeliveredKeys(Array.from(deliveredSet)),
  ]);
};

export const clearManagedEventNotifications = async (): Promise<void> => {
  const entries = await getManagedSchedules();
  await Promise.all(
    entries.map((entry) =>
      Notifications.cancelScheduledNotificationAsync(entry.notificationId).catch(() => undefined)
    )
  );
  await saveManagedSchedules([]);
};

export const syncManagedEventNotifications = async ({
  events,
  registeredEventIds,
  preferences,
  canScheduleDeviceNotifications,
}: {
  events: Event[];
  registeredEventIds: string[];
  preferences: NotificationPreferences;
  canScheduleDeviceNotifications: boolean;
}): Promise<void> => {
  const now = new Date();
  await materializeDueNotifications(now);

  const existingEntries = await getManagedSchedules();
  const deliveredKeys = new Set(await getDeliveredKeys());

  if (!canScheduleDeviceNotifications) {
    await clearManagedEventNotifications();
    return;
  }

  await ensureNotificationChannelAsync();

  const desiredDrafts: NotificationDraft[] = [
    ...(preferences.monthlyEvents ? buildMonthlyDigestNotifications(events, now) : []),
    ...(preferences.eventReminder
      ? buildEventReminderNotifications(events, registeredEventIds, now)
      : []),
  ];

  const existingByKey = new Map(existingEntries.map((entry) => [entry.key, entry]));
  const keptKeys = new Set<string>();
  const nextEntries: ManagedNotificationEntry[] = [];

  for (const draft of desiredDrafts) {
    if (deliveredKeys.has(draft.key)) {
      continue;
    }

    if (draft.triggerAt.getTime() <= now.getTime()) {
      await upsertLocalInboxNotification(
        buildLocalNotification({
          id: draft.key,
          title: draft.title,
          body: draft.body,
          type: draft.type,
          createdAt: normalizeDate(draft.triggerAt),
          metadata: draft.metadata,
          notificationKey: draft.key,
        })
      );
      deliveredKeys.add(draft.key);
      continue;
    }

    const existing = existingByKey.get(draft.key);
    const draftTriggerAt = normalizeDate(draft.triggerAt);

    if (
      existing &&
      existing.title === draft.title &&
      existing.body === draft.body &&
      existing.triggerAt === draftTriggerAt
    ) {
      keptKeys.add(existing.key);
      nextEntries.push(existing);
      continue;
    }

    if (existing) {
      await Notifications.cancelScheduledNotificationAsync(existing.notificationId).catch(
        () => undefined
      );
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: draft.key,
      content: {
        title: draft.title,
        body: draft.body,
        sound: 'default',
        data: {
          ...draft.metadata,
          title: draft.title,
          body: draft.body,
          notificationType: draft.type,
          source: 'local',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: draft.triggerAt,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });

    const nextEntry: ManagedNotificationEntry = {
      key: draft.key,
      notificationId,
      title: draft.title,
      body: draft.body,
      triggerAt: draftTriggerAt,
      type: draft.type,
      metadata: draft.metadata,
    };

    keptKeys.add(nextEntry.key);
    nextEntries.push(nextEntry);
  }

  const staleEntries = existingEntries.filter((entry) => !keptKeys.has(entry.key));
  await Promise.all(
    staleEntries.map((entry) =>
      Notifications.cancelScheduledNotificationAsync(entry.notificationId).catch(() => undefined)
    )
  );

  await Promise.all([
    saveManagedSchedules(nextEntries),
    saveDeliveredKeys(Array.from(deliveredKeys)),
  ]);
};

export const storeNotificationFromExpoPayload = async (
  notification: Notifications.Notification
): Promise<void> => {
  const { content, identifier } = notification.request;
  const title = content.title || 'Notification';
  const body = content.body || '';
  const rawData = (content.data || {}) as Record<string, unknown>;
  const notificationKey =
    typeof rawData.managedNotificationKey === 'string'
      ? rawData.managedNotificationKey
      : identifier;
  const type =
    typeof rawData.notificationType === 'string' ? rawData.notificationType : 'info';
  const createdAt = normalizeDate(new Date(notification.date));

  await upsertLocalInboxNotification(
    buildLocalNotification({
      id: identifier,
      title,
      body,
      type,
      createdAt,
      metadata: rawData,
      notificationKey,
    })
  );

  if (notificationKey) {
    const delivered = await getDeliveredKeys();
    delivered.push(notificationKey);
    await saveDeliveredKeys(delivered);
  }
};
