import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { RootStackParamList } from '../../navigation/types';

type VideoPlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PRIMARY = '#040725';

const VideoPlayerScreen = ({ navigation, route }: VideoPlayerScreenProps) => {
  const { videoUrl, title, author } = route.params;
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showControls) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handlePlayPause = async () => {
    if (status?.isLoaded) {
      if (status.isPlaying) {
        await video.current?.pauseAsync();
      } else {
        await video.current?.playAsync();
      }
    }
  };

  const handleSeek = async (position: number) => {
    if (status?.isLoaded && status.durationMillis) {
      const seekPosition = (position / 100) * status.durationMillis;
      await video.current?.setPositionAsync(seekPosition);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (status?.isLoaded && status.durationMillis && status.positionMillis) {
      return (status.positionMillis / status.durationMillis) * 100;
    }
    return 0;
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await video.current?.presentFullscreenPlayer();
    } else {
      await video.current?.dismissFullscreenPlayer();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    Alert.alert(
      'Playback Error',
      'Unable to play this video. Please check your internet connection and try again.',
      [
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Retry',
          onPress: () => {
            setIsLoading(true);
            video.current?.loadAsync({ uri: videoUrl }, { shouldPlay: true });
          },
        },
      ]
    );
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded) {
      if (isLoading) {
        setIsLoading(false);
      }
      if (playbackStatus.error) {
        handleVideoError(playbackStatus.error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {author && (
            <Text style={styles.author} numberOfLines={1}>
              {author}
            </Text>
          )}
        </View>
        
        <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
          <Ionicons 
            name={isFullscreen ? "contract" : "expand"} 
            size={20} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={toggleControls}
        activeOpacity={1}
      >
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: videoUrl }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isLooping={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        )}

        {/* Custom Controls Overlay */}
        {showControls && !isLoading && (
          <View style={styles.controlsOverlay}>
            {/* Center Play/Pause Button */}
            <TouchableOpacity style={styles.centerPlayButton} onPress={handlePlayPause}>
              <View style={styles.playButtonBackground}>
                <Ionicons 
                  name={status?.isLoaded && status.isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="#FFF" 
                  style={{ marginLeft: status?.isLoaded && !status.isPlaying ? 3 : 0 }}
                />
              </View>
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Time and Controls */}
              <View style={styles.timeAndControls}>
                <Text style={styles.timeText}>
                  {status?.isLoaded && status.positionMillis 
                    ? formatTime(status.positionMillis) 
                    : '0:00'
                  } / {status?.isLoaded && status.durationMillis 
                    ? formatTime(status.durationMillis) 
                    : '0:00'
                  }
                </Text>
                
                <View style={styles.controlButtons}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (status?.isLoaded && status.positionMillis) {
                        video.current?.setPositionAsync(Math.max(0, status.positionMillis - 10000));
                      }
                    }}
                    style={styles.controlButton}
                  >
                    <Ionicons name="play-back" size={20} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                    <Ionicons 
                      name={status?.isLoaded && status.isPlaying ? "pause" : "play"} 
                      size={20} 
                      color="#FFF" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      if (status?.isLoaded && status.positionMillis && status.durationMillis) {
                        video.current?.setPositionAsync(
                          Math.min(status.durationMillis, status.positionMillis + 10000)
                        );
                      }
                    }}
                    style={styles.controlButton}
                  >
                    <Ionicons name="play-forward" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  author: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  fullscreenButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: screenWidth,
    height: screenHeight - 200, // Account for header and bottom safe area
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingSpinner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  playButtonBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  timeAndControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default VideoPlayerScreen;