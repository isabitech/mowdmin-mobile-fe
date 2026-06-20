import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../contexts/NotificationContext';

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { settings, permissionStatus, expoPushToken, updateSetting } = useNotifications();

  const handleToggle = async (
    key:
      | 'emailNotification'
      | 'pushNotification'
      | 'inAppNotification'
      | 'monthlyEvents'
      | 'eventReminder'
  ) => {
    const nextValue = !settings[key];
    const appliedValue = await updateSetting(key, nextValue);

    if (key === 'pushNotification' && nextValue && !appliedValue) {
      Alert.alert(
        'Permission needed',
        'Push notifications are still off because device notification permission was not granted.'
      );
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    enabled: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#4C6FFF' }}
        thumbColor="#fff"
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderSettingItem(
          'Email notification',
          'You will receive updates, reminders, important announcements directly in your email inbox.',
          settings.emailNotification,
          () => handleToggle('emailNotification')
        )}

        {renderSettingItem(
          'Push notification',
          "You will receive instant updates directly on your device's screen, even when you're not using the app.",
          settings.pushNotification,
          () => handleToggle('pushNotification')
        )}

        {renderSettingItem(
          'In-app notification',
          'You will receive updates inside the app, shown as badges, banners, or in the notifications tab',
          settings.inAppNotification,
          () => handleToggle('inAppNotification')
        )}

        {renderSettingItem(
          'Monthly event digest',
          'When a new month has ministry events scheduled, the app will prepare a device reminder that opens the events calendar.',
          settings.monthlyEvents,
          () => handleToggle('monthlyEvents')
        )}

        {renderSettingItem(
          'Registered event reminders',
          'If you register for an event, the app will schedule reminder notifications before the event starts.',
          settings.eventReminder,
          () => handleToggle('eventReminder')
        )}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Device notification status</Text>
          <Text style={styles.statusValue}>
            {permissionStatus === 'granted'
              ? 'Granted'
              : permissionStatus === 'denied'
              ? 'Denied'
              : permissionStatus === 'unavailable'
              ? 'Unavailable on this device'
              : 'Not decided yet'}
          </Text>
          <Text style={styles.statusDescription}>
            {expoPushToken
              ? 'This device has an Expo push token and is ready for backend push delivery once the backend endpoints are connected.'
              : 'A push token will appear here after permission is granted and the backend registration endpoint is available.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusCard: {
    margin: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E6ECFF',
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4C6FFF',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
});

export default NotificationSettingsScreen;
