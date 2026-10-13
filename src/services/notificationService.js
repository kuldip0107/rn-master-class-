import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const notificationService = {
  async requestPermission() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Daily Streak Reminders',
            message: 'Allow notifications so you never lose your daily learning streak!',
            buttonNeutral: 'Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android POST_NOTIFICATIONS permission not granted');
        }
      }
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1;
    } catch (e) {
      console.error('Permission error:', e);
      return false;
    }
  },

  async scheduleDailyReminder(hour = 19, minute = 0) {
    try {
      await this.requestPermission();

      // Create high-importance channel with sound and vibration
      const channelId = await notifee.createChannel({
        id: 'daily_streak_reminder',
        name: 'Daily Streak Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      // Calculate next trigger time (e.g. 7:00 PM)
      const date = new Date(Date.now());
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);

      // If time already passed today, schedule for tomorrow
      if (date.getTime() <= Date.now()) {
        date.setDate(date.getDate() + 1);
      }

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      // Cancel existing reminder if any before creating a new one
      await notifee.cancelNotification('daily_streak_notification');

      await notifee.createTriggerNotification(
        {
          id: 'daily_streak_notification',
          title: "🔥 Don't break your learning streak!",
          body: "You are doing great! Complete today's quick lesson or quiz to keep your streak alive. 🚀",
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
            sound: 'default',
            vibrationPattern: [300, 500],
          },
          ios: {
            sound: 'default',
          },
        },
        trigger
      );

      console.log('Daily streak notification scheduled for:', date.toString());
      return true;
    } catch (error) {
      console.error('Failed to schedule daily notification:', error);
      return false;
    }
  },

  async cancelDailyReminder() {
    try {
      await notifee.cancelNotification('daily_streak_notification');
      console.log('Daily streak notification cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  },

  async triggerInstantTestNotification() {
    try {
      await this.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'daily_streak_reminder',
        name: 'Daily Streak Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      await notifee.displayNotification({
        id: 'streak_activated_test',
        title: '🔥 Daily Streak Reminder Activated!',
        body: 'Scheduled daily at 7:00 PM. Keep your streak alive and never miss a lesson! 🚀',
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
          sound: 'default',
          vibrationPattern: [300, 500],
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (e) {
      console.error('Instant notification error:', e);
    }
  },

  async initDailyReminderIfEnabled() {
    try {
      const enabled = await AsyncStorage.getItem('daily_reminder_enabled');
      if (enabled === 'true') {
        await this.scheduleDailyReminder(19, 0);
      }
    } catch (e) {
      console.log('Error initializing daily reminder:', e);
    }
  },


  /**
   * Sync FCM / Device Push token with backend
   */
  async syncTokenWithBackend(fcmToken) {
    try {
      const { notificationAPI, getCurrentUser } = require('./api');
      const user = await getCurrentUser();
      if (user && user.id && fcmToken) {
        return await notificationAPI.registerToken({
          userId: user.id,
          fcmToken,
        });
      }
    } catch (e) {
      console.log('Failed to sync push token with backend:', e.message);
    }
    return null;
  },

  /**
   * Fetch in-app notifications from backend
   */
  async fetchServerNotifications() {
    try {
      const { notificationAPI, getCurrentUser } = require('./api');
      const user = await getCurrentUser();
      if (user && user.id) {
        return await notificationAPI.getNotifications(user.id);
      }
    } catch (e) {
      console.log('Failed to fetch server notifications:', e.message);
    }
    return { notifications: [], unreadCount: 0 };
  },

  /**
   * Mark notification as read on backend
   */
  async markNotificationAsRead(notificationId) {
    try {
      const { notificationAPI } = require('./api');
      if (notificationId) {
        return await notificationAPI.markAsRead(notificationId);
      }
    } catch (e) {
      console.log('Failed to mark notification as read:', e.message);
    }
    return null;
  },
};
