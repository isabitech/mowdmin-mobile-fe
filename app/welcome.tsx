import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/images/church/church-bg-1.jpg')}
      style={styles.bg}
    >
      <View style={styles.card}>
        <Image
          source={require('@/assets/images/mowd-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to Mowdministries</Text>
        <Text style={styles.desc}>
          Jesus loves you! Stay connected with inspiring messages, worship, and resources to grow in faith.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/get-started')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.secondaryText}>Log in</Text>
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
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: '100%',
    padding: 25,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  primaryButton: {
    backgroundColor: '#0B1448',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#0B1448',
    textDecorationLine: 'underline',
  },
});
