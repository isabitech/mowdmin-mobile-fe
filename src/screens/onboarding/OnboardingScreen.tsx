import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides = [
  { image: require('../../assets/images/onboarding/one.jpg') },
  { image: require('../../assets/images/onboarding/two.jpg') },
  { image: require('../../assets/images/onboarding/three.jpg') },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const fadeAnims = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const { completeOnboarding } = useAuth();

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const next = (current + 1) % slides.length;

      Animated.parallel([
        Animated.timing(fadeAnims[current], {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[next], {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      current = next;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateAccount = async () => {
    await completeOnboarding();
  };

  const handleLogin = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* All images stacked with individual opacity */}
      {slides.map((slide, index) => (
        <Animated.View key={index} style={[StyleSheet.absoluteFill, { opacity: fadeAnims[index] }]}>
          <Image
            source={slide.image}
            style={{ width, height }}
            resizeMode="cover"
          />
          <View style={[StyleSheet.absoluteFill, styles.overlay]} />
        </Animated.View>
      ))}

      {/* Content Card */}
      <View className="absolute bottom-12 left-4 right-4 bg-white rounded-[24px] px-6 pt-6 pb-7 shadow-2xl">
        <View className="w-14 h-14 rounded-2xl bg-gray-100 justify-center items-center mb-5 overflow-hidden">
          <Image
            source={require('../../assets/icon.png')}
            className="w-14 h-14 rounded-2xl"
            resizeMode="cover"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          Welcome to Mowdministries
        </Text>

        <Text className="text-sm text-gray-600 leading-5 mb-7">
          Jesus loves you! Stay connected with inspiring messages, worship, and resources to grow in faith.
        </Text>

        <TouchableOpacity
          className="bg-[#1a1a3e] rounded-2xl py-4 items-center mb-3 shadow-md active:opacity-90"
          onPress={handleCreateAccount}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-semibold tracking-wide">
            Create account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl py-4 items-center border-2 border-gray-200 mb-6 active:bg-gray-50"
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text className="text-[#1a1a3e] text-base font-semibold tracking-wide">
            Log in
          </Text>
        </TouchableOpacity>

        <View className="items-center px-2">
          <Text className="text-xs text-gray-500 text-center leading-5">
            By continuing, you agree to Mowdministries{' '}
            <Text className="text-[#1a1a3e] font-semibold">Term of use.</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

export default OnboardingScreen;
