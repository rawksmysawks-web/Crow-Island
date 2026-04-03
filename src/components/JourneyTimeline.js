import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const JourneyTimeline = ({ log = [], onClose, onOpenJournal }) => {
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
              {/* Vertical line running through the center/left */}
              <View style={styles.verticalLine} />

              {log.map((entry, idx) => {
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

                return (
                  <View key={idx} style={styles.entryRow}>
                    <View style={styles.nodeWrapper}>
                      <Text style={styles.nodeIcon}>{nodeIcon}</Text>
                    </View>
                    <View style={[styles.cardNode, entry.type === 'level_start' && styles.levelNode]}>
                      <Text style={[styles.entryText, { color: nodeColour }]}>
                        {contentText}
                      </Text>
                    </View>
                  </View>
                );
              })}
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
    left: 12,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2, // ABOVE the vertical line
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
  levelNode: {
    backgroundColor: 'rgba(123, 31, 162, 0.2)',
    borderColor: '#7b1fa2',
  },
  entryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: 'bold',
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
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 8,
  },
  journalButtonText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    color: '#ffe082',
    letterSpacing: 2,
  },
  backButton: {
    backgroundColor: '#1a0030',
    borderColor: '#7b1fa2',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
    color: '#ce93d8',
    letterSpacing: 2,
  },
});

export default JourneyTimeline;
