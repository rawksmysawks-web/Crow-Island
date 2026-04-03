/**
 * TitleScreen.js — Game title screen.
 *
 * Shows the Crow Island logo, atmospheric background, and a Begin button.
 * A crow silhouette pulses in the background.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';

const TITLE_BG = require('../../assets/images/title_bg_v3.png');

const TitleScreen = () => {
  const { startGame, state, toggleMute, setScreen } = useGame();
  const { isMuted } = state;
  const insets = useSafeAreaInsets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const floatAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const titleScale  = useRef(new Animated.Value(0.85)).current;
  const crowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Entrance fade
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    ]).start();

    // Logo float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:  0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();

    // Crow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(crowOpacity, { toValue: 0.55, duration: 2500, useNativeDriver: true }),
        Animated.timing(crowOpacity, { toValue: 0.2,  duration: 2500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Mute/Navigation Toggle (Consolidated) ────────────────────── */}
      <View style={[styles.controlsContainer, { top: Math.max(insets.top, 50) }]}>
        <TouchableOpacity 
          style={styles.menuAnchor} 
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>

        {isMenuOpen && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.dropdownItem} 
              onPress={() => { toggleMute(); setIsMenuOpen(false); }}
            >
              <Text style={{ fontSize: 20 }}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dropdownItem} 
              onPress={() => { setScreen('journal'); setIsMenuOpen(false); }}
            >
              <Text style={{ fontSize: 20 }}>📖</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dropdownItem} 
              onPress={() => { setScreen('instructions'); setIsMenuOpen(false); }}
            >
              <Text style={{ fontSize: 18, color: '#fff' }}>?</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── High-Res Island Background (Integrated Crow) ──────────── */}
      <Image source={TITLE_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.bgScrim} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* ── Title ───────────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: titleScale }] }}>
          <Text style={styles.titleMain}>CROW</Text>
          <Text style={styles.titleSub}>ISLAND</Text>
        </Animated.View>

        {/* ── Begin button ────────────────────────────────────────────── */}
        <TouchableOpacity 
          style={styles.beginButton} 
          onPress={() => {
            // First click on web "unlocks" the audio context
            startGame();
          }}
        >
          <Text style={styles.beginText}>BEGIN</Text>
        </TouchableOpacity>

        {/* ── Instructions button ──────────────────────────────────────── */}
        <TouchableOpacity 
          style={styles.howToBtn} 
          onPress={() => setScreen('instructions')}
        >
          <Text style={styles.howToText}>HOW TO PLAY</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#03000d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  bgScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3, 0, 13, 0.72)',
  },
  crowBg: {
    position: 'absolute',
    width: '100%',
    height: '70%',
    top: '10%',
    opacity: 0.35,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleMain: {
    color: '#ffe082',
    fontSize: 52,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 14,
    textAlign: 'center',
    textShadowColor: '#ff9800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    width: '100%',
  },
  titleSub: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 20,
    textAlign: 'center',
    marginTop: -8,
    textShadowColor: '#aaa',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tagline: {
    color: '#555',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular_Italic',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  beginButton: {
    backgroundColor: '#1a0030',
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 8,
    paddingHorizontal: 0, // Remove horizontal padding to allow full width centering
    paddingVertical: 18,
    marginTop: 100, // even more spacing
    marginBottom: 20,
    width: 260, // Fixed width for better centering
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  beginText: {
    color: '#ce93d8',
    fontSize: 22,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 6,
    textAlign: 'center',
    width: '100%', // full width for centering
  },
  credit: {
    color: '#333',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controlsContainer: {
    position: 'absolute',
    right: 8,
    zIndex: 200,
    alignItems: 'flex-end',
  },
  menuAnchor: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  menuIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    top: -2,
  },
  dropdownMenu: {
    marginTop: 10,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderRadius: 12,
    padding: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  dropdownItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  howToBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(206, 147, 216, 0.4)',
  },
  howToText: {
    color: '#ce93d8',
    fontSize: 14,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
    opacity: 0.8,
  },
});

export default TitleScreen;
