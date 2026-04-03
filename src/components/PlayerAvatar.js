import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const AVATAR_MAP = {
  tired: {
    base: require('../../assets/images/avatar_tired_base.png'),
    action: require('../../assets/images/avatar_tired_action.png'),
    actionInterval: [8000, 15000],
    actionDuration: 400, // Quick blink
  },
  worried: {
    base: require('../../assets/images/avatar_worried_base.png'),
    action: require('../../assets/images/avatar_worried_action.png'),
    actionInterval: [6000, 10000],
    actionDuration: 800, // Quick worry glance
  },
  scared: {
    base: require('../../assets/images/avatar_scared_base.png'),
    action: require('../../assets/images/avatar_scared_action.png'),
    actionInterval: [4000, 7000],
    actionDuration: 1200, // Short terror flinch
  },
};

const PlayerAvatar = ({ fear }) => {
  const [isActionActive, setIsActionActive] = useState(false);

  // Determine state based on fear
  let stateKey = 'tired';
  if (fear > 70) {
    stateKey = 'scared';
  } else if (fear > 40) {
    stateKey = 'worried';
  }

  const currentConfig = AVATAR_MAP[stateKey];

  // Animation loop
  useEffect(() => {
    let timeoutId;
    
    const triggerAction = () => {
      setIsActionActive(true);
      
      // Stop action after duration
      timeoutId = setTimeout(() => {
        setIsActionActive(false);
        scheduleNextAction();
      }, currentConfig.actionDuration);
    };

    const scheduleNextAction = () => {
      const min = currentConfig.actionInterval[0];
      const max = currentConfig.actionInterval[1];
      const randomWait = Math.floor(Math.random() * (max - min + 1)) + min;
      timeoutId = setTimeout(triggerAction, randomWait);
    };

    // Start cycle
    scheduleNextAction();

    return () => clearTimeout(timeoutId);
  }, [stateKey, currentConfig]);

  const activeImage = isActionActive ? currentConfig.action : currentConfig.base;

  return (
    <View style={styles.container}>
      <Image source={activeImage} style={styles.avatarImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32, // Circular mask
    borderWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ scale: 1.15 }, { translateY: 2 }], // Very mild scale/shift to keep the head consistently framed without extreme crop 
  },
});

export default PlayerAvatar;
