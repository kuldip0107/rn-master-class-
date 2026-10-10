import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from './api';
import { soundService } from './soundService';
import { hapticService } from './hapticService';

const PROGRESS_PREFIX = 'lesson_progress_';

const LESSON_MAPPINGS = {
  flexbox: {
    id: 'flexbox',
    componentName: 'Flexbox Layout',
    title: 'Introduction to Flexbox',
  },
  state_management: {
    id: 'state_management',
    componentName: 'State Management',
    title: 'State Management with Context',
  },
  basic_rn: {
    id: 'basic_rn',
    componentName: 'Basic React-Native Components',
    title: 'Basic React-Native Components',
  },
};

export const lessonProgressService = {
  resolveLessonId(rawData) {
    if (!rawData) return null;
    const name = rawData.component || rawData.title || rawData.name || rawData.courseTitle;
    if (name === 'Flexbox Layout' || name === 'flexbox' || name === 'Introduction to Flexbox') {
      return 'flexbox';
    }
    if (name === 'State Management' || name === 'state_management' || name === 'State Management with Context') {
      return 'state_management';
    }
    if (
      name === 'Basic React-Native Components' ||
      name === 'basic_rn' ||
      name === 'RN_BASIC_001' ||
      name === 'Learn the Basics of React Native'
    ) {
      return 'basic_rn';
    }
    return null;
  },

  async getAllProgress() {
    try {
      const storedCompleted = await AsyncStorage.getItem('completedComponents');
      const completedList = storedCompleted ? JSON.parse(storedCompleted) : [];

      const [pFlexbox, pState, pBasic] = await Promise.all([
        AsyncStorage.getItem(PROGRESS_PREFIX + 'flexbox'),
        AsyncStorage.getItem(PROGRESS_PREFIX + 'state_management'),
        AsyncStorage.getItem(PROGRESS_PREFIX + 'basic_rn'),
      ]);

      const flexboxDone = completedList.includes('Flexbox Layout') || completedList.includes('flexbox');
      const stateDone = completedList.includes('State Management') || completedList.includes('state_management');
      const basicDone =
        completedList.includes('Basic React-Native Components') ||
        completedList.includes('basic_rn') ||
        completedList.includes('RN_BASIC_001');

      return {
        flexbox: flexboxDone ? 100 : pFlexbox !== null ? parseInt(pFlexbox, 10) : 0,
        state_management: stateDone ? 100 : pState !== null ? parseInt(pState, 10) : 0,
        basic_rn: basicDone ? 100 : pBasic !== null ? parseInt(pBasic, 10) : 0,
      };
    } catch (e) {
      console.log('Error getting lesson progress:', e);
      return { flexbox: 0, state_management: 0, basic_rn: 0 };
    }
  },

  async getProgress(lessonId) {
    if (!lessonId) return 0;
    try {
      const storedCompleted = await AsyncStorage.getItem('completedComponents');
      const completedList = storedCompleted ? JSON.parse(storedCompleted) : [];
      const mapping = LESSON_MAPPINGS[lessonId];
      if (mapping && (completedList.includes(mapping.componentName) || completedList.includes(lessonId))) {
        return 100;
      }
      const val = await AsyncStorage.getItem(PROGRESS_PREFIX + lessonId);
      return val !== null ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  async updateProgress(lessonId, newPercent) {
    if (!lessonId) return;
    const clamped = Math.min(100, Math.max(0, Math.round(newPercent)));
    try {
      const current = await this.getProgress(lessonId);
      if (clamped > current || clamped === 100) {
        await AsyncStorage.setItem(PROGRESS_PREFIX + lessonId, String(clamped));

        if (clamped === 100) {
          const mapping = LESSON_MAPPINGS[lessonId];
          const compName = mapping ? mapping.componentName : lessonId;
          const storedCompleted = await AsyncStorage.getItem('completedComponents');
          let list = storedCompleted ? JSON.parse(storedCompleted) : [];
          if (!list.includes(compName)) {
            list.push(compName);
            await AsyncStorage.setItem('completedComponents', JSON.stringify(list));
          }

          // Sync with server if logged in
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            const streakVal = parseInt((await AsyncStorage.getItem('streak')) || '1', 10);
            const todayStr = new Date().toISOString().split('T')[0];
            userAPI
              .updateProgress(storedUserId, {
                componentName: compName,
                streak: streakVal,
                lastActiveDate: todayStr,
              })
              .catch(() => {});
          }
          soundService.playSuccess();
          hapticService.success();
        }
      }
    } catch (e) {
      console.log('Error updating lesson progress:', e);
    }
  },
};

export default lessonProgressService;
