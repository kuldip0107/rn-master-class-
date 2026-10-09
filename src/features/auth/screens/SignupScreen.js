import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
import GoogleSignInModal from '../../../components/common/GoogleSignInModal';
import { signInWithGoogle } from '../../../services/googleAuth';

const SignupScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
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

  const handleSignup = async () => {
    const newErrors = {};

    // Full Name Validation (2-25 characters)
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full Name is required';
    } else if (trimmedName.length < 2 || trimmedName.length > 25) {
      newErrors.name = 'Full Name must be between 2 and 25 characters';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password Validation (6-20 characters)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6 || password.length > 20) {
      newErrors.password = 'Password must be between 6 and 20 characters';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await authAPI.register({
        name: trimmedName,
        email: email.trim(),
        password,
      });

      const registeredUser = response?.user ? { ...response.user, name: response.user.name || trimmedName } : null;
      if (registeredUser) {
        await saveUserSession(registeredUser);
      } else {
        await AsyncStorage.setItem('isLoggedIn', 'true');
      }
      await AsyncStorage.setItem('userName', trimmedName);
      await AsyncStorage.setItem('userEmail', email.trim());

      setLoading(false);
      CustomAlert.success('Welcome!', 'Account created successfully!', () => {
        if (navigation && typeof navigation.replace === 'function') {
          navigation.replace('MainTabs');
        }
      });
    } catch (error) {
      setLoading(false);
      const msg = error.message || 'Registration failed. Please try again.';
      CustomAlert.error('Registration Error', msg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050510' : '#FAF9FE' }]}>
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
          {/* Header Icon */}
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoIconCircle,
                { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.08)' },
              ]}
            >
              <Icon name="school" size={36} color="#007AFF" />
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <CustomText
              variant="headlineXl"
              weight="bold"
              style={[styles.mainTitle, { color: isDark ? '#F8FAFC' : '#1A1B1F' }]}
            >
              Create Account
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#414755' }]}
            >
              Join our community and start mastering React Native.
            </CustomText>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <AppTextInput
              label="Full Name"
              placeholder="Full Name"
              value={name}
              maxLength={25}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              autoCapitalize="words"
              error={errors.name}
              iconName="person"
            />

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
              placeholder="Create a password"
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

            {/* Checkbox Terms */}
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                setErrors((prev) => ({ ...prev, terms: null }));
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#C1C6D7',
                    backgroundColor: agreeTerms
                      ? '#007AFF'
                      : isDark
                      ? '#161823'
                      : '#F2F2F7',
                  },
                ]}
              >
                {agreeTerms && (
                  <CustomText style={{ fontSize: 13, color: '#FFFFFF' }}>✓</CustomText>
                )}
              </View>
              <CustomText
                variant="caption"
                style={[styles.checkboxText, { color: isDark ? '#94A3B8' : '#414755' }]}
              >
                I agree to the{' '}
                <CustomText
                  variant="caption"
                  weight="bold"
                  style={{ color: isDark ? '#F8FAFC' : '#1A1B1F' }}
                >
                  Terms of Service
                </CustomText>{' '}
                and{' '}
                <CustomText
                  variant="caption"
                  weight="bold"
                  style={{ color: isDark ? '#F8FAFC' : '#1A1B1F' }}
                >
                  Privacy Policy
                </CustomText>
                .
              </CustomText>
            </TouchableOpacity>

            {errors.terms && (
              <CustomText
                variant="small"
                style={[styles.errorText, { color: theme.colors.error }]}
              >
                {errors.terms}
              </CustomText>
            )}

            {/* Submit Button */}
            <Button
              title="SIGN UP"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' },
                ]}
              />
              <CustomText
                variant="small"
                weight="bold"
                style={[styles.dividerText, { color: isDark ? '#64748B' : '#717786' }]}
              >
                OR CONTINUE WITH
              </CustomText>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E3E2E7' },
                ]}
              />
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
                <ActivityIndicator size="small" color="#007AFF" />
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
              style={{ color: isDark ? '#94A3B8' : '#414755' }}
            >
              Already have an account?{' '}
            </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <CustomText
                variant="body"
                weight="bold"
                style={{ color: '#007AFF' }}
              >
                Login
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
  container: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
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
    maxWidth: 300,
  },
  formContainer: {
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  checkboxText: {
    flex: 1,
    lineHeight: 18,
  },
  errorText: {
    marginBottom: 8,
    marginLeft: 4,
  },
  signupButton: {
    marginTop: 12,
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
    backgroundColor: '#161823',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  googleGWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
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
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
});

export default SignupScreen;
