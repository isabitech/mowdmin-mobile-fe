import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationSuccess'>;

export default function RegistrationSuccessScreen({ navigation }: Props) {
  const { setIsAuthenticated } = useAuth();

  const handleGoHome = async () => {
    // Set user as authenticated
    await setIsAuthenticated(true);
    // Navigation will be handled automatically by AppNavigator
  };

  return (
    <SafeAreaView className="flex-1 bg-[#040725]" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#040725" />

      {/* Success Image - Centered */}
      <View className="flex-1 justify-center items-center">
        <Image
          source={require('../../assets/images/complete-setup.png')}
          className="w-[23rem] h-[23rem] mt-32"
          resizeMode="contain"
        />
      </View>

      {/* Success Message and Button - Bottom */}
      <View className="px-6 pb-6 flex gap-7">
        {/* Success Message */}
        <View className="items-center mb-6">
          <Text className="text-[33px] font-bold text-white text-center leading-[45px]">
            Your account has been{'\n'}created successfully!
          </Text>
        </View>

        {/* Go to Home Button */}
        <TouchableOpacity 
          className="bg-red-500 rounded-[20px] py-4"
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Text className="text-center text-base font-semibold text-[#fff]">
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}