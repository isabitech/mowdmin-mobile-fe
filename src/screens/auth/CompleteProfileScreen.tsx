import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfile'>;

const COUNTRIES = [
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
];

export default function CompleteProfileScreen({ navigation }: Props) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleContinue = () => {
    console.log('Profile:', { country: selectedCountry.name });
    navigation.navigate('RegistrationSuccess');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Progress Indicator */}
        <View className="flex-row px-6 pt-8 gap-2 w-[45%]">
          <View className="h-1 bg-gray-200 rounded-sm w-[25%]" />
          <View className="h-1 bg-gray-200 rounded-sm w-[50%]" />
          <View className="h-1 bg-green-500 rounded-sm w-[25%]" />
        </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-[28px] font-bold text-[#040725] mb-2">
              Where are you from?
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              Choose your country to complete your registration.
            </Text>
          </View>

          {/* Country Picker */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200"
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
              <Text className="flex-1 text-base text-[#040725]">
                {selectedCountry.name}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-10 pt-4 bg-white">
        <TouchableOpacity
          className="rounded-[20px] py-4 bg-[#040725]"
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-base font-semibold text-white">
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 max-h-[70%]">
            <View className="flex-row justify-between items-center px-6 mb-4">
              <Text className="text-xl font-bold text-[#040725]">
                Select your country
              </Text>
              <TouchableOpacity 
                onPress={() => setShowCountryPicker(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#040725" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  className="flex-row items-center px-6 py-4 border-b border-gray-100"
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text className="text-2xl mr-3">{country.flag}</Text>
                  <Text className="flex-1 text-base text-[#040725]">
                    {country.name}
                  </Text>
                  {selectedCountry.code === country.code && (
                    <Ionicons name="checkmark" size={24} color="#22C55E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}