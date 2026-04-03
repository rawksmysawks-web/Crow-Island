/**
 * WinScreen.js — Victory screen with multiple endings.
 *
 * Three endings based on fear at time of escape:
 *   'good'   — fear ≤ 30  — "You made it. Jack Brown walks free."
 *   'escape' — fear 31-65 — "You escaped. But you'll carry this forever."
 *   'dark'   — fear > 65  — "You escaped. But are you the same?"
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { stopBackgroundMusic, setMuted } from '../game/AudioManager';
import JourneyTimeline from '../components/JourneyTimeline';
import JournalScreen from './JournalScreen';

const PLAYER = require('../../assets/images/player_tired.png');
const TRUE_ENDING_BOAT = require('../../assets/images/true_ending_boat.png');
const CROW   = require('../../assets/images/crow_silhouette.png');
const ICON_JOURNAL     = require('../../assets/images/icon_journal.png');

const ENDINGS = {
  good: {
    title: 'ESCAPED',
    subtitle: 'The island let you go.',
    body: 'Your boat hits the mainland dock as the first light of morning breaks the horizon. You look back. Crow Island is quiet. Just an island.\n\nYou write your report. Nobody believes you.\n\nJack Brown is fine. He is absolutely fine.',
    colour: '#001a1a',
    accent: '#004d40',
    textAccent: '#a5d6a7',
    stars: '•••',
    starLabel: 'Perfect Escape',
    image: TRUE_ENDING_BOAT,
  },
  escape: {
    title: 'SURVIVED',
    subtitle: 'Barely. But you made it.',
    body: 'You collapse onto the dock. The creature stopped at the waterline — whatever it is, the sea holds it on the island.\n\nYou made it off. But you left something behind on Crow Island.\n\nYou\'re not quite sure what.',
    colour: '#0a0a1a',
    accent: '#1565c0',
    textAccent: '#90caf9',
    stars: '••',
    starLabel: 'Narrow Escape',
    image: TRUE_ENDING_BOAT,
  },
  dark: {
    title: 'FREE?',
    subtitle: 'You got off the island.',
    body: 'The mainland. Lights. People. Normal things.\n\nBut when you catch your reflection, your eyes are wrong. You keep looking over your shoulder. At night, you hear wings.\n\nCrow Island doesn\'t let go. Not really.',
    colour: '#0d0000',
    accent: '#4a148c',
    textAccent: '#ce93d8',
    stars: '•',
    starLabel: 'Dark Ending',
    image: CROW,
  },
  true: {
    title: 'THE TRUTH',
    subtitle: 'You found everything.',
    body: 'You didn\'t just escape. You found the truth. The message wasn\'t a cry for help; it was a lure. But as you push the boat away, the evidence in your pocket feels like a heavy secret.\n\nCrow Island is not finished with you, but you are finished with it.',
    colour: '#000814',
    accent: '#ffcc00',
    textAccent: '#ffe082',
    stars: '•••••',
    starLabel: 'True Ending',
    image: TRUE_ENDING_BOAT,
  },
};

const WinScreen = () => {
  const { state, restart, toggleMute } = useGame();
  const { ending, fear, isMuted } = state;

  const endingKey = ending ?? 'escape';
  const e = ENDINGS[endingKey] ?? ENDINGS.escape;

  const [showTimeline, setShowTimeline] = React.useState(false);
  const [showJournal, setShowJournal] = React.useState(false);

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    stopBackgroundMusic();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: e.colour }]}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
            <Text style={{ fontSize: 24 }}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowJournal(true)}>
            <Text style={{ fontSize: 24 }}>📖</Text>
          </TouchableOpacity>
        </View>
        {/* ── Image ─────────────────────────────────────────────────── */}
        <View style={styles.imageWrap}>
          <Image 
            source={e.image} 
            style={[
              styles.image,
              e.title === 'THE TRUTH' || e.title === 'ESCAPED' || e.title === 'SURVIVED' ? { width: 180, height: 220, transform: [{ scale: 0.5 }, { translateX: -45 }, { translateY: -55 }] } : {}
            ]} 
            resizeMode="contain" 
          />
        </View>

        {/* ── Title ─────────────────────────────────────────────────── */}
        <Animated.Text
          style={[
            styles.title,
            { color: e.textAccent, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {e.title}
        </Animated.Text>

        {/* ── Subtitle ──────────────────────────────────────────────── */}
        <Text style={[styles.subtitle, { color: e.textAccent }]}>{e.subtitle}</Text>

        {/* ── Stars ─────────────────────────────────────────────────── */}
        <View style={[styles.starRow, { borderColor: e.accent }]}>
          <Text style={[styles.stars, { color: e.textAccent }]}>{e.stars}</Text>
          <Text style={[styles.starLabel, { color: e.textAccent }]}>{e.starLabel}</Text>
        </View>

        {/* ── Ending body ───────────────────────────────────────────── */}
        <Text style={styles.body}>{e.body}</Text>

        {/* ── Final fear indicator ──────────────────────────────────── */}
        <Text style={styles.fearNote}>Final fear: {Math.round(fear)}/100</Text>

        {/* ── Play again & Journey ────────────────────────────────────────────── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { borderColor: e.accent }]}
            onPress={restart}
          >
            <Text style={[styles.buttonText, { color: e.textAccent }]}>
              Play Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { borderColor: e.accent, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => setShowTimeline(true)}
          >
            <Text style={[styles.buttonText, { color: e.textAccent }]}>
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
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  imageWrap: {
    width: 90,
    height: 110,
    overflow: 'hidden',
    marginBottom: 14,
  },
  image: {
    width: 90,
    height: 110,
    opacity: 0.85,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  starRow: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stars: {
    fontSize: 18,
  },
  starLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  body: {
    color: '#888',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  controls: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    zIndex: 100,
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
  },
  button: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  creditsArea: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.5,
  },
  creditText: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  muteBtn: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 100,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default WinScreen;
