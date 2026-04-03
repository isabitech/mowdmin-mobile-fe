import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import TabNavigator from './TabNavigator';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import RegistrationSuccessScreen from '../screens/auth/RegistrationSuccessScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import NotificationsScreen from '../screens/shared/notification/NotificationsScreen'; // Import NotificationsScreen
import NotificationSettingsScreen from '../screens/shared/notification/NotificationSettingsScreen'; // Import NotificationSettingsScreen
import ShopNavigator from './ShopNavigator'; // Import ShopNavigator
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SelectLanguageScreen from '../screens/profile/SelectLanguageScreen';
import GivingHistoryScreen from '../screens/profile/GivingHistoryScreen';
import AboutMowdministriesScreen from '../screens/profile/AboutMowdministriesScreen';
import BibleScreen from '../screens/content/BibleScreen';
import BibleStoriesScreen from '../screens/content/BibleStoriesScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CreateNewGroupScreen from '../screens/community/CreateNewGroupScreen';
import GroupChatScreen from '../screens/community/GroupChatScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import MembershipScreen from '../screens/profile/MembershipScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoading, isFirstTime, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isFirstTime ? (

    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
          </>
        ) : (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        )}
        {/* Notifications Screen is accessible when authenticated */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        {/* Notification Settings Screen accessible from NotificationsScreen */}
        {/* Notification Settings Screen accessible from NotificationsScreen */}
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        {/* Shop Navigator */}
        <Stack.Screen name="ShopStack" component={ShopNavigator} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SelectLanguage" component={SelectLanguageScreen} />
        <Stack.Screen name="GivingHistory" component={GivingHistoryScreen} />
        <Stack.Screen name="AboutMowdministries" component={AboutMowdministriesScreen} />
        <Stack.Screen name="Bible" component={BibleScreen} />
        <Stack.Screen name="BibleStories" component={BibleStoriesScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="CreateNewGroup" component={CreateNewGroupScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Membership" component={MembershipScreen} />
      </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
