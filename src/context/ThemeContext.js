import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme !== null) {
          setIsDark(storedTheme === 'dark');
        } else {
          // Default to Dark Theme for all new users
          setIsDark(true);
        }
      } catch (err) {
        console.error('Failed to load stored theme', err);
      }
    };
    loadStoredTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextIsDark = !isDark;
      setIsDark(nextIsDark);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  const setTheme = async (dark) => {
    try {
      setIsDark(Boolean(dark));
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

