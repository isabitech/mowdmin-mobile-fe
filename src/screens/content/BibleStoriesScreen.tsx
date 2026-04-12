import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import bibleStoriesAPI, { BibleStoryAPI } from '../../services/bibleStoriesAPI';

const { width } = Dimensions.get('window');
const PRIMARY = '#040725';
const ACCENT = '#3B82F6';
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

// Deterministic color palette for stories without images
const STORY_COLORS: [string, string][] = [
  ['#3B82F6', '#1D4ED8'],
  ['#8B5CF6', '#6D28D9'],
  ['#F97316', '#C2410C'],
  ['#10B981', '#047857'],
  ['#EC4899', '#BE185D'],
  ['#14B8A6', '#0F766E'],
  ['#F59E0B', '#B45309'],
  ['#EF4444', '#B91C1C'],
  ['#6366F1', '#4338CA'],
  ['#84CC16', '#4D7C0F'],
];

// Deterministic fallback images for stories
const STORY_IMAGES = [
  'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=600',
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
  'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
];

const getStoryColor = (id: string): [string, string] => {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return STORY_COLORS[hash % STORY_COLORS.length];
};

const getStoryImage = (story: BibleStoryAPI): string => {
  if (story.media && story.media.length > 0 && story.media[0]?.url) {
    return story.media[0].url;
  }
  const hash = (story._id || story.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return STORY_IMAGES[hash % STORY_IMAGES.length];
};

// Capitalize first letter of each word in title
const formatTitle = (title: string): string => {
  return title
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Get a preview snippet that's clean
const getPreview = (content: string, maxLength = 80): string => {
  const cleaned = content.replace(/\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
};

// Format date nicely
const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Estimate reading time
const getReadTime = (content: string): string => {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

interface Props {
  navigation?: any;
  route?: { params?: { storyId?: string } };
}

const BibleStoriesScreen = ({ navigation, route }: Props) => {
  const [stories, setStories] = useState<BibleStoryAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<BibleStoryAPI | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const { storyId } = route?.params || {};

  const fetchStories = useCallback(async () => {
    try {
      setError(null);
      const response = await bibleStoriesAPI.getAllStories();
      if (response.status === 'success' && response.data) {
        setStories(response.data);
      }
    } catch (err: any) {
      console.error('[BibleStoriesScreen] fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load stories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStories();
  }, [fetchStories]);

  // Deep link: open specific story
  useEffect(() => {
    if (storyId && stories.length > 0) {
      const match = stories.find((s) => s.id === storyId || s._id === storyId);
      if (match) openStory(match);
    }
  }, [storyId, stories]);

  const openStory = (story: BibleStoryAPI) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  // Filter and sort
  const filteredStories = stories
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const featuredStories = stories.slice(0, 5);

  // ─── Render Helpers ─────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: 'rgba(4,7,37,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <View style={{ marginLeft: 14 }}>
          <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
            Bible Stories
          </Text>
          <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, marginTop: 2, fontWeight: '500' }}>
            {stories.length} stories
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFeaturedCard = (story: BibleStoryAPI, index: number) => {
    const imageUrl = getStoryImage(story);
    const colors = getStoryColor(story._id || story.id);

    return (
      <TouchableOpacity
        key={story.id || story._id}
        onPress={() => openStory(story)}
        style={{
          width: width - 80,
          height: 190,
          marginRight: 14,
          borderRadius: 20,
          overflow: 'hidden',
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 6 },
          }),
        }}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          locations={[0.25, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
            padding: 16,
          }}
        >
          {/* Featured pill */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: colors[0],
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>FEATURED</Text>
          </View>

          <Text style={{ color: '#FFF', fontSize: 19, fontWeight: '800', lineHeight: 24 }} numberOfLines={2}>
            {formatTitle(story.title)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
              {getReadTime(story.content)}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderStoryCard = (story: BibleStoryAPI) => {
    const imageUrl = getStoryImage(story);
    const colors = getStoryColor(story._id || story.id);

    return (
      <TouchableOpacity
        key={story.id || story._id}
        onPress={() => openStory(story)}
        style={{
          width: CARD_WIDTH,
          marginBottom: CARD_GAP,
          borderRadius: 18,
          backgroundColor: '#FFF',
          overflow: 'hidden',
          ...Platform.select({
            ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
            android: { elevation: 3 },
          }),
        }}
        activeOpacity={0.85}
      >
        {/* Image or gradient placeholder */}
        {story.media && story.media.length > 0 ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="book-outline" size={32} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
        )}

        <View style={{ padding: 12 }}>
          <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700', lineHeight: 19 }} numberOfLines={2}>
            {formatTitle(story.title)}
          </Text>
          <Text
            style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, marginTop: 6, lineHeight: 17 }}
            numberOfLines={2}
          >
            {getPreview(story.content, 60)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="time-outline" size={11} color="rgba(4,7,37,0.3)" />
            <Text style={{ color: 'rgba(4,7,37,0.3)', fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
              {getReadTime(story.content)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Story Modal ────────────────────────────────────────────────────────────

  const renderStoryModal = () => {
    if (!selectedStory) return null;
    const imageUrl = getStoryImage(selectedStory);
    const colors = getStoryColor(selectedStory._id || selectedStory.id);

    return (
      <Modal
        visible={showStoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStoryModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <StatusBar barStyle="light-content" />

          {/* Hero Image */}
          <View style={{ height: 260, position: 'relative' }}>
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.75)']}
              locations={[0, 0.3, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowStoryModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 38,
                height: 38,
                borderRadius: 14,
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Title overlay */}
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <View
                style={{
                  backgroundColor: colors[0],
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                  BIBLE STORY
                </Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800', lineHeight: 30 }}>
                {formatTitle(selectedStory.title)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Meta info */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 18,
                marginBottom: 18,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(4,7,37,0.06)',
                gap: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: 'rgba(4,7,37,0.05)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={PRIMARY} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 11, fontWeight: '500' }}>Read Time</Text>
                  <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '700' }}>
                    {getReadTime(selectedStory.content)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: 'rgba(4,7,37,0.05)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={PRIMARY} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 11, fontWeight: '500' }}>Added</Text>
                  <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '700' }}>
                    {formatDate(selectedStory.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Story content */}
            <Text
              style={{
                color: 'rgba(4,7,37,0.75)',
                fontSize: 16,
                lineHeight: 28,
                letterSpacing: 0.1,
              }}
            >
              {selectedStory.content}
            </Text>

            {/* Media gallery */}
            {selectedStory.media && selectedStory.media.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Media</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {selectedStory.media.map((item, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: typeof item.url === 'string' ? item.url : '' }}
                      style={{ width: 200, height: 140, borderRadius: 14 }}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // ─── States ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        {renderHeader()}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: 'rgba(4,7,37,0.5)', marginTop: 16, fontSize: 14 }}>Loading stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        {renderHeader()}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: 'rgba(239,68,68,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="cloud-offline-outline" size={30} color="#EF4444" />
          </View>
          <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
            Unable to Load Stories
          </Text>
          <Text style={{ color: 'rgba(4,7,37,0.5)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 13,
              marginTop: 20,
            }}
            onPress={() => {
              setLoading(true);
              fetchStories();
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
        }
      >
        {/* Featured Carousel */}
        {featuredStories.length > 0 && !searchQuery && (
          <View style={{ marginBottom: 22 }}>
            <Text
              style={{
                color: PRIMARY,
                fontSize: 16,
                fontWeight: '800',
                paddingHorizontal: 20,
                marginBottom: 14,
              }}
            >
              Featured
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              decelerationRate="fast"
              snapToInterval={width - 80 + 14}
              snapToAlignment="start"
            >
              {featuredStories.map((story, idx) => renderFeaturedCard(story, idx))}
            </ScrollView>
          </View>
        )}

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 12 : 4,
              flexDirection: 'row',
              alignItems: 'center',
              ...Platform.select({
                ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
                android: { elevation: 2 },
              }),
            }}
          >
            <Ionicons name="search" size={18} color="rgba(4,7,37,0.35)" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search stories..."
              placeholderTextColor="rgba(4,7,37,0.35)"
              style={{
                flex: 1,
                marginLeft: 10,
                color: PRIMARY,
                fontSize: 14,
                fontWeight: '500',
                paddingVertical: Platform.OS === 'ios' ? 0 : 8,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="rgba(4,7,37,0.3)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, fontWeight: '600' }}>
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </Text>
        </View>

        {/* Stories Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredStories.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP }}>
              {filteredStories.map(renderStoryCard)}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 56 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 22,
                  backgroundColor: 'rgba(4,7,37,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="book-outline" size={28} color="rgba(4,7,37,0.25)" />
              </View>
              <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>No Stories Found</Text>
              <Text
                style={{
                  color: 'rgba(4,7,37,0.45)',
                  fontSize: 13,
                  marginTop: 6,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}
              >
                Try a different search term
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: 'rgba(4,7,37,0.06)',
                  }}
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '600' }}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderStoryModal()}
    </SafeAreaView>
  );
};

export default BibleStoriesScreen;