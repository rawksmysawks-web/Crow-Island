/**
 * GameOverScreen.js — Game over screen.
 *
 * Two variants based on loseReason:
 *   'crow_capture'  — "You heard the wings. Then nothing."
 *   'fear_overload' — "The darkness swallowed you whole."
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { stopBackgroundMusic, setMuted } from '../game/AudioManager';
import { formatInGameTime } from '../game/TimeSystem';
import JourneyTimeline from '../components/JourneyTimeline';
import JournalScreen from './JournalScreen';

const CROW     = require('../../assets/images/capture_screen_entity.png');
const PLAYER   = require('../../assets/images/player_tired.png');
const BG_NIGHT = require('../../assets/images/banner_night.png');
const ICON_JOURNAL     = require('../../assets/images/icon_journal.png');

const VARIANTS = {
  crow_capture: {
    title: 'CAPTURED',
    subtitle: 'You heard the wings.',
    body: 'Then nothing.\n\nThe half-human, half-crow shape stepped out of the dark. You ran. Not fast enough.\n\nCrow Island keeps its secrets.',
    colour: '#1a0030',
    accent: '#7b1fa2',
    textAccent: '#ce93d8',
    image: CROW,
  },
  fear_overload: {
    title: 'CONSUMED',
    subtitle: 'The darkness swallowed you whole.',
    body: 'Your mind couldn\'t hold it together. The fear won.\n\nThe island is still out there. The carvings on the floor are still there.\n\nAnd something is still watching.',
    colour: '#1a0000',
    accent: '#b71c1c',
    textAccent: '#ef9a9a',
    image: PLAYER,
  },
};

const GameOverScreen = () => {
  const { state, restart, toggleMute } = useGame();
  const { loseReason, currentLevel, isMuted } = state;

  const variant = VARIANTS[loseReason] ?? VARIANTS.fear_overload;

  const [showTimeline, setShowTimeline] = React.useState(false);
  const [showJournal, setShowJournal] = React.useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    stopBackgroundMusic();
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Title shake
    Animated.sequence([
      Animated.delay(800),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 4,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -4, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 2,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0,  duration: 200, useNativeDriver: true }),
          Animated.delay(2000),
        ]),
        { iterations: 3 },
      ),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: variant.colour }]}>
      {/* ── Night background ─────────────────────────────────────────── */}
      <Image source={BG_NIGHT} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.bgScrim} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* ── TOP RIGHT: MENU ── */}
        <GlobalMenu />
        {/* ── Image ─────────────────────────────────────────────────── */}
        {variant.image && variant.title !== 'CONSUMED' && (
          <View style={styles.imageWrap}>
            <Image 
              source={variant.image} 
              style={styles.image} 
              resizeMode="contain" 
            />
          </View>
        )}

        {/* ── Title ─────────────────────────────────────────────────── */}
        <Animated.Text
          style={[
            styles.title,
            { color: variant.textAccent, transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {variant.title}
        </Animated.Text>

        {/* ── Subtitle ──────────────────────────────────────────────── */}
        <Text style={[styles.subtitle, { color: variant.textAccent }]}>
          {variant.subtitle}
        </Text>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <Text style={styles.body}>{variant.body}</Text>

        {/* ── Time of Death ────────────────────────────────────────── */}
        {currentLevel && (
          <Text style={styles.levelIndicator}>
            Time of Death: {formatInGameTime(currentLevel.phase, state.progress)} — {currentLevel.name}
          </Text>
        )}

        {/* ── Retry & Journey ─────────────────────────────────────────── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { borderColor: variant.accent, backgroundColor: variant.colour }]}
            onPress={restart}
          >
            <Text style={[styles.buttonText, { color: variant.textAccent }]}>
              Try Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { borderColor: variant.accent, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => setShowTimeline(true)}
          >
            <Text style={[styles.buttonText, { color: variant.textAccent }]}>
              Review Journey
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Credits ────────────────────────────────────────────────── */}
        <View style={styles.creditsArea}>
          <Text style={styles.creditText}>Based on a short story written by Tyler James Hamilton.</Text>
        </View>
      </Animated.View>
      {showTimeline && (
        <JourneyTimeline 
          log={state.journeyLog} 
          onClose={() => setShowTimeline(false)} 
          onOpenJournal={() => {
            setShowTimeline(false);
            setShowJournal(true);
          }}
        />
      )}
      {showJournal && (
        <JournalScreen onCloseOverride={() => setShowJournal(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'center',
  },
  bgImage: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
  },
  bgScrim: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  imageWrap: {
    width: 200,
    height: 240,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 240,
    opacity: 0.85,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  body: {
    color: '#888',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  levelIndicator: {
    color: '#444',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  button: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  creditsArea: {
    marginTop: 35,
    alignItems: 'center',
    opacity: 0.5,
  },
  creditText: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  controls: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  controlBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default GameOverScreen;
