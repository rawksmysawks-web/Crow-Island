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

const ICON_CROW     = require('../../assets/images/icon_crow_v2.png');
const ICON_MOVEMENT = require('../../assets/images/icon_progress_v2.png');
const ICON_FEAR     = require('../../assets/images/icon_fear_pixel.png');
const ICON_SHIELD   = require('../../assets/images/icon_shield_v2.png');

// ── Card type art config ─────────────────────────────────────────────────────
const BG_MOVEMENT = require('../../assets/images/cards/card_art_movement.png');
const BG_LIGHT = require('../../assets/images/cards/card_art_light.png');
const BG_PROTECTION = require('../../assets/images/cards/card_art_shelter.png');
const BG_PANIC = require('../../assets/images/cards/card_art_panic.png');

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
  shelter: {
    frame:  '#003300',
    header: '#1b5e20',
    accent: '#a5d6a7',
    text:   '#e8f5e9',
    badge:  '#388e3c',
    label:  'SHELTER',
    image: BG_PROTECTION,
  },
  shield: {
    frame: '#1a237e', 
    header: '#283593', 
    accent: '#8c9eff', 
    text: '#e8eaf6', 
    badge: '#8c9eff', 
    label: 'SHIELD',
    image: require('../../assets/images/cards/card_shield.png'),
  },
  dark: {
    frame: '#212121', 
    header: '#4a148c', 
    accent: '#ea80fc', 
    text: '#f3e5f5', 
    badge: '#ea80fc', 
    label: 'PANIC', 
    image: BG_PANIC, 
  },
};

const RARITY_LABEL = { common: '•', rare: '••', legendary: '•••' };
const RARITY_COLOUR = { common: '#aaa', rare: '#ff9800', legendary: '#ffd700' };

const CardComponent = ({ card, onPlay, onSwap, disabled = false, onHoverIn, onHoverOut, previewValues = null }) => {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const hoverAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  const theme = TYPE_THEME[card.type] ?? TYPE_THEME.light;
  const isCorrupted = !!card.corrupted;
  const isDisabled = disabled || isCorrupted;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    if (card.type === 'dark') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.06, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [isDisabled, card.type]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(hoverAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();
    shakeAnim.stopAnimation();
    shakeAnim.setValue(0);
  }, []);

  const handleHoverIn = () => {
    if (isDisabled) return;
    Animated.parallel([
      Animated.spring(hoverAnim, { toValue: -15, friction: 8, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    onHoverIn?.();
  };

  const handleHoverOut = () => {
    Animated.parallel([
      Animated.spring(hoverAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
    onHoverOut?.();
  };

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    onPlay?.(card);
  }, [isDisabled, card, onPlay]);

  // ── Effect summary text ────────────────────────────────────────────────────
  const effects = [];
  const activeEffects = previewValues || card.effect;
  const { fearDelta, progressDelta, shieldDelta, crowPressure, crowPressureDelta } = activeEffects;
  const cp = crowPressure !== undefined ? crowPressure : crowPressureDelta;
  
  if (fearDelta !== 0) {
    effects.push({ 
      val: `${fearDelta > 0 ? '+' : ''}${Math.round(fearDelta)}`, 
      icon: ICON_FEAR 
    });
  }
  if (progressDelta !== 0) {
    effects.push({ 
      val: `${progressDelta > 0 ? '+' : ''}${Math.round(progressDelta)}`, 
      icon: ICON_MOVEMENT 
    });
  }
  if (shieldDelta > 0) {
    effects.push({ 
      val: `+${Math.round(shieldDelta)}`, 
      icon: ICON_SHIELD 
    });
  }
  if (cp !== 0 && cp !== undefined) {
    effects.push({ 
      val: `${cp > 0 ? '+' : ''}${Math.round(cp)}`, 
      icon: ICON_CROW 
    });
  }

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.wrapper, 
        { 
          transform: [
            { scale: scaleAnim }, 
            { translateY: hoverAnim },
            { rotate: rotation },
            { translateX: card.type === 'dark' ? translateX : 0 }
          ] 
        }
      ]}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.frame, borderColor: theme.accent },
          isCorrupted && styles.corrupted,
        ]}
        onPress={handlePress}
        onLongPress={() => onSwap?.(card)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
        delayLongPress={600}
      >
        {/* ── Header Image ─────────────────────────────────────────── */}
        {theme.image && (
           <View style={styles.artContainer}>
             <Image 
               source={card.image || theme.image} 
               style={[
                 styles.cardArt, 
                 card.type === 'dark' && { transform: [{ scale: 1.15 }] }
               ]} 
               resizeMode="cover" 
             />
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
          {RARITY_LABEL[card.rarity] ?? '•'}
        </Text>

        {/* ── Description ──────────────────────────────────────────── */}
        <Text style={[styles.description, { color: theme.text }]} numberOfLines={3}>
          {isCorrupted ? 'CORRUPTED — Cannot be played this turn.' : card.description}
        </Text>

        {/* ── Effects row ──────────────────────────────────────────── */}
        <View style={styles.effectRow}>
          {effects.map((eff, i) => (
            <View key={i} style={styles.effectChip}>
              <Text style={[styles.effectText, { color: theme.accent }]}>{eff.val}</Text>
              <Image source={eff.icon} style={styles.chipEmoji} />
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
    marginHorizontal: 3, 
    overflow: 'visible', 
  },
  card: {
    flex: 1,
    minWidth: 110,
    maxWidth: 140,
    minHeight: 180,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'visible',
    paddingBottom: 8,
    backgroundColor: '#000',
  },
  artContainer: {
    width: '100%',
    height: 55,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  effectText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    marginRight: 2,
  },
  chipEmoji: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 2,
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
