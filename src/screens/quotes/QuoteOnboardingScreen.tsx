import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Quote {
  title: string;
  content: string;
  verse: string;
  image: any;
}

const QuoteOnboardingScreen = ({ navigation }: any) => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const quotes: Quote[] = [
    {
      title: 'Strength in Weakness',
      content:
        'My grace is sufficient for you, for my power is made perfect in weakness. When we lean on Him, we find the courage to keep moving forward. Trust that He is with you every step of the way, guiding your path and giving you peace.',
      verse: '"My grace is sufficient for you, for my power is made perfect in weakness." - 2 Corinthians 12:9',
      image: require('./assets/images/quotes/strength.jpg'),
    },
    {
      title: 'Overflowing Blessings',
      content:
        'Generosity unlocks God\'s abundance. When you give with a willing heart, you bless others and make room for God\'s blessings to overflow in your life. Trust His promise to increase as you sow in faith.',
      verse: '"Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap." - Luke 6:38',
      image: require('./assets/images/quotes/blessings.jpg'),
    },
    {
      title: 'Risen in Glory',
      content:
        'Jesus\' tomb is empty, not because He rose, we have victory over sin, fear, and death. His resurrection is the unshakable hope that gives us new life, power, and freedom in Him.',
      verse: '"He is not here; he has risen, just as he said. Come and see the place where he lay." - Matthew 28:6',
      image: require('./assets/images/quotes/risen.jpg'),
    },
    {
      title: 'Power of Praise & Worship',
      content:
        'When we worship Him with sincere hearts, we draw us closer to God\'s presence. As we lift our voices and hearts, chains are broken, peace is restored, and God\'s glory fills our lives. True worship is not just a song, but a lifestyle of surrender.',
      verse: '"God is spirit, and his worshipers must worship in the Spirit and in truth." - John 4:24',
      image: require('./assets/images/quotes/worship.jpg'),
    },
  ];

  useEffect(() => {
    selectRandomQuote();
  }, []);

  const selectRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  const handleSkip = async () => {
    // Optional: Save that user has seen onboarding
    await AsyncStorage.setItem('hasSeenQuote', 'true');
    navigation.replace('MainApp'); // Or whatever your main screen is
  };

  if (!currentQuote) {
    return null; // Or a loading spinner
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image with Overlay */}
      <Image
        source={currentQuote.image}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{currentQuote.title}</Text>

        {/* Main Content */}
        <Text style={styles.description}>{currentQuote.content}</Text>

        {/* Bible Verse */}
        <Text style={styles.verse}>{currentQuote.verse}</Text>
      </View>

      {/* Skip Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.pageIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 28,
    opacity: 0.95,
  },
  verse: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.85,
  },
  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: 50,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(0, 20, 100, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicator: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
});

export default QuoteOnboardingScreen;
