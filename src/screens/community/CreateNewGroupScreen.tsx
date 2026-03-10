import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

const CreateNewGroupScreen = ({ navigation }: any) => {
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [privacySetting, setPrivacySetting] = useState<'public' | 'private'>('public');
  const [searchMembers, setSearchMembers] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#040725" />
        </TouchableOpacity>
        <Text className="text-[#040725] text-lg font-semibold">Create New Group</Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Photo Section */}
        <View className="items-center mb-6">
          <TouchableOpacity className="relative">
            <View className="w-24 h-24 rounded-full bg-[#040725]/5 items-center justify-center border-2 border-[#040725]/20 overflow-hidden">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop' }}
                className="w-full h-full absolute"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-[#040725]/30 items-center justify-center">
                <Ionicons name="globe-outline" size={40} color="white" />
              </View>
            </View>
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-[#040725] rounded-full items-center justify-center border-[3px] border-white">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-[#040725] text-sm font-semibold mt-3">Upload Group Photo</Text>
          <Text className="text-[#040725]/50 text-xs">Tap to change group image</Text>
        </View>

        {/* Group Name */}
        <View className="mb-4">
          <Text className="text-[#040725]/60 text-xs font-medium mb-2">Group Name</Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="e.g. Wednesday Night Fellowship"
            placeholderTextColor="rgba(4, 7, 37, 0.4)"
            className="bg-[#040725]/5 border border-[#040725]/10 rounded-xl px-4 py-3.5 text-[#040725] text-sm"
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-[#040725]/60 text-xs font-medium mb-2">Category</Text>
          <TouchableOpacity className="bg-[#040725]/5 border border-[#040725]/10 rounded-xl px-4 py-3.5 flex-row items-center justify-between">
            <Text className="text-[#040725]/40 text-sm">Select category</Text>
            <Ionicons name="chevron-down" size={18} color="rgba(4, 7, 37, 0.4)" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-[#040725]/60 text-xs font-medium mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is the mission of this group?"
            placeholderTextColor="rgba(4, 7, 37, 0.4)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-[#040725]/5 border border-[#040725]/10 rounded-xl px-4 py-3.5 text-[#040725] text-sm min-h-[80px]"
          />
        </View>

        {/* Privacy Settings */}
        <View className="mb-4">
          <Text className="text-[#040725]/60 text-xs font-medium mb-2">Privacy Settings</Text>
          
          {/* Public Option */}
          <TouchableOpacity 
            onPress={() => setPrivacySetting('public')}
            className={`flex-row items-center p-4 rounded-xl mb-2 ${
              privacySetting === 'public' 
                ? 'bg-[#040725]/5 border border-[#040725]' 
                : 'bg-[#040725]/[0.02] border border-[#040725]/10'
            }`}
          >
            <View className={`w-5 h-5 rounded-full border-2 border-[#040725] items-center justify-center mr-3`}>
              {privacySetting === 'public' && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#040725]" />
              )}
            </View>
            <View>
              <Text className="text-[#040725] text-sm font-medium">Public</Text>
              <Text className="text-[#040725]/50 text-xs">Anyone can find and join</Text>
            </View>
          </TouchableOpacity>

          {/* Private Option */}
          <TouchableOpacity 
            onPress={() => setPrivacySetting('private')}
            className={`flex-row items-center p-4 rounded-xl ${
              privacySetting === 'private' 
                ? 'bg-[#040725]/5 border border-[#040725]' 
                : 'bg-[#040725]/[0.02] border border-[#040725]/10'
            }`}
          >
            <View className={`w-5 h-5 rounded-full border-2 border-[#040725] items-center justify-center mr-3`}>
              {privacySetting === 'private' && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#040725]" />
              )}
            </View>
            <View>
              <Text className="text-[#040725] text-sm font-medium">Private</Text>
              <Text className="text-[#040725]/50 text-xs">Members must be approved</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Invite Members */}
        <View className="mb-6">
          <Text className="text-[#040725]/60 text-xs font-medium mb-2">Invite Members</Text>
          <View className="bg-[#040725]/5 border border-[#040725]/10 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color="rgba(4, 7, 37, 0.4)" />
            <TextInput
              value={searchMembers}
              onChangeText={setSearchMembers}
              placeholder="Search members by name or email"
              placeholderTextColor="rgba(4, 7, 37, 0.4)"
              className="flex-1 ml-3 text-[#040725] text-sm"
            />
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity className="bg-[#040725] rounded-xl py-4 items-center mb-8">
          <Text className="text-white text-base font-semibold">Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateNewGroupScreen;