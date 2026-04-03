import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import NotificationIconWithBadge from '../../components/NotificationIconWithBadge';
import mediaAPI, { MediaItemAPI } from '../../services/mediaAPI';
import mediaBookmarkAPI, { MediaBookmark } from '../../services/mediaBookmarkAPI';

const PRIMARY = '#040725';
const ACCENT = '#3B82F6';

type SeeAllType = 'live' | 'releases' | 'albums' | null;

interface Props {
  navigation?: any;
}

const MediaScreen = ({ navigation }: Props) => {
  const [allMedia, setAllMedia] = useState<MediaItemAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [seeAllType, setSeeAllType] = useState<SeeAllType>(null);

  const [categories, setCategories] = useState<string[]>(['All']);
  const [bookmarks, setBookmarks] = useState<MediaBookmark[]>([]);

  const toggleBookmark = async (mediaId: string) => {
    const existingId = mediaBookmarkAPI.getBookmarkId(mediaId, bookmarks);
    try {
      if (existingId) {
        await mediaBookmarkAPI.removeBookmark(existingId);
        setBookmarks(prev => prev.filter(b => b._id !== existingId));
      } else {
        const newBm = await mediaBookmarkAPI.addBookmark(mediaId);
        setBookmarks(prev => [...prev, newBm]);
      }
    } catch (error: any) {
      console.error('[Media] bookmark error:', error.message);
    }
  };

  const fetchMedia = async () => {
    try {
      setError(null);
      const [response, bm] = await Promise.all([
        mediaAPI.getAllMedia(),
        mediaBookmarkAPI.getMyBookmarks().catch(() => []),
      ]);
      setBookmarks(bm);
      if (response.status === 'success' && response.data) {
        setAllMedia(response.data);

        const uniqueCategories = new Set<string>();
        response.data.forEach(item => {
          if (item.category_id && item.category_id.name) {
            uniqueCategories.add(item.category_id.name);
          }
        });
        setCategories(['All', ...Array.from(uniqueCategories).sort()]);
      }
    } catch (err: any) {
      console.error('Error fetching media:', err);
      setError(err.response?.data?.message || 'Failed to load media. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedia();
  };

  const getFilteredByCategory = (items: MediaItemAPI[]) => {
    if (selectedCategory === 'All') return items;
    return items.filter(item =>
      item.category_id && item.category_id.name === selectedCategory
    );
  };

  const getFilteredMedia = (items: MediaItemAPI[]) => {
    let filtered = getFilteredByCategory(items);

    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.category_id && item.category_id.name.toLowerCase().includes(query))
    );
  };

  const liveStreams = allMedia.filter(item => item.isLive);
  const regularMedia = allMedia.filter(item => !item.isLive);

  const filteredLiveStreams = getFilteredMedia(liveStreams);
  const filteredRegularMedia = getFilteredMedia(regularMedia);

  const featuredMedia = filteredRegularMedia.length > 0 ? filteredRegularMedia[0] : null;

  const renderLiveStreamCard = (item: MediaItemAPI, isGrid: boolean = false) => (
    <TouchableOpacity
      key={item._id}
      style={{
        width: isGrid ? '48%' : 200,
        marginRight: isGrid ? 0 : 16,
        marginBottom: isGrid ? 16 : 0,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{
            width: '100%',
            height: isGrid ? 100 : 120,
            borderRadius: 16,
          }}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
        <View style={{
          position: 'absolute',
          top: 8,
          left: 8,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#EF4444',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
            marginRight: 4,
          }} />
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>LIVE</Text>
        </View>
        {item.category_id && (
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
              {item.category_id.name}
            </Text>
          </View>
        )}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="play" size={18} color="#EF4444" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '600', marginTop: 10 }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderMediaCard = (item: MediaItemAPI, isGrid: boolean = false) => (
    <TouchableOpacity
      key={item._id}
      style={{
        width: isGrid ? '48%' : 160,
        marginRight: isGrid ? 0 : 16,
        marginBottom: isGrid ? 16 : 0,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{
            width: '100%',
            height: isGrid ? 140 : 160,
            borderRadius: 16,
          }}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
        {item.category_id && (
          <View style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
              {item.category_id.name}
            </Text>
          </View>
        )}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="play" size={22} color={PRIMARY} style={{ marginLeft: 3 }} />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleBookmark(item._id)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={mediaBookmarkAPI.isBookmarked(item._id, bookmarks) ? 'bookmark' : 'bookmark-outline'}
            size={14}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '600', marginTop: 10 }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentlyPlayed = (item: MediaItemAPI) => (
    <TouchableOpacity
      key={item._id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: 56, height: 56, borderRadius: 12 }}
        contentFit="cover"
        cachePolicy="disk"
        transition={200}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          {item.category_id && (
            <View style={{
              backgroundColor: `${ACCENT}15`,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              marginRight: 8,
            }}>
              <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>
                {item.category_id.name}
              </Text>
            </View>
          )}
          <Text style={{ color: '#6B7280', fontSize: 13, flex: 1 }} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // See All Content
  const renderSeeAllContent = () => {
    let title = '';
    let data: MediaItemAPI[] = [];

    switch (seeAllType) {
      case 'live':
        title = 'Live Now';
        data = filteredLiveStreams;
        break;
      case 'releases':
        title = 'New Releases';
        data = filteredRegularMedia;
        break;
      case 'albums':
        title = 'Popular Albums';
        data = filteredRegularMedia;
        break;
      default:
        return null;
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
          <TouchableOpacity
            onPress={() => setSeeAllType(null)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 20, marginLeft: 16 }}>{title}</Text>
          {seeAllType === 'live' && liveStreams.length > 0 && (
            <View style={{
              backgroundColor: '#FEE2E2',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              marginLeft: 12,
            }}>
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>{liveStreams.length} LIVE</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${title.toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 15,
                color: PRIMARY,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {data.length === 0 ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}>
              <Ionicons name="film-outline" size={64} color="#D1D5DB" />
              <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
                No {title} found
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 15, marginTop: 8 }}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try a different search or category'
                  : 'Check back later'}
              </Text>
            </View>
          ) : (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
              {data.map((item) =>
                seeAllType === 'live'
                  ? renderLiveStreamCard(item, true)
                  : renderMediaCard(item, true)
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
          <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 24 }}>Media Library</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={'#040725'} />
          <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 16 }}>
            Loading media...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}>
          <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 24 }}>Media Library</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
          <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
            Unable to Load Media
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchMedia}
            style={{
              backgroundColor: ACCENT,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 24,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (seeAllType) {
    return renderSeeAllContent();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}>
        <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 24 }}>Media Library</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NotificationIconWithBadge
            onPress={() => navigation?.navigate('Notifications')}
            color={PRIMARY}
            size={22}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ACCENT]}
            tintColor={ACCENT}
          />
        }
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search sermons, music, or prophecy"
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 15,
                color: PRIMARY,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          style={{ marginBottom: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 10,
                backgroundColor: selectedCategory === category ? PRIMARY : '#F3F4F6',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedCategory === category ? '#FFFFFF' : '#6B7280',
              }}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Now Section */}
        {filteredLiveStreams.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#EF4444',
                  marginRight: 8,
                }} />
                <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold' }}>Live Now</Text>
                <View style={{
                  backgroundColor: '#FEE2E2',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginLeft: 8,
                }}>
                  <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>
                    {filteredLiveStreams.length} LIVE
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSeeAllType('live')}>
                <Text style={{ color: ACCENT, fontSize: 14, fontWeight: '500' }}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {filteredLiveStreams.slice(0, 5).map((item) => renderLiveStreamCard(item))}
            </ScrollView>
          </View>
        )}

        {/* Featured Media */}
        {featuredMedia && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{
              backgroundColor: `${ACCENT}15`,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: 'flex-start',
              marginBottom: 12,
            }}>
              <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
                FEATURED
              </Text>
            </View>

            <TouchableOpacity style={{ borderRadius: 24, overflow: 'hidden' }}>
              <ImageBackground
                source={{ uri: featuredMedia.thumbnail }}
                style={{ height: 200 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(4,7,37,0.95)']}
                  style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}
                >
                  {featuredMedia.category_id && (
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      alignSelf: 'flex-start',
                      marginBottom: 8,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                        {featuredMedia.category_id.name}
                      </Text>
                    </View>
                  )}
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                    {featuredMedia.title}
                  </Text>
                  <Text style={{ color: '#D1D5DB', fontSize: 13 }} numberOfLines={2}>
                    {featuredMedia.description}
                  </Text>

                  <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 24,
                    alignSelf: 'flex-start',
                    marginTop: 16,
                  }}>
                    <Ionicons name="play" size={16} color={PRIMARY} />
                    <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                      Watch Now
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

        {/* New Releases */}
        {filteredRegularMedia.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 16,
            }}>
              <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold' }}>
                {selectedCategory === 'All' ? 'New Releases' : `${selectedCategory}`}
              </Text>
              <TouchableOpacity onPress={() => setSeeAllType('releases')}>
                <Text style={{ color: ACCENT, fontSize: 14, fontWeight: '500' }}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {filteredRegularMedia.slice(0, 6).map((item) => renderMediaCard(item))}
            </ScrollView>
          </View>
        )}

        {/* Recently Played */}
        {filteredRegularMedia.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              Recently Played
            </Text>
            {filteredRegularMedia.slice(0, 3).map((item) => renderRecentlyPlayed(item))}
          </View>
        )}

        {/* Empty State */}
        {filteredRegularMedia.length === 0 && filteredLiveStreams.length === 0 && (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            paddingHorizontal: 40,
          }}>
            <Ionicons name="film-outline" size={64} color="#D1D5DB" />
            <Text style={{ color: PRIMARY, fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
              {searchQuery || selectedCategory !== 'All'
                ? 'No Media Found'
                : 'No Media Yet'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try a different search or category'
                : 'Content will appear here once available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MediaScreen;