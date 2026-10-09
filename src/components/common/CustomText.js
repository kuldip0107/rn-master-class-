import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const CustomText = ({
  children,
  variant = 'body', // 'h1', 'h2', 'h3', 'body', 'bodyLg', 'caption', 'small', 'code'
  weight = 'regular', // 'regular', 'medium', 'bold', 'heavy'
  color, // 'primary', 'secondary', 'muted', or hex string
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getFontSize = () => {
    switch (variant) {
      case 'headlineXl':
      case 'h1':
        return theme.typography.size.h1 || 30;
      case 'headlineLg':
      case 'h2':
        return theme.typography.size.h2 || 24;
      case 'headlineMd':
      case 'h3':
        return theme.typography.size.h3 || 20;
      case 'bodyLg':
        return theme.typography.size.bodyLg || 17;
      case 'body':
      case 'bodyMd':
        return theme.typography.size.body || 15;
      case 'caption':
      case 'labelLg':
        return theme.typography.size.caption || 13;
      case 'small':
      case 'labelMd':
        return theme.typography.size.small || 11;
      case 'code':
        return theme.typography.size.code || 14;
      default:
        return 15;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'heavy':
        return '800';
      case 'bold':
        return '700';
      case 'medium':
        return '600';
      case 'regular':
      default:
        return '400';
    }
  };

  const getTextColor = () => {
    if (!color) return theme.colors.text.primary;
    if (color === 'primary') return theme.colors.text.primary;
    if (color === 'secondary') return theme.colors.text.secondary;
    if (color === 'muted') return theme.colors.text.muted;
    if (color === 'accent') return theme.colors.primary;
    return color;
  };

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color: getTextColor(),
          fontFamily: variant === 'code' ? 'Courier Prime' : 'System',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});

export default CustomText;
