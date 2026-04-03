import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useGame } from '../context/GameContext';

const ICON_PAUSE = require('../../assets/images/icon_pause.png');

const GlobalMenu = ({ style }) => {
  const { state, toggleMute, toggleJournal, restart, setScreen } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const { isMuted } = state;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.anchor} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={() => { toggleMute(); setIsOpen(false); }}
          >
            <Text style={styles.iconText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={() => { setScreen('journal'); setIsOpen(false); }}
          >
            <Text style={styles.iconText}>📖</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={() => { restart(); setIsOpen(false); }}
          >
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2000,
  },
  anchor: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  menuIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    top: -2,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 12,
    padding: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  dropdownItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
});

export default GlobalMenu;
