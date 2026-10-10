import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'haptic_feedback_enabled';

let isHapticsEnabled = true;

// Initialize state from storage on module load
AsyncStorage.getItem(STORAGE_KEY)
  .then((val) => {
    if (val !== null) {
      isHapticsEnabled = val === 'true';
    }
  })
  .catch((err) => console.log('Haptic storage read error:', err));

export const hapticService = {
  isEnabled: () => isHapticsEnabled,

  async setEnabled(enabled) {
    isHapticsEnabled = Boolean(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(isHapticsEnabled));
    } catch (e) {
      console.log('Haptic storage save error:', e);
    }
    if (isHapticsEnabled) {
      // Immediate tactile feedback confirming it was turned on
      this.light();
    }
  },

  // Subtle light tap for regular button presses and toggles
  light() {
    if (!isHapticsEnabled) return;
    try {
      Vibration.vibrate(30);
    } catch (e) {}
  },

  // Medium vibration for modals, tabs, or confirmations
  medium() {
    if (!isHapticsEnabled) return;
    try {
      Vibration.vibrate(60);
    } catch (e) {}
  },

  // Heavy vibration for alerts, reset or deletion actions
  heavy() {
    if (!isHapticsEnabled) return;
    try {
      Vibration.vibrate(120);
    } catch (e) {}
  },

  // Distinct double-pulse for streak achievements or correct answers
  success() {
    if (!isHapticsEnabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 45, 60, 65]);
      } else {
        Vibration.vibrate(50);
      }
    } catch (e) {}
  },

  // Multi-pulse buzz for wrong answers or errors
  error() {
    if (!isHapticsEnabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 60, 40, 60, 40, 90]);
      } else {
        Vibration.vibrate(100);
      }
    } catch (e) {}
  },

  // Quick crisp selection feedback
  selection() {
    if (!isHapticsEnabled) return;
    try {
      Vibration.vibrate(20);
    } catch (e) {}
  },
};

export default hapticService;
