import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const TOTAL_TIME_KEY = 'app_total_time_spent_seconds';
const TODAY_TIME_KEY = 'app_today_time_spent_seconds';
const LAST_DATE_KEY = 'app_last_tracked_date';

class AppUsageService {
  constructor() {
    this.totalSeconds = 0;
    this.todaySeconds = 0;
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
      const [savedTotal, savedToday, savedDate] = await Promise.all([
        AsyncStorage.getItem(TOTAL_TIME_KEY),
        AsyncStorage.getItem(TODAY_TIME_KEY),
        AsyncStorage.getItem(LAST_DATE_KEY),
      ]);

      this.totalSeconds = savedTotal ? parseInt(savedTotal, 10) : 0;

      if (savedDate === todayStr) {
        this.todaySeconds = savedToday ? parseInt(savedToday, 10) : 0;
      } else {
        // Different day: reset today's session, but keep total seconds intact!
        this.todaySeconds = 0;
        await AsyncStorage.setItem(LAST_DATE_KEY, todayStr);
        await AsyncStorage.setItem(TODAY_TIME_KEY, '0');
      }
    } catch (e) {
      console.log('AppUsageService init error:', e);
    }

    // Start timer if app is currently active
    if (AppState.currentState === 'active') {
      this.startTimer();
    }

    // Handle background / foreground state transitions
    AppState.addEventListener('change', (nextState) => {
      if (this.appState.match(/inactive|background/) && nextState === 'active') {
        this.startTimer();
      } else if (nextState.match(/inactive|background/)) {
        this.stopTimer();
        this.saveToStorage();
      }
      this.appState = nextState;
    });
  }

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.totalSeconds += 1;
      this.todaySeconds += 1;

      this.notifyListeners();

      // Persist to storage every 5 seconds and on state changes
      if (this.totalSeconds % 5 === 0) {
        this.saveToStorage();
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
      ]);
    } catch (e) {
      console.log('AppUsageService save error:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Emit initial values immediately
    callback({
      totalSeconds: this.totalSeconds,
      todaySeconds: this.todaySeconds,
      formattedTotal: this.formatTime(this.totalSeconds),
      formattedToday: this.formatTime(this.todaySeconds),
    });

    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    const payload = {
      totalSeconds: this.totalSeconds,
      todaySeconds: this.todaySeconds,
      formattedTotal: this.formatTime(this.totalSeconds),
      formattedToday: this.formatTime(this.todaySeconds),
    };
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
}

export const appUsageService = new AppUsageService();
export default appUsageService;
