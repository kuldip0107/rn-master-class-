import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import AppTextInput from '../../../components/common/AppTextInput';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import { icons } from '../../../constants/assets';
import { CustomAlert } from '../../../context/AlertContext';

import { authAPI, getCurrentUser } from '../../../services/api';
import { colors } from '../../../theme/theme';

const ChangePasswordScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    const newErrors = {};

    if (!oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6 || newPassword.length > 20) {
      newErrors.newPassword = 'Password must be between 6 and 20 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user || !user.id) {
        setLoading(false);
        CustomAlert.error('Session Error', 'Please log in to change your password.');
        return;
      }

      const response = await authAPI.changePassword({
        userId: user.id,
        email: user.email,
        oldPassword,
        newPassword,
      });

      setLoading(false);
      CustomAlert.success(
        'Success',
        response.message || 'Password changed successfully!',
        () => {
          navigation.goBack();
        }
      );
    } catch (error) {
      setLoading(false);
      const msg = error.message || 'Failed to change password. Please check your current password.';
      CustomAlert.error('Error', msg);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={22} color={isDark ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Change Password
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formCard, isDark ? styles.formCardDark : styles.formCardLight]}>
            <AppTextInput
              label="Current Password"
              placeholder="Enter current password"
              value={oldPassword}
              maxLength={20}
              onChangeText={(text) => {
                setOldPassword(text);
                setErrors((prev) => ({ ...prev, oldPassword: null }));
              }}
              isPassword
              error={errors.oldPassword}
              iconName="lock"
            />

            <AppTextInput
              label="New Password"
              placeholder="Enter new password (6-20 chars)"
              value={newPassword}
              maxLength={20}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors((prev) => ({ ...prev, newPassword: null }));
              }}
              isPassword
              error={errors.newPassword}
              iconName="lock"
            />

            <AppTextInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              maxLength={20}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              isPassword
              error={errors.confirmPassword}
              iconName="lock"
            />

            <Button
              title="UPDATE PASSWORD"
              onPress={handleChange}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: colors.dark.background },
  containerLight: { backgroundColor: colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
  },
  backIcon: { width: 16, height: 16, transform: [{ rotate: '90deg' }] },
  headerSpacer: { width: 36 },
  iconLight: { tintColor: colors.dark.text },
  iconDark: { tintColor: colors.light.text },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  flexContainer: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  formCardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formCardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
  },
  saveButton: {
    marginTop: 8,
    height: 52,
  },
});

export default ChangePasswordScreen;
