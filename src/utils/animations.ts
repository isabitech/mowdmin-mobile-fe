import { Animated, Easing } from 'react-native';

// Animation duration constants
export const ANIMATION_DURATION = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  EXTRA_SLOW: 800,
};

// Easing presets for different animation types
export const EASING = {
  BOUNCE: Easing.out(Easing.back(1.7)),
  SMOOTH: Easing.out(Easing.quad),
  LINEAR: Easing.linear,
  SPRING: Easing.elastic(1),
};

// Common animation creators
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = ANIMATION_DURATION.MEDIUM,
  easing = EASING.SMOOTH
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = ANIMATION_DURATION.MEDIUM,
  easing = EASING.SMOOTH
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = ANIMATION_DURATION.FAST,
  easing = EASING.BOUNCE
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  tension: number = 100,
  friction: number = 8
) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  });
};

// Sequence animations
export const createStaggeredAnimation = (
  animations: Animated.CompositeAnimation[],
  delay: number = 100
) => {
  return Animated.stagger(delay, animations);
};

export const createSequenceAnimation = (
  animations: Animated.CompositeAnimation[]
) => {
  return Animated.sequence(animations);
};

// Loop animations
export const createLoopAnimation = (
  animation: Animated.CompositeAnimation,
  iterations: number = -1
) => {
  return Animated.loop(animation, { iterations });
};

// Pulse animation for loading states
export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return createLoopAnimation(
    Animated.sequence([
      createScaleAnimation(animatedValue, 1.1, ANIMATION_DURATION.FAST),
      createScaleAnimation(animatedValue, 1, ANIMATION_DURATION.FAST),
    ])
  );
};

// Shake animation for errors
export const createShakeAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    createSlideAnimation(animatedValue, 10, 50, EASING.LINEAR),
    createSlideAnimation(animatedValue, -10, 50, EASING.LINEAR),
    createSlideAnimation(animatedValue, 10, 50, EASING.LINEAR),
    createSlideAnimation(animatedValue, -10, 50, EASING.LINEAR),
    createSlideAnimation(animatedValue, 0, 50, EASING.LINEAR),
  ]);
};