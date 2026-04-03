import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Constants from '../game/Constants';

export default function Enemy({ position, isNight, rotation = 0 }) {
  return (
    <View
      style={[
        styles.enemy,
        {
          left: position.x - Constants.ENEMY_SIZE / 2,
          top: position.y - Constants.ENEMY_SIZE / 2,
          opacity: isNight ? 1 : 0.5,
          transform: [{ rotate: `${rotation}rad` }],
          backgroundColor: isNight ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
          borderRadius: Constants.ENEMY_SIZE / 2,
        },
      ]}
    >
      <Image 
        source={require('../../assets/images/enemy.png')} 
        style={styles.enemyImage} 
        resizeMode="contain" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
    width: Constants.ENEMY_SIZE,
    height: Constants.ENEMY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  enemyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
