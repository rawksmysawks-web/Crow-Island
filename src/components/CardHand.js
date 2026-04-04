/**
 * CardHand.js — Horizontal scrollable hand of cards.
 *
 * Shows the player's current hand with a subtle fan/spread layout.
 * Includes a "Draw" button to draw additional cards.
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { previewCard } from '../game/CardEffects';
import CardComponent from './CardComponent';

const CardHand = ({ hand = [], onPlay, onDraw, deckCount = 0, canDraw = true, isSwapMode = false, onToggleSwap }) => {
  const { state } = useGame();
  const { currentLevel } = state;

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✋ YOUR HAND</Text>
        <View style={styles.deckInfo}>
          <Text style={styles.deckCount}>🃏 {deckCount} left</Text>
          {canDraw && (
            <TouchableOpacity style={styles.drawButton} onPress={onDraw}>
              <Text style={styles.drawButtonText}>DRAW</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.drawButton, isSwapMode && styles.swapActiveBtn]} 
            onPress={onToggleSwap}
          >
            <Text style={styles.drawButtonText}>
              {isSwapMode ? 'CANCEL SWAP' : '🔄 SWAP (+2 😰)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      {hand.length === 0 ? (
        <View style={styles.emptyHand}>
          <Text style={styles.emptyText}>No cards in hand — draw more.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isSwapMode && (
            <Text style={styles.swapHintText}>Tap a card to discard and replace it.</Text>
          )}
          {hand.map((card, index) => (
            <CardComponent
              key={card.instanceId || `${card.id}_${index}_${Date.now()}`}
              card={card}
              onPlay={onPlay}
              previewValues={previewCard(card, state, currentLevel)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  headerTitle: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  deckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deckCount: {
    color: '#777',
    fontSize: 11,
  },
  drawButton: {
    backgroundColor: '#1a237e',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3949ab',
  },
  swapActiveBtn: {
    backgroundColor: '#b71c1c',
    borderColor: '#ff5252',
  },
  drawButtonText: {
    color: '#90caf9',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  emptyHand: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
  },
  swapHintText: {
    position: 'absolute',
    top: -20,
    left: 10,
    color: '#ff5252',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CardHand;
