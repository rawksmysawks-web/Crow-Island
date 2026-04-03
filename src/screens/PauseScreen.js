/**
 * PauseScreen.js — Pause overlay.
 *
 * Semi-transparent overlay shown when the game is paused.
 * Options: Resume, Restart, (future: Journal/Settings).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useGame } from '../context/GameContext';
import InstructionsScreen from './InstructionsScreen';

const ICON_PAUSE       = require('../../assets/images/icon_pause.png');
const ICON_JOURNAL     = require('../../assets/images/icon_journal.png');

const PauseScreen = () => {
  const { state, togglePause, toggleJournal, restart, toggleMute } = useGame();
  const { isMuted } = state;
  const levelName = state.currentLevel?.name ?? '';
  const [showInstructions, setShowInstructions] = React.useState(false);

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.popup}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <Image source={ICON_PAUSE} style={styles.headerIcon} />
          <Text style={styles.title}>PAUSED</Text>
        </View>

        <View style={styles.topRightControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
            <Text style={{ fontSize: 24 }}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleJournal}>
            <Text style={{ fontSize: 24 }}>📖</Text>
          </TouchableOpacity>
        </View>
        {levelName ? (
          <Text style={styles.levelLabel}>{levelName}</Text>
        ) : null}
        <View style={styles.divider} />

        {/* ── Stats summary ─────────────────────────────────────────── */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fear</Text>
          <Text style={styles.statValue}>{Math.round(state.fear)}/100</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={styles.statValue}>{Math.round(state.progress)}%</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Shield</Text>
          <Text style={styles.statValue}>{state.shield}</Text>
        </View>

        <View style={styles.divider} />

        {/* ── Journal Button ─────────────────────────────────────────── */}
        <TouchableOpacity style={styles.journalButton} onPress={toggleJournal}>
          <View style={styles.buttonRow}>
            <Image source={ICON_JOURNAL} style={styles.buttonIcon} />
            <Text style={styles.journalText}>
              View Journal ({state.journal.length} found)
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.resumeButton} onPress={togglePause}>
          <Text style={styles.resumeText}>RESUME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.instructionsButton} onPress={() => setShowInstructions(true)}>
          <Text style={styles.instructionsText}>HOW TO PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => {
            restart();
          }}
        >
          <Text style={styles.restartText}>Restart from Beginning</Text>
        </TouchableOpacity>
      </View>
      {showInstructions && (
        <InstructionsScreen onClose={() => setShowInstructions(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4000,
  },
  popup: {
    backgroundColor: '#0d0d24',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2a1a4a',
    padding: 28,
    width: '80%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  topRightControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  controlBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    color: '#ffe082',
    fontSize: 22,
    letterSpacing: 3,
  },
  levelLabel: {
    fontFamily: 'Inter_400Regular',
    color: '#777',
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#2a1a4a',
    marginVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    color: '#888',
    fontSize: 13,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    color: '#ccc',
    fontSize: 13,
  },
  journalButton: {
    backgroundColor: '#1a237e',
    borderColor: '#3949ab',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  journalText: {
    fontFamily: 'Inter_700Bold',
    color: '#4caf50',
    fontSize: 12,
  },
  resumeButton: {
    backgroundColor: '#1a0030',
    borderWidth: 2,
    borderColor: '#7b1fa2',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  resumeText: {
    fontFamily: 'Inter_700Bold',
    color: '#ce93d8',
    fontSize: 15,
    letterSpacing: 1,
  },
  instructionsButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  instructionsText: {
    fontFamily: 'Inter_700Bold',
    color: '#aaa',
    fontSize: 13,
    letterSpacing: 1,
  },
  restartButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  restartText: {
    fontFamily: 'Inter_400Regular',
    color: '#555',
    fontSize: 13,
  },
});

export default PauseScreen;
