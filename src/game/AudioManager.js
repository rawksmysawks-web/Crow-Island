/**
 * AudioManager.js — Multi-channel soundscape controller for Expo.
 */
import { Audio } from 'expo-av';

// --- Assets ---
const BGM_HUNT = require('../../assets/audio/delosound-scary-horror-music-351315.mp3');
const AMBIENCE_WIND = require('../../assets/audio/dragon-studio-spooky-wind-429221 (1).mp3');
const SFX_HEARTBEAT = require('../../assets/audio/universfield-fast-heartbeat-151928.mp3');
const SFX_CROW = require('../../assets/audio/dragon-studio-crow-caw-with-echoing-reverb-472375 (1).mp3');
const SFX_CLICK = require('../../assets/audio/freesound_community-switch-button-106349.mp3');
const SFX_I_SEE_YOU = require('../../assets/audio/dragon-studio-i-see-you-creepy-ghost-whisper-401711.mp3');
const SFX_CARD_DROP = require('../../assets/audio/freesound_community-carddrop2-92718.mp3');
const SFX_EXPLOSION = require('../../assets/audio/freesound_community-distant-explosion-103563.mp3');
const SFX_SCRIBBLE = require('../../assets/audio/freesound_community-scribble-6144.mp3');
const SFX_JUMPSCARE = require('../../assets/audio/nickpanekaiassets-jump-scare-sound-effect-ai-made-sfx-473363.mp3');
const SFX_LEAVES = require('../../assets/audio/tanweraman-leaves-rustle-03-329001.mp3');
const SFX_DOOR = require('../../assets/audio/universfield-creaking-door-03-487855.mp3');
const SFX_BELL = require('../../assets/audio/universfield-single-church-bell-2-352062.mp3');

// --- New Ambience Assets ---
const AMBIENCE_GATE = require('../../assets/audio/freesound_community-eeiry-gate-within-a-forrest-72226.mp3');
const AMBIENCE_THUMP = require('../../assets/audio/freesound_community-mittens-against-a-brickwall-33095.mp3');
const AMBIENCE_DRONE = require('../../assets/audio/freesound_community-spooky-drone-79313.mp3');

// --- Level Ambience Mapping ---
const AMBIENCE_MAPPING = {
  arrival: AMBIENCE_WIND,
  the_farms: AMBIENCE_GATE,
  the_shed: AMBIENCE_THUMP,
  the_warning: AMBIENCE_WIND,
  night_hunt: AMBIENCE_DRONE,
  escape: AMBIENCE_DRONE,
  default: AMBIENCE_WIND,
};

// --- State ---
let channels = {
  bgm: null,
  ambience: null,
  heartbeat: null,
};

let preloadedSFX = {};
let hasPlayedISeeYou = false;
let globalMuted = false;
let ambientCawTimer = null;
let isInitialized = false;

// --- Initialize ---
const createLoopedSound = async (source, volume = 0.5) => {
  if (!source) return null;
  try {
    const { sound } = await Audio.Sound.createAsync(source, {
      isLooping: true,
      volume: globalMuted ? 0 : volume,
    });
    return sound;
  } catch (err) {
    console.warn('Audio: Failed to load sound', source, err);
    return null;
  }
};

export const initAudio = async () => {
  if (isInitialized) return;
  console.log('--- AUDIO: Initializing System ---');
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: false, // Prevents OS from dipping volume and causing temporary cut-outs
    staysActiveInBackground: false,
  });

  // Pre-load common SFX to prevent dynamic loading from stalling the native audio thread
  try {
    const sfxList = [
      { key: 'crow', source: SFX_CROW },
      { key: 'card', source: SFX_CARD_DROP },
      { key: 'thud', source: SFX_EXPLOSION },
      { key: 'scribble', source: SFX_SCRIBBLE },
      { key: 'jumpscare', source: SFX_JUMPSCARE },
      { key: 'rustle', source: SFX_LEAVES },
      { key: 'door', source: SFX_DOOR },
      { key: 'bell', source: SFX_BELL },
      { key: 'click', source: SFX_CLICK },
      { key: 'iseeyou', source: SFX_I_SEE_YOU }
    ];
    
    for (const item of sfxList) {
      const { sound } = await Audio.Sound.createAsync(item.source);
      preloadedSFX[item.key] = sound;
    }
    isInitialized = true;
    console.log('--- AUDIO: Finished Preloading SFX ---');
  } catch (err) {
    console.error('Audio: Failed to preload SFX', err);
  }
};

