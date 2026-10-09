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
import { icons } from '../../../constants/assets';
import { CustomAlert } from '../../../context/AlertContext';

import { authAPI } from '../../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1); // 1 = request otp, 2 = reset password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required');
      return;
    } else if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email: email.trim() });
      setLoading(false);

      if (response && response.otp) {
        setOtp(String(response.otp));
      }
      setStep(2);

      CustomAlert.success(
        'Code Generated',
        response.otp
          ? `Reset OTP code is: ${response.otp}. Please set your new password below.`
          : 'Password reset code has been sent. Please enter it below.'
      );
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to generate reset code.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setLoading(false);
      CustomAlert.success(
        'Password Reset Successful',
        response.message || 'You can now sign in with your new password.',
        () => {
          navigation.replace('Login');
        }
      );
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Password reset failed. Check OTP.');
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Circular Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badgeCircle, isDark ? styles.badgeCircleDark : styles.badgeCircleLight]}>
              <Icon name="vpn-key" size={36} color="#007AFF" />
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <CustomText
              variant="headlineXl"
              weight="bold"
              style={[styles.mainTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              {step === 1
                ? "Enter your email address and we'll generate a verification code."
                : `Enter the OTP code sent for ${email} and your new password.`}
            </CustomText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                <AppTextInput
                  label="Email Address"
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={error}
                  iconName="email"
                />

                <Button
                  title="SEND RESET CODE"
                  onPress={handleRequestOtp}
                  loading={loading}
                  style={styles.resetButton}
                />
              </>
            ) : (
              <>
                <AppTextInput
                  label="Verification OTP"
                  placeholder="Enter 6-digit OTP (e.g. 489201)"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    setError('');
                  }}
                  keyboardType="number-pad"
                  iconName="lock"
                />

                <AppTextInput
                  label="New Password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError('');
                  }}
                  secureTextEntry
                  error={error}
                  iconName="lock"
                />

                <Button
                  title="SET NEW PASSWORD"
                  onPress={handleResetPassword}
                  loading={loading}
                  style={styles.resetButton}
                />

                <TouchableOpacity
                  style={{ alignSelf: 'center', marginTop: 12 }}
                  onPress={() => setStep(1)}
                >
                  <CustomText style={{ color: '#007AFF', fontSize: 14 }}>
                    ← Resend or change email
                  </CustomText>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CustomText
                variant="body"
                weight="bold"
                style={styles.backButtonText}
              >
                Back to Login
              </CustomText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: '#050510' },
  containerLight: { backgroundColor: '#FAF9FE' },
  flexContainer: { flex: 1 },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#414755' },
  darkBlueTint: { tintColor: '#0058BC' },
  backButtonText: { color: '#007AFF', textAlign: 'center' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCircleDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  badgeCircleLight: {
    backgroundColor: '#D8E2FF',
  },
  badgeIcon: {
    width: 36,
    height: 36,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 24,
    height: 52,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default ForgotPasswordScreen;
