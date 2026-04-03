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
  Pressable,
  Image,
} from 'react-native';
import CardComponent from './CardComponent';

const CardHand = ({ hand = [], onPlay, onDraw, deckCount = 0, canDraw = true, isSwapMode = false, onToggleSwap, onThink, onHoverCard, onUnhoverCard }) => {
  const scrollRef = React.useRef(null);
  const [scrollX, setScrollX] = React.useState(0);

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: Math.max(0, scrollX - 140), animated: true });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: scrollX + 140, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.handTitle}>CARDS LEFT: {deckCount}</Text>
        </View>

        <View style={styles.actionRowContainer}>
          <Pressable 
            style={styles.actionBtn} 
            onPress={onThink}
            onHoverIn={() => onHoverCard?.({ flavorText: 'Should I think about this?' })}
            onHoverOut={() => onUnhoverCard?.()}
          >
            <Text style={styles.actionBtnText}>🧠 TACTICAL THINK</Text>
            <Text style={styles.actionBtnSubText}>(skip turn + random effect)</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionBtn, isSwapMode && styles.swapActiveBtn]} 
            onPress={onToggleSwap}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.actionBtnText}>
                {isSwapMode ? '🚫 CANCEL SWAP' : '🔄 SWAP (+2 '}
              </Text>
              {!isSwapMode && <Image source={require('../../assets/images/icon_fear_pixel.png')} style={{width: 14, height: 14, marginLeft: 2, marginRight: 2}} />}
              {!isSwapMode && <Text style={styles.actionBtnText}>)</Text>}
            </View>
            <Text style={styles.actionBtnSubText}>
              {isSwapMode ? '(keep current hand)' : '(burn fear to replace)'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      {hand.length === 0 ? (
        <View style={styles.emptyHand}>
          <Text style={styles.emptyText}>No cards in hand — draw more.</Text>
        </View>
      ) : (
      <View style={styles.scrollWrapper}>
        {hand.length > 3 && (
          <Pressable style={[styles.arrowBtn, styles.arrowLeft]} onPress={scrollLeft}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={true} // Enabled for web feedback
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        >
          {isSwapMode && (
            <Text style={styles.swapHintText}>Tap a card to discard and replace it.</Text>
          )}
          {hand.map((card, index) => (
            <CardComponent
              key={card.instanceId || `${card.id}_${index}_${Date.now()}`}
              card={card}
              onPlay={onPlay}
              onHoverIn={() => onHoverCard?.(card)}
              onHoverOut={onUnhoverCard}
            />
          ))}
        </ScrollView>

        {hand.length > 3 && (
          <Pressable style={[styles.arrowBtn, styles.arrowRight]} onPress={scrollRight}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        )}
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0, // Reset margin since we use padding for headroom
    overflow: 'visible',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 12,
    marginBottom: 6,
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  deckCount: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  titleArea: {
    alignItems: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  handTitle: {
    color: '#ffe082',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionRowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3949ab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapActiveBtn: {
    backgroundColor: '#b71c1c',
    borderColor: '#ff5252',
  },
  actionBtnText: {
    color: '#90caf9',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionBtnSubText: {
    color: '#7986cb',
    fontSize: 9,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 40, // MASSIVE HEADROOM so cards lift INSIDE the container
    paddingBottom: 15,
    overflow: 'visible',
  },
  scrollView: {
    overflow: 'visible', // ALLOW CARDS TO LIFT OUT OF SCROLLVIEW
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
  scrollWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  arrowBtn: {
    position: 'absolute',
    top: '40%',
    width: 30,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  arrowLeft: {
    left: 2,
  },
  arrowRight: {
    right: 2,
  },
  arrowText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
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
