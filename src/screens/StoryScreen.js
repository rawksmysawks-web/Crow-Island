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
  Image,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { LEVELS } from '../data/levels';
import { LinearGradient } from 'expo-linear-gradient';
import GlobalMenu from '../components/GlobalMenu';
import BannerScene from '../components/BannerScene';


// Icons are now emojis

const STORY_TEXT = `Dispatch Log — Officer Jack Brown.

Three days ago, a torn envelope arrived at the precinct. No return address. Just a single, jagged line of ink:

"I was wrong about the island. They're not just stories. Please hurry."

Two miles offshore. A place the mainland prefers to forget. 

The local ferry dropped me at the decaying wooden dock an hour ago and immediately turned back. The air here is dead, heavy with the smell of wet earth and salt. Ahead of me sit silent, overgrown farm buildings — full of food, ready to harvest, untouched. Gates left open. No sign of where the people went.

In the food shed, scratched into every wall — marks made by something that wasn't quite human. On the floor, carved so deep the letters split the wood:

"DAY = SAFE. NIGHT = RUN."

I need to find whoever sent that message before the sun goes down.

Survive the Island. Find a way off. Don't let the shadow in the dark take you. Every choice matters. All actions have consequences.`;

const StoryScreen = () => {
  const { beginLevel, state, setScreen, setDifficulty } = useGame();
  const { difficulty } = state;
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
      {/* ── Background World (BannerScene) ────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <BannerScene bannerKey="pano_arrival" phase="day" />
      </View>
      <View style={styles.bgScrim} />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.topRightControls}>
          <GlobalMenu />
        </View>

        <View style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Dispatch Notes</Text>
            <Text style={styles.date}>Initial Entry — 5:45 PM</Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.handbookBtn} 
              onPress={() => setScreen('instructions')}
            >
               <Text style={styles.handbookBtnText}>📖 Read Dispatch Handbook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.difficultySection}>
            <Text style={styles.difficultyHeader}>Select Difficulty:</Text>
            <View style={styles.difficultyRow}>
              {['easy', 'medium', 'hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.diffBtn,
                    difficulty === diff && styles.diffBtnActive
                  ]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text style={[
                     styles.diffBtnText,
                     difficulty === diff && styles.diffBtnTextActive
                  ]}>
                    {diff === 'easy' ? 'Tourist' : diff === 'medium' ? 'Officer' : 'Abyss'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightControls: {
    position: 'absolute',
    top: 50,
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    zIndex: 1000,
  },
  controlBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
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
    fontSize: 22,
    lineHeight: 32,
    fontFamily: 'IndieFlower_400Regular',
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
  topActions: {
    marginBottom: 15,
    alignItems: 'center',
  },
  handbookBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#8b4513',
  },
  handbookBtnText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: '#2c1e14',
    textDecorationLine: 'underline',
  },
  difficultySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
  },
  difficultyHeader: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 12,
    color: '#5d4037',
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  diffBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d2b48c',
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  diffBtnActive: {
    backgroundColor: '#2c1e14',
    borderColor: '#2c1e14',
  },
  diffBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#5d4037',
  },
  diffBtnTextActive: {
    color: '#f4e4bc',
  },
});

export default StoryScreen;
