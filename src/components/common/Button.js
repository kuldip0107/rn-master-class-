import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme/theme';
import CustomText from './CustomText';

const ButtonContent = ({
  icon,
  iconRight,
  loading,
  textColor,
  size,
  title,
  textStyle,
}) => (
  <View style={styles.contentContainer}>
    {icon && <View style={styles.leftIconContainer}>{icon}</View>}
    {loading ? (
      <ActivityIndicator color={textColor} size="small" />
    ) : (
      <CustomText
        variant={size === 'small' ? 'caption' : 'body'}
        weight="bold"
        style={[styles.titleText, { color: textColor }, textStyle]}
      >
        {title}
      </CustomText>
    )}
    {iconRight && <View style={styles.rightIconContainer}>{iconRight}</View>}
  </View>
);

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'gradient', 'secondary', 'outline', 'ghost', 'danger'
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconRight,
  size = 'medium', // 'small', 'medium', 'large'
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#A0A0A0';
    if (variant === 'primary') return '#007AFF';
    if (variant === 'secondary') return theme.colors.surfaceLow || '#F2F2F7';
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    if (variant === 'danger') return theme.colors.error;
    return '#007AFF';
  };

  const getTextColor = () => {
    if (disabled) return '#FFFFFF';
    if (variant === 'outline' || variant === 'ghost') return '#007AFF';
    if (variant === 'secondary') return theme.colors.text.primary;
    if (variant === 'danger') return '#FFFFFF';
    return '#FFFFFF';
  };

  const isGradient = variant === 'gradient' && !disabled;

  const getSizeStyle = () => {
    if (size === 'small') return styles.sizeSmall;
    if (size === 'large') return styles.sizeLarge;
    return styles.sizeMedium;
  };

  const textColor = getTextColor();

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.touchable, getSizeStyle(), style]}
        {...props}
      >
        <LinearGradient
          colors={['#007AFF', '#00C1FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, getSizeStyle()]}
        >
          <ButtonContent
            icon={icon}
            iconRight={iconRight}
            loading={loading}
            textColor={textColor}
            size={size}
            title={title}
            textStyle={textStyle}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.container,
        getSizeStyle(),
        variant === 'outline' && styles.outlineVariant,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      {...props}
    >
      <ButtonContent
        icon={icon}
        iconRight={iconRight}
        loading={loading}
        textColor={textColor}
        size={size}
        title={title}
        textStyle={textStyle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  container: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  outlineVariant: {
    borderColor: '#007AFF',
    borderWidth: 1.5,
  },
  sizeSmall: {
    minHeight: 40,
  },
  sizeMedium: {
    minHeight: 52,
  },
  sizeLarge: {
    minHeight: 56,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
});

export default Button;
