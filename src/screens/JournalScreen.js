import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import ClueGallery from '../components/ClueGallery';

const JournalScreen = ({ onCloseOverride }) => {
  const { state, toggleJournal } = useGame();
  const { journal, clues, lastViewedClueCount = 0 } = state;
  const [galleryVisible, setGalleryVisible] = useState(false);
  const hasNewClues = clues.length > lastViewedClueCount;

  const handleOpenGallery = () => {
    setGalleryVisible(true);
    dispatch({ type: 'ACK_CLUES' });
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>JOURNAL</Text>
        
        <TouchableOpacity 
          style={[styles.evidenceBtn, hasNewClues && styles.evidenceBtnNew]} 
          onPress={handleOpenGallery}
        >
          <Text style={styles.evidenceBtnText}>
            VIEW GATHERED EVIDENCE ({clues.length})
          </Text>
          {hasNewClues && <View style={styles.newIndicator} />}
        </TouchableOpacity>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {journal.length === 0 ? (
            <Text style={styles.emptyText}>No clues discovered yet...</Text>
          ) : (
            journal.map((entry, idx) => (
              <View key={idx} style={styles.entry}>
                <Text style={styles.entryTitle}>{entry.title} — {entry.timestamp}</Text>
                <Text style={styles.entryText}>{entry.text || entry.body}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={onCloseOverride || toggleJournal}>
          <Text style={styles.backButtonText}>CLOSE JOURNAL</Text>
        </TouchableOpacity>

        <ClueGallery 
          visible={galleryVisible} 
          onClose={() => setGalleryVisible(false)} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 4000,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 28,
    color: '#ffe082',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 4,
  },
  evidenceBtn: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#3d2b1f',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffe082',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    position: 'relative',
  },
  evidenceBtnNew: {
    borderColor: '#ffeb3b',
    borderWidth: 2,
    shadowColor: '#ffeb3b',
    shadowOpacity: 0.4,
  },
  newIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5252',
    borderWidth: 2,
    borderColor: '#ffe082',
  },
  evidenceBtnText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 13,
    color: '#ffe082',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  entry: {
    backgroundColor: '#f4e4bc',
    padding: 20,
    marginBottom: 16,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#d2b48c',
  },
  entryTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    color: '#2c1e14',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 4,
  },
  entryText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: '#3d2b1f',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2c1e14',
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 4,
  },
  backButtonText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    color: '#f4e4bc',
    letterSpacing: 2,
  },
});

export default JournalScreen;
