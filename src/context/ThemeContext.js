import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../theme/theme';

const THEME_STORAGE_KEY = 'app_user_theme';

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [hasCustomTheme, setHasCustomTheme] = useState(false);

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme !== null) {
          setIsDark(storedTheme === 'dark');
          setHasCustomTheme(true);
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (err) {
        console.error('Failed to load stored theme', err);
      }
    };
    loadStoredTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    if (!hasCustomTheme) {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, hasCustomTheme]);

  const toggleTheme = async () => {
    try {
      const nextIsDark = !isDark;
      setIsDark(nextIsDark);
      setHasCustomTheme(true);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  const setTheme = async (dark) => {
    try {
      setIsDark(Boolean(dark));
      setHasCustomTheme(true);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

