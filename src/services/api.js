import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Default Base URL:
 * - Android Emulator uses 10.0.2.2 to access host machine's localhost
 * - iOS Simulator / Web uses localhost
 * - Can be overridden dynamically via AsyncStorage key 'custom_api_base_url'
 */
const DEFAULT_BASE_URL = 'http://localhost:5000';

export const getBaseUrl = async () => {
  try {
    const customUrl = await AsyncStorage.getItem('custom_api_base_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_BASE_URL;
};

export const setBaseUrl = async (url) => {
  if (!url) {
    await AsyncStorage.removeItem('custom_api_base_url');
  } else {
    await AsyncStorage.setItem('custom_api_base_url', url.trim().replace(/\/+$/, ''));
  }
};

/**
 * Universal API Request Handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Timeout controller (10s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Connection timed out. Please check if your backend server is running on port 5000.');
      timeoutErr.isNetworkError = true;
      throw timeoutErr;
    }
    if (!error.status) {
      const netErr = new Error(`Cannot connect to server at ${baseUrl}. Ensure backend is running!`);
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw error;
  }
};

/* ==========================================================================
   1. USER SESSION HELPERS
   ========================================================================== */

export const getCurrentUser = async () => {
  try {
    const id = await AsyncStorage.getItem('userId');
    const name = await AsyncStorage.getItem('userName');
    const email = await AsyncStorage.getItem('userEmail');
    const profileImage = await AsyncStorage.getItem('profileImage');
    const userStr = await AsyncStorage.getItem('userObject');
    const parsedUser = userStr ? JSON.parse(userStr) : null;

    return {
      id,
      name,
      email,
      profileImage,
      ...parsedUser,
    };
  } catch (e) {
    return null;
  }
};

export const saveUserSession = async (user) => {
  try {
    if (!user) return;
    const userId = user.id || user._id;
    if (userId) await AsyncStorage.setItem('userId', String(userId));
    if (user.name) await AsyncStorage.setItem('userName', user.name);
    if (user.email) await AsyncStorage.setItem('userEmail', user.email);
    if (user.userTitle) await AsyncStorage.setItem('userTitle', user.userTitle);
    if (user.avatarColor) await AsyncStorage.setItem('avatarColor', user.avatarColor);
    if (user.profileImage) await AsyncStorage.setItem('profileImage', user.profileImage);
    else if (user.photoUrl) await AsyncStorage.setItem('profileImage', user.photoUrl);
    if (user.streak != null) await AsyncStorage.setItem('streak', String(user.streak));
    const todayStr = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem('lastActiveDate', user.lastActiveDate || todayStr);
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userObject', JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user session', e);
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.setItem('isLoggedIn', 'false');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('profileImage');
    await AsyncStorage.removeItem('userObject');
  } catch (e) {
    console.error('Error clearing user session', e);
  }
};

/* ==========================================================================
   2. SYSTEM & HEALTH API
   ========================================================================== */

export const systemAPI = {
  checkHealth: () => apiRequest('/api/health', { method: 'GET' }),
};

/* ==========================================================================
   3. AUTHENTICATION APIs
   ========================================================================== */

export const authAPI = {
  // POST /api/auth/register
  register: (payload) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/auth/login
  login: (payload) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/auth/google-login & /api/auth/google-signup
  googleLogin: (payload) =>
    apiRequest('/api/auth/google-login', {
      method: 'POST',
      body: payload,
    }),
  googleSignup: (payload) =>
    apiRequest('/api/auth/google-signup', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/auth/change-password
  changePassword: (payload) =>
    apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/auth/forgot-password
  forgotPassword: (payload) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/auth/reset-password
  resetPassword: (payload) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: payload,
    }),

  // GET /api/auth/users
  getAllUsers: () =>
    apiRequest('/api/auth/users', {
      method: 'GET',
    }),
};

/* ==========================================================================
   4. USER PROFILE & LEARNING PROGRESS APIs
   ========================================================================== */

export const userAPI = {
  // GET /api/user/profile/:userId
  getProfile: (userId) =>
    apiRequest(`/api/user/profile/${userId}`, {
      method: 'GET',
    }),

  // PUT /api/user/profile/:userId
  updateProfile: (userId, payload) =>
    apiRequest(`/api/user/profile/${userId}`, {
      method: 'PUT',
      body: payload,
    }),

  // GET /api/user/progress/:userId
  getProgress: (userId) =>
    apiRequest(`/api/user/progress/${userId}`, {
      method: 'GET',
    }),

  // PUT /api/user/progress/:userId
  updateProgress: (userId, payload) =>
    apiRequest(`/api/user/progress/${userId}`, {
      method: 'PUT',
      body: payload,
    }),

  // GET /api/user/streak/:userId
  getStreak: (userId) =>
    apiRequest(`/api/user/streak/${userId}`, {
      method: 'GET',
    }),

  // POST /api/user/streak/:userId
  syncStreak: (userId, payload = {}) =>
    apiRequest(`/api/user/streak/${userId}`, {
      method: 'POST',
      body: payload,
    }),
};

/* ==========================================================================
   5. QUIZ & ACHIEVEMENTS APIs
   ========================================================================== */

export const quizAPI = {
  // POST /api/quiz/result
  submitResult: (payload) =>
    apiRequest('/api/quiz/result', {
      method: 'POST',
      body: payload,
    }),

  // GET /api/quiz/history/:userId
  getHistory: (userId) =>
    apiRequest(`/api/quiz/history/${userId}`, {
      method: 'GET',
    }),
};

/* ==========================================================================
   6. SUPPORT & FEEDBACK APIs
   ========================================================================== */

export const supportAPI = {
  // POST /api/support/feedback
  submitFeedback: (payload) =>
    apiRequest('/api/support/feedback', {
      method: 'POST',
      body: payload,
    }),

  // GET /api/support/feedback
  getAllFeedbacks: () =>
    apiRequest('/api/support/feedback', {
      method: 'GET',
    }),
};

/* ==========================================================================
   7. PUSH NOTIFICATIONS & ALERTS APIs
   ========================================================================== */

export const notificationAPI = {
  // POST /api/notifications/register-token
  registerToken: (payload) =>
    apiRequest('/api/notifications/register-token', {
      method: 'POST',
      body: payload,
    }),

  // POST /api/notifications/send
  sendNotification: (payload) =>
    apiRequest('/api/notifications/send', {
      method: 'POST',
      body: payload,
    }),

  // GET /api/notifications/:userId
  getNotifications: (userId) =>
    apiRequest(`/api/notifications/${userId}`, {
      method: 'GET',
    }),

  // PUT /api/notifications/mark-read/:id
  markAsRead: (notificationId) =>
    apiRequest(`/api/notifications/mark-read/${notificationId}`, {
      method: 'PUT',
    }),
};
