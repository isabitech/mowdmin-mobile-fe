import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationSettingsScreen = ({ navigation }: any) => {
  const [emailNotification, setEmailNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);
  const [inAppNotification, setInAppNotification] = useState(true);

  const handleToggle = (type: 'email' | 'push' | 'inApp') => {
    switch (type) {
      case 'email':
        setEmailNotification(!emailNotification);
        break;
      case 'push':
        setPushNotification(!pushNotification);
        break;
      case 'inApp':
        setInAppNotification(!inAppNotification);
        break;
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
          emailNotification,
          () => handleToggle('email')
        )}

        {renderSettingItem(
          'Push notification',
          "You will receive instant updates directly on your device's screen, even when you're not using the app.",
          pushNotification,
          () => handleToggle('push')
        )}

        {renderSettingItem(
          'In-app notification',
          'You will receive updates inside the app, shown as badges, banners, or in the notifications tab',
          inAppNotification,
          () => handleToggle('inApp')
        )}
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
});

export default NotificationSettingsScreen;
