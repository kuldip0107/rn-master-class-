import AsyncStorage from '@react-native-async-storage/async-storage';
import { componentsAPI } from './api';
import localComponentsData from '../data/componentsData';

const CACHE_KEYS = {
  SECTIONS: 'cached_components_sections',
  DETAIL_PREFIX: 'comp_detail_',
  LAST_SYNC: 'components_last_sync_time',
};

class ContentService {
  constructor() {
    this.memorySections = null;
    this.memoryDetails = new Map();
    this.listeners = new Set();
    this.isSyncing = false;
  }

  /**
   * Subscribe to content updates (called when background sync fetches newer data)
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.warn('Error notifying content listener:', e);
      }
    });
  }

  /**
   * Normalize component ID
   */
  normalizeId(idOrName) {
    if (!idOrName) return 'view';
    return idOrName.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  /**
   * Get Components list for SectionList (Offline-First)
   * 1. Returns in-memory or AsyncStorage cache immediately
   * 2. Falls back to bundled localComponentsData
   * 3. Syncs fresh list from Cloud MongoDB in background
   */
  async getComponentsList(onUpdated) {
    // 1. In-memory fast path
    if (this.memorySections && this.memorySections.length > 0) {
      this.syncListInBackground(onUpdated);
      return this.memorySections;
    }

    // 2. AsyncStorage cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.SECTIONS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memorySections = parsed;
          this.syncListInBackground(onUpdated);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed reading cached component sections:', err);
    }

    // 3. Fallback to bundled data
    this.memorySections = localComponentsData;
    this.syncListInBackground(onUpdated);
    return localComponentsData;
  }

  /**
   * Background sync for components list from MongoDB Atlas
   */
  async syncListInBackground(onUpdated) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const response = await componentsAPI.getAll('sections');
      if (response && response.success && Array.isArray(response.sections) && response.sections.length > 0) {
        // Re-attach local componentData references for instant opening
        const mergedSections = response.sections.map((cloudSection) => {
          const localMatchSection = localComponentsData.find(
            (ls) => ls.title?.toLowerCase() === cloudSection.title?.toLowerCase()
          );

          const enrichedData = cloudSection.data.map((cloudItem) => {
            const localItem = localMatchSection?.data?.find(
              (li) =>
                li.id === cloudItem.id ||
                li.name?.toLowerCase() === cloudItem.name?.toLowerCase()
            );

            return {
              ...cloudItem,
              componentData: localItem?.componentData || null,
            };
          });

          return {
            ...cloudSection,
            data: enrichedData,
          };
        });

        this.memorySections = mergedSections;
        await AsyncStorage.setItem(CACHE_KEYS.SECTIONS, JSON.stringify(mergedSections));
        await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());

        if (typeof onUpdated === 'function') {
          onUpdated(mergedSections);
        }
        this.notifyListeners(mergedSections);
      }
    } catch (apiErr) {
      // Gracefully silent when offline
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get single component full documentation & data
   * 1. Returns local/fallback data immediately
   * 2. Checks AsyncStorage detail cache
   * 3. Syncs fresh details from Cloud in background
   */
  async getComponentDetail(componentIdOrName, fallbackData = null, onUpdated = null) {
    const key = this.normalizeId(componentIdOrName);

    // Check memory detail
    if (this.memoryDetails.has(key)) {
      const cached = this.memoryDetails.get(key);
      this.syncDetailInBackground(key, onUpdated);
      return cached;
    }

    // Check AsyncStorage
    try {
      const cachedStr = await AsyncStorage.getItem(CACHE_KEYS.DETAIL_PREFIX + key);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        this.memoryDetails.set(key, parsed);
        this.syncDetailInBackground(key, onUpdated);
        return parsed;
      }
    } catch (e) {
      // Ignore cache read error
    }

    // If fallbackData provided, cache it in memory
    if (fallbackData) {
      this.memoryDetails.set(key, fallbackData);
    }

    this.syncDetailInBackground(key, onUpdated);
    return fallbackData;
  }

  /**
   * Background sync single component detail from MongoDB
   */
  async syncDetailInBackground(key, onUpdated) {
    try {
      const response = await componentsAPI.getById(key);
      if (response && response.success && response.data && response.data.componentData) {
        const freshDetail = response.data.componentData;
        this.memoryDetails.set(key, freshDetail);
        await AsyncStorage.setItem(
          CACHE_KEYS.DETAIL_PREFIX + key,
          JSON.stringify(freshDetail)
        );

        if (typeof onUpdated === 'function') {
          onUpdated(freshDetail);
        }
      }
    } catch (_) {
      // Gracefully silent when offline or server asleep
    }
  }

  /**
   * Preload entire bundle for complete offline readiness
   */
  async preloadFullBundle() {
    try {
      const response = await componentsAPI.getFullBundle();
      if (response && response.success && Array.isArray(response.data)) {
        for (const comp of response.data) {
          if (comp.componentId && comp.componentData) {
            const key = this.normalizeId(comp.componentId);
            this.memoryDetails.set(key, comp.componentData);
            await AsyncStorage.setItem(
              CACHE_KEYS.DETAIL_PREFIX + key,
              JSON.stringify(comp.componentData)
            );
          }
        }
      }
    } catch (_) {}
  }
}

export const contentService = new ContentService();
export default contentService;
