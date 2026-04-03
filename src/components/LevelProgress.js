/**
 * LevelProgress.js — Island path progress indicator.
 *
 * Shows a horizontal track (the island journey) with:
 *   - Milestone markers for shelter nodes (campfire emoji)
 *   - A Jack Brown icon that slides along
 *   - Level name and phase badge
 *   - Crow pressure bar using the enemy sprite, not an emoji
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { formatInGameTime } from '../game/TimeSystem';



const LevelProgress = ({
  progress = 0,
  levelName = '',
  phase = 'day',
  shelterNodes = [],
  crowPressure = 0,
  crowMax = 80,
  clueCount = 0,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress / 100,
      friction: 8,
      tension: 80,
      useNativeDriver: false, // needs layout driver for width
    }).start();
  }, [progress]);

  const playerOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '94%'], // Keeps sprite inside track at 100%
  });

  const phaseColour =
    phase === 'night' ? '#1a237e'
    : phase === 'dusk' ? '#4a148c'
    : '#1b5e20';
  const phaseLabel =
    phase === 'night' ? 'Night'
    : phase === 'dusk' ? 'Dusk'
    : 'Day';

  const crowPct = Math.min(1, crowPressure / crowMax);
  const crowBarColour = crowPct > 0.7 ? '#c62828' : '#e65100';

  const isFinale = clueCount >= 10;
  const displayLevelName = isFinale ? 'ALL EVIDENCE FOUND - ESCAPE TO SAFETY' : levelName;
  const levelNameStyle = isFinale ? [styles.levelName, styles.finaleText] : styles.levelName;

  return (
    <View style={styles.container}>
      {/* ── Level & Phase Row ──────────────────────────────────────────── */}
      <View style={styles.topRow}>
        <Text style={levelNameStyle}>{displayLevelName}</Text>
        <View style={[styles.phaseBadge, { backgroundColor: phaseColour }]}>
          <Text style={styles.phaseText}>{phaseLabel}</Text>
        </View>
      </View>

      {/* ── Journey track ─────────────────────────────────────────────── */}
      <View style={styles.trackWrapper}>
        <View style={styles.track}>
          {/* Progress fill */}
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* ── Progress label ────────────────────────────────────────────── */}
      <View style={styles.progressRow}>
        <Image source={require('../../assets/images/icon_progress_v2.png')} style={styles.timeIcon} />
        <Text style={styles.progressLabel}>{formatInGameTime(phase, progress)} — {Math.round(progress)}% through area</Text>
      </View>
      {/* ── Crow pressure bar ─────────────────────────────────────────── */}
      <View style={styles.crowRow}>
        <Image source={require('../../assets/images/icon_crow_v2.png')} style={styles.crowIcon} />
        <Text style={styles.crowLabel}> Crow Pressure</Text>
        <View style={styles.crowBarBg}>
          <View
            style={[
              styles.crowBarFill,
              { width: `${crowPct * 100}%`, backgroundColor: crowBarColour },
            ]}
          />
        </View>
        {crowPct > 0.8 && (
          <Image source={require('../../assets/images/icon_crow_v2.png')} style={styles.warningIcon} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelName: {
    color: '#ffe082',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  finaleText: {
    color: '#ff5252',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  phaseBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  phaseText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trackWrapper: {
    position: 'relative',
    height: 28,
    justifyContent: 'center',
  },
  track: {
    height: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'visible',
    position: 'relative',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  shelterMarker: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
  shelterIcon: {
    fontSize: 14,
  },
  playerIconWrapper: {
    position: 'absolute',
    top: -18,
    width: 20,
    zIndex: 10,
  },
  playerIcon: {
    width: 20,
    height: 28,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timeEmoji: {
    fontSize: 10,
  },
  progressLabel: {
    color: '#777',
    fontSize: 10,
  },
  crowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  crowEmoji: {
    fontSize: 14,
  },
  crowLabel: {
    color: '#aaa',
    fontSize: 10,
    marginRight: 6,
  },
  crowBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#111',
    borderRadius: 3,
    overflow: 'hidden',
  },
  crowBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  warningIcon: {
    width: 14,
    height: 14,
    marginLeft: 6,
    resizeMode: 'contain',
  },
  crowIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    resizeMode: 'contain',
  },
  timeIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    resizeMode: 'contain',
  },
});

export default LevelProgress;
