import React from 'react';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { IndieFlower_400Regular } from '@expo-google-fonts/indie-flower';
import {
  Inter_400Regular,
  Inter_400Regular_Italic,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { View, ActivityIndicator, StyleSheet, Dimensions, Platform } from 'react-native';
import ErrorBoundary from './src/ErrorBoundary';
import { GameProvider } from './src/context/GameContext';
import MainNavigation from './src/MainNavigation';
import { initAudio } from './src/game/AudioManager';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const IS_WEB = Platform.OS === 'web';

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Inter_400Regular,
    Inter_400Regular_Italic,
    Inter_700Bold,
    IndieFlower_400Regular,
  });

  React.useEffect(() => {
    initAudio();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#ce93d8" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.rootContainer}>
        <View style={styles.mobileFrame}>
          <SafeAreaProvider>
            <GameProvider>
              <MainNavigation />
            </GameProvider>
          </SafeAreaProvider>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#050010', // Dark void background for desktop
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileFrame: {
    width: '100%',
    maxWidth: 450,
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    // Subtle shadow for the "phone" frame on web
    ...Platform.select({
      web: {
        boxShadow: '0 0 50px rgba(0,0,0,0.8)',
        height: '100dvh', // Use dynamic viewport height to prevent squashing on mobile web
      }
    })
  },
  loading: {
    flex: 1,
    backgroundColor: '#03000d',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
