import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FOG_OVERLAY = require('../../assets/images/fog_overlay.png');

const BACKGROUNDS = {
  pano_arrival: require('../../assets/images/sc_arrival_v7.png'),
  pano_farms:   require('../../assets/images/sc_farms_v8.png'),
  pano_shed:    require('../../assets/images/sc_shed_v8.png'),
  pano_forest:  require('../../assets/images/sc_forest_v7.png'),
  pano_night:   require('../../assets/images/sc_church_v8.png'),
  pano_escape:  require('../../assets/images/sc_escape_v8.png'),
};

const BannerScene = React.memo(({
  phase         = 'day',
  bannerKey     = 'arrival',
  isPaused      = false,
}) => {
  const fogAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const loopRef   = useRef(null);
  const breathRef = useRef(null);

  useEffect(() => {
    // Re-initialize animation when banner changes
    fogAnim.setValue(0);
    
    if (loopRef.current) {
      loopRef.current.stop();
    }

    loopRef.current = Animated.loop(
      Animated.timing(fogAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    if (!isPaused) {
      loopRef.current.start();
    }

    // Breathing scale animation
    breathRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    if (!isPaused) breathRef.current.start();

    return () => {
      if (loopRef.current) loopRef.current.stop();
      if (breathRef.current) breathRef.current.stop();
    };
  }, [bannerKey, fogAnim, scaleAnim]);

  // Handle manual pause/resume without resetting position
  useEffect(() => {
    if (isPaused) {
      if (loopRef.current) loopRef.current.stop();
      if (breathRef.current) breathRef.current.stop();
    } else {
      if (loopRef.current) loopRef.current.start();
      if (breathRef.current) breathRef.current.start();
    }
  }, [isPaused]);

  const scene = bannerKey in BACKGROUNDS ? bannerKey : 'pano_arrival';
  const bgSource = BACKGROUNDS[scene];

  return (
    <View style={styles.outer}>
      {/* ── Background Static Image ──────────────────────────────── */}
      <Animated.View style={[
        styles.bgContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Image 
          source={bgSource} 
          style={styles.bgImage} 
          resizeMode="cover" 
        />
        
        {/* Night tint overlay */}
        {phase === 'night' && <View style={styles.nightOverlay} />}
      </Animated.View>

      {/* ── Atmospheric Fog (Still drifts for depth) ─────────────── */}
      <Animated.View 
        style={[
          styles.fogContainer, 
          { transform: [{ translateX: fogAnim }] }
        ]}
      >
        <Image source={FOG_OVERLAY} style={styles.fogImage} resizeMode="repeat" />
        <Image source={FOG_OVERLAY} style={styles.fogImage} resizeMode="repeat" />
      </Animated.View>

      <View style={styles.vignette} />
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#050010',
    borderBottomWidth: 0,
    borderBottomColor: '#111',
  },
  bgContainer: {
    width: '100%',
    minHeight: '120%', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    // resizeMode: 'cover' handled in component for better RN-web behavior
  },
  nightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 40, 0.4)',
  },
  fogContainer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
    flexDirection: 'row',
    opacity: 0.35, 
    zIndex: 90, 
  },
  fogImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Could add gradient here later
  },
});

export default BannerScene;
