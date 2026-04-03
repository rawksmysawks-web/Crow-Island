import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import BannerScene from '../components/BannerScene';


const InstructionsScreen = ({ onClose }) => {
  const { state, setScreen } = useGame();
  const { difficulty } = state;

  const getDifficultySpecs = () => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Tourist',
          goal: 'Short Journey (~4,000 pts)',
          fear: 'Minimal (13% per Jog)',
          deck: 'Large (45 cards)',
        };
      case 'hard':
        return {
          label: 'Abyss Hunter',
          goal: 'Extensive Journey (~7,900 pts)',
          fear: 'Lethal (22% per Jog)',
          deck: 'Scant (30 cards)',
        };
      default:
        return {
          label: 'Police Officer',
          goal: 'Standard Journey (~6,500 pts)',
          fear: 'Balanced (18% per Jog)',
          deck: 'Standard (35 cards)',
        };
    }
  };

  const specs = getDifficultySpecs();

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Background World (BannerScene) ────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <BannerScene bannerKey="pano_title" />
      </View>
      <View style={styles.bgScrim} />

      <View style={styles.container}>
        <View style={styles.paper}>
          <Text style={styles.header}>Dispatch Handbook</Text>
          <Text style={styles.subHeader}>Subject: Crow Island Survival Protocol</Text>
          
          <ScrollView style={styles.scroll}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Sanity is Life</Text>
              <Text style={styles.sectionBody}>
                Every step on Crow Island carries a weight. Moving forward through the gloom increases your <Text style={styles.boldRed}>Fear</Text>. 
                If you succumb to Panic, you must find a way to steady your nerves, and find it quickly. Fail to calm your mind, and the darkness will consume you.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. The Shadow in the Dark</Text>
              <Text style={styles.sectionBody}>
                You are being watched. Constant movement draws unwanted attention, manifesting as <Text style={styles.boldRed}>Crow Pressure</Text>. 
                You do not want to find out what happens if that pressure reaches its peak. Use your Light cards to push back the encroaching flock and keep the creatures in the shadows.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Resource Scarcity</Text>
              <Text style={styles.sectionBody}>
                Your supplies are finite. Your deck of cards must sustain you for the entire journey; running out far from the shore means certain death. 
                Deploy your <Text style={styles.bold}>Shields</Text> with extreme care—wasting them early may leave you defenseless when the true nightmares arrive.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Tactical Breathing</Text>
              <Text style={styles.sectionBody}>
                Under pressure, you can choose to <Text style={styles.bold}>"Think"</Text>—skipping a movement to focus and draw a new tool. But beware: hesitation in these woods always comes at a price.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. The Desperate Swap</Text>
              <Text style={styles.sectionBody}>
                In dire moments, you can discard a card and pull another from your deck. It is a gamble of desperation, and the strain of such a choice will leave its mark on your sanity.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose || (() => setScreen('story'))}>
            <Text style={styles.buttonText}>{onClose ? 'Return to Game' : 'Return to Journal'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  paper: {
    backgroundColor: '#f4e4bc',
    flex: 1,
    borderRadius: 4,
    padding: 24,
    borderWidth: 1,
    borderColor: '#d2b48c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  header: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: '#2c1e14',
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeader: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#5d4037',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 10,
  },
  scroll: { flex: 1 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    color: '#2c1e14',
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: '#3d2b1f',
  },
  statLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5d4037',
    marginTop: 6,
  },
  bold: { fontFamily: 'Inter_700Bold' },
  boldRed: { fontFamily: 'Inter_700Bold', color: '#b71c1c' },
  italic: { fontStyle: 'italic' },
  button: {
    backgroundColor: '#2c1e14',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#f4e4bc',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    letterSpacing: 2,
  },
});

export default InstructionsScreen;
