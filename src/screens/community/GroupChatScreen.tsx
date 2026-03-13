import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Vibration,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import groupsAPI, { Group, GroupMessage } from '../../services/groupsAPI';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI } from '../../services/profileApi';
import Svg, { Circle, Rect, Path } from 'react-native-svg';

const PRIMARY = '#040725';
const MY_BUBBLE = '#040725';
const OTHER_BUBBLE = '#FFFFFF';
const SCREEN_BG = '#EFF2F9';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Chat Background Pattern ─────────────────────────────────────────
const ChatPattern = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
      {Array.from({ length: 12 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => {
          const x = col * 52 + (row % 2 === 0 ? 0 : 26);
          const y = row * 52;
          const type = (row + col) % 4;
          const opacity = 0.04;
          const color = PRIMARY;
          if (type === 0) return <Circle key={`${row}-${col}`} cx={x + 10} cy={y + 10} r={4} fill={color} opacity={opacity} />;
          if (type === 1) return <Rect key={`${row}-${col}`} x={x + 6} y={y + 6} width={8} height={8} rx={2} fill={color} opacity={opacity} />;
          if (type === 2) return <Path key={`${row}-${col}`} d={`M${x + 10} ${y + 4} L${x + 16} ${y + 16} L${x + 4} ${y + 16} Z`} fill={color} opacity={opacity} />;
          return <Circle key={`${row}-${col}`} cx={x + 10} cy={y + 10} r={2.5} fill={color} opacity={opacity} />;
        })
      )}
    </Svg>
  </View>
);

