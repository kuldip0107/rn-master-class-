import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/theme';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default', // 'default', 'elevated', 'outlined', 'flat'
  padding = 'm',
  borderRadius = 16,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const Container = onPress ? TouchableOpacity : View;

  const getContainerStyle = () => {
    const cardBg = isDark ? colors.dark.card : colors.brand.white;
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.light.border;

    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: borderColor,
          backgroundColor: cardBg,
        };
      case 'flat':
        return {
          backgroundColor: isDark ? colors.dark.elevated : colors.light.elevated,
          borderWidth: 0,
        };
      case 'elevated':
        return {
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
          ...theme.shadows.card,
        };
      case 'default':
      default:
        return {
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
        };
    }
  };

  const getPaddingValue = () => {
    if (typeof padding === 'number') return padding;
    if (padding === 's' || padding === 'sm') return 10;
    if (padding === 'm' || padding === 'md') return 16;
    if (padding === 'l' || padding === 'lg') return 20;
    return 16;
  };

  return (
    <Container
      style={[
        styles.card,
        { borderRadius: borderRadius, padding: getPaddingValue() },
        getContainerStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    width: '100%',
  },
});

export default Card;
