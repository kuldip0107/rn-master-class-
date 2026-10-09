import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Type-safe, crash-resilient AsyncStorage wrapper
 */
export const storage = {
  async get(key, defaultValue = null) {
    try {
      const val = await AsyncStorage.getItem(key);
      return val !== null ? val : defaultValue;
    } catch (e) {
      console.warn(`Storage get error for key "${key}":`, e);
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, String(value));
      return true;
    } catch (e) {
      console.error(`Storage set error for key "${key}":`, e);
      return false;
    }
  },

  async getObject(key, defaultValue = null) {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn(`Storage getObject error for key "${key}":`, e);
      return defaultValue;
    }
  },

  async setObject(key, object) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(object));
      return true;
    } catch (e) {
      console.error(`Storage setObject error for key "${key}":`, e);
      return false;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Storage remove error for key "${key}":`, e);
      return false;
    }
  },

  async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (e) {
      console.error('Storage multiRemove error:', e);
      return false;
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  },
};

export default storage;
