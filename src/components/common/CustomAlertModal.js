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

const ALERT_TYPES = {
  success: {
    primaryColor: '#10B981',
    gradient: ['#10B981', '#00C1FD'],
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    badgeShadow: '#10B981',
    iconSymbol: '✓',
    defaultTitle: 'Success',
  },
  error: {
    primaryColor: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeBorder: 'rgba(239, 68, 68, 0.3)',
    badgeShadow: '#EF4444',
    iconSymbol: '✕',
    defaultTitle: 'Error',
  },
  warning: {
    primaryColor: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    badgeShadow: '#F59E0B',
    iconSymbol: '!',
    defaultTitle: 'Warning',
  },
  info: {
    primaryColor: '#007AFF',
    gradient: ['#007AFF', '#00C1FD'],
    badgeBg: 'rgba(0, 122, 255, 0.12)',
    badgeBorder: 'rgba(0, 122, 255, 0.3)',
    badgeShadow: '#007AFF',
    iconSymbol: 'i',
    defaultTitle: 'Information',
  },
  confirm: {
    primaryColor: '#007AFF',
    gradient: ['#007AFF', '#00C1FD'],
    badgeBg: 'rgba(0, 122, 255, 0.12)',
    badgeBorder: 'rgba(0, 122, 255, 0.3)',
    badgeShadow: '#007AFF',
    iconSymbol: '?',
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
                      <CustomText weight="heavy" style={styles.badgeText}>
                        {typeConfig.iconSymbol}
                      </CustomText>
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
                    ? ['#EF4444', '#DC2626']
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
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
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
    color: '#FFFFFF',
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
    color: '#F8FAFC',
  },
  textPrimaryLight: {
    color: '#1A1B1F',
  },
  textSecondaryDark: {
    color: '#94A3B8',
  },
  textSecondaryLight: {
    color: '#414755',
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
    backgroundColor: '#161823',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelButtonLight: {
    backgroundColor: '#F4F3F8',
    borderColor: '#E3E2E7',
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
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default CustomAlertModal;