export const playBackgroundMusic = async () => {
  if (channels.bgm) return;
  console.log('--- AUDIO: playBackgroundMusic ---');
  channels.bgm = await createLoopedSound(BGM_HUNT, 0.35);
  if (channels.bgm) await channels.bgm.playAsync();
  
  // Start random ambient caws
  startAmbientCaws();
};

const startAmbientCaws = () => {
  if (ambientCawTimer) clearTimeout(ambientCawTimer);
  
  const scheduleNext = () => {
    // 15-45 seconds between caws
    const delay = Math.floor(Math.random() * 30000 + 15000); 
    ambientCawTimer = setTimeout(() => {
      if (!globalMuted && channels.bgm) {
        playSFX('crow');
      }
      scheduleNext();
    }, delay);
  };
  
  scheduleNext();
};

export const resetAllAudio = async () => {
  console.log('--- AUDIO: resetAllAudio ---');
  if (channels.bgm) {
    try { await channels.bgm.unloadAsync(); } catch (e) {}
    channels.bgm = null;
  }
  if (channels.ambience) {
    try { await channels.ambience.unloadAsync(); } catch (e) {}
    channels.ambience = null;
  }
  if (channels.heartbeat) {
    try { await channels.heartbeat.unloadAsync(); } catch (e) {}
    channels.heartbeat = null;
  }
  if (ambientCawTimer) {
    clearTimeout(ambientCawTimer);
    ambientCawTimer = null;
  }
  currentLevelAmbienceKey = null;
};

export const stopBackgroundMusic = async () => {
  if (channels.bgm) {
    await channels.bgm.unloadAsync();
    channels.bgm = null;
  }
  if (ambientCawTimer) {
    clearTimeout(ambientCawTimer);
    ambientCawTimer = null;
  }
};

let currentLevelAmbienceKey = null;

/**
 * Enhanced updateAmbience with real cross-fading.
 * Prevents "vanishing" sound by playing new track before stopping the old one.
 */
export const updateAmbience = async (levelKey = 'default') => {
  if (currentLevelAmbienceKey === levelKey && channels.ambience) {
    return; // Already playing correctly
  }

  console.log(`--- AUDIO: updateAmbience (Cross-fade to ${levelKey}) ---`);
  
  // 1. Prepare New Track
  const trackToPlay = AMBIENCE_MAPPING[levelKey] || AMBIENCE_MAPPING.default;
  const newAmbience = await createLoopedSound(trackToPlay, 0.0);
  if (!newAmbience) return;

  // 2. Begin Playback (Muted)
  await newAmbience.playAsync();
  currentLevelAmbienceKey = levelKey;

  // 3. Handle Cross-fade - REFACTORED to reduce bridge traffic and stuttering
  const oldAmbience = channels.ambience;
  channels.ambience = newAmbience;

  let step = 0;
  const FADE_STEPS = 5;       // Reduced from 20 to 5 updates to prevent JS thread locking
  const FADE_INTERVAL = 400;  // 2 seconds total fade (5 * 400ms)

  const crossFadeInterval = setInterval(async () => {
    step++;
    const progress = step / FADE_STEPS;

    // Fade in new
    if (channels.ambience === newAmbience) {
      try {
        await newAmbience.setVolumeAsync(globalMuted ? 0 : 0.4 * progress);
      } catch(e) {}
    }

    // Fade out old
    if (oldAmbience) {
      try {
        await oldAmbience.setVolumeAsync(globalMuted ? 0 : 0.4 * (1 - progress));
      } catch (e) {}
    }

    if (step >= FADE_STEPS) {
      clearInterval(crossFadeInterval);
      if (oldAmbience) {
        try {
          await oldAmbience.stopAsync();
          await oldAmbience.unloadAsync();
        } catch (e) {}
      }
    }
  }, FADE_INTERVAL);
};

