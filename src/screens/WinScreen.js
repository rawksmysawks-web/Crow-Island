/**
 * WinScreen.js — Victory screen with multiple endings.
 * 
 * RESTORED V2 VERSION.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import JourneyTimeline from '../components/JourneyTimeline';
import JournalScreen from './JournalScreen';
import BannerScene from '../components/BannerScene';
import GlobalMenu from '../components/GlobalMenu';
import { stopBackgroundMusic } from '../game/AudioManager';

const PLAYER = require('../../assets/images/player_tired.png');
const TRUE_ENDING_BOAT = require('../../assets/images/true_ending_boat.png');
const CROW   = require('../../assets/images/crow_silhouette.png');

const ENDINGS = {
  good: {
    title: 'ESCAPED',
    subtitle: 'The island let you go.',
    body: 'Your boat hits the mainland dock as the first light of morning breaks the horizon. You look back. Crow Island is quiet. Just an island.\n\nYou write your report. Nobody believes you.\n\nJack Brown is fine. He is absolutely fine.',
    colour: '#001a1a',
    accent: '#004d40',
    textAccent: '#a5d6a7',
    stars: '•••',
    starLabel: 'Perfect Escape',
    image: TRUE_ENDING_BOAT,
  },
  escape: {
    title: 'SURVIVED',
    subtitle: 'Barely. But you made it.',
    body: 'You collapse onto the dock. The creature stopped at the waterline — whatever it is, the sea holds it on the island.\n\nYou made it off. But you left something behind on Crow Island.\n\nYou\'re not quite sure what.',
    colour: '#0a0a1a',
    accent: '#1565c0',
    textAccent: '#90caf9',
    stars: '••',
    starLabel: 'Narrow Escape',
    image: TRUE_ENDING_BOAT,
  },
  dark: {
    title: 'FREE?',
    subtitle: 'You got off the island.',
    body: 'The mainland. Lights. People. Normal things.\n\nBut when you catch your reflection, your eyes are wrong. You keep looking over your shoulder. At night, you hear wings.\n\nCrow Island doesn\'t let go. Not really.',
    colour: '#0d0000',
    accent: '#4a148c',
    textAccent: '#ce93d8',
    stars: '•',
    starLabel: 'Dark Ending',
    image: CROW,
  },
  true: {
    title: 'THE TRUTH',
    subtitle: 'You found everything.',
    body: 'You didn\'t just escape. You found the truth. The message wasn\'t a cry for help; it was a lure. But as you push the boat away, the evidence in your pocket feels like a heavy secret.\n\nCrow Island is not finished with you, but you are finished with it.',
    colour: '#000814',
    accent: '#ffcc00',
    textAccent: '#ffe082',
    stars: '•••••',
    starLabel: 'True Ending',
    image: TRUE_ENDING_BOAT,
  },
};

const WinScreen = () => {
  const { state, restart } = useGame();
  const { ending, fear, lastAction } = state;

  const endingKey = ending ?? 'escape';
  const e = ENDINGS[endingKey] ?? ENDINGS.escape;

  const [showTimeline, setShowTimeline] = React.useState(false);
  const [showJournal, setShowJournal] = React.useState(false);

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    stopBackgroundMusic();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: e.colour }]}>
      <View style={StyleSheet.absoluteFill}>
        <BannerScene bannerKey="pano_escape" phase="day" />
      </View>
      
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <GlobalMenu />

        <View style={styles.imageWrap}>
          <Image 
            source={e.image} 
            style={[
              styles.image,
              (endingKey !== 'dark') && { transform: [{ scale: 1.2 }] }
            ]} 
            resizeMode="contain" 
          />
        </View>

        <Animated.Text
          style={[
            styles.title,
            { color: e.textAccent, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {e.title}
        </Animated.Text>

        <Text style={[styles.subtitle, { color: e.textAccent }]}>{e.subtitle}</Text>

        <View style={[styles.starRow, { borderColor: e.accent }]}>
          <Text style={[styles.stars, { color: e.textAccent }]}>{e.stars}</Text>
          <Text style={[styles.starLabel, { color: e.textAccent }]}>{e.starLabel}</Text>
        </View>

        <Text style={styles.body}>{e.body}</Text>

        <View style={styles.detailsArea}>
           <Text style={styles.fearNote}>Final fear: {Math.round(fear)}/100</Text>
           {lastAction && (
             <Text style={styles.lastActionText}>Last Action: {lastAction}</Text>
           )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { borderColor: e.accent, backgroundColor: e.colour }]}
            onPress={restart}
          >
            <Text style={[styles.buttonText, { color: e.textAccent }]}>
              Play Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { borderColor: e.accent, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => setShowTimeline(true)}
          >
            <Text style={[styles.buttonText, { color: e.textAccent }]}>
              Review Journey
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creditsArea}>
          <Text style={styles.creditText}>Based on a short story written by Tyler James Hamilton.</Text>
          <Text style={styles.creditText}>Created for Dancer.Digital • Music by DELOSound</Text>
        </View>
      </Animated.View>

      {showTimeline && (
        <JourneyTimeline 
          log={state.journeyLog} 
          onClose={() => setShowTimeline(false)} 
          onOpenJournal={() => {
            setShowTimeline(false);
            setShowJournal(true);
          }}
        />
      )}
      {showJournal && (
        <JournalScreen onCloseOverride={() => setShowJournal(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  imageWrap: {
    width: 200,
    height: 180,
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    opacity: 0.85,
  },
  title: {
    fontSize: 38,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  starRow: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stars: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  starLabel: {
    fontSize: 11,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
  body: {
    color: '#bbb',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  detailsArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fearNote: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'Inter_400Regular_Italic',
  },
  lastActionText: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1.5,
  },
  creditsArea: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.5,
  },
  creditText: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default WinScreen;
