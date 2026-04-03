import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Image } from 'react-native';

const DiscoveryToast = ({ message, visible, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 20, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -100, duration: 500, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start(() => onHide && onHide());
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/images/paper_clue.png')} style={styles.icon} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>EVIDENCE COLLECTED</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#c4a484',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#3d2b1f',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#c4a484',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffe082',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  message: {
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
});

export default DiscoveryToast;
