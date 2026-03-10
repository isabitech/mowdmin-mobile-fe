import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#040725';

export default function AboutMowdministriesScreen() {
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const coreValues = [
    {
      icon: 'heart',
      title: 'Love',
      description: 'Unconditional love for all',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      icon: 'users',
      title: 'Community',
      description: 'Building strong bonds',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      icon: 'book-open',
      title: 'Truth',
      description: 'Grounded in scripture',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      icon: 'globe',
      title: 'Outreach',
      description: 'Reaching the nations',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
  ];

  const stats = [
    { value: '50+', label: 'Countries', icon: 'earth' },
    { value: '1M+', label: 'Lives Touched', icon: 'heart-multiple' },
    { value: '500+', label: 'Churches', icon: 'church' },
    { value: '10K+', label: 'Volunteers', icon: 'account-group' },
  ];

  const socialLinks = [
    { name: 'YouTube', icon: 'youtube', url: 'https://youtube.com', color: '#FF0000', bgColor: 'rgba(255,0,0,0.08)' },
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com', color: '#1877F2', bgColor: 'rgba(24,119,242,0.08)' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com', color: '#E4405F', bgColor: 'rgba(228,64,95,0.08)' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com', color: '#1DA1F2', bgColor: 'rgba(29,161,242,0.08)' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-11 h-11 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-[#040725] mr-11">
          About Us
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section */}
        <View className="mx-5 mt-2 rounded-3xl overflow-hidden">
          <LinearGradient
            colors={[PRIMARY, '#0A1045', '#141452']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' }}
          >
            {/* Decorative circles */}
            <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
            <View style={{ position: 'absolute', bottom: -64, left: -64, width: 192, height: 192, borderRadius: 96, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
            <View style={{ position: 'absolute', top: 32, left: 32, width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(96,165,250,0.3)' }} />
            <View style={{ position: 'absolute', bottom: 48, right: 48, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(192,132,252,0.4)' }} />
            
            {/* Logo */}
            <View style={{ width: 96, height: 96, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <MaterialCommunityIcons name="hands-pray" size={48} color="#FFFFFF" />
            </View>
            
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>
              Welcome to
            </Text>
            <Text className="text-white text-3xl font-bold text-center mb-2">
              Mowdministries
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 }}>
              Spreading hope and transforming lives across the globe
            </Text>
          </LinearGradient>
        </View>

        {/* Mission & Vision Cards */}
        <View className="px-5 mt-8">
          {/* Mission Card */}
          <View className="rounded-2xl p-5 mb-4 border border-gray-100 bg-white" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
            <View className="flex-row items-start">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: `${PRIMARY}10` }}
              >
                <Ionicons name="flag" size={24} color={PRIMARY} />
              </View>
              <View className="flex-1">
                <Text className="text-[#040725] font-bold text-lg mb-2">Our Mission</Text>
                <Text className="text-gray-600 leading-6 text-sm">
                  To spread spiritual enlightenment and provide global ministry management that empowers believers worldwide to live a life of purpose, faith, and transformative impact.
                </Text>
              </View>
            </View>
          </View>

          {/* Vision Card */}
          <View className="rounded-2xl p-5 border border-gray-100 bg-white" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
            <View className="flex-row items-start">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#8B5CF610' }}
              >
                <Ionicons name="eye" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-[#040725] font-bold text-lg mb-2">Our Vision</Text>
                <Text className="text-gray-600 leading-6 text-sm">
                  To become a worldwide beacon of spiritual leadership, fostering a connected community where every individual has access to biblical resources and supportive fellowship.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Core Values */}
        <View className="mt-10">
          <Text className="text-[#040725] font-bold text-xl px-5 mb-4">Core Values</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {coreValues.map((value, index) => (
              <View 
                key={index}
                className="w-36 rounded-2xl p-4 mr-3 items-center"
                style={{ backgroundColor: value.bgColor }}
              >
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${value.color}20` }}
                >
                  <Feather name={value.icon as any} size={24} color={value.color} />
                </View>
                <Text className="text-[#040725] font-semibold text-base mb-1">{value.title}</Text>
                <Text className="text-gray-500 text-xs text-center">{value.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View className="mx-5 mt-10">
          <Text className="text-[#040725] font-bold text-xl mb-4">Our Impact</Text>
          <View 
            className="rounded-2xl p-5"
            style={{ backgroundColor: `${PRIMARY}08` }}
          >
            <View className="flex-row flex-wrap">
              {stats.map((stat, index) => (
                <View 
                  key={index} 
                  className={`w-1/2 items-center py-4`}
                  style={{
                    ...(index < 2 ? { borderBottomWidth: 1, borderBottomColor: '#E5E7EB80' } : {}),
                    ...(index % 2 === 0 ? { borderRightWidth: 1, borderRightColor: '#E5E7EB80' } : {}),
                  }}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <MaterialCommunityIcons name={stat.icon as any} size={22} color="#FFFFFF" />
                  </View>
                  <Text className="text-[#040725] text-2xl font-bold">{stat.value}</Text>
                  <Text className="text-gray-500 text-xs uppercase tracking-wider mt-1">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* About Description */}
        <View className="mx-5 mt-10 bg-gray-50 rounded-2xl p-5">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="information" size={20} color={PRIMARY} />
            <Text className="text-[#040725] font-semibold text-base ml-2">Who We Are</Text>
          </View>
          <Text className="text-gray-600 leading-7 text-sm">
            Mowdministries is a global faith-based organization dedicated to spiritual growth and community development. Through our mobile-first approach, we've bridged the gap between traditional ministry and modern accessibility, serving millions through digital devotionals, live streaming services, and physical missions across 50+ countries.
          </Text>
        </View>

        {/* Contact Section */}
        <View className="mx-5 mt-8">
          <Text className="text-[#040725] font-bold text-xl mb-4">Get in Touch</Text>
          
          <TouchableOpacity 
            onPress={() => openLink('mailto:contact@mowdministries.org')}
            className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3"
          >
            <View 
              className="w-11 h-11 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${PRIMARY}10` }}
            >
              <Ionicons name="mail" size={20} color={PRIMARY} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs uppercase tracking-wider">Email</Text>
              <Text className="text-[#040725] font-medium">contact@mowdministries.org</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => openLink('https://mowdministries.org')}
            className="flex-row items-center bg-gray-50 rounded-xl p-4"
          >
            <View 
              className="w-11 h-11 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${PRIMARY}10` }}
            >
              <Ionicons name="globe" size={20} color={PRIMARY} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs uppercase tracking-wider">Website</Text>
              <Text className="text-[#040725] font-medium">www.mowdministries.org</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Social Media */}
        <View className="mx-5 mt-10">
          <Text className="text-center text-gray-400 text-xs uppercase tracking-widest mb-5">
            Follow Us
          </Text>
          <View className="flex-row justify-center">
            {socialLinks.map((social, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => openLink(social.url)}
                className="w-14 h-14 rounded-2xl items-center justify-center mx-2"
                style={{ backgroundColor: social.bgColor }}
              >
                <FontAwesome5 name={social.icon} size={22} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="mt-10 items-center">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="hands-pray" size={16} color={PRIMARY} />
            <Text className="text-[#040725] font-semibold text-sm ml-2">Mowdministries</Text>
          </View>
          <Text className="text-gray-400 text-xs">
            © {new Date().getFullYear()} All Rights Reserved
          </Text>
          <Text className="text-gray-300 text-xs mt-1">
            Version 2.4.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}