export const updateHeartbeat = async (fear) => {
  if (fear > 30) {
    if (!channels.heartbeat) {
      channels.heartbeat = await createLoopedSound(SFX_HEARTBEAT, 0);
      if (channels.heartbeat) await channels.heartbeat.playAsync();
    }
    
    // Scale volume between 0.1 and 1.0 based on fear 30-100
    const vol = Math.min(1.0, Math.max(0, (fear - 30) / 70));
    if (channels.heartbeat) {
      await channels.heartbeat.setVolumeAsync(globalMuted ? 0 : vol);
      // Speed up the heartbeat as fear rises
      const rate = 1.0 + ((fear - 30) / 70) * 0.5; // Up to 1.5x speed
      await channels.heartbeat.setRateAsync(rate, true);
    }
  } else if (channels.heartbeat) {
    await channels.heartbeat.stopAsync();
    await channels.heartbeat.unloadAsync();
    channels.heartbeat = null;
  }
};

export const playISeeYou = async () => {
  if (hasPlayedISeeYou || globalMuted) return;
  console.log('--- AUDIO: playISeeYou (Crow Pressure high) ---');
  try {
    const sound = preloadedSFX['iseeyou'];
    if (sound) {
      await sound.setVolumeAsync(0.9);
      await sound.replayAsync();
      hasPlayedISeeYou = true;
    }
  } catch (err) {
    console.error('Audio: playISeeYou failed', err);
  }
};

export const playSFX = async (type = 'click') => {
  if (globalMuted) return;
  try {
    let key = type;
    if (type === 'draw') key = 'card';
    
    const sound = preloadedSFX[key];
    if (sound) {
      let vol = 0.5;
      switch(key) {
        case 'crow': vol = 0.6; break;
        case 'card': vol = 0.7; break;
        case 'thud': vol = 0.8; break;
        case 'scribble': vol = 0.6; break;
        case 'jumpscare': vol = 0.9; break;
        case 'rustle': vol = 0.5; break;
        case 'door': vol = 0.5; break;
        case 'bell': vol = 0.8; break;
        case 'click': 
        default: vol = 0.45; break;
      }
      
      await sound.setVolumeAsync(vol);
      await sound.replayAsync();
    }
  } catch (err) {}
};

export const setMuted = async (muted) => {
  globalMuted = muted;
  if (channels.bgm) await channels.bgm.setVolumeAsync(muted ? 0 : 0.35);
  if (channels.ambience) await channels.ambience.setVolumeAsync(muted ? 0 : 0.4);
  if (channels.heartbeat) await channels.heartbeat.setVolumeAsync(0);
};

export const resetOneTimeEvents = async () => {
  hasPlayedISeeYou = false;
  // Don't call resetAllAudio here as it unloads BGM, causing a gap on restart.
  // Instead, just clear state-heavy things.
  if (channels.ambience) {
    try { await channels.ambience.stopAsync(); await channels.ambience.unloadAsync(); } catch (e) {}
    channels.ambience = null;
  }
  if (channels.heartbeat) {
    try { await channels.heartbeat.stopAsync(); await channels.heartbeat.unloadAsync(); } catch (e) {}
    channels.heartbeat = null;
  }
  if (ambientCawTimer) {
     clearTimeout(ambientCawTimer);
     ambientCawTimer = null;
  }
  currentLevelAmbienceKey = null;
};
