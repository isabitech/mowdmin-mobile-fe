// SelectLanguageScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import * as Updates from 'expo-updates';

const PRIMARY = '#040725';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
}

const languages: Language[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isActive: true },
  { id: 'fr', name: 'Français', nativeName: 'French', flag: '🇫🇷', isActive: true },
  { id: 'de', name: 'Deutsch', nativeName: 'German', flag: '🇩🇪', isActive: false },
  { id: 'es', name: 'Español', nativeName: 'Spanish', flag: '🇪🇸', isActive: false },
  { id: 'pt', name: 'Português', nativeName: 'Portuguese', flag: '🇵🇹', isActive: false },
  { id: 'it', name: 'Italiano', nativeName: 'Italian', flag: '🇮🇹', isActive: false },
  { id: 'zh', name: '中文', nativeName: 'Chinese', flag: '🇨🇳', isActive: false },
  { id: 'ja', name: '日本語', nativeName: 'Japanese', flag: '🇯🇵', isActive: false },
  { id: 'ko', name: '한국어', nativeName: 'Korean', flag: '🇰🇷', isActive: false },
  { id: 'ar', name: 'العربية', nativeName: 'Arabic', flag: '🇸🇦', isActive: false },
  { id: 'sw', name: 'Kiswahili', nativeName: 'Swahili', flag: '🇰🇪', isActive: false },
  { id: 'hi', name: 'हिन्दी', nativeName: 'Hindi', flag: '🇮🇳', isActive: false },
];

export default function SelectLanguageScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const activeLanguages = languages.filter(l => l.isActive);
  const comingSoonLanguages = languages.filter(l => !l.isActive);

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.id === currentLanguage);
    return lang?.name || 'English';
  };

  const handleSelectLanguage = (language: Language) => {
    if (language.isActive) {
      setSelectedLanguage(language.id);
    }
  };

  const handleApplyChanges = async () => {
    if (selectedLanguage === currentLanguage) {
      navigation.goBack();
      return;
    }

    try {
      await changeLanguage(selectedLanguage);
      
      // Show alert and reload app
      Alert.alert(
        'Language Changed',
        'The app will restart to apply language changes.',
        [
          {
            text: 'OK',
            onPress: async () => {
              if (!__DEV__) {
                // In production, reload the app
                await Updates.reloadAsync();
              } else {
                // In development, just go back
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const renderLanguageItem = (language: Language) => {
    const isSelected = selectedLanguage === language.id;
    const isDisabled = !language.isActive;

    return (
      <TouchableOpacity
        key={language.id}
        onPress={() => handleSelectLanguage(language)}
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1 : 0.7}
        className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 border-2 ${
          isSelected
            ? 'bg-[#040725]/5 border-[#040725]'
            : isDisabled
            ? 'bg-gray-50 border-transparent opacity-50'
            : 'bg-gray-50 border-transparent'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <View 
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              isDisabled ? 'bg-gray-100' : 'bg-white shadow-sm'
            }`}
          >
            <Text className={`text-2xl ${isDisabled ? 'opacity-50' : ''}`}>
              {language.flag}
            </Text>
          </View>
          
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className={`font-semibold text-base ${
                isSelected 
                  ? 'text-[#040725]' 
                  : isDisabled 
                  ? 'text-gray-400' 
                  : 'text-[#040725]'
              }`}>
                {language.name}
              </Text>
              {isDisabled && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-amber-600 text-[10px] font-semibold">
                    {t('language.comingSoon').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text className={`text-sm mt-0.5 ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        
        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          isSelected
            ? 'border-[#040725] bg-[#040725]'
            : isDisabled
            ? 'border-gray-200 bg-gray-100'
            : 'border-gray-300 bg-white'
        }`}>
          {isSelected && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
          {isDisabled && !isSelected && (
            <Ionicons name="lock-closed" size={10} color="#D1D5DB" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-11 h-11 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#040725]">{t('language.title')}</Text>
        <View className="w-11" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center pt-8 pb-6 px-6">
          <View 
            className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
            style={{ backgroundColor: `${PRIMARY}10` }}
          >
            <MaterialCommunityIcons name="translate" size={40} color={PRIMARY} />
          </View>
          <Text className="text-2xl font-bold text-[#040725] text-center">
            {t('language.chooseLanguage')}
          </Text>
          <Text className="text-gray-500 text-center mt-3 leading-6 px-4">
            {t('language.description')}
          </Text>
        </View>

        <View className="mx-5 mb-6 p-4 bg-emerald-50 rounded-2xl flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-emerald-800 font-semibold">{t('language.currentLanguage')}</Text>
            <Text className="text-emerald-600 text-sm">
              {t('language.activeLanguage', { language: getCurrentLanguageName() })}
            </Text>
          </View>
          <Text className="text-2xl">
            {languages.find(l => l.id === currentLanguage)?.flag || '🇬🇧'}
          </Text>
        </View>

        <View className="px-5">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: `${PRIMARY}10` }}
            >
              <Ionicons name="globe-outline" size={16} color={PRIMARY} />
            </View>
            <Text className="text-[#040725] font-bold text-lg">{t('language.available')}</Text>
            <View className="bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
              <Text className="text-emerald-700 text-xs font-semibold">{activeLanguages.length}</Text>
            </View>
          </View>
          
          {activeLanguages.map(renderLanguageItem)}
        </View>

        <View className="px-5 mt-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-amber-50">
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
            </View>
            <Text className="text-[#040725] font-bold text-lg">{t('language.comingSoon')}</Text>
            <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2">
              <Text className="text-amber-700 text-xs font-semibold">{comingSoonLanguages.length}</Text>
            </View>
          </View>
          
          {comingSoonLanguages.map(renderLanguageItem)}
        </View>

        <View className="mx-5 mt-8 p-5 bg-gray-50 rounded-2xl">
          <View className="flex-row items-start">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${PRIMARY}10` }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={PRIMARY} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[#040725] font-semibold text-base">
                {t('language.dontSee')}
              </Text>
              <Text className="text-gray-500 text-sm mt-1 leading-5">
                {t('language.requestDescription')}
              </Text>
              <TouchableOpacity 
                className="flex-row items-center mt-3"
                activeOpacity={0.7}
              >
                <Text className="text-[#040725] font-semibold">{t('language.requestLanguage')}</Text>
                <Ionicons name="arrow-forward" size={16} color={PRIMARY} className="ml-1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-5 mt-8">
          <TouchableOpacity 
            onPress={handleApplyChanges}
            className="rounded-2xl py-4 flex-row items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base ml-2">
              {t('common.apply')}
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-center mt-4">
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs text-center ml-2">
              {t('language.appRestart')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}