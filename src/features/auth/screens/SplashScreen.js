import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../../components/common/CustomText';
import { colors } from '../../../theme/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    // Pulse loop for logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Launch routing check
    const checkNavigation = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        const timeoutId = setTimeout(() => {
          if (!navigation || typeof navigation.replace !== 'function') {
            return;
          }

          if (isFirstLaunch === null || isFirstLaunch === 'true') {
            navigation.replace('Onboarding');
          } else if (isLoggedIn === 'true') {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Login');
          }
        }, 2400);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.log('Error checking launch status:', error);
        if (navigation && typeof navigation.replace === 'function') {
          navigation.replace('Login');
        }
      }
    };

    checkNavigation();

    return () => {
      pulseLoop.stop();
    };
  }, [navigation, fadeAnim, scaleAnim, pulseAnim, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#0A0B10', '#1A1B26']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0B10" translucent={false} />

      {/* Main Content Cluster */}
      <Animated.View
        style={[
          styles.centerCluster,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Figma Glowing Logo Circle with '<>' Code Icon */}
        <Animated.View
          style={[
            styles.logoCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.logoInnerGlow}>
            <CustomText weight="heavy" style={styles.logoCodeText}>
              {'<>'}
            </CustomText>
          </View>
        </Animated.View>

        {/* Typography */}
        <View style={styles.textCluster}>
          <CustomText variant="headlineXl" weight="heavy" style={styles.title}>
            RN Master Class
          </CustomText>
          <CustomText weight="bold" style={styles.subtitle}>
            MASTER REACT NATIVE
          </CustomText>
        </View>

        {/* Linear Progress Bar */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </Animated.View>

      {/* Bottom Safe Area Home Indicator */}
      <View style={styles.bottomIndicator} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerCluster: {
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 193, 253, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: colors.brand.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  logoInnerGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(0, 193, 253, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCodeText: {
    fontSize: 44,
    color: colors.brand.accent,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 48,
  },
  textCluster: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    color: colors.brand.white,
    fontSize: 30,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 193, 253, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  subtitle: {
    color: colors.light.chevron,
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressBarTrack: {
    width: Math.min(260, width * 0.65),
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.accent,
    borderRadius: 2,
    shadowColor: colors.brand.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 24,
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
});

export default SplashScreen;
