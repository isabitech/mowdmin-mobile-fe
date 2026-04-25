import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { profileAPI, Profile } from '../../services/profileApi';
import { useAuth } from '../../contexts/AuthContext';

const PRIMARY = '#040725';

const ministryRoles = [
  'Ministry Leader',
  'Pastor',
  'Worship Leader',
  'Youth Leader',
  'Deacon',
  'Elder',
  'Volunteer',
  'Member',
];

const LOCATIONS = [
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Others', flag: '🌍' },
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [ministryRole, setMinistryRole] = useState('Member');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      setFullName(profile.displayName || profile.name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phoneNumber || '');
      const profileLocation = profile.location || '';
      const isKnownLocation = LOCATIONS.some(l => l.name === profileLocation && l.name !== 'Others');
      if (profileLocation && !isKnownLocation) {
        setLocation('Others');
        setCustomLocation(profileLocation);
      } else {
        setLocation(profileLocation);
      }
      setMinistryRole(profile.ministryRole || 'Member');
      setBio(profile.bio || '');
      setPhoto(profile.photo || '');
    } catch (error: any) {
      console.error('[EditProfile] Error fetching profile:', error.message);
      // Fall back to auth context data
      setFullName(user?.name || '');
      setEmail(user?.email || '');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.updateDetailedProfile({
        name: fullName.trim(),
        displayName: fullName.trim(),
        bio: bio.trim(),
        phoneNumber: phone.trim(),
        location: location === 'Others' ? customLocation.trim() : location.trim(),
        ministryRole: ministryRole,
      });
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('[EditProfile] Error saving profile:', error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    try {
      setUploadingPhoto(true);
      const updatedProfile = await profileAPI.uploadProfilePhoto(uri);
      setPhoto(updatedProfile.photo || uri);
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error: any) {
      console.error('[EditProfile] Photo upload error:', error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: React.ReactNode,
    fieldName: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      multiline?: boolean;
      editable?: boolean;
      verified?: boolean;
    }
  ) => {
    const isFocused = focusedField === fieldName;

    return (
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-sm font-medium ml-1">{label}</Text>
          {options?.verified && (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text className="text-emerald-500 text-xs ml-1">Verified</Text>
            </View>
          )}
        </View>
        <View
          className={`flex-row items-center rounded-2xl px-4 border ${
            isFocused
              ? 'border-[#040725] bg-[#040725]/5'
              : 'border-gray-200 bg-gray-50'
          } ${options?.multiline ? 'py-3 items-start' : 'py-4'}`}
        >
          <View className={options?.multiline ? 'mt-0.5' : ''}>
            {icon}
          </View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
            keyboardType={options?.keyboardType || 'default'}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
            editable={options?.editable !== false}
            className={`flex-1 ml-3 text-[#040725] text-base ${
              options?.multiline ? 'min-h-[80px] textAlignVertical-top' : ''
            }`}
            placeholderTextColor="#9CA3AF"
            style={options?.multiline ? { textAlignVertical: 'top' } : {}}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-11 h-11 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#040725]">Edit Profile</Text>
        <TouchableOpacity
          className="w-11 h-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${PRIMARY}10` }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <Ionicons name="checkmark" size={24} color={PRIMARY} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Image Section */}
        <View className="items-center pt-6 pb-8 bg-gray-50">
          <View className="relative">
            {/* Profile Image */}
            <View className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
              ) : (
                <View className="w-full h-full justify-center items-center bg-[#040725]/10">
                  <Text className="text-4xl font-bold" style={{ color: PRIMARY }}>
                    {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>

            {/* Camera Button */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-3 border-white shadow-md"
              style={{ backgroundColor: PRIMARY }}
              onPress={handlePickImage}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="camera" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-4 flex-row items-center" onPress={handlePickImage} disabled={uploadingPhoto}>
            <Feather name="edit-2" size={14} color={PRIMARY} />
            <Text className="text-[#040725] font-semibold ml-2">
              {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs mt-2">
            Tap to upload a new profile picture
          </Text>
        </View>

        {/* Form Section */}
        <View className="px-5 pt-6">
          {/* Section Title */}
          <View className="flex-row items-center mb-5">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: `${PRIMARY}10` }}
            >
              <Ionicons name="person" size={16} color={PRIMARY} />
            </View>
            <Text className="text-[#040725] font-bold text-lg">Personal Information</Text>
          </View>

          {/* Full Name */}
          {renderInput(
            'Full Name',
            fullName,
            setFullName,
            <Ionicons name="person-outline" size={20} color={focusedField === 'fullName' ? PRIMARY : '#9CA3AF'} />,
            'fullName'
          )}

          {/* Email Address */}
          {renderInput(
            'Email Address',
            email,
            setEmail,
            <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? PRIMARY : '#9CA3AF'} />,
            'email',
            { keyboardType: 'email-address', verified: true, editable: false }
          )}

          {/* Phone Number */}
          {renderInput(
            'Phone Number',
            phone,
            setPhone,
            <Ionicons name="call-outline" size={20} color={focusedField === 'phone' ? PRIMARY : '#9CA3AF'} />,
            'phone',
            { keyboardType: 'phone-pad' }
          )}

          {/* Location */}
          <View className="mb-5">
            <Text className="text-gray-500 text-sm font-medium ml-1 mb-2">Location</Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4 border border-gray-200 bg-gray-50"
            >
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                <Text className="ml-3 text-[#040725] text-base">
                  {location === 'Others' && customLocation ? customLocation : location || 'Select Location'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {location === 'Others' && (
              <TextInput
                value={customLocation}
                onChangeText={setCustomLocation}
                placeholder="Enter your location"
                placeholderTextColor="#9CA3AF"
                className="mt-2 rounded-2xl px-4 py-4 border border-gray-200 bg-gray-50 text-[#040725] text-base"
              />
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 my-4" />

          {/* Section Title */}
          <View className="flex-row items-center mb-5">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: '#8B5CF610' }}
            >
              <MaterialCommunityIcons name="church" size={16} color="#8B5CF6" />
            </View>
            <Text className="text-[#040725] font-bold text-lg">Ministry Details</Text>
          </View>

          {/* Ministry Role - Dropdown */}
          <View className="mb-5">
            <Text className="text-gray-500 text-sm font-medium ml-1 mb-2">Ministry Role</Text>
            <TouchableOpacity
              onPress={() => setShowRolePicker(true)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4 border border-gray-200 bg-gray-50"
            >
              <View className="flex-row items-center">
                <MaterialIcons name="work-outline" size={20} color="#9CA3AF" />
                <Text className="ml-3 text-[#040725] text-base">{ministryRole}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {renderInput(
            'Bio',
            bio,
            setBio,
            <Ionicons name="document-text-outline" size={20} color={focusedField === 'bio' ? PRIMARY : '#9CA3AF'} />,
            'bio',
            { multiline: true }
          )}

          {/* Character Count */}
          <Text className="text-gray-400 text-xs text-right -mt-3 mr-2">
            {bio.length}/200 characters
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mt-8">
          {/* Save Button */}
          <TouchableOpacity
            className="rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
            style={{ backgroundColor: PRIMARY, opacity: saving ? 0.7 : 1 }}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base ml-2">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            className="rounded-2xl py-4 flex-row items-center justify-center mt-3 bg-gray-100"
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#6B7280" />
            <Text className="text-gray-500 font-semibold text-base ml-2">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="shield-checkmark" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs text-center ml-2">
              Your profile information is securely stored and shared across Mowdministries services
            </Text>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Role Picker Modal */}
      <Modal
        visible={showRolePicker}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-[#040725]">Select Role</Text>
              <TouchableOpacity
                onPress={() => setShowRolePicker(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center "
              >
                <Ionicons name="close" size={24} color={PRIMARY} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ministryRoles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setMinistryRole(item);
                    setShowRolePicker(false);
                  }}
                  className={`flex-row items-center justify-between px-5 py-4 border-b border-gray-50 ${
                    ministryRole === item ? 'bg-[#040725]/5' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: ministryRole === item ? `${PRIMARY}15` : '#F3F4F6' }}
                    >
                      <MaterialCommunityIcons
                        name="account-tie"
                        size={20}
                        color={ministryRole === item ? PRIMARY : '#9CA3AF'}
                      />
                    </View>
                    <Text className={`text-base ${
                      ministryRole === item ? 'text-[#040725] font-semibold' : 'text-gray-600'
                    }`}>
                      {item}
                    </Text>
                  </View>
                  {ministryRole === item && (
                    <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            <View className="h-8" />
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-[#040725]">Select Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationPicker(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={24} color={PRIMARY} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LOCATIONS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setLocation(item.name);
                    if (item.name !== 'Others') setCustomLocation('');
                    setShowLocationPicker(false);
                  }}
                  className={`flex-row items-center justify-between px-5 py-4 border-b border-gray-50 ${
                    location === item.name ? 'bg-[#040725]/5' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{item.flag}</Text>
                    <Text className={`text-base ${
                      location === item.name ? 'text-[#040725] font-semibold' : 'text-gray-600'
                    }`}>
                      {item.name}
                    </Text>
                  </View>
                  {location === item.name && (
                    <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            <View className="h-8" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
