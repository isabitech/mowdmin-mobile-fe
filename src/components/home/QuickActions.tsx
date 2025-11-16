import { Heart, ShoppingBag } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const QuickActions: React.FC = () => {
  return (
    <View className="mb-6 px-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
      <View className="flex-row gap-4">
        <TouchableOpacity className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 items-center">
          <View className="bg-white bg-opacity-20 rounded-full p-3 mb-3">
            <ShoppingBag size={24} color="white" />
          </View>
          <Text className="text-white font-bold text-lg">Shop</Text>
          <Text className="text-white text-sm opacity-90 text-center mt-1">
            Books, Music & More
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 items-center">
          <View className="bg-white bg-opacity-20 rounded-full p-3 mb-3">
            <Heart size={24} color="white" />
          </View>
          <Text className="text-white font-bold text-lg">Donate</Text>
          <Text className="text-white text-sm opacity-90 text-center mt-1">
            Support Our Ministry
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};