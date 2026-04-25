import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationIconWithBadge from './NotificationIconWithBadge';

const { width } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  isLive?: boolean;
  views?: string;
  media_url?: string;
  type?: string;
  author?: string;
  duration?: string;
}

interface HomeHeroProps {
  videos: VideoItem[];
  currentVideoIndex: number;
  videoFlatListRef: React.RefObject<FlatList | null>;
  onViewableItemsChanged: any;
  viewabilityConfig: any;
  profilePhoto?: string;
  firstName?: string;
  profileLoading: boolean;
  greeting: string;
  navigation?: any;
}

const HomeHero: React.FC<HomeHeroProps> = ({
  videos,
  currentVideoIndex,
  videoFlatListRef,
  onViewableItemsChanged,
  viewabilityConfig,
  profilePhoto,
  firstName,
  profileLoading,
  greeting,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  
  // Video playback state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<VideoItem | null>(null);
  
  // Create player with current media URL - expo-video handles URL changes
  const player = useVideoPlayer(currentMedia?.media_url || '', player => {
    player.loop = false;
    player.muted = false;
  });

  // Helper functions
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePlayMedia = useCallback((item: VideoItem) => {
    try {
      console.log('[HomeHero] handlePlayMedia called with:', item.title, item.media_url);
      
      if (!item.media_url) {
        Alert.alert('No Video', 'This media item does not have a video URL available.');
        return;
      }
      
      // Always start playing - no toggle, dedicated video player
      console.log('[HomeHero] Starting video:', item.title);
      setCurrentMedia(item);
      setPlayingVideoId(item.id);
    } catch (error) {
      console.error('[HomeHero] Error:', error);
    }
  }, []);

  const handleCloseVideo = useCallback(() => {
    console.log('[HomeHero] Closing video player');
    setPlayingVideoId(null);
    setCurrentMedia(null);
    if (player) {
      player.pause();
    }
  }, [player]);

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    return (
      <View style={{ 
        width, 
        height: 460,
      }}>
        {/* Always show thumbnail in carousel */}
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Overlay gradient */}
        <LinearGradient
          colors={['rgba(4,7,37,0.7)', 'transparent', 'rgba(4,7,37,0.95)']}
          locations={[0, 0.3, 1]}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 2,
          }}
        />

        {/* Badge */}
        {item.isLive ? (
          <View
            style={{
              position: 'absolute',
              bottom: 100,
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EF4444',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
              zIndex: 3,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }} />
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>LIVE</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{item.views}</Text>
          </View>
        ) : (
          <View
            style={{
              position: 'absolute',
              bottom: 100,
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
              zIndex: 3,
            }}
          >
            <Ionicons name="eye-outline" size={13} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{item.views}</Text>
          </View>
        )}

        {/* Play Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: '42%',
            alignSelf: 'center',
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4,
          }}
          activeOpacity={0.7}
          onPress={() => handlePlayMedia(item)}
        >
          <Ionicons 
            name="play" 
            size={28} 
            color="#FFF" 
            style={{ marginLeft: 3 }} 
          />
        </TouchableOpacity>

        {/* Video Info */}
        <View style={{ 
          position: 'absolute', 
          bottom: 32, 
          left: 20, 
          right: 20,
          zIndex: 3,
        }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: 'flex-start',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' }}>
              {item.category}
            </Text>
          </View>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>
            {item.title}
          </Text>
        </View>
      </View>
    );
  };

  const renderVideoPlayer = () => {
    if (!currentMedia) return null;

    return (
      <View style={{ 
        width, 
        height: 460,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '100%',
          height: 300, // Fixed height for centered video
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {isYouTubeUrl(currentMedia.media_url || '') ? (
            <YoutubePlayer
              height={300}
              play={true}
              videoId={getYouTubeVideoId(currentMedia.media_url || '') || ''}
              onChangeState={(state: any) => {
                console.log('[HomeHero] YouTube state changed:', state);
                if (state === 'ended') {
                  handleCloseVideo();
                }
              }}
              onError={(error: any) => {
                console.log('YouTube player error:', error);
                Alert.alert('Error', 'Failed to load YouTube video');
                handleCloseVideo();
              }}
            />
          ) : (
            <VideoView
              style={{ 
                width: '100%', 
                height: '100%',
              }}
              player={player}
              fullscreenOptions={{ enable: false }}
              allowsPictureInPicture={false}
            />
          )}
        </View>

        {/* Video Player Controls Overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            pointerEvents: 'box-none',
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: insets.top + 16,
              left: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleCloseVideo}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Video Info Overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{
              color: '#FFF',
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 4,
            }}>
              {currentMedia.title}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14,
              fontWeight: '500',
            }}>
              {currentMedia.category}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View style={{ height: 460 }}>
        {playingVideoId ? (
          // Show standalone video player
          renderVideoPlayer()
        ) : (
          // Show video carousel
          <FlatList
            ref={videoFlatListRef}
            data={videos}
            renderItem={renderVideoItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>

      {/* Header Overlay - only show when not playing video */}
      {!playingVideoId && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingTop: insets.top + 8,
          }}
        >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Profile Avatar */}
            <TouchableOpacity
              onPress={() => navigation?.navigate('Profile')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.25)',
                overflow: 'hidden',
              }}
              activeOpacity={0.7}
            >
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />
              ) : (
                <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '700' }}>
                  {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                </Text>
              )}
            </TouchableOpacity>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' }}>
                {greeting}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
                {profileLoading ? '...' : firstName || 'Welcome'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <NotificationIconWithBadge
              onPress={() => navigation?.navigate('Notifications')}
              color="#FFFFFF"
              size={20}
            />
          </TouchableOpacity>
        </View>
        </View>
      )}

      {/* Pagination Dots - only show when not playing video */}
      {!playingVideoId && (
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {videos.map((_, index) => (
            <View
              key={index}
              style={{
                height: 3,
                borderRadius: 2,
                width: currentVideoIndex === index ? 24 : 8,
                backgroundColor: currentVideoIndex === index ? '#FFF' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default HomeHero;