// Generate a consistent color from a name string
const nameColors = ['#E85D3A', '#2EAF6E', '#7C5CFC', '#E0A030', '#D94E8A', '#3BA4D9', '#8B6F47', '#5B8DEF'];
const getNameColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return nameColors[Math.abs(hash) % nameColors.length];
};

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
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Avatar ───────────────────────────────────────────────────────────
const Avatar = ({ photo, name, size = 34 }: { photo: string; name: string; size?: number }) => {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8ECF4' }}
      />
    );
  }
  const bg = getNameColor(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.42, fontWeight: '700' }}>
        {(name || '?').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────
const GroupChatScreen = ({ navigation, route }: any) => {
  const { groupId, groupName, groupImage: passedGroupImage } = route.params || {};
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const myPhotoRef = useRef('');
  const inputRef = useRef<TextInput>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [myPhoto, setMyPhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; photo: string } | null>(null);
  const [replyTo, setReplyTo] = useState<{ _id: string; name: string; message: string } | null>(null);

  const userId = user?.id || (user as any)?._id || '';

  const fetchData = useCallback(async () => {
    if (!groupId) return;
    try {
      const [details, msgs, profile] = await Promise.all([
        groupsAPI.getGroupDetails(groupId),
        groupsAPI.getGroupMessages(groupId),
        profileAPI.getProfile().catch(() => null),
      ]);
      setGroupDetails(details);
      setMessages(msgs);
      if (profile?.photo) {
        setMyPhoto(profile.photo);
        myPhotoRef.current = profile.photo;
      }
    } catch (error: any) {
      console.error('[GroupChat] fetch error:', error.message);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 500);
    }
  }, [groupId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const sub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await groupsAPI.getGroupMessages(groupId);
        setMessages(prev => {
          if (msgs.length !== prev.length || (msgs.length > 0 && msgs[msgs.length - 1]._id !== prev[prev.length - 1]?._id)) {
            return msgs;
          }
          return prev;
        });
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [groupId]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    try {
      setSending(true);
      const content = replyTo
        ? `↩ ${replyTo.name}: ${replyTo.message.slice(0, 50)}${replyTo.message.length > 50 ? '...' : ''}\n\n${trimmed}`
        : trimmed;
      const newMsg = await groupsAPI.sendMessage(groupId, content);
      const msg: GroupMessage = {
        ...newMsg,
        sender: {
          _id: userId || newMsg.sender?._id || '',
          name: newMsg.sender?.name && newMsg.sender.name !== 'Unknown'
            ? newMsg.sender.name : user?.name || 'Me',
          photo: newMsg.sender?.photo || myPhotoRef.current || '',
        },
      };
      setMessages(prev => [...prev, msg]);
      setMessage('');
      setReplyTo(null);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = useCallback((msg: GroupMessage) => {
    const isMe = msg.sender?._id === userId;
    const name = isMe ? 'You' : (msg.sender?.name || 'Unknown');
    setReplyTo({ _id: msg._id, name, message: msg.message });
    Vibration.vibrate(10);
    inputRef.current?.focus();
  }, [userId]);

  const closeAllSwipeables = useCallback((exceptId?: string) => {
    swipeableRefs.current.forEach((ref, id) => {
      if (id !== exceptId) ref.close();
    });
  }, []);

  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive',
        onPress: async () => {
          try { await groupsAPI.leaveGroup(groupId); navigation.goBack(); }
          catch { Alert.alert('Error', 'Failed to leave group.'); }
        },
      },
    ]);
  };

  const displayName = groupDetails?.name || groupName || 'Group';
  const memberCount = groupDetails?.memberCount || groupDetails?.members?.length || 0;
  const groupImage = groupDetails?.image || groupDetails?.avatar || passedGroupImage || '';

  const shouldShowDate = (index: number): boolean => {
    if (index === 0) return true;
    return new Date(messages[index].createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
  };

  // Check if same sender sent the previous message (for grouping)
  const isSameSender = (index: number): boolean => {
    if (index === 0) return false;
    const prev = messages[index - 1];
    const curr = messages[index];
    if (new Date(curr.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()) return false;
    return prev.sender?._id === curr.sender?._id;
  };

  const renderSwipeIcon = () => (
    <View style={styles.swipeAction}>
      <View style={styles.swipeIconCircle}>
        <Ionicons name="arrow-undo" size={15} color="#fff" />
      </View>
    </View>
  );

  const renderItem = ({ item: msg, index }: { item: GroupMessage; index: number }) => {
    const isMe = msg.sender?._id === userId;
    const senderName = msg.sender?.name || 'Unknown';
    const photo = isMe ? myPhoto : (msg.sender?.photo || '');
    const text = msg.message || '';
    const showDate = shouldShowDate(index);
    const grouped = isSameSender(index);
    const nameColor = getNameColor(senderName);

    return (
      <>
        {showDate && (
          <View style={styles.dateDivider}>
            <View style={styles.datePill}>
              <Text style={styles.dateText}>{formatDateDivider(msg.createdAt)}</Text>
            </View>
          </View>
        )}

        <Swipeable
          ref={(ref) => {
            if (ref) swipeableRefs.current.set(msg._id, ref);
            else swipeableRefs.current.delete(msg._id);
          }}
          renderLeftActions={isMe ? undefined : renderSwipeIcon}
          renderRightActions={isMe ? renderSwipeIcon : undefined}
          onSwipeableOpen={() => {
            handleReply(msg);
            setTimeout(() => swipeableRefs.current.get(msg._id)?.close(), 300);
          }}
          onSwipeableWillOpen={() => closeAllSwipeables(msg._id)}
          friction={2}
          overshootFriction={8}
          rightThreshold={40}
          leftThreshold={40}
        >
          {isMe ? (
            /* ── MY MESSAGE (RIGHT) ── */
            <View style={[styles.myRow, grouped && { marginTop: 1 }]}>
              <View style={styles.myContent}>
                <View style={[styles.myBubble, grouped && styles.myBubbleGrouped]}>
                  <Text style={styles.myText}>{text}</Text>
                  <Text style={styles.myTime}>{formatTime(msg.createdAt)}</Text>
                </View>
              </View>
              {!grouped ? (
                <View style={{ marginLeft: 8 }}>
                  <Avatar photo={photo} name={senderName} size={32} />
                </View>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>
          ) : (
            /* ── OTHER MESSAGE (LEFT) ── */
            <View style={[styles.otherRow, grouped && { marginTop: 1 }]}>
              {!grouped ? (
                <TouchableOpacity onPress={() => setSelectedUser({ name: senderName, photo })} activeOpacity={0.7}>
                  <Avatar photo={photo} name={senderName} size={32} />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 32 }} />
              )}

              <View style={styles.otherContent}>
                {!grouped && (
                  <TouchableOpacity onPress={() => setSelectedUser({ name: senderName, photo })} activeOpacity={0.7}>
                    <Text style={[styles.otherNameText, { color: nameColor }]}>{senderName}</Text>
                  </TouchableOpacity>
                )}
                <View style={[styles.otherBubble, grouped && styles.otherBubbleGrouped]}>
                  <Text style={styles.otherText}>{text}</Text>
                  <Text style={styles.otherTime}>{formatTime(msg.createdAt)}</Text>
                </View>
              </View>
            </View>
          )}
        </Swipeable>
      </>
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: PRIMARY }]} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={{ flex: 1, backgroundColor: SCREEN_BG, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={MY_BUBBLE} />
          <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: PRIMARY }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo} activeOpacity={0.8}>
          {groupImage ? (
            <Image source={{ uri: groupImage }} style={styles.headerImg} />
          ) : (
            <Avatar photo="" name={displayName} size={40} />
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.headerSub}>{memberCount} member{memberCount !== 1 ? 's' : ''}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveGroup} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: SCREEN_BG }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatPattern />
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={[styles.messageList, messages.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          inverted={false}
          maintainVisibleContentPosition={Platform.OS === 'ios' ? { minIndexForVisible: 0 } : undefined}
          onContentSizeChange={() => {
            if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: false });
          }}
          onLayout={() => {
            if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={44} color="rgba(4,7,37,0.12)" />
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>Be the first to say something!</Text>
            </View>
          }
        />

        {/* ── Reply Preview ── */}
        {replyTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyName}>{replyTo.name}</Text>
              <Text style={styles.replyPreview} numberOfLines={1}>{replyTo.message}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.replyClose}>
              <Ionicons name="close" size={16} color="rgba(4,7,37,0.5)" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Input ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#A0A8BE"
              style={styles.input}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              editable={!sending}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending || !message.trim()}
              activeOpacity={0.7}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Profile Modal ── */}
      <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedUser(null)}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedUser(null)}>
              <Ionicons name="close" size={18} color="rgba(4,7,37,0.4)" />
            </TouchableOpacity>
            <View style={styles.modalAvatarRing}>
              <Avatar photo={selectedUser?.photo || ''} name={selectedUser?.name || '?'} size={80} />
            </View>
            <Text style={styles.modalName}>{selectedUser?.name || 'Unknown'}</Text>
            <View style={styles.modalBadge}>
              <Ionicons name="people" size={12} color={MY_BUBBLE} />
              <Text style={styles.modalBadgeText}>Member of {displayName}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },
  centered: { flex: 1, backgroundColor: SCREEN_BG, justifyContent: 'center', alignItems: 'center' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: PRIMARY,
  },
  backBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 19,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 2 },
  headerImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 1 },
  leaveBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Message list ──
  messageList: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },

  // ── Date divider ──
  dateDivider: { alignItems: 'center', marginVertical: 18 },
  datePill: {
    backgroundColor: 'rgba(4,7,37,0.06)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 12,
  },
  dateText: { color: 'rgba(4,7,37,0.45)', fontSize: 11, fontWeight: '600' },

  // ── Swipe ──
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
  },
  swipeIconCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(4,7,37,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── MY message (RIGHT) ──
  myRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 4,
    paddingLeft: SCREEN_WIDTH * 0.15,
    backgroundColor: 'transparent',
  },
  myContent: { alignItems: 'flex-end', maxWidth: '100%' },
  myBubble: {
    backgroundColor: MY_BUBBLE,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  myBubbleGrouped: { borderTopRightRadius: 8 },
  myText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  myTime: {
    color: 'rgba(255,255,255,0.5)', fontSize: 10,
    marginTop: 4, alignSelf: 'flex-end',
  },

  // ── OTHER message (LEFT) ──
  otherRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    paddingRight: SCREEN_WIDTH * 0.18,
    backgroundColor: 'transparent',
  },
  otherContent: { marginLeft: 8, flex: 1 },
  otherNameText: {
    fontSize: 12, fontWeight: '700',
    marginBottom: 3, marginLeft: 4,
  },
  otherBubble: {
    backgroundColor: OTHER_BUBBLE,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  otherBubbleGrouped: { borderTopLeftRadius: 8 },
  otherText: { color: PRIMARY, fontSize: 15, lineHeight: 21 },
  otherTime: {
    color: 'rgba(4,7,37,0.3)', fontSize: 10,
    marginTop: 4, alignSelf: 'flex-end',
  },

  // ── Empty state ──
  emptyState: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: 'rgba(4,7,37,0.04)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { color: PRIMARY, fontSize: 17, fontWeight: '700' },
  emptySub: { color: 'rgba(4,7,37,0.35)', fontSize: 14, marginTop: 4 },

  // ── Reply bar ──
  replyBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(4,7,37,0.08)',
  },
  replyAccent: {
    width: 3, borderRadius: 2, backgroundColor: 'rgba(0,122,255,0.3)',
    marginRight: 10, alignSelf: 'stretch',
  },
  replyName: { color: 'rgba(0,122,255,0.5)', fontSize: 12, fontWeight: '700' },
  replyPreview: { color: 'rgba(4,7,37,0.5)', fontSize: 13, marginTop: 2 },
  replyClose: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(4,7,37,0.06)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },

  // ── Input bar ──
  inputBar: {
    paddingHorizontal: 12, paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(4,7,37,0.06)',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F3F5FA',
    borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(4,7,37,0.06)',
  },
  input: {
    flex: 1, color: PRIMARY, fontSize: 15,
    maxHeight: 100, paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: MY_BUBBLE,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#B0BFE8' },

  // ── Profile Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 28,
    paddingTop: 36, paddingBottom: 30, paddingHorizontal: 32,
    alignItems: 'center', width: 280,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24 },
      android: { elevation: 12 },
    }),
  },
  modalCloseBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(4,7,37,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalAvatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(27,77,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalName: { color: PRIMARY, fontSize: 19, fontWeight: '700', marginTop: 14, marginBottom: 10 },
  modalBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(27,77,255,0.06)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  modalBadgeText: { color: MY_BUBBLE, fontSize: 12, fontWeight: '500', marginLeft: 6 },
});

export default GroupChatScreen;
