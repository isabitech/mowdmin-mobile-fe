# Event Notifications Backend Handoff

## What is already done on mobile

The mobile app now has a full frontend notification flow for events:

- `expo-notifications` is installed and configured.
- The app asks for device notification permission.
- The app generates an Expo push token when permission is granted.
- Notification preferences are persisted on device and are ready to sync with backend.
- The app schedules local fallback notifications for:
  - monthly event digests
  - registered-event reminders
- The in-app Notifications screen now merges backend notifications with local fallback notifications.
- Tapping a notification can open the Events tab and deep-link to a specific event.

## Important note

The app now has local fallback scheduling, but backend push is still required for reliable delivery when:

- a user has not opened the app recently
- a new month’s event schedule is added after the app last synced
- an admin updates event dates/times and users need fresh reminders

Without backend push, the frontend can only schedule reminders based on event data the device has already fetched.

## Frontend endpoints now expected

### 1. Get notification feed

`GET /notifications`

This already exists in the app and is still used.

Expected response:

```json
{
  "status": "success",
  "message": "Notifications fetched successfully",
  "data": [
    {
      "_id": "notif_123",
      "userId": "user_123",
      "title": "Events for July 2026",
      "message": "5 events are scheduled for July 2026. Tap to view the calendar.",
      "type": "event",
      "isRead": false,
      "metadata": {
        "target": "event",
        "monthKey": "2026-07"
      },
      "createdAt": "2026-06-14T10:00:00.000Z",
      "updatedAt": "2026-06-14T10:00:00.000Z"
    }
  ]
}
```

### 2. Mark notification as read

`PUT /notifications/:notificationId/read`

Expected response:

```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

### 3. Get notification preferences

`GET /notifications/preferences`

Expected response:

```json
{
  "status": "success",
  "message": "Notification preferences fetched successfully",
  "data": {
    "emailNotification": false,
    "pushNotification": true,
    "inAppNotification": true,
    "monthlyEvents": true,
    "eventReminder": true
  }
}
```

### 4. Update notification preferences

`PUT /notifications/preferences`

Request body:

```json
{
  "emailNotification": false,
  "pushNotification": true,
  "inAppNotification": true,
  "monthlyEvents": true,
  "eventReminder": true
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Notification preferences updated successfully",
  "data": {
    "emailNotification": false,
    "pushNotification": true,
    "inAppNotification": true,
    "monthlyEvents": true,
    "eventReminder": true
  }
}
```

### 5. Register device push token

`POST /notifications/devices/register`

Request body:

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "deviceName": "Pixel 8",
  "appVersion": "1.0.0",
  "locale": "en-NG"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Device token registered successfully",
  "data": {
    "_id": "device_123",
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "android",
    "isActive": true,
    "lastSeenAt": "2026-06-14T10:00:00.000Z"
  }
}
```

### 6. Unregister device push token

`POST /notifications/devices/unregister`

