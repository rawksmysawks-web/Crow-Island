/**
 * FearMeter.js — Fear gauge UI component.
 *
 * Displays fear as a horizontal bar from 0–100.
 * Colour shifts: green (low) → amber (mid) → red (high).
 * Pulses/flickers above 75%.
 * At 100%, triggers the panic event (handled by GameContext → PanicMinigame).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';

const FEAR_MAX = 100;

const FearMeter = ({ fear = 0, isPanic = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pct = Math.min(1, fear / FEAR_MAX);

  // Pulse animation when fear > 75
  useEffect(() => {
    if (fear > 75) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.97, duration: 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [fear > 75]);

  const barColor = pct < 0.4
    ? '#4caf50'     // green — safe
    : pct < 0.7
    ? '#ff9800'     // amber — caution
    : pct < 0.9
    ? '#f44336'     // red — danger
    : '#ff0000';    // full red + flicker — critical

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.labelRow}>
        <View style={styles.fearTitleContainer}>
          <Image source={require('../../assets/images/icon_fear_pixel.png')} style={styles.fearIcon} />
          <Text style={styles.label}>FEAR</Text>
        </View>
        <Text style={[styles.fearValue, { color: barColor }]}>{Math.round(fear)}</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
        {/* Flicker notch at 100% */}
        {isPanic && <View style={styles.panicFlash} />}
      </View>
      {fear > 75 && !isPanic && (
        <View style={styles.warningContainer}>
          <Image source={require('../../assets/images/icon_crow_v2.png')} style={styles.warningIcon} />
          <Text style={styles.warning}>
            {fear >= 95 ? 'CRITICAL — darkness closing in' : "High Fear - You're panicking! Find a way to stay calm."}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fearTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fearIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  fearValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  panicFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  warningIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  warning: {
    color: '#ff4444',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default FearMeter;
