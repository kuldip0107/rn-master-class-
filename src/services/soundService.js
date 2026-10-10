import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticService } from './hapticService';

const { SoundModule } = NativeModules;
const STORAGE_KEY = 'sound_effects_enabled';

let isSoundEnabled = true;

// Load persisted state from storage
AsyncStorage.getItem(STORAGE_KEY)
  .then((val) => {
    if (val !== null) {
      isSoundEnabled = val === 'true';
    }
  })
  .catch((err) => console.log('Sound storage read error:', err));

export const soundService = {
  isEnabled: () => isSoundEnabled,

  async setEnabled(enabled) {
    isSoundEnabled = Boolean(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(isSoundEnabled));
    } catch (e) {
      console.log('Sound storage save error:', e);
    }
    if (isSoundEnabled) {
      // Immediate preview tone when enabled
      this.playSuccess();
    }
  },

  // UI button click / toggle switch sound
  playClick() {
    if (!isSoundEnabled) return;
    try {
      if (SoundModule?.playClick) {
        SoundModule.playClick();
      }
    } catch (e) {
      console.log('playClick error:', e);
    }
    hapticService.light();
  },

  // Success tone for correct answers, completed tasks, streak increment
  playSuccess() {
    if (!isSoundEnabled) return;
    try {
      if (SoundModule?.playSuccess) {
        SoundModule.playSuccess();
      } else if (SoundModule?.playNotification) {
        SoundModule.playNotification();
      }
    } catch (e) {
      console.log('playSuccess error:', e);
    }
    hapticService.success();
  },

  // Error tone for incorrect answers or failures
  playError() {
    if (!isSoundEnabled) return;
    try {
      if (SoundModule?.playError) {
        SoundModule.playError();
      }
    } catch (e) {
      console.log('playError error:', e);
    }
    hapticService.error();
  },

  // Cheerful chime for celebration / streak protected
  playChime() {
    if (!isSoundEnabled) return;
    try {
      if (SoundModule?.playChime) {
        SoundModule.playChime();
      } else if (SoundModule?.playNotification) {
        SoundModule.playNotification();
      }
    } catch (e) {
      console.log('playChime error:', e);
    }
    hapticService.medium();
  },

  // Default system notification chime
  playNotification() {
    if (!isSoundEnabled) return;
    try {
      if (SoundModule?.playNotification) {
        SoundModule.playNotification();
      }
    } catch (e) {
      console.log('playNotification error:', e);
    }
    hapticService.medium();
  },
};

export default soundService;
