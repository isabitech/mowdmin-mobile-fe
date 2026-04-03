import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import NotificationIconWithBadge from '../../components/NotificationIconWithBadge';
import { prayerAPI, Prayer, PrayerRequest, PrayerComment } from '../../services/prayerAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

interface Props {
  navigation?: any;
}

export default function CommunityPrayerWallScreen({ navigation }: Props) {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'church' | 'personal'>('church');
  const [prayerSearchQuery, setPrayerSearchQuery] = useState('');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerContent, setPrayerContent] = useState('');
  const [churchPrayers, setChurchPrayers] = useState<Prayer[]>([]);
  const [personalPrayerRequests, setPersonalPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currentUserId = authUser?.id || authUser?._id || '';
  const currentUserName = authUser?.name || 'You';

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    
    try {
      console.log('=== LOADING ALL DATA ===');
      
      // Load public prayers for church wall
      console.log('Fetching public prayers...');
      const publicPrayers = await prayerAPI.getAllPrayers();
      console.log('Public prayers count:', publicPrayers.length);
      console.log('First prayer sample:', JSON.stringify(publicPrayers[0], null, 2));
      setChurchPrayers(publicPrayers);
      
      // Load user's personal prayer requests
      console.log('Fetching personal prayer requests...');
      const myPrayerRequests = await prayerAPI.getMyPrayerRequests();
      console.log('Personal prayer requests count:', myPrayerRequests.length);
      setPersonalPrayerRequests(myPrayerRequests);
      
      console.log('=== DATA LOADING COMPLETED ===');
    } catch (error: any) {
      console.error('=== DATA LOADING ERROR ===');
      console.error('Error loading data:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', 'Failed to load prayers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleSubmitPrayerRequest = async () => {
    if (!prayerTitle.trim() || !prayerContent.trim()) {
      Alert.alert('Missing Information', 'Please provide both title and content for your prayer request.');
      return;
    }

    setSubmitting(true);
    try {
      const newPrayerRequest = await prayerAPI.createPrayerRequest({
        title: prayerTitle,
        description: prayerContent,
        isPublic: false, // Personal prayer requests are private
        images: [],
      });

      setPersonalPrayerRequests([newPrayerRequest, ...personalPrayerRequests]);
      setPrayerTitle('');
      setPrayerContent('');
      Alert.alert('Success', 'Your prayer request has been saved.');
    } catch (error: any) {
      console.error('Error creating prayer request:', error);
      Alert.alert('Error', 'Failed to save prayer request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglingPrayers = useRef(new Set<string>()).current;

  // ── Comments state ──
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsPrayerId, setCommentsPrayerId] = useState('');
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const commentInputRef = useRef<TextInput>(null);

  const handleOpenComments = useCallback(async (prayerId: string) => {
    setCommentsPrayerId(prayerId);
    setCommentsVisible(true);
    setCommentsLoading(true);
    try {
      const data = await prayerAPI.getComments(prayerId);
      setComments(data);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || sendingComment) return;
    setSendingComment(true);
    try {
      const newComment = await prayerAPI.addComment(commentsPrayerId, trimmed);
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      Keyboard.dismiss();
      // Update comment count on the prayer card
      setChurchPrayers(prev => prev.map(p =>
        p._id === commentsPrayerId
          ? { ...p, commentCount: (p.commentCount || 0) + 1 }
          : p
      ));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await prayerAPI.deleteComment(commentId);
            setComments(prev => prev.filter(c => c._id !== commentId));
            setChurchPrayers(prev => prev.map(p =>
              p._id === commentsPrayerId
                ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
                : p
            ));
          } catch {
            Alert.alert('Error', 'Failed to delete comment.');
          }
        },
      },
    ]);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setCommentsPrayerId('');
    setComments([]);
    setCommentText('');
  };

  const handlePrayToggle = async (prayerId: string) => {
    if (togglingPrayers.has(prayerId)) return;
    togglingPrayers.add(prayerId);

    // Optimistic UI update
    setChurchPrayers(prev => prev.map(prayer => {
      if (prayer._id === prayerId) {
        const wasLiked = prayer.isLiked;
        return {
          ...prayer,
          isLiked: !wasLiked,
          likeCount: wasLiked
            ? Math.max(0, (prayer.likeCount || 1) - 1)
            : (prayer.likeCount || 0) + 1,
        };
      }
      return prayer;
    }));

    try {
      const result = await prayerAPI.togglePrayerLike(prayerId);
      // Sync with server response
      setChurchPrayers(prev => prev.map(prayer => {
        if (prayer._id === prayerId) {
          return {
            ...prayer,
            isLiked: result.liked,
            likeCount: result.likeCount,
          };
        }
        return prayer;
      }));
    } catch (error: any) {
      console.error('Prayer like error:', error.response?.data?.message || error.message);
    } finally {
      togglingPrayers.delete(prayerId);
    }
  };

  const handleDeletePrayerRequest = async (requestId: string) => {
    Alert.alert(
      'Delete Prayer Request',
      'Are you sure you want to delete this prayer request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await prayerAPI.deletePrayerRequest(requestId);
              setPersonalPrayerRequests(
                personalPrayerRequests.filter(request => request._id !== requestId)
              );
              Alert.alert('Success', 'Prayer request deleted successfully.');
            } catch (error: any) {
              console.error('Error deleting prayer request:', error);
              Alert.alert('Error', 'Failed to delete prayer request.');
            }
          },
        },
      ]
    );
  };

  const handleEditPrayerRequest = async (requestId: string, currentTitle: string, currentDescription: string) => {
    Alert.prompt(
      'Edit Prayer Request',
      'Update your prayer request title',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: async (newTitle) => {
            if (newTitle && newTitle.trim()) {
              Alert.prompt(
                'Edit Prayer Request',
                'Update your prayer request description',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Save',
                    onPress: async (newDescription) => {
                      if (newDescription && newDescription.trim()) {
                        try {
                          const updated = await prayerAPI.updatePrayerRequest(requestId, {
                            title: newTitle.trim(),
                            description: newDescription.trim(),
                          });
                          
                          setPersonalPrayerRequests(
                            personalPrayerRequests.map(req => 
                              req._id === requestId ? updated : req
                            )
                          );
                          Alert.alert('Success', 'Prayer request updated successfully.');
                        } catch (error: any) {
                          console.error('Error updating prayer request:', error);
                          Alert.alert('Error', 'Failed to update prayer request.');
                        }
                      }
                    },
                  },
                ],
                'plain-text',
                currentDescription
              );
            }
          },
        },
      ],
      'plain-text',
      currentTitle
    );
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  const renderChurchPrayerCard = (prayer: Prayer) => (
    <View 
      key={prayer._id} 
      className="bg-gray-50 rounded-3xl mb-4 overflow-hidden border border-gray-100"
    >
      <View className="p-4 pb-0">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              <MaterialCommunityIcons 
                name="account-circle" 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
            
            <View className="ml-3 flex-1">
              <Text className="font-bold text-base" style={{ color: PRIMARY }}>
                {prayer.author?.name || 'Anonymous'}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                {getTimeAgo(prayer.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <Text className="font-bold text-lg mt-4" style={{ color: PRIMARY }}>
          {prayer.title}
        </Text>
        
        <Text className="text-gray-600 text-sm mt-2 leading-5">
          {prayer.description}
        </Text>
      </View>

      {/* Stats row - not clickable */}
      <View className="flex-row items-center px-4 mt-3">
        <MaterialCommunityIcons name="hands-pray" size={14} color="#9CA3AF" />
        <Text className="text-xs text-gray-400 ml-1">
          {prayer.likeCount || 0} {prayer.likeCount === 1 ? 'prayer' : 'prayers'}
        </Text>
        {prayer.commentCount > 0 && (
          <>
            <Text className="text-gray-300 mx-2">·</Text>
            <Text className="text-xs text-gray-400">
              {prayer.commentCount} {prayer.commentCount === 1 ? 'comment' : 'comments'}
            </Text>
          </>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center p-4 pt-2 gap-2">
        <TouchableOpacity
          onPress={() => handlePrayToggle(prayer._id)}
          className="flex-row items-center px-4 py-2.5 rounded-full"
          style={{ backgroundColor: prayer.isLiked ? '#FEE2E2' : '#FFFFFF', borderWidth: 1, borderColor: prayer.isLiked ? '#FECACA' : '#E5E7EB' }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={prayer.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={prayer.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text
            className="text-sm font-semibold ml-1.5"
            style={{ color: prayer.isLiked ? '#EF4444' : '#374151' }}
          >
            {prayer.isLiked ? 'Prayed' : 'I Prayed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenComments(prayer._id)}
          className="flex-row items-center px-4 py-2.5 rounded-full bg-white"
          style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
          <Text className="text-sm font-semibold ml-1.5 text-gray-700">
            Comment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPersonalPrayerRequestCard = (request: PrayerRequest) => (
    <View 
      key={request._id} 
      className="bg-gray-50 rounded-3xl mb-4 overflow-hidden border border-gray-100"
      style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
    >
      <View className="p-4 pb-0">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            </View>
            
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-sm" style={{ color: PRIMARY }}>
                  Prayer Request
                </Text>
                <View className="ml-2 px-2 py-0.5 rounded-xl bg-blue-50">
                  <Text className="text-xs font-bold" style={{ color: ACCENT }}>
                    PRIVATE
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xs mt-0.5">
                {getTimeAgo(request.createdAt)}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => handleEditPrayerRequest(request._id, request.title, request.description)}
              className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mr-2"
            >
              <Feather name="edit-3" size={16} color={ACCENT} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleDeletePrayerRequest(request._id)}
              className="w-9 h-9 rounded-full bg-red-100 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="font-bold text-lg mt-4" style={{ color: PRIMARY }}>
          {request.title}
        </Text>
        
        <Text className="text-gray-600 text-sm mt-2 mb-4 leading-5">
          {request.description}
        </Text>
      </View>
    </View>
  );

  const renderPersonalTab = () => (
    <View>
      <View className="bg-white rounded-3xl mb-6 p-5 border border-gray-100 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <Feather name="edit-3" size={18} color="#FFFFFF" />
          </View>
          <Text className="font-bold text-lg ml-3" style={{ color: PRIMARY }}>
            Add New Prayer Request
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2 font-medium">
            Prayer Title
          </Text>
          <TextInput
            value={prayerTitle}
            onChangeText={setPrayerTitle}
            placeholder="Give your prayer request a title..."
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl px-4 py-3.5 text-base border border-gray-100"
            style={{ color: PRIMARY }}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2 font-medium">
            Your Prayer Request
          </Text>
          <TextInput
            value={prayerContent}
            onChangeText={setPrayerContent}
            placeholder="Pour out your heart to God..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-gray-50 rounded-xl px-4 py-3.5 text-base border border-gray-100"
            style={{ color: PRIMARY, minHeight: 120 }}
          />
        </View>

        <TouchableOpacity 
          onPress={handleSubmitPrayerRequest}
          disabled={!prayerTitle.trim() || !prayerContent.trim() || submitting}
          className="rounded-xl py-4 flex-row items-center justify-center"
          style={{
            backgroundColor: (!prayerTitle.trim() || !prayerContent.trim() || submitting) 
              ? '#D1D5DB' 
              : PRIMARY
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="hands-pray" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base ml-2">
                Save Prayer Request
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {personalPrayerRequests.length > 0 && (
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-bold text-lg" style={{ color: PRIMARY }}>
            Your Prayer Requests
          </Text>
          <Text className="text-gray-400 text-sm">
            {personalPrayerRequests.length} {personalPrayerRequests.length === 1 ? 'request' : 'requests'}
          </Text>
        </View>
      )}

      {personalPrayerRequests.length > 0 ? (
        personalPrayerRequests.map((request) => renderPersonalPrayerRequestCard(request))
      ) : (
        <View className="bg-gray-50 rounded-3xl p-8 items-center border border-gray-100">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-4">
            <MaterialCommunityIcons name="hands-pray" size={32} color="#9CA3AF" />
          </View>
          <Text className="font-semibold text-base mb-1" style={{ color: PRIMARY }}>
            No prayer requests yet
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            Start your prayer journal by adding your first prayer request above
          </Text>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="text-gray-400 mt-4">Loading prayers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <MaterialCommunityIcons name="hands-pray" size={20} color="#FFFFFF" />
          </View>
          <Text className="font-bold text-xl ml-3" style={{ color: PRIMARY }}>
            Prayer Wall
          </Text>
        </View>
        <View className="flex-row items-center">
          <NotificationIconWithBadge 
            onPress={() => navigation?.navigate('Notifications')}
            color={PRIMARY}
            size={20}
          />
        </View>
      </View>

      <View className="flex-row mx-5 mt-4 bg-gray-100 rounded-2xl p-1.5">
        <TouchableOpacity 
          onPress={() => setActiveTab('church')}
          className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: activeTab === 'church' ? '#FFFFFF' : 'transparent' }}
        >
          <MaterialCommunityIcons 
            name="church" 
            size={18} 
            color={activeTab === 'church' ? PRIMARY : '#9CA3AF'} 
            style={{ marginRight: 6 }}
          />
          <Text 
            className="font-semibold"
            style={{ color: activeTab === 'church' ? PRIMARY : '#9CA3AF' }}
          >
            Church Prayers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('personal')}
          className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: activeTab === 'personal' ? '#FFFFFF' : 'transparent' }}
        >
          <Ionicons 
            name="lock-closed" 
            size={16} 
            color={activeTab === 'personal' ? PRIMARY : '#9CA3AF'} 
            style={{ marginRight: 6 }}
          />
          <Text 
            className="font-semibold"
            style={{ color: activeTab === 'personal' ? PRIMARY : '#9CA3AF' }}
          >
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search bar for church prayers */}
      {activeTab === 'church' && (
        <View className="mx-5 mt-3">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={prayerSearchQuery}
              onChangeText={setPrayerSearchQuery}
              placeholder="Search prayers..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-sm"
              style={{ color: PRIMARY, padding: 0 }}
            />
            {prayerSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setPrayerSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-5 pt-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
          }
        >
          {activeTab === 'church' ? (
            (() => {
              const q = prayerSearchQuery.toLowerCase().trim();
              const filtered = q
                ? churchPrayers.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    (p.author?.name || '').toLowerCase().includes(q)
                  )
                : churchPrayers;
              return filtered.length > 0 ? (
              filtered.map((prayer) => renderChurchPrayerCard(prayer))
            ) : (
              <View className="bg-gray-50 rounded-3xl p-8 items-center border border-gray-100">
                <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-4">
                  <MaterialCommunityIcons name="hands-pray" size={32} color="#9CA3AF" />
                </View>
                <Text className="font-semibold text-base mb-1" style={{ color: PRIMARY }}>
                  No prayers yet
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  {q ? 'No prayers match your search' : 'Be the first to share a prayer with the community'}
                </Text>
              </View>
            );
            })()
          ) : (
            renderPersonalTab()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Comments Modal ── */}
      <Modal
        visible={commentsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={closeComments}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: SCREEN_HEIGHT * 0.7,
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: PRIMARY }}>Comments</Text>
            <TouchableOpacity onPress={closeComments} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {commentsLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          ) : comments.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="chatbubble-outline" size={36} color="#D1D5DB" />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>No comments yet</Text>
              <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 2 }}>Be the first to comment</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item._id}
              style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
              renderItem={({ item }) => {
                // userId can be a string or populated object { _id, name, email }
                const userIdStr = typeof item.userId === 'object' ? item.userId._id : item.userId;
                const populatedName = typeof item.userId === 'object' ? item.userId.name : undefined;
                const isOwn = userIdStr === currentUserId;
                const displayName = item.author?.name || populatedName || (isOwn ? currentUserName : 'Anonymous');
                return (
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    {/* Avatar */}
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isOwn ? PRIMARY : '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isOwn ? '#fff' : '#6B7280' }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY }}>
                          {isOwn ? 'You' : displayName}
                        </Text>
                        {isOwn && (
                          <TouchableOpacity onPress={() => handleDeleteComment(item._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={{ fontSize: 14, color: '#374151', marginTop: 2, lineHeight: 20 }}>
                        {item.comment}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                        {getTimeAgo(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Comment input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 30 : 16,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            backgroundColor: '#fff',
          }}>
            <TextInput
              ref={commentInputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              style={{
                flex: 1,
                backgroundColor: '#F3F4F6',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingTop: Platform.OS === 'ios' ? 10 : 8,
                paddingBottom: Platform.OS === 'ios' ? 10 : 8,
                fontSize: 14,
                color: PRIMARY,
                maxHeight: 80,
              }}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={!commentText.trim() || sendingComment}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: commentText.trim() ? PRIMARY : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}