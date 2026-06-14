import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NotificationIconWithBadge from '../../components/NotificationIconWithBadge';
import TestimonyCard from '../../components/testimonies/TestimonyCard';
import MyTestimonyCard from '../../components/testimonies/MyTestimonyCard';
import TestimonyComposerCard from '../../components/testimonies/TestimonyComposerCard';
import { useAuth } from '../../contexts/AuthContext';
import {
  testimoniesAPI,
  Testimony,
  TestimonyComment,
} from '../../services/testimoniesApi';
import { RootStackParamList } from '../../navigation/types';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Testimonies'>;

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

const TestimoniesScreen = ({ navigation }: Props) => {
  const { user: authUser } = useAuth();
  const currentUserId = authUser?.id || authUser?._id || '';
  const currentUserName = authUser?.name || 'You';
  const togglingTestimonies = useRef(new Set<string>()).current;
  const commentInputRef = useRef<TextInput>(null);

  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonyTitle, setTestimonyTitle] = useState('');
  const [testimonyContent, setTestimonyContent] = useState('');
  const [editingTestimonyId, setEditingTestimonyId] = useState<string | null>(null);

  const [communityTestimonies, setCommunityTestimonies] = useState<Testimony[]>([]);
  const [myTestimonies, setMyTestimonies] = useState<Testimony[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsTestimonyId, setCommentsTestimonyId] = useState('');
  const [comments, setComments] = useState<TestimonyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [publicStories, myStories] = await Promise.all([
        testimoniesAPI.getAllPublicTestimonies(),
        testimoniesAPI.getMyTestimonies(currentUserId),
      ]);

      setCommunityTestimonies(publicStories);
      setMyTestimonies(myStories);
    } catch (error) {
      console.error('[TestimoniesScreen] loadAllData error:', error);
      Alert.alert('Error', 'Failed to load testimonies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const resetComposer = () => {
    setTestimonyTitle('');
    setTestimonyContent('');
    setEditingTestimonyId(null);
  };

  const handleSubmitTestimony = async () => {
    if (!testimonyTitle.trim() || !testimonyContent.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and your testimony.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: testimonyTitle.trim(),
      description: testimonyContent.trim(),
      isPublic: true,
    };

    try {
      if (editingTestimonyId) {
        const updated = await testimoniesAPI.updateTestimony(editingTestimonyId, payload);

        setMyTestimonies((prev) =>
          prev.map((item) => (item._id === editingTestimonyId ? updated : item))
        );
        setCommunityTestimonies((prev) =>
          prev.map((item) => (item._id === editingTestimonyId ? updated : item))
        );
        Alert.alert('Success', 'Your testimony has been updated.');
      } else {
        const created = await testimoniesAPI.createTestimony(payload, {
          _id: currentUserId || 'local-user',
          name: currentUserName,
        });

        setMyTestimonies((prev) => [created, ...prev]);
        setCommunityTestimonies((prev) =>
          created.isPublic === false ? prev : [created, ...prev]
        );
        Alert.alert('Success', 'Your testimony has been shared.');
      }

      resetComposer();
      setActiveTab('community');
    } catch (error) {
      console.error('[TestimoniesScreen] submit error:', error);
      Alert.alert('Error', 'Failed to save your testimony. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTestimony = (testimony: Testimony) => {
    setActiveTab('mine');
    setEditingTestimonyId(testimony._id);
    setTestimonyTitle(testimony.title);
    setTestimonyContent(testimony.description);
  };

  const handleDeleteTestimony = (testimonyId: string) => {
    Alert.alert(
      'Delete Testimony',
      'Are you sure you want to delete this testimony?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await testimoniesAPI.deleteTestimony(testimonyId);
              setMyTestimonies((prev) => prev.filter((item) => item._id !== testimonyId));
              setCommunityTestimonies((prev) => prev.filter((item) => item._id !== testimonyId));
              if (editingTestimonyId === testimonyId) {
                resetComposer();
              }
              Alert.alert('Success', 'Your testimony has been deleted.');
            } catch (error) {
              console.error('[TestimoniesScreen] delete error:', error);
              Alert.alert('Error', 'Failed to delete testimony.');
            }
          },
        },
      ]
    );
  };

  const handleToggleLike = async (testimonyId: string) => {
    if (togglingTestimonies.has(testimonyId)) return;
    togglingTestimonies.add(testimonyId);

    setCommunityTestimonies((prev) =>
      prev.map((item) => {
        if (item._id !== testimonyId) return item;

        const wasLiked = item.isLiked;
        return {
          ...item,
          isLiked: !wasLiked,
          likeCount: wasLiked
            ? Math.max(0, (item.likeCount || 1) - 1)
            : (item.likeCount || 0) + 1,
        };
      })
    );

    try {
      const result = await testimoniesAPI.toggleTestimonyLike(testimonyId, currentUserId);
      setCommunityTestimonies((prev) =>
        prev.map((item) =>
          item._id === testimonyId
            ? { ...item, isLiked: result.liked, likeCount: result.likeCount }
            : item
        )
      );
    } catch (error) {
      console.error('[TestimoniesScreen] like error:', error);
    } finally {
      togglingTestimonies.delete(testimonyId);
    }
  };

  const handleOpenComments = useCallback(async (testimonyId: string) => {
    setCommentsTestimonyId(testimonyId);
    setCommentsVisible(true);
    setCommentsLoading(true);

    try {
      const data = await testimoniesAPI.getComments(testimonyId);
      setComments(data);
    } catch (error) {
      console.error('[TestimoniesScreen] comments error:', error);
      Alert.alert('Error', 'Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || sendingComment) return;

    setSendingComment(true);
    try {
      const newComment = await testimoniesAPI.addComment(commentsTestimonyId, trimmed, {
        _id: currentUserId || 'local-user',
        name: currentUserName,
      });

      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      Keyboard.dismiss();

      setCommunityTestimonies((prev) =>
        prev.map((item) =>
          item._id === commentsTestimonyId
            ? { ...item, commentCount: (item.commentCount || 0) + 1 }
            : item
        )
      );
      setMyTestimonies((prev) =>
        prev.map((item) =>
          item._id === commentsTestimonyId
            ? { ...item, commentCount: (item.commentCount || 0) + 1 }
            : item
        )
      );
    } catch (error) {
      console.error('[TestimoniesScreen] send comment error:', error);
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await testimoniesAPI.deleteComment(commentId, commentsTestimonyId);
            setComments((prev) => prev.filter((item) => item._id !== commentId));
            setCommunityTestimonies((prev) =>
              prev.map((item) =>
                item._id === commentsTestimonyId
                  ? { ...item, commentCount: Math.max(0, (item.commentCount || 1) - 1) }
                  : item
              )
            );
            setMyTestimonies((prev) =>
              prev.map((item) =>
                item._id === commentsTestimonyId
                  ? { ...item, commentCount: Math.max(0, (item.commentCount || 1) - 1) }
                  : item
              )
            );
          } catch (error) {
            console.error('[TestimoniesScreen] delete comment error:', error);
            Alert.alert('Error', 'Failed to delete comment.');
          }
        },
      },
    ]);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setCommentsTestimonyId('');
    setComments([]);
    setCommentText('');
  };

  const filteredCommunityTestimonies = (() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return communityTestimonies;

    return communityTestimonies.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.author?.name || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  })();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ color: '#9CA3AF', marginTop: 14 }}>Loading testimonies...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>

          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ color: PRIMARY, fontSize: 22, fontWeight: '800' }}>Testimonies</Text>
            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>
              Read, celebrate, and share what God is doing.
            </Text>
          </View>
        </View>

        <NotificationIconWithBadge
          onPress={() => navigation.navigate('Notifications')}
          color={PRIMARY}
          size={22}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 16,
          backgroundColor: '#F3F4F6',
          borderRadius: 18,
          padding: 6,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('community')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: activeTab === 'community' ? '#FFFFFF' : 'transparent',
          }}
        >
          <MaterialCommunityIcons
            name="account-group-outline"
            size={18}
            color={activeTab === 'community' ? PRIMARY : '#9CA3AF'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: activeTab === 'community' ? PRIMARY : '#9CA3AF',
              fontWeight: '700',
            }}
          >
            Community Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('mine')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: activeTab === 'mine' ? '#FFFFFF' : 'transparent',
          }}
        >
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={18}
            color={activeTab === 'mine' ? PRIMARY : '#9CA3AF'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: activeTab === 'mine' ? PRIMARY : '#9CA3AF',
              fontWeight: '700',
            }}
          >
            Share Yours
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'community' ? (
        <View style={{ marginHorizontal: 20, marginTop: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search testimonies..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, marginLeft: 10, fontSize: 14, color: PRIMARY, padding: 0 }}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
          }
        >
          {activeTab === 'community' ? (
            filteredCommunityTestimonies.length > 0 ? (
              filteredCommunityTestimonies.map((item) => (
                <TestimonyCard
                  key={item._id}
                  testimony={item}
                  timeAgoText={getTimeAgo(item.createdAt)}
                  onPressLike={() => handleToggleLike(item._id)}
                  onPressComment={() => handleOpenComments(item._id)}
                />
              ))
            ) : (
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 24,
                  padding: 32,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <MaterialCommunityIcons name="message-text-outline" size={30} color={ACCENT} />
                </View>
                <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
                  {searchQuery ? 'No testimonies match your search' : 'No testimonies yet'}
                </Text>
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 22,
                    marginTop: 8,
                  }}
                >
                  {searchQuery
                    ? 'Try another keyword and keep exploring the community feed.'
                    : 'Be the first to encourage others by sharing what God has done.'}
                </Text>
              </View>
            )
          ) : (
            <>
              <TestimonyComposerCard
                title={testimonyTitle}
                description={testimonyContent}
                isEditing={!!editingTestimonyId}
                submitting={submitting}
                onChangeTitle={setTestimonyTitle}
                onChangeDescription={setTestimonyContent}
                onSubmit={handleSubmitTestimony}
                onCancelEdit={resetComposer}
              />

              {myTestimonies.length > 0 ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800' }}>
                      Your Shared Testimonies
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '600' }}>
                      {myTestimonies.length} {myTestimonies.length === 1 ? 'story' : 'stories'}
                    </Text>
                  </View>

                  {myTestimonies.map((item) => (
                    <MyTestimonyCard
                      key={item._id}
                      testimony={item}
                      timeAgoText={getTimeAgo(item.createdAt)}
                      onEdit={() => handleEditTestimony(item)}
                      onDelete={() => handleDeleteTestimony(item._id)}
                    />
                  ))}
                </>
              ) : (
                <View
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 24,
                    padding: 32,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 34,
                      backgroundColor: '#EFF6FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <MaterialCommunityIcons name="book-open-variant" size={30} color={ACCENT} />
                  </View>
                  <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
                    No testimonies shared yet
                  </Text>
                  <Text
                    style={{
                      color: '#9CA3AF',
                      fontSize: 14,
                      textAlign: 'center',
                      lineHeight: 22,
                      marginTop: 8,
                    }}
                  >
                    Use the form above to share your first testimony with the community.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
            maxHeight: SCREEN_HEIGHT * 0.72,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            overflow: 'hidden',
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: PRIMARY }}>Comments</Text>
            <TouchableOpacity
              onPress={closeComments}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          ) : comments.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="chatbubble-outline" size={36} color="#D1D5DB" />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>No comments yet</Text>
              <Text style={{ color: '#D1D5DB', fontSize: 12, marginTop: 2 }}>Be the first to respond</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              style={{ maxHeight: SCREEN_HEIGHT * 0.42 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
              renderItem={({ item }) => {
                const userIdStr = typeof item.userId === 'object' ? item.userId._id : item.userId;
                const populatedName = typeof item.userId === 'object' ? item.userId.name : undefined;
                const isOwn = userIdStr === currentUserId;
                const displayName = item.author?.name || populatedName || (isOwn ? currentUserName : 'Anonymous');

                return (
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: isOwn ? PRIMARY : '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '800', color: isOwn ? '#FFFFFF' : '#6B7280' }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: PRIMARY }}>
                          {isOwn ? 'You' : displayName}
                        </Text>
                        {isOwn ? (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(item._id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <Text style={{ fontSize: 14, color: '#374151', marginTop: 4, lineHeight: 21 }}>
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: Platform.OS === 'ios' ? 30 : 16,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
              backgroundColor: '#FFFFFF',
            }}
          >
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
                maxHeight: 82,
              }}
            />

            <TouchableOpacity
              onPress={handleSendComment}
              disabled={!commentText.trim() || sendingComment}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: commentText.trim() ? PRIMARY : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default TestimoniesScreen;
