import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface Slide {
  id: number;
  image: any;
  text: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: require('@/assets/images/church/church-bg-1.jpg'),
    text: 'Worship with the Mowdministries family globally.',
  },
  {
    id: 2,
    image: require('@/assets/images/church/church-bg-1.jpg'),
    text: 'Join outreach and crusades to share the Gospel of Salvation.',
  },
  {
    id: 3,
    image: require('@/assets/images/church/church-bg-1.jpg'),
    text: 'Grow spiritually through teachings and fellowship.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState<number>(0);

  const nextSlide = () => {
    if (index === slides.length - 1) {
      router.replace('/welcome');
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <ImageBackground
      source={slides[index].image}
      style={styles.bg}
    >
      <View style={styles.bottomCard}>
        <Text style={styles.text}>{slides[index].text}</Text>

        <TouchableOpacity onPress={nextSlide} style={styles.button}>
          <Text style={styles.buttonText}>
            {index === slides.length - 1 ? 'Continue' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0B1448',
    fontWeight: '600',
  },
});
