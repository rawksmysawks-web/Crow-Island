/**
 * MainNavigation.js — Screen router.
 *
 * Uses GameContext `state.screen` to determine which screen to render.
 * No stack navigator needed — all screens are full-screen overlays/swaps
 * driven by the game state machine in GameContext.
 *
 * Screen routing:
 *   title       → TitleScreen
 *   story       → StoryScreen
 *   level_intro → LevelIntroScreen
 *   game        → GameScreen  (+ PauseScreen overlay if state.screen === 'pause')
 *   pause       → GameScreen + PauseScreen overlay
 *   game_over   → GameOverScreen
 *   win         → WinScreen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGame } from './context/GameContext';

import TitleScreen       from './screens/TitleScreen';
import StoryScreen       from './screens/StoryScreen';
import LevelIntroScreen  from './screens/LevelIntroScreen';
import GameScreen        from './screens/GameScreen';
import PauseScreen       from './screens/PauseScreen';
import GameOverScreen    from './screens/GameOverScreen';
import JournalScreen     from './screens/JournalScreen';
import WinScreen         from './screens/WinScreen';
import InstructionsScreen from './screens/InstructionsScreen';

const MainNavigation = () => {
  const { state } = useGame();
  const { screen } = state;

  return (
    <View style={styles.root}>
      {/* ── Title ─────────────────────────────────────────────────────── */}
      {screen === 'title' && <TitleScreen />}

      {/* ── Opening story ─────────────────────────────────────────────── */}
      {screen === 'story' && <StoryScreen />}

      {/* ── Instructions / Handbook ───────────────────────────────────── */}
      {screen === 'instructions' && <InstructionsScreen />}

      {/* ── Level intro ───────────────────────────────────────────────── */}
      {screen === 'level_intro' && <LevelIntroScreen />}

      {/* ── Main game (always mount when game or paused, pause is overlay) ── */}
      {(screen === 'game' || screen === 'pause' || screen === 'journal') && (
        <View style={StyleSheet.absoluteFill}>
          <GameScreen />
          {screen === 'pause' && <PauseScreen />}
          {screen === 'journal' && <JournalScreen />}
        </View>
      )}

      {/* ── Game over ─────────────────────────────────────────────────── */}
      {screen === 'game_over' && <GameOverScreen />}

      {/* ── Win ───────────────────────────────────────────────────────── */}
      {screen === 'win' && <WinScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default MainNavigation;
