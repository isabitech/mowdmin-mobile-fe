import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationSuccess'>;

export default function RegistrationSuccessScreen({ navigation }: Props) {
  const { setIsAuthenticated } = useAuth();

  const handleGoHome = async () => {
    await setIsAuthenticated(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#040725" />

      {/* Decorative circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Content */}
      <View style={styles.content}>
        {/* Success image */}
        <View style={styles.imageContainer}>
          <View style={styles.glowRing}>
            <Image
              source={require('../../assets/images/complete-setup.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Success badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Account Verified</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          You{"'"}re all set!
        </Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          Your account has been created successfully.{'\n'}Welcome to the community!
        </Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoHome}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040725',
  },
  circleTopRight: {
    position: 'absolute',
    top: -width * 0.3,
    right: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(248,6,6,0.06)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -width * 0.25,
    left: -width * 0.25,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(248,6,6,0.04)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    marginBottom: isSmall ? 24 : 36,
  },
  glowRing: {
    width: width * 0.55,
    height: width * 0.55,
    maxWidth: 260,
    maxHeight: 260,
    borderRadius: width * 0.275,
    borderWidth: 2,
    borderColor: 'rgba(248,6,6,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: isSmall ? 16 : 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  badgeText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  heading: {
    fontSize: isSmall ? 28 : 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: isSmall ? 10 : 14,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: isSmall ? 14 : 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: isSmall ? 20 : 23,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: isSmall ? 16 : 24,
  },
  button: {
    backgroundColor: '#F80606',
    borderRadius: 16,
    paddingVertical: isSmall ? 14 : 17,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
