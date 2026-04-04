/**
 * CardComponent.js — Individual card rendering.
 *
 * Displays a card with:
 *   - Type-based frame colour (light = amber/gold, dark = deep purple/red, shelter = green)
 *   - Card name, description, flavour text
 *   - Effect icons (fear change, progress change)
 *   - Rarity indicator (common/rare/legendary)
 *   - Corrupted state (greyed out, locked)
 *   - Tap-to-play with spring lift animation
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

// ── Card type colour config (edit here to restyle card types) ─────────────────
const BG_MOVEMENT = require('../../assets/images/cards/card_movement.png');
const BG_LIGHT = require('../../assets/images/cards/card_light.png');
const BG_SHIELD = require('../../assets/images/cards/card_shield.png');

const TYPE_THEME = {
  light: {
    frame:  '#3d2b00',
    header: '#c8860a',
    accent: '#ffe082',
    text:   '#fff8e1',
    badge:  '#ffb300',
    label:  'LIGHT',
    image: BG_LIGHT,
  },
  movement: {
    frame:  '#001f3f',
    header: '#0056b3',
    accent: '#80c0ff',
    text:   '#e6f2ff',
    badge:  '#3399ff',
    label:  'MOVEMENT',
    image: BG_MOVEMENT,
  },
  // The existing 'dark' type is being replaced by the new structure.
  // The existing 'shield' type is being replaced by the new structure.
  shelter: {
    frame:  '#003300',
    header: '#1b5e20',
    accent: '#a5d6a7',
    text:   '#e8f5e9',
    badge:  '#388e3c',
    label:  'SHELTER',
    image: BG_SHIELD,
  },
  shield: {
    frame: '#1a237e', 
    header: '#283593', 
    accent: '#8c9eff', // Lighter purple for visibility
    text: '#e8eaf6', 
    badge: '#8c9eff', // Contrast against header
    label: 'SHIELD',
    image: require('../../assets/images/cards/card_shield.png'),
  },
  dark: {
    frame: '#212121', 
    header: '#4a148c', 
    accent: '#ea80fc', 
    text: '#f3e5f5', 
    badge: '#ea80fc', 
    label: 'PANIC', // Changed from DARK to PANIC for consistency
    image: null, 
  },
};

// ── Rarity stars ──────────────────────────────────────────────────────────────
const RARITY_STARS = { common: '★', rare: '★★', legendary: '★★★' };
const RARITY_COLOUR = { common: '#aaa', rare: '#ff9800', legendary: '#ffd700' };

const CardComponent = ({ card, onPlay, disabled = false, previewValues = null }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current; // For dark card shake

  const theme = TYPE_THEME[card.type] ?? TYPE_THEME.light;
  const isCorrupted = !!card.corrupted;
  const isDisabled = disabled || isCorrupted;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1.06,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
    if (card.type === 'dark') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [isDisabled, card.type]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    shakeAnim.stopAnimation(); // Stop shake animation on press out
    shakeAnim.setValue(0);
  }, []);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    onPlay?.(card);
  }, [isDisabled, card, onPlay]);

  // ── Effect summary text ────────────────────────────────────────────────────
  const effectBits = [];
  const activeEffects = previewValues || card.effect;
  const { fearDelta, progressDelta, shieldDelta, crowPressure, crowPressureDelta } = activeEffects;
  const cp = crowPressure !== undefined ? crowPressure : crowPressureDelta;

  if (fearDelta !== 0)    effectBits.push(`${fearDelta > 0 ? '+' : ''}${fearDelta} 😰`);
  if (progressDelta !== 0) effectBits.push(`${progressDelta > 0 ? '+' : ''}${progressDelta} 👣`);
  if (shieldDelta > 0)    effectBits.push(`+${shieldDelta} 🛡`);
  if (cp > 0)   effectBits.push(`+${cp} 🐦`);

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2], // Small shake left and right
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }, { translateX: card.type === 'dark' ? translateX : 0 }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.frame, borderColor: theme.accent },
          isCorrupted && styles.corrupted,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
      >
        {/* ── Header Image ─────────────────────────────────────────── */}
        {theme.image && (
           <View style={styles.artContainer}>
             <Image source={theme.image} style={styles.cardArt} resizeMode="cover" />
             <View style={styles.artOverlay} /> 
           </View>
        )}

        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.cardName, { color: theme.accent }]} numberOfLines={1}>
            {card.name}
          </Text>
          <Text style={[styles.typeBadge, { color: theme.badge }]}>
            {theme.label}
          </Text>
        </View>

        {/* ── Rarity ───────────────────────────────────────────────── */}
        <Text style={[styles.rarity, { color: RARITY_COLOUR[card.rarity] }]}>
          {RARITY_STARS[card.rarity] ?? '★'}
        </Text>

        {/* ── Description ──────────────────────────────────────────── */}
        <Text style={[styles.description, { color: theme.text }]} numberOfLines={3}>
          {isCorrupted ? '⚠️ CORRUPTED — Cannot be played this turn.' : card.description}
        </Text>

        {/* ── Effects row ──────────────────────────────────────────── */}
        <View style={styles.effectRow}>
          {effectBits.map((bit, i) => (
            <View key={i} style={[styles.effectChip, { borderColor: theme.accent }]}>
              <Text style={[styles.effectText, { color: theme.accent }]}>{bit}</Text>
            </View>
          ))}
        </View>

        {/* ── Flavour text ─────────────────────────────────────────── */}
        {!isCorrupted && (
          <Text style={styles.flavour} numberOfLines={2}>
            {card.flavorText}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 5,
  },
  card: {
    flex: 1,
    minWidth: 110,
    maxWidth: 140,
    minHeight: 180,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  artContainer: {
    width: '100%',
    height: 55,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.5)',
  },
  cardArt: {
    width: '100%',
    height: '100%',
  },
  artOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  corrupted: {
    opacity: 0.45,
    borderColor: '#444',
  },
  header: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    flex: 1,
  },
  typeBadge: {
    fontSize: 7,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
  rarity: {
    fontSize: 10,
    paddingHorizontal: 8,
    marginTop: 3,
  },
  description: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 8,
    marginTop: 4,
    lineHeight: 14,
  },
  effectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginTop: 6,
    gap: 3,
  },
  effectChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  effectText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  flavour: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular_Italic',
    color: '#888',
    paddingHorizontal: 8,
    marginTop: 5,
    lineHeight: 12,
  },
});

export default CardComponent;
