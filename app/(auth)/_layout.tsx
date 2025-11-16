import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ animation: 'fade' }}
      />
      <Stack.Screen 
        name="get-started" 
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="verify-email" 
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
