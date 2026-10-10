import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation';
import { ThemeProvider, useTheme, AlertProvider, QuizProvider } from './src/context';
import { notificationService } from './src/services/notificationService';
import './src/i18n';

const MainApp = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#ffffff'}
      />
      <AlertProvider>
        <QuizProvider>
          <AppNavigator />
        </QuizProvider>
      </AlertProvider>
    </>
  );
};

const App = () => {
  useEffect(() => {
    notificationService.initDailyReminderIfEnabled();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};


export default App;
