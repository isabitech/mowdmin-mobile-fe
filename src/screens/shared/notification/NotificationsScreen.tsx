import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsAPI, AppNotification } from '../../../services/notificationsApi';

const getNotificationIcon = (type: string) => {
  const configs: Record<string, { icon: string; iconColor: string; iconBg: string }> = {
    donation: { icon: 'heart', iconColor: '#FF6B6B', iconBg: '#FFE8E8' },
    order: { icon: 'cart', iconColor: '#4C6FFF', iconBg: '#E8ECFF' },
    group: { icon: 'people', iconColor: '#4CAF50', iconBg: '#E8F5E9' },
    membership: { icon: 'ribbon', iconColor: '#9C27B0', iconBg: '#F3E5F5' },
    reminder: { icon: 'notifications', iconColor: '#FF9800', iconBg: '#FFF3E0' },
    info: { icon: 'information-circle', iconColor: '#4C6FFF', iconBg: '#E8ECFF' },
  };
  return configs[type] || configs.info;
};

const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hrs`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} wks`;
  } catch {
    return '';
  }
};

interface NotificationDisplay {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  isNew: boolean;
}

const toDisplay = (n: AppNotification): NotificationDisplay => {
  const config = getNotificationIcon(n.type);
  return {
    id: n._id,
    title: n.title,
    description: n.message,
    time: formatTimeAgo(n.createdAt),
    icon: config.icon,
    iconColor: config.iconColor,
    iconBg: config.iconBg,
    isNew: !n.isRead,
  };
};

const SwipeableNotification = ({
  notification,
  onDelete,
  onPress,
}: {
  notification: NotificationDisplay;
  onDelete: () => void;
  onPress: () => void;
}) => {
  const translateX = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          Animated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <View className="relative">
      <View className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 justify-center items-center">
        <TouchableOpacity
          onPress={handleDelete}
          className="w-full h-full justify-center items-center"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: '#fff',
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          className="px-4 py-4 border-b border-gray-100"
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View className="flex-row gap-3">
            <View
              className="w-11 h-11 rounded-xl justify-center items-center relative"
              style={{ backgroundColor: notification.iconBg }}
            >
              <Ionicons
                name={notification.icon as any}
                size={20}
                color={notification.iconColor}
              />
              {notification.isNew && (
                <View className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-base font-semibold text-black">
                  {notification.title}
                </Text>
                <Text className="text-xs text-gray-400">{notification.time}</Text>
              </View>
              <Text className="text-sm text-gray-600 leading-5 mb-2" numberOfLines={3}>
                {notification.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data.map(toDisplay));
    } catch (error: any) {
      console.error('[Notifications] fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => n.isNew).length;

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationPress = async (notification: NotificationDisplay) => {
    if (notification.isNew) {
      try {
        await notificationsAPI.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isNew: false } : n)
        );
      } catch (error: any) {
        console.error('[Notifications] markAsRead error:', error.message);
      }
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-10">
      <View className="mb-5">
        <Ionicons name="notifications-outline" size={80} color="#E0E0E0" />
      </View>
      <Text className="text-base text-gray-400 text-center">
        You currently have no notification
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#040725" />
        <Text className="text-gray-500 mt-4">Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center justify-center gap-2">
          <Text className="text-lg font-semibold text-black">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1.5">
              <Text className="text-white text-xs font-semibold">{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="w-10 h-10 justify-center items-center"
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#040725" />
          }
        >
          {notifications.map((notification) => (
            <SwipeableNotification
              key={notification.id}
              notification={notification}
              onDelete={() => handleDelete(notification.id)}
              onPress={() => handleNotificationPress(notification)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
