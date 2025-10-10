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
  const [prevIndex, setPrevIndex] = useState(null); // index of image that's fading out
  const fade = useRef(new Animated.Value(0)).current; // used to fade out prev image
  const intervalRef = useRef(null);

  // animate cross-fade: prev image fades from opacity=1 -> 0
  const crossfade = (fromIndex, toIndex) => {
    setPrevIndex(fromIndex);
    // reset fade to 1 (fully visible prev) then animate to 0
    fade.setValue(1);
    Animated.timing(fade, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setPrevIndex(null); // remove the faded image after animation
    });
  };

  // advance slide every 3 seconds
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* Previous image (fading out) */}
      {prevIndex !== null && (
        <Animated.Image
          source={slides[prevIndex]}
          resizeMode="cover"
          style={[
            StyleSheet.absoluteFill,
            { opacity: fade },
          ]}
        />
      )}

      {/* Current image (always visible beneath prev when prev exists) */}
      <Animated.Image
        source={slides[index]}
        
        style={{ opacity: 1, height:'100%',width: 'auto' }}
        
      />

      {/* optional dark overlay to improve contrast of card */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Bottom card (content) */}
      <View className="absolute bottom-0 w-full px-6 pb-6">
        <View className="bg-white w-full rounded-3xl p-5">
          {/* Logo */}
          <View className=" w-full ">
          <Image
            source={require("@/assets/images/mowd-logo.png")}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
          </View>

          {/* Title */}
          <Text className="text-lg font-bold text-[#0B1448] mt-2 ">
            Welcome to Mowdministries
          </Text>

          {/* Description */}
          <Text className="text-[12px] text-gray-600 mt-2 mb-6">
            Jesus loves you! Stay connected with inspiring messages, worship, and resources to grow in faith.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/get-started")}
            className="bg-[#0B1448] w-full py-4 rounded-full items-center mb-3"
          >
            <Text className="text-white font-semibold text-base">Create account</Text>
          </TouchableOpacity>

          {/* Secondary */}
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="border-[#0B1448] border-2 w-full py-4 rounded-full items-center mb-3">
            <Text className="text-[#0B1448] text-base font-medium  ">Log in</Text>
          </TouchableOpacity>
          <Text className="text-[10px] text-center text-gray-600">By continuing, you agree to Mowdminitries <span className=" text-black text-[12px] underline font-semibold">Term of use.</span></Text>
        </View>
      </View>
    </View>
  );
}
