import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import CustomText from './CustomText';
import Icon from './Icon';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  iconName,
  iconColor,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  style,
  containerStyle,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let borderStyle = isDark ? styles.borderDark : styles.borderLight;
  if (isFocused) {
    borderStyle = styles.borderFocused;
  } else if (error) {
    borderStyle = styles.borderError;
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <CustomText
          variant="caption"
          weight="medium"
          style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}
        >
          {label}
        </CustomText>
      )}

      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputDark : styles.inputLight,
          borderStyle,
          style,
        ]}
      >
        {iconName ? (
          <Icon
            name={iconName}
            size={20}
            color={iconColor || (isFocused ? '#007AFF' : (isDark ? '#64748B' : '#717786'))}
            style={styles.leftIconVector}
          />
        ) : icon ? (
          typeof icon === 'string' ? (
            <CustomText style={styles.leftIconEmoji}>{icon}</CustomText>
          ) : (
            <Image
              source={icon}
              style={[
                styles.leftIcon,
                isFocused ? styles.iconFocused : styles.iconMuted,
              ]}
              resizeMode="contain"
            />
          )
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#64748B' : '#717786'}
          style={[
            styles.textInput,
            isDark ? styles.textDark : styles.textLight,
          ]}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            {typeof rightIcon === 'string' ? (
              <CustomText style={styles.rightIconEmoji}>{rightIcon}</CustomText>
            ) : (
              <Image
                source={rightIcon}
                style={[styles.rightIcon, styles.iconMuted]}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <CustomText
          variant="small"
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  labelDark: { color: '#94A3B8' },
  labelLight: { color: '#414755' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  inputDark: { backgroundColor: '#161823' },
  inputLight: { backgroundColor: '#F2F2F7' },
  borderDark: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLight: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  borderFocused: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  borderError: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  leftIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  leftIconEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  leftIconVector: {
    marginRight: 10,
  },
  rightIconEmoji: {
    fontSize: 16,
  },
  iconFocused: { tintColor: '#007AFF' },
  iconMuted: { tintColor: '#717786' },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
  },
  textDark: { color: '#F8FAFC' },
  textLight: { color: '#1A1B1F' },
  rightAction: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  toggleText: { color: '#007AFF' },
  rightIcon: {
    width: 18,
    height: 18,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
  },
});

export default AppTextInput;
