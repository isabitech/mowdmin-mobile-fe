import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Events</Text>
        <Text className="text-base text-gray-600 text-center">
          Event management and calendar features will be implemented here.
        </Text>
      </View>
    </SafeAreaView>
  );
}