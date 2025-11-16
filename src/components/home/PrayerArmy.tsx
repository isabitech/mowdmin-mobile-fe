import { MessageCircle, Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface PrayerRequest {
  id: string;
  user: string;
  request: string;
  timeAgo: string;
  prayerCount: number;
}

interface PrayerArmyProps {
  prayerRequests?: PrayerRequest[];
}

export const PrayerArmy: React.FC<PrayerArmyProps> = ({
  prayerRequests = [
    {
      id: '1',
      user: 'Sarah M.',
      request: 'Please pray for my mother\'s healing and recovery from surgery.',
      timeAgo: '2 hours ago',
      prayerCount: 15
    },
    {
      id: '2',
      user: 'John D.',
      request: 'Seeking guidance for a major life decision. Your prayers are appreciated.',
      timeAgo: '5 hours ago',
      prayerCount: 28
    },
    {
      id: '3',
      user: 'Maria L.',
      request: 'Praying for peace and unity in our community during these challenging times.',
      timeAgo: '1 day ago',
      prayerCount: 42
    }
  ]
}) => {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-gray-900">🙏 Prayer Army</Text>
        <TouchableOpacity className="bg-blue-600 rounded-full p-2">
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
        {prayerRequests.map((prayer) => (
          <View key={prayer.id} className="mr-4 w-72 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-semibold text-sm">
                  {prayer.user.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{prayer.user}</Text>
                <Text className="text-gray-500 text-xs">{prayer.timeAgo}</Text>
              </View>
            </View>
            
            <Text className="text-gray-700 text-sm mb-3 leading-5" numberOfLines={3}>
              {prayer.request}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MessageCircle size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {prayer.prayerCount} prayers
                </Text>
              </View>
              <TouchableOpacity className="bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 text-sm font-semibold">Pray</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity className="mx-6 mt-4 bg-blue-600 rounded-xl py-3 items-center">
        <Text className="text-white font-semibold">Add Your Prayer Request</Text>
      </TouchableOpacity>
    </View>
  );
};