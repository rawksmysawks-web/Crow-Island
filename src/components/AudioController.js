import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { useGame } from '../context/GameContext';

const AMBIENT_URL = 'https://www.chosic.com/wp-content/uploads/2021/07/creepy-night-ambience-123.mp3';
const CROW_CAW_URL = 'https://orangefreesounds.com/wp-content/uploads/2014/10/Crow-caw-sound.mp3';
const CARD_PLAY_URL = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/playing_card_flick_001.mp3';

const AudioController = () => {
  const { state } = useGame();
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [lastFear, setLastFear] = useState(0);

  useEffect(() => {
    async function setupAudio() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: AMBIENT_URL },
          { shouldPlay: true, isLooping: true, volume: 0.2 }
        );
        setBackgroundMusic(sound);
      } catch (error) {
        console.log('Error loading ambient audio:', error);
      }
    }

    setupAudio();

    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
    };
  }, []);

  // Update volume based on fear
  useEffect(() => {
    if (backgroundMusic) {
      const volume = 0.2 + (state.fear / 100) * 0.4;
      backgroundMusic.setVolumeAsync(volume);
    }
  }, [state.fear, backgroundMusic]);

  // Crow Caw sound effect
  useEffect(() => {
    if (state.crowPressure > 80 && state.crowPressure > lastFear) {
      playCrowCaw();
    }
    setLastFear(state.crowPressure);
  }, [state.crowPressure]);

  async function playCrowCaw() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: CROW_CAW_URL },
        { shouldPlay: true, volume: 0.6 }
      );
      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
       // Silent fail
    }
  }

  return null;
};

export default AudioController;
