import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { userAPI } from './api';

const TOTAL_TIME_KEY = 'app_total_time_spent_seconds';
const TODAY_TIME_KEY = 'app_today_time_spent_seconds';
const LAST_DATE_KEY = 'app_last_tracked_date';
const PENDING_SYNC_KEY = 'app_usage_pending_sync';
const LAST_SYNCED_TOTAL_KEY = 'app_usage_last_synced_total';
const LAST_SYNCED_TIMESTAMP_KEY = 'app_usage_last_synced_timestamp';

class AppUsageService {
  constructor() {
    this.totalSeconds = 0;
    this.todaySeconds = 0;
    this.lastSyncedTotal = 0;
    this.lastSyncedTimestamp = null;
    this.isPendingSync = false;
    this.syncStatus = 'synced'; // 'synced' | 'syncing' | 'offline'
    this.isSyncing = false;
    this.listeners = new Set();
    this.timer = null;
    this.appState = AppState.currentState;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [
        savedTotal,
        savedToday,
        savedDate,
        savedPending,
        savedSyncedTotal,
        savedSyncedTimestamp,
      ] = await Promise.all([
        AsyncStorage.getItem(TOTAL_TIME_KEY),
        AsyncStorage.getItem(TODAY_TIME_KEY),
        AsyncStorage.getItem(LAST_DATE_KEY),
        AsyncStorage.getItem(PENDING_SYNC_KEY),
        AsyncStorage.getItem(LAST_SYNCED_TOTAL_KEY),
        AsyncStorage.getItem(LAST_SYNCED_TIMESTAMP_KEY),
      ]);

      this.totalSeconds = savedTotal ? parseInt(savedTotal, 10) : 0;
      this.lastSyncedTotal = savedSyncedTotal ? parseInt(savedSyncedTotal, 10) : 0;
      this.lastSyncedTimestamp = savedSyncedTimestamp || null;
      this.isPendingSync = savedPending === 'true' || this.totalSeconds > this.lastSyncedTotal;

      if (savedDate === todayStr) {
        this.todaySeconds = savedToday ? parseInt(savedToday, 10) : 0;
      } else {
        // Different day: reset today's session, but keep total seconds intact!
        this.todaySeconds = 0;
        await AsyncStorage.setItem(LAST_DATE_KEY, todayStr);
        await AsyncStorage.setItem(TODAY_TIME_KEY, '0');
      }
    } catch (e) {
      console.log('AppUsageService init local storage error:', e);
    }

    // Try initial sync with backend
    this.syncWithBackend().catch(() => {});

    // Start timer if app is currently active
    if (AppState.currentState === 'active') {
      this.startTimer();
    }

    // Handle background / foreground state transitions
    AppState.addEventListener('change', (nextState) => {
      if (this.appState.match(/inactive|background/) && nextState === 'active') {
        this.startTimer();
        // App resumed into foreground: attempt sync
        this.syncWithBackend().catch(() => {});
      } else if (nextState.match(/inactive|background/)) {
        this.stopTimer();
        this.saveToStorage();
        // Going to background: trigger quick sync if online
        this.syncWithBackend().catch(() => {});
      }
      this.appState = nextState;
    });
  }

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.totalSeconds += 1;
      this.todaySeconds += 1;
      this.isPendingSync = true;

      this.notifyListeners();

      // Persist to local storage every 5 seconds
      if (this.totalSeconds % 5 === 0) {
        this.saveToStorage();
      }

      // Auto periodic sync with backend every 30 seconds
      if (this.totalSeconds % 30 === 0) {
        this.syncWithBackend().catch(() => {});
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async saveToStorage() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await AsyncStorage.multiSet([
        [TOTAL_TIME_KEY, String(this.totalSeconds)],
        [TODAY_TIME_KEY, String(this.todaySeconds)],
        [LAST_DATE_KEY, todayStr],
        [PENDING_SYNC_KEY, this.isPendingSync ? 'true' : 'false'],
        [LAST_SYNCED_TOTAL_KEY, String(this.lastSyncedTotal)],
      ]);
    } catch (e) {
      console.log('AppUsageService save error:', e);
    }
  }

  /**
   * Offline-First Backend Synchronization
   * - If offline: continues storing locally, flags pending sync, marks status as 'offline'
   * - When network is active / restored: pushes accumulated local data to backend, marks status as 'synced'
   */
  async syncWithBackend(force = false) {
    if (this.isSyncing) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // User not logged in: keep local storage, nothing to push yet
        return;
      }

      // If nothing has changed and not forced, skip
      if (!force && !this.isPendingSync && this.totalSeconds === this.lastSyncedTotal) {
        return;
      }

      this.isSyncing = true;
      this.syncStatus = 'syncing';
      this.notifyListeners();

      const payload = {
        userId,
        totalSeconds: this.totalSeconds,
        todaySeconds: this.todaySeconds,
        totalScreenTimeSeconds: this.totalSeconds,
        todayScreenTimeSeconds: this.todaySeconds,
      };

      const response = await userAPI.syncScreenTime(payload);

      if (response && response.success) {
        // Successfully synced with backend!
        const serverTotal = response.screenTime?.totalScreenTimeSeconds;
        if (typeof serverTotal === 'number' && serverTotal > this.totalSeconds) {
          // Backend has higher accumulated time
          this.totalSeconds = serverTotal;
        }

        this.lastSyncedTotal = this.totalSeconds;
        this.lastSyncedTimestamp = new Date().toISOString();
        this.isPendingSync = false;
        this.syncStatus = 'synced';

        await AsyncStorage.multiSet([
          [TOTAL_TIME_KEY, String(this.totalSeconds)],
          [LAST_SYNCED_TOTAL_KEY, String(this.lastSyncedTotal)],
          [LAST_SYNCED_TIMESTAMP_KEY, this.lastSyncedTimestamp],
          [PENDING_SYNC_KEY, 'false'],
        ]);
      } else {
        // Unexpected response: treat as pending
        this.isPendingSync = true;
        this.syncStatus = 'offline';
      }
    } catch (err) {
      // Offline / Network Error / Server unreachable
      // Local storage is completely safe and retained!
      this.isPendingSync = true;
      this.syncStatus = 'offline';
      await AsyncStorage.setItem(PENDING_SYNC_KEY, 'true').catch(() => {});
      console.log('AppUsageService offline notice: time saved locally in AsyncStorage. Will sync when online.');
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Force manual sync (e.g. from UI button or screen focus)
   */
  async syncNow() {
    return this.syncWithBackend(true);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Emit initial values immediately
    callback(this.getStatsSnapshot());

    return () => {
      this.listeners.delete(callback);
    };
  }

  getStatsSnapshot() {
    return {
      totalSeconds: this.totalSeconds,
      todaySeconds: this.todaySeconds,
      formattedTotal: this.formatTime(this.totalSeconds),
      formattedToday: this.formatTime(this.todaySeconds),
      syncStatus: this.syncStatus,
      isPendingSync: this.isPendingSync,
      lastSyncedTimestamp: this.lastSyncedTimestamp,
    };
  }

  notifyListeners() {
    const payload = this.getStatsSnapshot();
    this.listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {}
    });
  }

  formatTime(totalSec) {
    const s = Math.max(0, totalSec || 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  getTotalSeconds() {
    return this.totalSeconds;
  }

  getSyncStatus() {
    return this.syncStatus;
  }
}

export const appUsageService = new AppUsageService();
export default appUsageService;