Request body:

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Device token unregistered successfully"
}
```

## Notification types the mobile app understands

These are the most useful `type` values for the UI:

- `event`
- `reminder`
- `info`
- `donation`
- `order`
- `group`
- `membership`

For event scheduling work, backend should mainly use:

- `event` for month-level schedule announcements
- `reminder` for event-specific reminders

## Metadata payload expected by mobile

The mobile app uses `metadata` to decide where to navigate when a user taps a notification.

### Month digest notification

```json
{
  "target": "event",
  "monthKey": "2026-07"
}
```

### Event-specific notification

```json
{
  "target": "event",
  "eventId": "6850f12ab4c0b7db72df9012"
}
```

### Recommended full payload shape

```json
{
  "target": "event",
  "eventId": "6850f12ab4c0b7db72df9012",
  "monthKey": "2026-07",
  "category": "monthly-events"
}
```

Only `target: "event"` is required for navigation. `eventId` is optional but strongly recommended for direct event opening.

## Backend trigger rules to implement

### 1. Monthly event schedule announcement

Send this when a month has event data ready for users.

Recommended behavior:

- Trigger when the first event for a new month is published, or when an admin explicitly publishes the month schedule.
- Send only to users whose preferences are:
  - `pushNotification = true`
  - `monthlyEvents = true`
- Also create an in-app notification record if:
  - `inAppNotification = true`

Recommended notification:

```json
{
  "title": "Events for July 2026",
  "message": "5 events are scheduled for July 2026. Tap to view the calendar.",
  "type": "event",
  "metadata": {
    "target": "event",
    "monthKey": "2026-07"
  }
}
```

### 2. Event registration confirmation

Recommended when a user registers for an event.

Audience:

- only the user who registered

Recommended notification:

```json
{
  "title": "You are registered",
  "message": "You are registered for Revival Night on July 12 at 5:00 PM.",
  "type": "event",
  "metadata": {
    "target": "event",
    "eventId": "6850f12ab4c0b7db72df9012"
  }
}
```

### 3. Event reminder: 24 hours before

Audience:

- users registered for the event
- only if:
  - `pushNotification = true`
  - `eventReminder = true`

Recommended notification:

```json
{
  "title": "Reminder: Revival Night",
  "message": "Revival Night starts tomorrow at 5:00 PM.",
  "type": "reminder",
  "metadata": {
    "target": "event",
    "eventId": "6850f12ab4c0b7db72df9012"
  }
}
```

### 4. Event reminder: 2 hours before

Same audience and preferences as above.

Recommended notification:

```json
{
  "title": "Reminder: Revival Night",
  "message": "Revival Night starts in 2 hours.",
  "type": "reminder",
  "metadata": {
    "target": "event",
    "eventId": "6850f12ab4c0b7db72df9012"
  }
}
```

### 5. Event update notification

Recommended when an event date, time, or location changes after users have registered.

Audience:

- users registered for that event

Recommended notification:

```json
{
  "title": "Event updated",
  "message": "Revival Night has a new start time. Tap to review the update.",
  "type": "event",
  "metadata": {
    "target": "event",
    "eventId": "6850f12ab4c0b7db72df9012"
  }
}
```

## Suggested backend data model

### Notification preferences

One record per user:

```json
{
  "_id": "pref_123",
  "userId": "user_123",
  "emailNotification": false,
  "pushNotification": true,
  "inAppNotification": true,
  "monthlyEvents": true,
  "eventReminder": true,
  "createdAt": "2026-06-14T10:00:00.000Z",
  "updatedAt": "2026-06-14T10:00:00.000Z"
}
```

### Device tokens

One user can have many devices:

```json
{
  "_id": "device_123",
  "userId": "user_123",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "deviceName": "Pixel 8",
  "appVersion": "1.0.0",
  "locale": "en-NG",
  "isActive": true,
  "lastSeenAt": "2026-06-14T10:00:00.000Z",
  "createdAt": "2026-06-14T10:00:00.000Z",
  "updatedAt": "2026-06-14T10:00:00.000Z"
}
```

### Notifications

```json
{
  "_id": "notif_123",
  "userId": "user_123",
  "title": "Events for July 2026",
  "message": "5 events are scheduled for July 2026. Tap to view the calendar.",
  "type": "event",
  "isRead": false,
  "metadata": {
    "target": "event",
    "monthKey": "2026-07"
  },
  "delivery": {
    "pushSent": true,
    "inAppCreated": true,
    "emailSent": false
  },
  "createdAt": "2026-06-14T10:00:00.000Z",
  "updatedAt": "2026-06-14T10:00:00.000Z"
}
```

## Push delivery notes for backend

The frontend registers Expo push tokens, so backend can send pushes through Expo Push Service.

Each push payload should include:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Reminder: Revival Night",
  "body": "Revival Night starts tomorrow at 5:00 PM.",
  "sound": "default",
  "data": {
    "target": "event",
    "eventId": "6850f12ab4c0b7db72df9012",
    "notificationType": "reminder"
  }
}
```

Recommended backend behavior:

- store Expo push tickets and receipts for debugging
- deactivate tokens that return permanent device errors
- deduplicate sends per user/device/event trigger

## Frontend behavior if backend is not ready yet

The mobile app is intentionally tolerant right now:

- if `/notifications/preferences` is missing, the app uses local device preferences
- if `/notifications/devices/register` is missing, the app still works locally
- if backend push is not ready, local fallback notifications still work after the app syncs events

That means the backend can implement this incrementally.

## Implementation priority for backend

Recommended order:

1. Finish `GET /notifications`, `PUT /notifications/:id/read`, `GET /notifications/preferences`, and `PUT /notifications/preferences`.
2. Add device token registration and unregistration endpoints.
3. Add monthly schedule announcement job/trigger.
4. Add registered-event reminder jobs for 24 hours and 2 hours before each event.
5. Add event-update notifications for changed schedules.

## Mobile file references

If backend wants to verify the frontend contract in code, the main files are:

- `src/contexts/NotificationContext.tsx`
- `src/services/notificationsApi.ts`
- `src/services/deviceNotifications.ts`
- `src/screens/shared/notification/NotificationsScreen.tsx`
- `src/screens/shared/notification/NotificationSettingsScreen.tsx`
- `src/screens/tabs/EventScreen.tsx`
