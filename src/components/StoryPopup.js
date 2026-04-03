/**
 * StoryPopup.js — In-game story event overlay.
 *
 * Shown when a story event triggers during a level.
 * Displays event title, body text, and optional asset image.
 * Dismissable by tapping "Continue".
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, Dimensions } from 'react-native';
import { useGame } from '../context/GameContext';
import { EventSVG } from './EventSVG';
import { playSFX, playISeeYou } from '../game/AudioManager';
import { EVENT_ASSETS } from '../data/assets';

// Asset map for event images (now imported from assets.js)

const ICON_FEAR     = require('../../assets/images/icon_fear_pixel.png');
const ICON_PROGRESS = require('../../assets/images/icon_progress_v2.png');
const ICON_SHIELD   = require('../../assets/images/icon_shield_v2.png');
const ICON_CROW     = require('../../assets/images/icon_crow_v2.png');
const ICON_JOURNAL = '📖';

const StoryPopup = ({ event, onDismiss, onChoice }) => {
  const { state } = useGame();
  const { phase } = state;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!event) return;

    // Trigger context-specific sound
    if (event.id === 'chapel_bell') playSFX('bell');
    else if (event.id === 'stumble' || event.id === 'farm_tractor') playSFX('thud');
    else if (event.id === 'warning_feathers' || event.id === 'crow_closer' || event.id === 'farm_crows') playSFX('crow');
    else if (event.id === 'disorientation' || event.id === 'environmental_tension') playSFX('rustle');
    else if (event.fearDelta >= 25 || event.asset === 'svg_finds_you' || event.id === 'first_silhouette') {
       playSFX('jumpscare');
       if (event.id === 'first_silhouette') playISeeYou();
    }
    else if (event.isJournal) playSFX('scribble');
    else if (event.fearDelta >= 15) playSFX('thud');
    else playSFX('rustle'); // default ambient sound for popups

    opacity.setValue(0);
    scale.setValue(0.9);
    translateY.setValue(20);
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [event?.id]);

  if (!event) return null;

  const assetSource = event.asset ? EVENT_ASSETS[event.asset] : null;

  return (
    <Animated.View style={[styles.overlay, { opacity: opacity }]}>
      <Animated.View style={[styles.popup, { transform: [{ scale: scale }, { translateY: translateY }] }]}>
        {/* ── Asset image or Icon ───────────────────────────────────── */}
        {assetSource ? (
          event.asset === 'player_tired' ? (
            <View style={styles.stumbleContainer}>
              <Image source={assetSource} style={styles.stumbleImage} />
            </View>
          ) : (
            <Image source={assetSource} style={styles.eventImage} resizeMode="contain" />
          )
        ) : event.asset && event.asset.startsWith('svg_') ? (
          <View style={styles.svgContainer}>
             <EventSVG name={event.asset} width={100} height={100} />
          </View>
        ) : event.icon ? (
          <Text style={styles.icon}>{event.icon}</Text>
        ) : null}

        {/* ── Title ────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.headerInfo}>
            {phase && <Text style={styles.phaseBadge}>PHASE: {phase?.toUpperCase()}</Text>}
            {event.timestamp && <Text style={styles.timestamp}>{event.timestamp}</Text>}
          </View>
        </View>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <Text style={styles.body}>{event.body || event.text}</Text>

        {/* ── Effect hint ──────────────────────────────────────────── */}
        {(() => {
          const effects = [];
          const fear = event.fearDelta || 0;
          const progress = event.progressDelta || 0;
          const shield = event.shieldDelta || 0;
          const crow = event.crowPressure || 0;
          const cards = event.cardRewardDelta || 0;

          if (fear !== 0) {
            effects.push({ val: `${fear > 0 ? '+' : ''}${fear}`, icon: ICON_FEAR, color: fear > 0 ? '#b71c1c' : '#2e7d32' });
          }
          if (progress !== 0) {
            effects.push({ val: `${progress > 0 ? '+' : ''}${progress}`, icon: ICON_PROGRESS, color: '#1565c0' });
          }
          if (shield !== 0) {
            effects.push({ val: `${shield > 0 ? '+' : ''}${shield}`, icon: ICON_SHIELD, color: '#283593' });
          }
          if (crow !== 0) {
            effects.push({ val: `${crow > 0 ? '+' : ''}${crow}`, icon: ICON_CROW, color: '#ef6c00' });
          }

          return (
            <>
              {effects.length > 0 && (
                <View style={styles.effectRow}>
                  {effects.map((eff, i) => (
                    <View key={i} style={styles.effectItem}>
                      <Text style={[styles.effectValue, { color: eff.color }]}>{eff.val}</Text>
                      <Image source={eff.icon} style={styles.effectIcon} />
                    </View>
                  ))}
                </View>
              )}
              {cards > 0 && (
                <View style={styles.effectItem}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>🃏</Text>
                  <Text style={[styles.effectDark, { color: '#1565c0' }]}>+{cards} Extra Card</Text>
                </View>
              )}
            </>
          );
        })()}

        {/* ── Journal indicator ─────────────────────────────────────── */}
        {event.isJournal && (
          <View style={styles.journalNoteRow}>
            <Text style={styles.journalNoteEmoji}>{ICON_JOURNAL}</Text>
            <Text style={styles.journalNote}>Added to your journal</Text>
          </View>
        )}

        {/* ── Choices ───────────────────────────────────────────────── */}
        {event.choices && event.choices.length > 0 ? (
          event.choices.map((choice, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.choiceButton} 
              onPress={() => onChoice ? onChoice(choice) : onDismiss()}
            >
              <Text style={styles.choiceButtonText}>{choice.text}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    padding: 20,
  },
  popup: {
    backgroundColor: '#f4e4bc',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#d2b48c',
    padding: 24,
    maxWidth: 380,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  eventImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  svgContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#c4a484',
    overflow: 'hidden',
  },
  stumbleContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#7a3e3e',
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stumbleImage: {
    width: '300%',
    height: '300%',
    position: 'absolute',
    top: -50,
  },
  icon: {
    fontSize: 50,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  headerInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  title: {
    color: '#2c1e14',
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1.5,
    flexShrink: 1,
    marginRight: 10,
  },
  phaseBadge: {
    fontFamily: 'Inter_900Black',
    fontSize: 10,
    color: '#5d4037',
    opacity: 0.8,
  },
  timestamp: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#5d4037',
    opacity: 0.6,
  },
  body: {
    color: '#3d2b1f',
    fontSize: 16,
    fontFamily: 'IndieFlower_400Regular',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  effectRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  effectIcon: {
    width: 14,
    height: 14,
  },
  effectDark: {
    color: '#b71c1c',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  effectValue: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginRight: 2,
  },
  journalNoteEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  journalNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  journalNoteIcon: {
    width: 14,
    height: 14,
  },
  journalNote: {
    color: '#2e7d32',
    fontSize: 14,
    fontFamily: 'IndieFlower_400Regular',
  },
  button: {
    backgroundColor: '#2c1e14',
    borderRadius: 4,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: '#f4e4bc',
    fontSize: 14,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
  },
  choiceButton: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    width: '100%',
    alignItems: 'center',
  },
  choiceButtonText: {
    color: '#2c1e14',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
});

export default StoryPopup;
