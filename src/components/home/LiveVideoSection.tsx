import { Eye, Play } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
    { id: "1", title: "Faith in Action", thumbnail: "", duration: "25:30" },
    { id: "2", title: "Hope & Healing", thumbnail: "", duration: "18:45" },
    { id: "3", title: "Grace Unveiled", thumbnail: "", duration: "32:15" },
  ],
}) => {
  if (isLive) {
    return (
      <View className=" mb-6 absolute h-full top-0 bg-yellow-300 w-full">
        <View className="absolute inset-0 bg-black bg-opacity-40 justify-center items-center">
          <TouchableOpacity className="rounded-full bg-white bg-opacity-70 p-4">
            <Play size={50} color="#000" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-end p-4">
          <View className="flex-row items-center">
            <View className="bg-red-500 px-2 py-1 rounded-md flex-row items-center mr-4">
              <View className="w-2 h-2 bg-white rounded-full mr-2" />
              <Text className="text-white font-semibold rounded-sm px-5 py-1">
                LIVE
              </Text>
            </View>
            <View className="bg-black bg-opacity-60 px-2 py-1 rounded-md flex-row items-center">
              <Eye size={16} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">1.2K Watching</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6 h-full bg-red-600">
      <View className="flex-row justify-between items-center px-6 mb-3">
        <Text className="text-xl font-bold text-gray-900">Recent Videos</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-semibold">See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-6"
      >
        {videos.map((video) => (
          <TouchableOpacity key={video.id} className="mr-4 w-64">
            <View className="rounded-xl bg-gray-200 h-36 justify-center items-center mb-2 relative">
              <Play size={40} color="#666" />
              <View className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                <Text className="text-white text-xs">{video.duration}</Text>
              </View>
            </View>
            <Text
              className="text-gray-900 font-semibold text-sm"
              numberOfLines={2}
            >
              {video.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
