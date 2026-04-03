import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.42; // Restore perfect header height (42%)
const FOG_OVERLAY = require('../../assets/images/fog_overlay.png');

const BACKGROUNDS = {
  pano_title:   require('../../assets/images/title_bg_v3.png'),
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
  useEffect(() => {
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

    return () => {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [bannerKey, fogAnim]);

  useEffect(() => {
    if (isPaused) {
      if (loopRef.current) loopRef.current.stop();
    } else {
      if (loopRef.current) loopRef.current.start();
    }
  }, [isPaused]);

  const scene = bannerKey in BACKGROUNDS ? bannerKey : 'pano_title';
  const bgSource = BACKGROUNDS[scene];

  return (
    <View style={styles.outer}>
      <View style={styles.bgContainer}>
        <Image 
          source={bgSource} 
          style={styles.bgImage} 
          resizeMode="cover" 
        />
        {phase === 'night' && <View style={styles.nightOverlay} />}
      </View>

      <Animated.View 
        style={[
          styles.fogContainer, 
          { transform: [{ translateX: fogAnim }] }
        ]}
      >
        <Image source={FOG_OVERLAY} style={styles.fogImage} resizeMode="repeat" />
        <Image source={FOG_OVERLAY} style={styles.fogImage} resizeMode="repeat" />
      </Animated.View>

      <LinearGradient 
        colors={['rgba(0,0,0,0.75)', 'transparent', 'rgba(0,0,0,0.75)']}
        style={styles.vignette} 
        pointerEvents="none"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    height: BANNER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#050010',
    borderBottomWidth: 0,
    borderBottomColor: '#111',
  },
  bgContainer: {
    width: '100%',
    height: '100%',
  },
  bgImage: {
    width: '100%',
    height: '100%',
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
    height: BANNER_HEIGHT,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default BannerScene;
