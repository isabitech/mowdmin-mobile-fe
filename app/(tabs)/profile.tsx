import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Profile</Text>
        <Text className="text-base text-gray-600 text-center">
          User profile, settings, donations and personal information will be managed here.
        </Text>
      </View>
    </SafeAreaView>
  );
}