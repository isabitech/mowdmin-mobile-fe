import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import Toast from 'react-native-toast-message';
import { initI18n } from './src/i18tn/i18tn';
import './global.css';

export default function App() {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      await initI18n();
      setI18nInitialized(true);
    }
    initialize();
  }, []);

  if (!i18nInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <AppNavigator />
              <StatusBar style="auto" />
              <Toast />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});