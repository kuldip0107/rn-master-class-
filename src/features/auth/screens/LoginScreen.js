import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import { authAPI, saveUserSession } from '../../../services/api';
import CustomText from '../../../components/common/CustomText';
import AppTextInput from '../../../components/common/AppTextInput';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import GoogleSignInModal from '../../../components/common/GoogleSignInModal';
import { signInWithGoogle } from '../../../services/googleAuth';
import { colors } from '../../../theme/theme';

const LoginScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const user = await signInWithGoogle();
      setGoogleLoading(false);
      if (user && navigation && typeof navigation.replace === 'function') {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      setGoogleLoading(false);
      if (
        error?.code === 'SIGN_IN_CANCELLED' ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('canceled')
      ) {
        return;
      }
      CustomAlert.error(
        'Google Sign-In Error',
        error.message || 'Failed to sign in with Google'
      );
    }
  };

  const handleLogin = async () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length > 20) {
      newErrors.password = 'Password must be max 20 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: email.trim(),
        password,
      });

      if (response && response.user) {
        await saveUserSession(response.user);
        if (response.user.name && response.user.name !== 'React Native Developer') {
          await AsyncStorage.setItem('userName', response.user.name);
        }
        if (response.user.profileImage) {
          await AsyncStorage.setItem('profileImage', response.user.profileImage);
        }
      } else {
        await AsyncStorage.setItem('isLoggedIn', 'true');
      }

      if (Platform.OS === 'android') {
        const userName = response?.user?.name ? `, ${response.user.name}` : '';
        ToastAndroid.show(`Login Successful! Welcome back${userName} 👋`, ToastAndroid.SHORT);
      }

      setLoading(false);
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      setLoading(false);
      const msg = error.message || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('password')) {
        const errorText = 'Invalid password. Please enter correct password.';
        setErrors((prev) => ({
          ...prev,
          password: errorText,
        }));
        CustomAlert.error('Validation Error', errorText);
      } else {
        CustomAlert.error('Login Failed', msg);
      }
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIconCircle, isDark ? styles.logoCircleDark : styles.logoCircleLight]}>
              <Icon name="code" size={32} color={isDark ? colors.brand.accent : colors.brand.primary} />
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <CustomText
              variant="headlineXl"
              weight="bold"
              style={[styles.mainTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              Welcome Back!
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              Sign in to continue your learning journey.
            </CustomText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <AppTextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              
              autoCapitalize="none"
              error={errors.email}
              iconName="email"
            />

            <AppTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: null }));
              }}
              isPassword
              maxLength={20}
              error={errors.password}
              iconName="lock"
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CustomText
                  variant="caption"
                  weight="bold"
                  style={styles.forgotPasswordText}
                >
                  Forgot Password?
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="LOGIN"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
              <CustomText
                variant="small"
                weight="bold"
                style={[styles.dividerText, isDark ? styles.textMutedDark : styles.textMutedLight]}
              >
                OR CONTINUE WITH
              </CustomText>
              <View style={[styles.dividerLine, isDark ? styles.dividerDark : styles.dividerLight]} />
            </View>

            {/* Single Google Sign-In Option */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                isDark ? styles.googleButtonDark : styles.googleButtonLight,
              ]}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={colors.brand.primary} />
              ) : (
                <>
                  <View style={styles.googleGWrapper}>
                    <CustomText weight="heavy" style={styles.googleGLogo}>G</CustomText>
                  </View>
                  <CustomText
                    variant="body"
                    weight="bold"
                    style={[styles.googleButtonText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                  >
                    CONTINUE WITH GOOGLE
                  </CustomText>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <CustomText
              variant="body"
              style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
            >
              Don't have an account?{' '}
            </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <CustomText
                variant="body"
                weight="bold"
                style={styles.signUpLinkText}
              >
                Sign Up
              </CustomText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleSignInModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => {
          if (navigation && typeof navigation.replace === 'function') {
            navigation.replace('MainTabs');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: colors.dark.background },
  containerLight: { backgroundColor: colors.light.background },
  flexContainer: { flex: 1 },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  textSecondaryDark: { color: colors.dark.textSecondary },
  textSecondaryLight: { color: colors.light.textSecondary },
  textMutedDark: { color: colors.dark.textMuted },
  textMutedLight: { color: colors.light.textSecondary },
  iconLight: { tintColor: colors.dark.text },
  iconDark: { tintColor: colors.light.text },
  brandTint: { tintColor: colors.brand.primary },
  forgotPasswordText: { color: colors.brand.primary },
  signUpLinkText: { color: colors.brand.primary },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  logoCircleLight: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  logoIcon: {
    width: 36,
    height: 36,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  loginButton: {
    marginBottom: 16,
    height: 52,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerLight: {
    backgroundColor: colors.light.border,
  },
  dividerText: {
    marginHorizontal: 12,
    letterSpacing: 1,
    fontSize: 11,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  googleButtonDark: {
    backgroundColor: colors.dark.elevated,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleButtonLight: {
    backgroundColor: colors.brand.white,
    borderColor: '#E2E8F0',
  },
  googleGWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleGLogo: {
    fontSize: 15,
    color: '#4285F4',
  },
  googleButtonText: {
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  emojiIcon: {
    fontSize: 32,
  },
});

export default LoginScreen;
