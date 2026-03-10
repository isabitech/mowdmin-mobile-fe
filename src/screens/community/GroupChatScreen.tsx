import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import groupsAPI, { Group, GroupMessage } from '../../services/groupsAPI';
import { useAuth } from '../../contexts/AuthContext';

const formatTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
};

const formatDateDivider = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'TODAY';
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  return date
    .toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();
};

const GroupChatScreen = ({ navigation, route }: any) => {
  const { groupId, groupName } = route.params || {};
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!groupId) return;
    try {
      const [details, msgs] = await Promise.all([
        groupsAPI.getGroupDetails(groupId),
        groupsAPI.getGroupMessages(groupId),
      ]);
      setGroupDetails(details);
      setMessages(msgs);
    } catch (error: any) {
      console.error('[GroupChat] fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for new messages every 10s
  useEffect(() => {
    if (!groupId) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await groupsAPI.getGroupMessages(groupId);
        setMessages(msgs);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [groupId]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      const newMsg = await groupsAPI.sendMessage(groupId, trimmed);
      // Ensure sender has correct user info for immediate display
      const msg: GroupMessage = {
        ...newMsg,
        sender: {
          _id: user?.id || newMsg.sender?._id || '',
          name: newMsg.sender?.name && newMsg.sender.name !== 'Unknown'
            ? newMsg.sender.name
            : user?.name || 'Me',
          photo: newMsg.sender?.photo || '',
        },
      };
      setMessages((prev) => [...prev, msg]);
      setMessage('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsAPI.leaveGroup(groupId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to leave group.');
          }
        },
      },
    ]);
  };

  const displayName = groupDetails?.name || groupName || 'Group';
  const memberCount = groupDetails?.memberCount || groupDetails?.members?.length || 0;
  const groupImage = groupDetails?.image || groupDetails?.avatar || '';

  const shouldShowDateDivider = (index: number): boolean => {
    if (index === 0) return true;
    const current = new Date(messages[index].createdAt).toDateString();
    const previous = new Date(messages[index - 1].createdAt).toDateString();
    return current !== previous;
  };

  const renderMessage = (msg: GroupMessage, index: number) => {
    const isMe = msg.sender?._id === user?.id;
    const senderName = msg.sender?.name || 'Unknown';
    const senderPhoto = msg.sender?.photo || '';
    const initial = senderName.charAt(0).toUpperCase();
    const text = msg.message || '';

    return (
      <React.Fragment key={msg._id}>
        {shouldShowDateDivider(index) && (
          <View className="items-center mb-5">
            <View className="bg-[#040725]/5 px-4 py-1.5 rounded-full">
              <Text className="text-[#040725]/50 text-[11px] font-medium tracking-wider">
                {formatDateDivider(msg.createdAt)}
              </Text>
            </View>
          </View>
        )}

        {isMe ? (
          <View className="flex-row justify-end mb-4">
            <View className="max-w-[80%]">
              <View className="bg-[#040725] rounded-2xl rounded-tr p-3.5">
                <Text className="text-white text-[13px] leading-5">{text}</Text>
              </View>
              <Text className="text-[#040725]/40 text-[10px] mt-1.5 text-right">
                {formatTime(msg.createdAt)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row mb-4">
            {senderPhoto ? (
              <Image source={{ uri: senderPhoto }} className="w-9 h-9 rounded-full" />
            ) : (
              <View className="w-9 h-9 rounded-full items-center justify-center bg-[#040725]">
                <Text className="text-white text-sm font-semibold">{initial}</Text>
              </View>
            )}
            <View className="flex-1 ml-2.5 max-w-[80%]">
              <Text className="text-[#040725]/50 text-[10px] font-semibold tracking-wide mb-1.5">
                {senderName.toUpperCase()}
              </Text>
              <View className="bg-[#040725]/[0.05] rounded-tl rounded-2xl p-3.5">
                <Text className="text-[#040725] text-[13px] leading-5">{text}</Text>
              </View>
              <Text className="text-[#040725]/40 text-[10px] mt-1.5">
                {formatTime(msg.createdAt)}
              </Text>
            </View>
          </View>
        )}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#040725" />
        <Text className="text-gray-500 mt-4">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#040725]/10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#040725" />
        </TouchableOpacity>

        {groupImage ? (
          <Image source={{ uri: groupImage }} className="w-10 h-10 rounded-full ml-1" />
        ) : (
          <View className="w-10 h-10 rounded-full ml-1 bg-[#040725]/10 items-center justify-center">
            <Text className="text-[#040725] font-bold text-base">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text className="text-[#040725] text-base font-semibold">{displayName}</Text>
          <Text className="text-[#040725]/50 text-xs">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          className="w-9 h-9 bg-[#040725]/5 rounded-xl items-center justify-center"
          onPress={handleLeaveGroup}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#040725" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="chatbubbles-outline" size={48} color="rgba(4,7,37,0.15)" />
            <Text className="text-[#040725]/40 text-sm mt-4">No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          messages.map((msg, index) => renderMessage(msg, index))
        )}
        <View className="h-4" />
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row items-center px-4 py-3 pb-6 border-t border-[#040725]/10">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="attach" size={22} color="rgba(4, 7, 37, 0.4)" />
          </TouchableOpacity>

          <View className="flex-1 mx-2">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="rgba(4, 7, 37, 0.4)"
              className="bg-[#040725]/5 rounded-full px-4 py-3 text-[#040725] text-sm"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-[#040725] rounded-full items-center justify-center"
            onPress={handleSend}
            disabled={sending || !message.trim()}
            style={{ opacity: sending || !message.trim() ? 0.5 : 1 }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupChatScreen;
