import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const Container = ({
  children,
  style,
  backgroundColor,
  statusBarStyle,
  noPadding = false,
  safeArea = true,
  edges = ['top', 'left', 'right'],
}) => {
  const { theme, isDark } = useTheme();
  const Wrapper = safeArea ? SafeAreaView : View;
  const bgColor = backgroundColor || theme.colors.background;
  const resolvedStatusBarStyle =
    statusBarStyle || (isDark ? 'light-content' : 'dark-content');
  const wrapperProps = safeArea ? { edges } : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.container, { backgroundColor: bgColor }, style]}>
      <StatusBar
        barStyle={resolvedStatusBarStyle}
        backgroundColor={bgColor}
      />
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 0,
  },
  noPadding: {
    padding: 0,
  },
});

export default Container;
