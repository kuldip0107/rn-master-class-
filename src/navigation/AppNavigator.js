import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { ROUTES } from './routes';
import TabNavigator from './TabNavigator';

// Feature-Domain Screen Imports
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ChangePasswordScreen,
} from '../features/auth';

import {
  ComponentDetailScreen,
  LessonScreen,
} from '../features/lessons';

import { PracticalScreen } from '../features/practice';

import {
  ProfileScreen,
  EditProfileScreen,
  AchievementsScreen,
} from '../features/profile';

import {
  InterviewPrepScreen,
  AndroidSetupScreen,
} from '../features/resources';

import {
  SettingsScreen,
  AboutAppScreen,
  HelpSupportScreen,
  TermsScreen,
} from '../features/settings';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
        <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
        <Stack.Screen
          name={ROUTES.MAIN_TABS}
          component={TabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.COMPONENT_DETAIL}
          component={ComponentDetailScreen}
        />
        <Stack.Screen
          name={ROUTES.PRACTICAL}
          component={PracticalScreen}
        />
        <Stack.Screen
          name={ROUTES.INTERVIEW_PREP}
          component={InterviewPrepScreen}
        />
        <Stack.Screen
          name={ROUTES.ANDROID_SETUP}
          component={AndroidSetupScreen}
        />
        <Stack.Screen
          name={ROUTES.TERMS}
          component={TermsScreen}
        />
        <Stack.Screen
          name={ROUTES.ABOUT_APP}
          component={AboutAppScreen}
        />
        <Stack.Screen
          name={ROUTES.ACHIEVEMENTS}
          component={AchievementsScreen}
        />
        <Stack.Screen
          name={ROUTES.HELP_SUPPORT}
          component={HelpSupportScreen}
        />
        <Stack.Screen
          name={ROUTES.SETTINGS}
          component={SettingsScreen}
        />
        <Stack.Screen
          name={ROUTES.EDIT_PROFILE}
          component={EditProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
