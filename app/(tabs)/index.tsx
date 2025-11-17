import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  InspirationalBooks,
  LiveVideoSection,
  PrayerArmy,
  QuickActions,
  TorahSection,
} from "../../src/components/home";
import { Bell } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="h-[350px] bg-red-500 w-full relative">
          <View className="absolute top-0 w-full px-5 pt-3  z-10 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">
              Welcome back!{" "}
            </Text>
            <View className="">
              <View className=" w-12 h-12 rounded-full bg-[#FFFFFF47] flex justify-center items-center">
                <Bell size={25} color="white" className="m-2" />
              </View>
            </View>
          </View>

         
            <LiveVideoSection isLive={true} />
        </View>

        {/* Quick Actions */}
        {/* <QuickActions /> */}

        {/* Prayer Army */}
        {/* <PrayerArmy /> */}

        {/* Torah Section */}
        {/* <TorahSection /> */}

        {/* Inspirational Books */}
        {/* <InspirationalBooks /> */}
      </ScrollView>
    </SafeAreaView>
  );
}
