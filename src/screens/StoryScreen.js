/**
 * StoryScreen.js — Opening narration screen.
 *
 * Displays the story setup with typewriter-style reveal.
 * Player taps "I understand" to proceed to Level 1 intro.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';

const STORY_TEXT = `You are Police Officer Jack Brown.

Three days ago you received a message. It came from Crow Island — a small, ignored scrap of land two miles offshore. The message said only one thing:

"Come. Please."

No name. No number. You came anyway. That's what you do.

The ferry dropped you at a wooden dock. The boat is gone now. You're alone on the island.

There are farms here — full of food, ready to harvest, untouched. Gates left open. Buildings empty. No sign of where the people went.

As you searched, the day began to fade.

In the food shed, scratched into every wall — marks made by something that wasn't quite human. On the floor, carved so deep the letters split the wood:

"DAY = SAFE. NIGHT = RUN."

You didn't understand. Not then.

Now the sun is going down. 

You hear a CAW and then everything fades to black. You awaken, dazed, confused, surrounded by giant large feathers... wait are those bones?

You feel a chill... let's get out of here.

Survive the Island. Find a way off. Don't let the shadow in the dark take you. Every choice matters. All actions have consequences.`;

const StoryScreen = () => {
  const { beginLevel, state, toggleMute } = useGame();
  const { isMuted } = state;
  const [visible, setVisible]     = useState(false);
  const fadeAnim                  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setVisible(true));
  }, []);

  const handleContinue = () => {
    beginLevel(LEVELS[0]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* ── Mute Toggle (Top Right) ────────────────────────────── */}
        <TouchableOpacity style={styles.muteBtn} onPress={toggleMute}>
          <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        <View style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Dispatch Notes</Text>
            <Text style={styles.date}>Officer Jack Brown — 6:00 PM</Text>
          </View>
          
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.body}>{STORY_TEXT}</Text>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Close Journal & Begin</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteBtn: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 100,
  },
  muteIcon: {
    fontSize: 24,
  },
  page: {
    backgroundColor: '#f4e4bc',
    width: '100%',
    maxWidth: 500,
    height: '90%',
    borderRadius: 4,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#d2b48c',
  },
  pageHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#2c1e14',
    fontSize: 24,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  date: {
    color: '#5d4037',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  body: {
    color: '#2c1e14',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular_Italic',
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#2c1e14',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#f4e4bc',
    fontSize: 14,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
});

export default StoryScreen;
