import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';

export const notificationService = {
  async requestPermission() {
    try {
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

      // Create high-importance channel for Android
      const channelId = await notifee.createChannel({
        id: 'daily_streak_reminder',
        name: 'Daily Streak Reminders',
        importance: 4, // High
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
          title: '🔥 Don\'t break your learning streak!',
          body: 'You are doing great! Complete today\'s quick lesson or quiz to keep your streak alive. 🚀',
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
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
      const channelId = await notifee.createChannel({
        id: 'test_notification',
        name: 'Test Notifications',
        importance: 4,
      });

      await notifee.displayNotification({
        title: '🔥 Streak Protected!',
        body: 'Awesome job! Your daily reminder is actively set to keep you on track. 🚀',
        android: {
          channelId,
          smallIcon: 'ic_launcher',
        },
      });
    } catch (e) {
      console.error(e);
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
