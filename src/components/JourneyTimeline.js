import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { EVENT_ASSETS } from '../data/assets';

const JourneyTimeline = ({ log = [], onClose, onOpenJournal }) => {
  const [viewingAsset, setViewingAsset] = useState(null);

  const renderTimelineEntry = (entry, idx) => {
    let nodeColour = '#f4e4bc';
    let contentText = '';
    let nodeIcon = '•';

    if (entry.type === 'level_start') {
      nodeColour = '#7b1fa2';
      contentText = `Arrived at: ${entry.title}`;
      nodeIcon = '📍';
    } else if (entry.type === 'card') {
      nodeColour = '#ccc';
      contentText = `Played: ${entry.name}`;
      nodeIcon = '🃏';
    } else if (entry.type === 'event') {
      nodeColour = '#ff5252';
      contentText = `Triggered: ${entry.title}`;
      nodeIcon = '👁️';
    } else if (entry.type === 'choice') {
      nodeColour = '#5c6bc0';
      contentText = `Chose: "${entry.title}"`;
      nodeIcon = '⚖️';
    } else if (entry.type === 'milestone') {
      nodeColour = '#ffe082';
      contentText = entry.title;
      nodeIcon = '🏆';
    }

    const hasAsset = !!entry.asset && EVENT_ASSETS[entry.asset];

    return (
      <TouchableOpacity 
        key={idx} 
        style={styles.entryRow}
        onPress={() => hasAsset && setViewingAsset(entry.asset)}
        disabled={!hasAsset}
        activeOpacity={0.7}
      >
        <View style={styles.nodeWrapper}>
          <Text style={styles.nodeIcon}>{nodeIcon}</Text>
        </View>
        <View style={[
          styles.cardNode, 
          entry.type === 'level_start' && styles.levelNode,
          hasAsset && styles.assetNode
        ]}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryText, { color: nodeColour }]}>
              {contentText}
            </Text>
            {hasAsset && <Text style={styles.eyeIcon}>🖼️</Text>}
          </View>
          {hasAsset && (
             <Text style={styles.clickHint}>Click to view memory</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>YOUR JOURNEY</Text>
        <Text style={styles.subtitle}>Timeline of Events</Text>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {log.length === 0 ? (
            <Text style={styles.emptyText}>No data available...</Text>
          ) : (
            <View style={styles.timelineContainer}>
              <View style={styles.verticalLine} />
              {log.map((entry, idx) => renderTimelineEntry(entry, idx))}
            </View>
          )}
        </ScrollView>

        <View style={styles.timelineActions}>
          {onOpenJournal && (
            <TouchableOpacity style={styles.journalButton} onPress={onOpenJournal}>
              <Text style={styles.journalButtonText}>VIEW JOURNAL</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Easter Egg Modal */}
      <Modal
        visible={!!viewingAsset}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingAsset(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setViewingAsset(null)}
        >
          <View style={styles.modalContent}>
            {viewingAsset && (
              <Image 
                source={EVENT_ASSETS[viewingAsset]} 
                style={styles.fullImage} 
                resizeMode="contain"
              />
            )}
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setViewingAsset(null)}
            >
              <Text style={styles.modalCloseText}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    zIndex: 9999,
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
    letterSpacing: 4,
    marginTop: 20,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
    width: '100%',
    minWidth: 300,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  timelineContainer: {
    position: 'relative',
    marginLeft: 20,
    paddingTop: 10,
  },
  verticalLine: {
    position: 'absolute',
    left: 13,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nodeWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  nodeIcon: {
    fontSize: 12,
  },
  cardNode: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  assetNode: {
    backgroundColor: 'rgba(255, 224, 130, 0.1)',
    borderColor: 'rgba(255, 224, 130, 0.3)',
  },
  levelNode: {
    backgroundColor: 'rgba(123, 31, 162, 0.2)',
    borderColor: '#7b1fa2',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eyeIcon: {
    fontSize: 14,
  },
  clickHint: {
    fontSize: 10,
    color: '#ffe082',
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  timelineActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  journalButton: {
    backgroundColor: '#3d2b1f',
    borderColor: '#ffe082',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
  },
  journalButtonText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 12,
    color: '#ffe082',
    letterSpacing: 2,
  },
  backButton: {
    backgroundColor: '#1a0030',
    borderColor: '#7b1fa2',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 12,
    color: '#ce93d8',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  modalCloseBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#ffe082',
    borderRadius: 8,
  },
  modalCloseText: {
    fontFamily: 'Cinzel_700Bold',
    color: '#ffe082',
    letterSpacing: 4,
  }
});

export default JourneyTimeline;
