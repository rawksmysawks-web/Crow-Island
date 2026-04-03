/**
 * GameScreen.js — Main card game UI.
 *
 * Layout (top to bottom):
 *   1. BannerScene          — animated atmospheric header
 *   2. LevelProgress        — level name, phase badge, progress/crow bars
 *   3. FearMeter            — fear gauge
 *   4. Card message strip   — last played card feedback
 *   5. CardHand             — playable hand
 *   6. Pause button         — top-right corner
 *   7. StoryPopup overlay   — conditional event popup
 *   8. PanicMinigame overlay— conditional panic event
 *   9. Shield indicator     — if shield > 0
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useGame } from '../context/GameContext';
import BannerScene from '../components/BannerScene';
import FearMeter from '../components/FearMeter';
import LevelProgress from '../components/LevelProgress';
import PlayerAvatar from '../components/PlayerAvatar';
import CardHand from '../components/CardHand';
import StoryPopup from '../components/StoryPopup';
import DiscoveryToast from '../components/DiscoveryToast';
import { LinearGradient } from 'expo-linear-gradient';
import { updateHeartbeat, updateAmbience, playSFX, playISeeYou } from '../game/AudioManager';
import { CLUES } from '../data/clues';
const GameScreen = () => {
  const {
    state,
    playCard,
    drawMoreCards,
    swapCard,
    think,
    togglePause,
    toggleJournal,
    toggleMute,
    dismissEvent,
    makeChoice,
    hoverCard,
    unhoverCard,
    setScreen,
  } = useGame();

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevStats = useRef({ fear: 0, crow: 0, clues: 0 });
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastClueFound, setLastClueFound] = useState(null);

  const {
    currentLevel,
    phase,
    fear,
    crowPressure,
    progress,
    shield,
    hand,
    deck,
    isHallucinating,
    activeEvent,
    cardMessage,
    hoverMessage,
    isReducedVis,
    isMuted,
  } = state;

  useEffect(() => {
    let anim;
    if (fear > 80 || isHallucinating) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(0);
    }
    return () => anim?.stop();
  }, [fear, isHallucinating, pulseAnim]); // Added pulseAnim to dependencies
  
  // ── Screen Shake detection ─────────────────────────────────────────
  useEffect(() => {
    const fearDiff = fear - prevStats.current.fear;
    const crowDiff = crowPressure - prevStats.current.crow;
    
    if (fearDiff >= 15 || crowDiff >= 15) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    prevStats.current.fear = fear;
    prevStats.current.crow = crowPressure;
  }, [fear, crowPressure, shakeAnim]);

  // ── Clue Discovery Detection ──────────────────────────────────────
  useEffect(() => {
    const currentClueCount = state.clues?.length || 0;
    if (currentClueCount > prevStats.current.clues) {
      const clueId = state.clues[currentClueCount - 1];
      const clueData = CLUES[clueId];
      if (clueData) {
        setLastClueFound(clueData.title);
        playSFX('bell'); // Use church bell for discovery
      }
    }
    prevStats.current.clues = currentClueCount;
  }, [state.clues]);
  
  // ── Dynamic Audio Updates ──────────────────────────────────────────
  useEffect(() => {
    updateHeartbeat(fear);
  }, [fear]);

  useEffect(() => {
    const maxCrow = currentLevel?.crowMaxPressure || 20;
    if (crowPressure >= maxCrow * 0.75) {
      playISeeYou();
    }
  }, [crowPressure, currentLevel]);

  // Trigger audio on story events involving the enemy
  useEffect(() => {
    if (activeEvent?.asset === 'enemy') {
      playISeeYou();
    }
  }, [activeEvent]);

  useEffect(() => {
    if (state.crowPressure >= 85) {
      playISeeYou();
    }
  }, [state.crowPressure]);

  useEffect(() => {
    if (currentLevel?.id) {
      updateAmbience(currentLevel.id);
    }
  }, [currentLevel?.id]);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const pulseColor = isHallucinating ? 'rgba(123, 31, 162, 0.3)' : 'rgba(211, 47, 47, 0.3)';

  const handlePlayCard = useCallback((card) => {
    if (isSwapMode) {
      swapCard(card.instanceId);
      setIsSwapMode(false);
    } else {
      playCard(card);
      // Always play card snap for consistency and to prevent overlapping with StoryPopup events
      playSFX('card');
    }
  }, [playCard, swapCard, isSwapMode]);

  const handleDraw = useCallback(() => {
    drawMoreCards(1);
    playSFX('draw');
  }, [drawMoreCards]);

  if (!currentLevel) return null;

  // Hallucination: invert colours on entire screen
  const hallucinateStyle = isHallucinating
    ? { backgroundColor: '#2d003a' }
    : {};

  // Reduced visibility: dark overlay
  const visStyle = isReducedVis
    ? { backgroundColor: 'rgba(0,0,0,0.45)' }
    : {};

  const getPortrait = () => {
    if (isHallucinating) return '😱';
    if (fear > 80) return '😱';
    if (fear > 50) return '😰';
    if (fear > 20) return '😐';
    return '🙂';
  };

  // Player avatar assets (Migrated to PlayerAvatar component)

  const ICON_PAUSE       = require('../../assets/images/icon_pause.png');
  const ICON_SHIELD      = require('../../assets/images/icon_shield_v2.png');
  const ICON_TACTICAL    = require('../../assets/images/icon_tactical.png');

  return (
    <View style={[styles.safe, hallucinateStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Animated.View style={{ flex: 1, transform: [{ translateX: shakeAnim }] }}>
        {/* ── Animated background world (Static) ────────────────────── */}
        <View style={StyleSheet.absoluteFill}>
          <BannerScene 
            phase={phase} 
            isHallucinating={isHallucinating} 
            fear={fear}
            levelNumber={currentLevel.number}
            progress={progress}
            bannerKey={currentLevel.bannerKey}
            isPaused={!!activeEvent}
          />
        </View>

        {/* ── Dark overlay (reduced visibility effect) ────────────────── */}
        {isReducedVis && <View style={styles.darkOverlay} pointerEvents="none" />}

        {/* ── High Fear / Hallucination Pulse ────────────────────────── */}
        {(fear > 80 || isHallucinating) && (
          <Animated.View 
            style={[
              StyleSheet.absoluteFill, 
              { backgroundColor: pulseColor, opacity: pulseOpacity, zIndex: 100 }
            ]} 
            pointerEvents="none" 
          />
        )}

        {/* ── TOP RIGHT: MENU ── */}
        <View style={styles.topRightControls}>
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
                onPress={() => { togglePause(); setIsMenuOpen(false); }}
              >
                <Image source={ICON_PAUSE} style={styles.controlIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── BOTTOM CONSOLIDATED REGION ─────────────────────────────── */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
          locations={[0, 0.4, 1]}
          style={styles.bottomRegion}
        >
          
          {/* Avatar reacting to journey, anchored to the top of the region */}
          <View style={styles.avatarReacting}>
            <PlayerAvatar 
              fear={fear} 
              isHallucinating={isHallucinating} 
              size={64}
              style={styles.avatarRefined}
            />
            {(hoverMessage || cardMessage || state.jackThought) && (
              <View style={styles.thoughtBubble}>
                <View style={styles.bubbleTail} />
                <Text style={styles.thoughtText}>
                  {hoverMessage || cardMessage || state.jackThought}
                </Text>
              </View>
            )}
          </View>

          {/* Unified Info Block (Location + Bars + Fear) */}
          <View style={styles.infoBlockUnified}>
            <LevelProgress
              progress={progress}
              levelName={currentLevel.name}
              clueCount={state.clues.length}
              phase={phase}
              shelterNodes={currentLevel.shelterNodes ?? []}
              crowPressure={crowPressure}
              crowMax={currentLevel.crowMaxPressure}
            />
            <View style={styles.fearRowBottom}>
              <FearMeter fear={fear} />
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.bottomControlsRow}>
            <View style={styles.shieldArea}>
              {shield > 0 && (
                <View style={styles.shieldRow}>
                  {Array.from({ length: shield }).map((_, i) => (
                    <Image key={i} source={require('../../assets/images/icon_shield_v2.png')} style={styles.shieldIcon} />
                  ))}
                  <Text style={styles.shieldText}> Shield active</Text>
                </View>
              )}
            </View>
          </View>

          {/* Card hand */}
          <CardHand
            hand={hand}
            onPlay={handlePlayCard}
            onDraw={handleDraw}
            deckCount={deck.length}
            canDraw={hand.length < (currentLevel.handSize ?? 5)}
            isSwapMode={isSwapMode}
            onToggleSwap={() => setIsSwapMode(!isSwapMode)}
            onThink={think}
            onHoverCard={hoverCard}
            onUnhoverCard={unhoverCard}
          />
        </LinearGradient>

        <DiscoveryToast 
          visible={!!lastClueFound} 
          message={lastClueFound} 
          onHide={() => setLastClueFound(null)} 
        />
      </Animated.View>

      {/* ── Story Popup Overlay ──────────────────────────────────────── */}
      {activeEvent && (
        <StoryPopup 
          event={activeEvent} 
          onDismiss={() => dismissEvent()} 
          onChoice={(c) => makeChoice(c)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  topRightControls: {
    position: 'absolute',
    top: 55,
    right: 8,
    zIndex: 1000,
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
    top: -2, // Optical centering
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
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  avatarReacting: {
    position: 'absolute',
    bottom: '100%', // Stable anchor above the gradient region
    left: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  avatarRefined: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  zoomContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitSprite: {
    width: '100%',
    height: '100%',
  },
  thoughtBubble: {
    backgroundColor: 'rgba(244, 228, 188, 0.72)',
    padding: 14,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#c4a484',
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  bubbleTail: {
    position: 'absolute',
    top: 25, 
    left: -12, 
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: '#c4a484',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.72,
  },
  thoughtText: {
    color: '#2c1e14',
    fontSize: 16,
    fontFamily: 'IndieFlower_400Regular',
    lineHeight: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  bottomRegion: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0, // Remove solid border for seamless blending
    paddingTop: 30, // Extra headroom for the transparent fade
    paddingBottom: 20,
    overflow: 'visible', 
    zIndex: 300,
  },
  infoBlockUnified: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fearRowBottom: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  shieldArea: {
    flex: 1,
  },
  thinkBtn: {
    backgroundColor: '#37474f',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#546e7a',
  },
  thinkBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
  },
  thinkBtnSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconImg: {
    width: 14,
    height: 14,
    marginRight: 2,
  },
  shieldText: {
    color: '#90caf9',
    fontSize: 11,
    fontWeight: 'bold',
  },
  thinkBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  thinkIcon: {
    width: 14,
    height: 14,
  },
  shieldIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginRight: 4,
  },
});

export default GameScreen;
