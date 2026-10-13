import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';

import { ROUTES } from './routes';
import { HomeScreen } from '../features/home';
import { LessonScreen } from '../features/lessons';
import { PracticalScreen } from '../features/practice';
import { ProfileScreen } from '../features/profile';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ routeName, focused, color }) => {
  let iconName = 'home';
  if (routeName === ROUTES.LESSONS || routeName === 'Lessons') iconName = 'menu-book';
  if (routeName === ROUTES.PRACTICE || routeName === 'Practice') iconName = 'code';
  if (routeName === ROUTES.PROFILE || routeName === 'Profile') iconName = 'person';

  return (
    <View style={styles.iconContainer}>
      <Icon
        name={iconName}
        size={focused ? 24 : 22}
        color={focused ? colors.brand.accent : color}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
};

const renderHomeIcon = ({ focused, color }) => (
  <TabBarIcon routeName={ROUTES.HOME} focused={focused} color={color} />
);

const renderLessonsIcon = ({ focused, color }) => (
  <TabBarIcon routeName={ROUTES.LESSONS} focused={focused} color={color} />
);

const renderPracticeIcon = ({ focused, color }) => (
  <TabBarIcon routeName={ROUTES.PRACTICE} focused={focused} color={color} />
);

const renderProfileIcon = ({ focused, color }) => (
  <TabBarIcon routeName={ROUTES.PROFILE} focused={focused} color={color} />
);

const TabNavigator = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand.accent,
        tabBarInactiveTintColor: isDark ? colors.dark.textMuted : colors.light.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          isDark ? styles.tabBarDark : styles.tabBarLight,
        ],
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 6,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home') || 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.LESSONS}
        component={LessonScreen}
        options={{
          tabBarLabel: t('tabs.learn') || 'Lessons',
          tabBarIcon: renderLessonsIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.PRACTICE}
        component={PracticalScreen}
        options={{
          tabBarLabel: t('tabs.quiz') || 'Practice',
          tabBarStyle: { display: 'none' },
          tabBarIcon: renderPracticeIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile') || 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 82 : 68,
    paddingBottom: Platform.OS === 'ios' ? 22 : 6,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarDark: {
    backgroundColor: '#0A0B10',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBarLight: {
    backgroundColor: colors.brand.white,
    borderTopColor: colors.light.border,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    position: 'relative',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    backgroundColor: colors.brand.accent,
  },
});

export default TabNavigator;
