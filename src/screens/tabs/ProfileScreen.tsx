// ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { profileAPI, Profile } from '../../services/profileApi';

const PRIMARY_COLOR = '#040725';

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Language display mapping
  const languageNames: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    pt: 'Português',
    it: 'Italiano',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    sw: 'Kiswahili',
    hi: 'हिन्दी',
  };

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('[ProfileScreen] Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Refetch profile when screen comes back into focus (e.g. after editing)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  // Display name: prefer profile data, fall back to auth user, then placeholder
  const displayName = profile?.displayName || profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayPhoto = profile?.photo || '';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle') || 'Log Out',
      t('profile.logoutMessage') || 'Are you sure you want to log out?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('profile.logout') || 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(
                t('common.error') || 'Error',
                t('profile.logoutError') || 'Failed to log out. Please try again.'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileAPI.deleteProfile();
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  const accountSettings = [
    {
      id: '1',
      title: t('profile.editProfile') || 'Edit Profile',
      icon: 'person-outline',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('EditProfile' as never),
      showArrow: true,
    },
    {
      id: '1b',
      title: 'Change Password',
      icon: 'lock-closed-outline',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('ChangePassword' as never),
      showArrow: true,
    },
    {
      id: '2',
      title: t('profile.notifications') || 'Notifications',
      icon: 'notifications-outline',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Notifications' as never),
      showArrow: true,
    },
    {
      id: '3',
      title: t('profile.language') || 'Language',
      icon: 'language',
      iconType: 'material',
      onPress: () => navigation.navigate('SelectLanguage' as never),
      showArrow: true,
      rightText: languageNames[currentLanguage] || 'English',
    },
  ];

  const ministrySettings = [
    {
      id: '4',
      title: t('profile.giveHistory') || 'Give History',
      icon: 'hand-coin-outline',
      iconType: 'material-community',
      onPress: () => navigation.navigate('GivingHistory' as never),
      showArrow: true,
    },
    {
      id: '4b',
      title: 'Membership',
      icon: 'card-account-details-outline',
      iconType: 'material-community',
      onPress: () => navigation.navigate('Membership' as never),
      showArrow: true,
    },
  ];

  const appPreferences = [
    {
      id: '5',
      title: t('profile.aboutMowdministries') || 'About Mowdministries',
      icon: 'information-circle-outline',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('AboutMowdministries' as never),
      showArrow: true,
    },
  ];

  const renderIcon = (iconName: string, iconType: string) => {
    const iconProps = { size: 22, color: PRIMARY_COLOR };

    switch (iconType) {
      case 'ionicon':
        return <Ionicons name={iconName as any} {...iconProps} />;
      case 'material':
        return <MaterialIcons name={iconName as any} {...iconProps} />;
      case 'material-community':
        return <MaterialCommunityIcons name={iconName as any} {...iconProps} />;
      default:
        return <Ionicons name={iconName as any} {...iconProps} />;
    }
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center justify-between bg-gray-50 rounded-xl py-4 px-4 mb-3"
      onPress={item.onPress}
      disabled={item.isToggle}
      activeOpacity={item.isToggle ? 1 : 0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-[#040725]/10 justify-center items-center mr-3">
          {renderIcon(item.icon, item.iconType)}
        </View>
        <Text className="text-base text-gray-900 font-medium">
          {item.title}
        </Text>
      </View>

      {item.isToggle ? (
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#E5E7EB', true: PRIMARY_COLOR }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E7EB"
        />
      ) : item.rightText ? (
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-400 mr-2">{item.rightText}</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      ) : item.showArrow ? (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );

  const renderSectionTitle = (title: string) => (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
      {title}
    </Text>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          {t('profile.title') || 'Profile & Settings'}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Header */}
        <View className="items-center pt-6 pb-8 px-6">
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-amber-100 overflow-hidden">
              {displayPhoto ? (
                <Image
                  source={{ uri: displayPhoto }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
              ) : (
                <View className="w-full h-full justify-center items-center bg-[#040725]/10">
                  <Text className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    {(displayName || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {/* Edit Badge */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full justify-center items-center border-2 border-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
              onPress={() => navigation.navigate('EditProfile' as never)}
            >
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {displayName}
          </Text>
          {displayEmail ? (
            <Text className="text-sm text-gray-500 mb-1">{displayEmail}</Text>
          ) : null}
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: '#10B981' }}
            />
            <Text className="text-sm text-gray-500">
              {memberSince
                ? `${t('profile.memberSince') || 'Member Since'} ${memberSince}`
                : t('profile.memberSince') || 'Member'}
            </Text>
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-4 mb-6">
          {renderSectionTitle(t('profile.accountSettings') || 'Account Settings')}
          {accountSettings.map(renderMenuItem)}
        </View>

        {/* Ministry */}
        <View className="px-4 mb-6">
          {renderSectionTitle(t('profile.ministry') || 'Ministry')}
          {ministrySettings.map(renderMenuItem)}
        </View>

        {/* App Preferences */}
        <View className="px-4 mb-8">
          {renderSectionTitle(t('profile.appPreferences') || 'App Preferences')}
          {appPreferences.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <View className="px-4 mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl py-4"
            style={{ backgroundColor: PRIMARY_COLOR }}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text className="text-base text-white font-semibold ml-2">
              {t('profile.logout') || 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account Button */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl py-4 bg-red-50 border border-red-200"
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="text-base text-red-500 font-semibold ml-2">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
