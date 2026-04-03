import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { CLUES } from '../data/clues';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

const ClueItem = ({ clue, isUnlocked }) => {
  if (!isUnlocked) {
    return (
      <View style={[styles.clueCard, styles.lockedCard]}>
        <Text style={styles.lockedText}>LOCKED</Text>
        <Text style={styles.lockedSubtext}>Find this evidence on the island</Text>
      </View>
    );
  }

  return (
    <View style={styles.clueCard}>
      <Text style={styles.clueTitle}>{clue.title}</Text>
      <Text style={styles.clueDescription}>{clue.description}</Text>
      {clue.flavor && <Text style={styles.clueFlavor}>"{clue.flavor}"</Text>}
    </View>
  );
};

const ClueGallery = ({ visible, onClose }) => {
  const { state } = useGame();
  const unlockedClues = state.clues || [];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>COLLECTED EVIDENCE</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.summaryText}>
              {unlockedClues.length} / {Object.keys(CLUES).length} Clues Gathered
            </Text>
            
            {Object.values(CLUES).map((clue) => (
              <ClueItem 
                key={clue.id} 
                clue={clue} 
                isUnlocked={unlockedClues.includes(clue.id)} 
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    height: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c4a484',
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#ffe082',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 18,
  },
  closeBtn: {
    padding: 5,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 15,
  },
  summaryText: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  clueCard: {
    backgroundColor: 'rgba(253, 243, 231, 0.05)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 164, 132, 0.3)',
    marginBottom: 15,
  },
  lockedCard: {
    opacity: 0.4,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  lockedText: {
    color: '#666',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
  },
  lockedSubtext: {
    color: '#444',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 4,
  },
  clueTitle: {
    color: '#ffe082',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  clueDescription: {
    color: '#ddd',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  clueFlavor: {
    color: '#c4a484',
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 15,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default ClueGallery;
