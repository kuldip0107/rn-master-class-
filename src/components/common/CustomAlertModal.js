import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import CustomText from './CustomText';
import Icon from './Icon';
import { colors } from '../../theme/theme';

const ALERT_TYPES = {
  success: {
    primaryColor: colors.brand.success,
    gradient: [colors.brand.success, colors.brand.accent],
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    badgeShadow: colors.brand.success,
    iconName: 'check',
    defaultTitle: 'Success',
  },
  error: {
    primaryColor: colors.brand.error,
    gradient: [colors.brand.error, '#DC2626'],
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeBorder: 'rgba(239, 68, 68, 0.3)',
    badgeShadow: colors.brand.error,
    iconName: 'close',
    defaultTitle: 'Error',
  },
  warning: {
    primaryColor: colors.brand.warning,
    gradient: [colors.brand.warning, '#D97706'],
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    badgeShadow: colors.brand.warning,
    iconName: 'priority-high',
    defaultTitle: 'Warning',
  },
  info: {
    primaryColor: colors.brand.primary,
    gradient: [colors.brand.primary, colors.brand.accent],
    badgeBg: 'rgba(0, 122, 255, 0.12)',
    badgeBorder: 'rgba(0, 122, 255, 0.3)',
    badgeShadow: colors.brand.primary,
    iconName: 'info',
    defaultTitle: 'Information',
  },
  confirm: {
    primaryColor: colors.brand.primary,
    gradient: [colors.brand.primary, colors.brand.accent],
    badgeBg: 'rgba(0, 122, 255, 0.12)',
    badgeBorder: 'rgba(0, 122, 255, 0.3)',
    badgeShadow: colors.brand.primary,
    iconName: 'help-outline',
    defaultTitle: 'Confirm',
  },
};

const CustomAlertModal = ({ visible, config, onClose }) => {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const {
    title,
    message,
    type = 'info',
    icon,
    buttons = [{ text: 'OK', onPress: () => {} }],
    cancelable = true,
  } = config || {};

  const typeConfig = ALERT_TYPES[type] || ALERT_TYPES.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [visible, opacityAnim, scaleAnim]);

  const handleButtonPress = (btn) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      if (btn && typeof btn.onPress === 'function') {
        btn.onPress();
      }
    });
  };

  const handleBackdropPress = () => {
    if (cancelable) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }
  };

  if (!visible) {
    return null;
  }

  const isDestructive = (btn) => btn.style === 'destructive' || type === 'error';
  const isCancel = (btn) => btn.style === 'cancel';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.overlay,
            isDark ? styles.overlayDark : styles.overlayLight,
            { opacity: opacityAnim },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Top Accent Bar */}
              <LinearGradient
                colors={typeConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topAccentBar}
              />

              {/* Glowing Icon Badge */}
              <View style={styles.badgeWrapper}>
                <View
                  style={[
                    styles.badgeOuterGlow,
                    {
                      backgroundColor: typeConfig.badgeBg,
                      borderColor: typeConfig.badgeBorder,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={typeConfig.gradient}
                    style={styles.badgeInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {icon ? (
                      icon
                    ) : (
                      <Icon name={typeConfig.iconName} size={26} color={colors.brand.white} />
                    )}
                  </LinearGradient>
                </View>
              </View>

              {/* Content */}
              <View style={styles.contentContainer}>
                <CustomText
                  variant="h3"
                  weight="bold"
                  style={[
                    styles.title,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  {title || typeConfig.defaultTitle}
                </CustomText>

                {message ? (
                  <CustomText
                    variant="body"
                    style={[
                      styles.message,
                      isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                    ]}
                  >
                    {message}
                  </CustomText>
                ) : null}
              </View>

              {/* Actions */}
              <View
                style={[
                  styles.buttonsContainer,
                  buttons.length === 2 && styles.buttonsRow,
                ]}
              >
                {buttons.map((btn, index) => {
                  const cancelBtn = isCancel(btn);
                  const destructiveBtn = isDestructive(btn);

                  if (cancelBtn) {
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        style={[
                          styles.cancelButton,
                          isDark ? styles.cancelButtonDark : styles.cancelButtonLight,
                          buttons.length === 2 && styles.halfButton,
                        ]}
                        onPress={() => handleButtonPress(btn)}
                      >
                        <CustomText
                          weight="bold"
                          style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
                        >
                          {btn.text || 'Cancel'}
                        </CustomText>
                      </TouchableOpacity>
                    );
                  }

                  const buttonGradient = destructiveBtn
                    ? [colors.brand.error, '#DC2626']
                    : typeConfig.gradient;

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.85}
                      style={[
                        styles.actionButtonWrapper,
                        buttons.length === 2 && styles.halfButton,
                      ]}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <LinearGradient
                        colors={buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButton}
                      >
                        <CustomText
                          weight="bold"
                          style={styles.actionButtonText}
                        >
                          {btn.text || 'OK'}
                        </CustomText>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayDark: {
    backgroundColor: 'rgba(5, 5, 16, 0.85)',
  },
  overlayLight: {
    backgroundColor: 'rgba(26, 27, 31, 0.6)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  badgeWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOuterGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  badgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.brand.white,
    fontSize: 22,
    lineHeight: 24,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 6,
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
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 1,
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonDark: {
    backgroundColor: colors.dark.elevated,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelButtonLight: {
    backgroundColor: colors.light.elevated,
    borderColor: colors.light.border,
  },
  actionButtonWrapper: {
    minHeight: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: colors.brand.white,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default CustomAlertModal;
