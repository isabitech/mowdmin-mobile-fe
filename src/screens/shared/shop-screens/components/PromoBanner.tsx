import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { PromoBanner as PromoBannerType } from '../types/shop';

interface Props {
  banner: PromoBannerType;
  onPress?: () => void;
}

const PromoBanner: React.FC<Props> = ({ banner, onPress }) => {
  return (
    <View className="mx-4 mt-3 mb-4 rounded-xl overflow-hidden bg-[#040725]">
      <View className="flex-row p-4 min-h-[120px]">
        <View className="flex-1 justify-center">
          <Text className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider">
            {banner.subtitle}
          </Text>
          <Text className="text-base font-bold text-white leading-[22px] mb-3 max-w-[90%]">
            {banner.title}
          </Text>
          <TouchableOpacity 
            className="bg-red-600 px-4 py-2 rounded-md self-start"
            onPress={onPress}
          >
            <Text className="text-white text-xs font-semibold">
              {banner.ctaText}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="w-[100px] justify-center items-center">
          {/* Book stack illustration */}
          <View className="relative w-20 h-[90px]">
            <View 
              className="absolute w-[50px] h-[70px] bg-gray-700 rounded bottom-0 left-0"
              style={{ transform: [{ rotate: '-5deg' }] }}
            />
            <View 
              className="absolute w-[50px] h-[70px] bg-gray-800 rounded bottom-[5px] left-[15px]"
              style={{ transform: [{ rotate: '0deg' }] }}
            />
            <View 
              className="absolute w-[50px] h-[70px] bg-gray-900 rounded bottom-[10px] left-[30px]"
              style={{ transform: [{ rotate: '5deg' }] }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default PromoBanner;