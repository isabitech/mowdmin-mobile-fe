import { BookOpen, Calendar } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TorahSectionProps {
  todayReading?: {
    portion: string;
    reference: string;
    theme: string;
  };
}

export const TorahSection: React.FC<TorahSectionProps> = ({
  todayReading = {
    portion: "Parashat Vayera",
    reference: "Genesis 18:1-22:24",
    theme: "Faith and Hospitality"
  }
}) => {
  return (
    <View className="mb-6 px-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">📜 Torah</Text>
      
      <TouchableOpacity className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="white" />
              <Text className="text-white text-sm ml-2 opacity-90">Today's Reading</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-1">
              {todayReading.portion}
            </Text>
            <Text className="text-white text-sm opacity-90 mb-2">
              {todayReading.reference}
            </Text>
            <Text className="text-white text-base">
              Theme: {todayReading.theme}
            </Text>
          </View>
          
          <View className="bg-white bg-opacity-20 rounded-full p-3">
            <BookOpen size={24} color="white" />
          </View>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-sm opacity-90">Tap to read more</Text>
          <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
            <Text className="text-white text-sm font-semibold">Read</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};