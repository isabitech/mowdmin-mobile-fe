import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  InspirationalBooks,
  LiveVideoSection,
  PrayerArmy,
  QuickActions,
  TorahSection
} from '../../src/components/home';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-gray-900">Welcome</Text>
          <Text className="text-gray-600 text-base">to Mowdministries</Text>
        </View>

        {/* Live Video / Video Carousel */}
        <LiveVideoSection isLive={false} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Prayer Army */}
        <PrayerArmy />

        {/* Torah Section */}
        <TorahSection />

        {/* Inspirational Books */}
        <InspirationalBooks />
      </ScrollView>
    </SafeAreaView>
  );
}
