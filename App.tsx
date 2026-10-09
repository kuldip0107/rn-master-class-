import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation';
import { ThemeProvider, AlertProvider, QuizProvider } from './src/context';
import './src/i18n';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ThemeProvider>
        <AlertProvider>
          <QuizProvider>
            <AppNavigator />
          </QuizProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
