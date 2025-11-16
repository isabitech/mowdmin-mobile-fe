import { Play } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface LiveVideoSectionProps {
  isLive?: boolean;
  liveStreamTitle?: string;
  videos?: Video[];
}

export const LiveVideoSection: React.FC<LiveVideoSectionProps> = ({
  isLive = false,
  liveStreamTitle = "Sunday Service Live",
  videos = [
    { id: '1', title: 'Faith in Action', thumbnail: '', duration: '25:30' },
    { id: '2', title: 'Hope & Healing', thumbnail: '', duration: '18:45' },
    { id: '3', title: 'Grace Unveiled', thumbnail: '', duration: '32:15' },
  ]
}) => {
  if (isLive) {
    return (
      <View className="mb-6 h-[250px]">
        <Text className="text-xl font-bold text-gray-900 mb-3 px-6">🔴 Live Now</Text>
        <View className="mx-6 rounded-2xl overflow-hidden bg-red-600 h-48 justify-center items-center relative">
          <View className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">LIVE</Text>
          </View>
          <Play size={60} color="white" />
          <Text className="text-white text-lg font-semibold mt-3">{liveStreamTitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6 h-[250px] bg-red-600">
      <View className="flex-row justify-between items-center px-6 mb-3">
        <Text className="text-xl font-bold text-gray-900">Recent Videos</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-semibold">See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
        {videos.map((video) => (
          <TouchableOpacity key={video.id} className="mr-4 w-64">
            <View className="rounded-xl bg-gray-200 h-36 justify-center items-center mb-2 relative">
              <Play size={40} color="#666" />
              <View className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                <Text className="text-white text-xs">{video.duration}</Text>
              </View>
            </View>
            <Text className="text-gray-900 font-semibold text-sm" numberOfLines={2}>
              {video.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};