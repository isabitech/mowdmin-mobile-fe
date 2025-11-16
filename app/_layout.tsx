import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import "../global.css";
import { AppProviders } from '../src/providers/AppProviders';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack 
          screenOptions={{ 
            headerShown: false, 
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ animation: 'fade' }}
          /> 
          <Stack.Screen 
            name="welcome" 
            options={{ animation: 'slide_from_bottom' }}
          /> 
          <Stack.Screen 
            name="(auth)" 
            options={{ animation: 'slide_from_right' }}
          /> 
          <Stack.Screen 
            name="(tabs)" 
            options={{ animation: 'slide_from_right' }}
          /> 
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
