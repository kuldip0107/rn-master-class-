import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import CustomText from './CustomText';
import Icon from './Icon';
import { colors } from '../../theme/theme';

/**
 * CustomLoader Component
 * Sleek, developer-themed animated loader with pulsing aura & code branding.
 *
 * Props:
 * - message: string (optional, e.g. "Loading Lessons...", "Syncing with Cloud...")
 * - subMessage: string (optional, e.g. "Fetching latest curriculum")
 * - variant: 'fullscreen' | 'overlay' | 'inline' | 'compact' (default: 'fullscreen')
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 */
const CustomLoader = ({
  message = 'Loading...',
  subMessage,
  variant = 'fullscreen',
  size = 'medium',
  style,
}) => {
  const { isDark } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Pulse animation for logo icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous rotation for outer gradient ring
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Glow opacity pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    rotateLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
      glowLoop.stop();
    };
  }, [pulseAnim, rotateAnim, glowAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { boxSize: 44, iconSize: 20, ringSize: 52 };
      case 'large':
        return { boxSize: 76, iconSize: 36, ringSize: 92 };
      case 'medium':
      default:
        return { boxSize: 60, iconSize: 28, ringSize: 74 };
    }
  };

  const { boxSize, iconSize, ringSize } = getDimensions();

  // Inline / Compact variant (used inside cards, list headers, or banners)
  if (variant === 'compact' || variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <ActivityIndicator
          size="small"
          color={colors.brand.primary}
          style={{ marginRight: 10 }}
        />
        {message ? (
          <CustomText
            variant="caption"
            weight="medium"
            style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
          >
            {message}
          </CustomText>
        ) : null}
      </View>
    );
  }

  const content = (
    <View style={styles.centerBox}>
      {/* Outer Rotating Aura Ring */}
      <View style={[styles.auraWrapper, { width: ringSize, height: ringSize }]}>
        <Animated.View
          style={[
            styles.spinRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              transform: [{ rotate: spin }],
              opacity: glowAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.brand.primary, colors.brand.accent, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientRing,
              { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
            ]}
          />
        </Animated.View>

        {/* Center Icon Badge with scale pulse */}
        <Animated.View
          style={[
            styles.iconBadge,
            isDark ? styles.iconBadgeDark : styles.iconBadgeLight,
            {
              width: boxSize,
              height: boxSize,
              borderRadius: boxSize / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? ['rgba(0, 122, 255, 0.22)', 'rgba(0, 193, 253, 0.08)']
                : ['#EBF3FF', '#F0F8FF']
            }
            style={[
              styles.iconGradient,
              { width: boxSize, height: boxSize, borderRadius: boxSize / 2 },
            ]}
          >
            <Icon
              name="code"
              size={iconSize}
              color={isDark ? colors.brand.accent : colors.brand.primary}
            />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Messages */}
      {message ? (
        <CustomText
          variant={size === 'small' ? 'caption' : 'body'}
          weight="bold"
          style={[
            styles.messageText,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        >
          {message}
        </CustomText>
      ) : null}

      {subMessage ? (
        <CustomText
          variant="small"
          style={[
            styles.subMessageText,
            isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
          ]}
        >
          {subMessage}
        </CustomText>
      ) : null}
    </View>
  );

  if (variant === 'overlay') {
    return (
      <View
        style={[
          styles.overlayContainer,
          isDark ? styles.overlayDark : styles.overlayLight,
          style,
        ]}
      >
        <View
          style={[
            styles.glassCard,
            isDark ? styles.glassCardDark : styles.glassCardLight,
          ]}
        >
          {content}
        </View>
      </View>
    );
  }

  // Fullscreen container
  return (
    <View
      style={[
        styles.fullscreenContainer,
        isDark ? styles.bgDark : styles.bgLight,
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bgDark: {
    backgroundColor: colors.dark.background,
  },
  bgLight: {
    backgroundColor: colors.light.background,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayDark: {
    backgroundColor: 'rgba(5, 5, 16, 0.78)',
  },
  overlayLight: {
    backgroundColor: 'rgba(250, 249, 254, 0.78)',
  },
  glassCard: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
  },
  glassCardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassCardLight: {
    backgroundColor: colors.brand.white,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  spinRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.brand.primary,
    borderRightColor: colors.brand.accent,
  },
  gradientRing: {
    opacity: 0.15,
  },
  iconBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconBadgeDark: {
    backgroundColor: colors.dark.elevated,
    borderColor: 'rgba(0, 193, 253, 0.35)',
  },
  iconBadgeLight: {
    backgroundColor: colors.brand.white,
    borderColor: 'rgba(0, 122, 255, 0.25)',
  },
  iconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subMessageText: {
    textAlign: 'center',
    marginTop: 6,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textPrimaryDark: {
    color: colors.dark.text,
  },
  textPrimaryLight: {
    color: colors.light.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  textSecondaryLight: {
    color: colors.light.textSecondary,
  },
});

export default CustomLoader;
