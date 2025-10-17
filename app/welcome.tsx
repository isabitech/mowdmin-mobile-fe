import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const slides = [
  require("@/assets/images/church/church-bg-1.jpg"),
  require("@/assets/images/church/church-bg-2.jpg"),
  require("@/assets/images/church/church-bg-3.jpg"),
];

export default function WelcomeScreenSlideshow() {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const crossfade = (fromIndex: number, toIndex: number) => {
    setPrevIndex(fromIndex);
    fade.setValue(1);
    Animated.timing(fade, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setPrevIndex(null);
    });
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((cur) => {
        const next = (cur + 1) % slides.length;
        crossfade(cur, next);
        return next;
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* Fading Previous Image */}
      {prevIndex !== null && (
        <Animated.Image
          source={slides[prevIndex]}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { opacity: fade }]}
        />
      )}

      {/* Current Image */}
      <Animated.Image
        source={slides[index]}
        resizeMode="cover"
        style={{ height: "100%", width: "100%" }}
      />

      {/* Overlay */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Bottom Card */}
      <View className="absolute bottom-0 w-full px-6 pb-6">
        <View className="bg-white w-full rounded-3xl p-5">
          {/* Logo */}
          <View className="w-full mb-2">
            <Image
              source={require("@/assets/images/mowd-logo.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-[#0B1448] mt-2">
            Welcome to Mowdministries
          </Text>

          {/* Description */}
          <Text className="text-[12px] text-gray-600 mt-2 mb-6 leading-5">
            Jesus loves you! Stay connected with inspiring messages, worship, and resources to grow in faith.
          </Text>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/get-started")}
            className="bg-[#0B1448] w-full py-4 rounded-full items-center mb-3"
          >
            <Text className="text-white font-semibold text-base">
              Create account
            </Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className="border-[#0B1448] border-2 w-full py-4 rounded-full items-center mb-3"
          >
            <Text className="text-[#0B1448] text-base font-medium">
              Log in
            </Text>
          </TouchableOpacity>

          {/* Terms Text */}
          <Text className="text-[10px] text-center text-gray-600">
            By continuing, you agree to Mowdministries{" "}
            <Text className="text-black underline font-semibold text-[12px]">
              Terms of Use.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
