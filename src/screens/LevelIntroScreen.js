/**
 * LevelIntroScreen.js — Per-level intro screen.
 *
 * Shows the level name and atmospheric intro text before play begins.
 * Transitions to the game screen on "Begin".
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Image
} from 'react-native';
import { useGame } from '../context/GameContext';
import BannerScene from '../components/BannerScene';

const LevelIntroScreen = () => {
  const { state, nextLevel, toggleMute } = useGame();
  const { currentLevel, isMuted } = state;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [currentLevel?.id]);

  if (!currentLevel) return null;

  const phaseLabel = currentLevel.phase === 'night' ? 'NIGHT' : currentLevel.phase === 'dusk' ? 'DUSK' : 'DAY';
  const phaseColour = currentLevel.phase === 'night' ? '#3949ab' : currentLevel.phase === 'dusk' ? '#6a1b9a' : '#1b5e20';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Background World (BannerScene) ────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <BannerScene bannerKey={currentLevel?.bannerKey || 'pano_arrival'} phase={currentLevel?.phase || 'day'} />
      </View>
      <View style={styles.bgScrim} />

      <View style={styles.topRightControls}>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
          <Text style={{ fontSize: 24 }}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => {}}>
          <Text style={{ fontSize: 24 }}>📖</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Level number ─────────────────────────────────────────── */}
        <Text style={styles.levelNumber}>LEVEL {currentLevel.number}</Text>

        {/* ── Level name ───────────────────────────────────────────── */}
        <Text style={styles.levelName}>{currentLevel.name}</Text>

        {/* ── Phase badge ──────────────────────────────────────────── */}
        <View style={[styles.phaseBadge, { backgroundColor: phaseColour }]}>
          <Text style={styles.phaseBadgeText}>{phaseLabel}</Text>
        </View>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Intro text ───────────────────────────────────────────── */}
        <Text style={styles.introText}>{currentLevel.intro}</Text>

        {/* ── Difficulty hint ──────────────────────────────────────── */}
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Tip</Text>
          <Text style={styles.hintText}>{currentLevel.defeatHint}</Text>
        </View>

        {/* ── Begin button ─────────────────────────────────────────── */}
        <TouchableOpacity style={styles.button} onPress={nextLevel}>
          <Text style={styles.buttonText}>
            {currentLevel.number === 1 ? 'Start the Game' : 'Continue'}
          </Text>
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
  },
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 0, 13, 0.72)',
  },
  container: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
  },
  levelNumber: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
    marginBottom: 4,
  },
  levelName: {
    color: '#ffe082',
    fontSize: 32,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  phaseBadge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  phaseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#2a1a4a',
    marginBottom: 20,
  },
  introText: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular_Italic',
    marginBottom: 20,
  },
  hintBox: {
    backgroundColor: '#111827',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1565c0',
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  hintTitle: {
    color: '#90caf9',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  hintText: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#1a0030',
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#ce93d8',
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
  },
  topRightControls: {
    position: 'absolute',
    top: 50,
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    zIndex: 1000,
  },
  controlBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LevelIntroScreen;
