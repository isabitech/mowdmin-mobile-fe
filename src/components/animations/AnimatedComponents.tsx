import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import {
    ANIMATION_DURATION,
    createFadeAnimation,
    createScaleAnimation,
    createShakeAnimation,
    createSlideAnimation,
} from '../../utils/animations';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = ANIMATION_DURATION.MEDIUM,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      createFadeAnimation(fadeAnim, 1, duration).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, delay, duration]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction,
  delay = 0,
  duration = ANIMATION_DURATION.MEDIUM,
  distance = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialValue = 
      direction === 'left' ? -distance :
      direction === 'right' ? distance :
      direction === 'up' ? -distance : distance;
    
    slideAnim.setValue(initialValue);

    const timer = setTimeout(() => {
      createSlideAnimation(slideAnim, 0, duration).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, direction, delay, duration, distance]);

  const transform = 
    direction === 'left' || direction === 'right'
      ? [{ translateX: slideAnim }]
      : [{ translateY: slideAnim }];

  return (
    <Animated.View style={[style, { transform }]}>
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  delay = 0,
  duration = ANIMATION_DURATION.FAST,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      createScaleAnimation(scaleAnim, 1, duration).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, delay, duration]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

interface LoadingDotsProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 8,
  color = '#0B1448',
  style,
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 200),
      createDotAnimation(dot3, 400),
    ]).start();
  }, [dot1, dot2, dot3]);

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    marginHorizontal: 2,
  };

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Animated.View style={[dotStyle, { opacity: dot1 }]} />
      <Animated.View style={[dotStyle, { opacity: dot2 }]} />
      <Animated.View style={[dotStyle, { opacity: dot3 }]} />
    </Animated.View>
  );
};

interface ShakeViewProps {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
  style?: ViewStyle;
}

export const ShakeView: React.FC<ShakeViewProps> = ({
  children,
  trigger,
  onComplete,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      createShakeAnimation(shakeAnim).start(() => {
        onComplete?.();
      });
    }
  }, [trigger, shakeAnim, onComplete]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shakeAnim }] }]}>
      {children}
    </Animated.View>
  );
};

interface PressableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  scaleValue?: number;
  disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  style,
  scaleValue = 0.95,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      createScaleAnimation(scaleAnim, scaleValue, 100).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      createScaleAnimation(scaleAnim, 1, 100).start();
    }
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
        onResponderGrant={handlePressIn}
        onResponderRelease={handlePressOut}
      >
        <Animated.View onTouchEnd={onPress}>
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};