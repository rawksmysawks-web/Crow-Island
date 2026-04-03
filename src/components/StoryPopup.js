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

// Asset map for event images (add more here as story expands)
const EVENT_ASSETS = {
  player:   require('../../assets/images/player_sprite.png'),
  enemy:    require('../../assets/images/enemy.png'),
  campfire: require('../../assets/images/campfire.png'),
  scratched_floor: require('../../assets/images/start_floor.png'),
  paper_clue: require('../../assets/images/paper_clue.png'),
  player_tired: require('../../assets/images/player_tired.png'),
  event_dock: require('../../assets/images/event_dock.png'),
  event_path: require('../../assets/images/event_path.png'),
  event_shore: require('../../assets/images/event_shore.png'),
  event_silence: require('../../assets/images/event_silence.png'),
  event_photo: require('../../assets/images/event_photo.png'),
  event_tractor: require('../../assets/images/event_tractor.png'),
  event_crows: require('../../assets/images/event_crows.png'),
  event_shed: require('../../assets/images/event_shed.png'),
  event_map: require('../../assets/images/event_map.png'),
  event_scratches: require('../../assets/images/event_scratches.png'),
  event_floorboards: require('../../assets/images/events/event_floorboards.png'),
  event_scratching: require('../../assets/images/events/event_scratching.png'),
  event_locket: require('../../assets/images/events/event_locket.png'),
  event_feathers: require('../../assets/images/events/event_feathers.png'),
  event_totem: require('../../assets/images/events/event_totem.png'),
  event_red_sky: require('../../assets/images/events/event_red_sky.png'),
  event_bell: require('../../assets/images/events/event_bell.png'),
  event_old_map: require('../../assets/images/events/event_old_map.png'),
  event_lost: require('../../assets/images/events/event_lost.png'),
  event_first_steps: require('../../assets/images/events/event_first_steps.png'),
  event_ash: require('../../assets/images/events/event_ash.png'),
  event_see_it: require('../../assets/images/events/event_see_it.png'),
  event_ledger: require('../../assets/images/events/event_ledger.png'),
  event_script: require('../../assets/images/events/event_script.png'),
  event_wings: require('../../assets/images/events/event_wings.png'),
  event_message: require('../../assets/images/events/event_message.png'),
  event_it_comes: require('../../assets/images/events/event_it_comes.png'),
  event_stumble: require('../../assets/images/events/event_stumble.png'),
  event_rustling: require('../../assets/images/events/event_rustling.png'),
  event_supplies: require('../../assets/images/events/event_supplies.png'),
};

const ICON_FEAR = require('../../assets/images/icon_fear_pixel.png');
const ICON_CROW = require('../../assets/images/icon_crow_v2.png');
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
        {(event.fearDelta !== 0 || event.crowPressure !== 0 || event.cardRewardDelta) && (
          <View style={styles.effectRow}>
            {event.fearDelta > 0 && (
              <View style={styles.effectItem}>
                <Image source={ICON_FEAR} style={styles.effectIcon} />
                <Text style={styles.effectDark}>+{event.fearDelta} Fear</Text>
              </View>
            )}
            {event.fearDelta < 0 && (
              <View style={styles.effectItem}>
                <Image source={ICON_FEAR} style={styles.effectIcon} />
                <Text style={[styles.effectDark, { color: '#2e7d32' }]}>{event.fearDelta} Fear</Text>
              </View>
            )}
            {event.crowPressure > 0 && (
              <View style={styles.effectItem}>
                <Image source={ICON_CROW} style={styles.effectIcon} />
                <Text style={styles.effectDark}>+{event.crowPressure} Pressure</Text>
              </View>
            )}
            {event.cardRewardDelta > 0 && (
              <View style={styles.effectItem}>
                <Text style={{ fontSize: 14, marginRight: 4 }}>🃏</Text>
                <Text style={[styles.effectDark, { color: '#1565c0' }]}>+{event.cardRewardDelta} Extra Card</Text>
              </View>
            )}
          </View>
        )}

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
