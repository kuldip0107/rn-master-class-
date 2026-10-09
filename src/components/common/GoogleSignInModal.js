import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CustomAlert } from '../../context/AlertContext';
import CustomText from './CustomText';
import Icon from './Icon';
import { authAPI, saveUserSession } from '../../services/api';
import { signInWithGoogle } from '../../services/googleAuth';

const GoogleSignInModal = ({ visible, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleNativeDeviceSignIn = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogle();
      setLoading(false);
      onClose();
      if (typeof onSuccess === 'function') {
        onSuccess(user);
      }
    } catch (err) {
      setLoading(false);
      if (
        err?.code === 'SIGN_IN_CANCELLED' ||
        err?.message?.includes('cancelled') ||
        err?.message?.includes('canceled')
      ) {
        return;
      }
      CustomAlert.error('Google Sign-In Error', err.message || 'Failed to sign in with Google');
    }
  };

  const handleSelectAccount = async (account) => {
    setLoading(true);
    setSelectedAccountId(account.id || account.email);

    try {
      const response = await authAPI.googleLogin({
        email: account.email,
        name: account.name,
        profileImage: account.profileImage || null,
        userTitle: 'React Native Developer',
      });

      const finalUser = response?.user || account;
      await saveUserSession(finalUser);
      if (response?.user?.name || account.name) {
        await AsyncStorage.setItem('userName', response?.user?.name || account.name);
      }
      if (response?.user?.email || account.email) {
        await AsyncStorage.setItem('userEmail', response?.user?.email || account.email);
      }
      const finalImg = response?.user?.profileImage || account.profileImage || account.photoUrl;
      if (finalImg) {
        await AsyncStorage.setItem('profileImage', finalImg);
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          `Signed in as ${account.name} 👋`,
          ToastAndroid.SHORT
        );
      }

      setLoading(false);
      onClose();
      if (typeof onSuccess === 'function') {
        onSuccess(response?.user || account);
      }
    } catch (err) {
      setLoading(false);
      setSelectedAccountId(null);
      const msg = err.message || 'Google sign-in failed. Please try again.';
      CustomAlert.error('Google Sign-In Error', msg);
    }
  };

  const handleCustomSubmit = () => {
    const trimmedEmail = customEmail.trim();
    const trimmedName = customName.trim();

    if (!trimmedEmail) {
      CustomAlert.error('Validation Error', 'Please enter your Google email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      CustomAlert.error('Validation Error', 'Please enter a valid email address.');
      return;
    }

    const resolvedName = trimmedName || trimmedEmail.split('@')[0];
    const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      resolvedName
    )}&background=4285F4&color=fff&size=256`;

    handleSelectAccount({
      id: 'custom',
      email: trimmedEmail,
      name: resolvedName,
      profileImage: generatedAvatar,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={loading ? undefined : onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            isDark ? styles.sheetDark : styles.sheetLight,
          ]}
        >
          {/* Header handle */}
          <View style={styles.dragHandle} />

          {/* Google Branding Header */}
          <View style={styles.googleBrandRow}>
            <View style={styles.googleGLogoBox}>
              <CustomText weight="heavy" style={styles.googleGLetter}>
                G
              </CustomText>
            </View>
            <View style={styles.brandTextCol}>
              <CustomText
                variant="headlineMd"
                weight="bold"
                style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
              >
                Sign in with Google
              </CustomText>
              <CustomText
                variant="caption"
                style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
              >
                Choose an account to continue to RN Master Class
              </CustomText>
            </View>
          </View>

          <View style={[styles.separator, isDark ? styles.separatorDark : styles.separatorLight]} />

          {/* Account List */}
          <View style={styles.accountsList}>
            {/* Real Device Account Picker Button */}
            <TouchableOpacity
              style={[
                styles.accountItem,
                isDark ? styles.accountItemDark : styles.accountItemLight,
              ]}
              activeOpacity={0.7}
              disabled={loading}
              onPress={handleNativeDeviceSignIn}
            >
              <View style={styles.deviceGLogoBox}>
                <CustomText weight="heavy" style={styles.googleGLogoLetter}>
                  G
                </CustomText>
              </View>
              <View style={styles.accountInfo}>
                <CustomText
                  variant="body"
                  weight="bold"
                  style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                >
                  Choose Account from This Phone
                </CustomText>
                <CustomText
                  variant="caption"
                  style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
                >
                  Select from your logged-in Google accounts
                </CustomText>
              </View>

              {loading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Icon
                  name="chevron-right"
                  size={20}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
              )}
            </TouchableOpacity>

            {/* Custom Account Toggle */}
            {!showCustomForm ? (
              <TouchableOpacity
                style={[
                  styles.addAccountRow,
                  isDark ? styles.accountItemDark : styles.accountItemLight,
                ]}
                activeOpacity={0.7}
                disabled={loading}
                onPress={() => setShowCustomForm(true)}
              >
                <View style={[styles.addIconCircle, isDark ? styles.addIconDark : styles.addIconLight]}>
                  <Icon name="person-add" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <CustomText
                  variant="body"
                  weight="bold"
                  style={[styles.addAccountText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                >
                  Use another Google account
                </CustomText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.customFormBox, isDark ? styles.customFormDark : styles.customFormLight]}>
                <CustomText
                  variant="caption"
                  weight="bold"
                  style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                >
                  GOOGLE EMAIL
                </CustomText>
                <TextInput
                  style={[styles.textInput, isDark ? styles.textInputDark : styles.textInputLight]}
                  placeholder="e.g. yourname@gmail.com"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomText
                  variant="caption"
                  weight="bold"
                  style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight, { marginTop: 10 }]}
                >
                  YOUR FULL NAME
                </CustomText>
                <TextInput
                  style={[styles.textInput, isDark ? styles.textInputDark : styles.textInputLight]}
                  placeholder="e.g. Alex Sharma"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={customName}
                  onChangeText={setCustomName}
                  autoCapitalize="words"
                />

                <View style={styles.formButtonRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, isDark ? styles.cancelBtnDark : styles.cancelBtnLight]}
                    onPress={() => setShowCustomForm(false)}
                    disabled={loading}
                  >
                    <CustomText variant="caption" weight="bold" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                      CANCEL
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.continueBtn}
                    onPress={handleCustomSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <CustomText variant="caption" weight="bold" style={styles.continueBtnText}>
                        SIGN IN
                      </CustomText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Privacy Note */}
          <View style={styles.footerNoteBox}>
            <CustomText
              variant="small"
              style={[styles.footerNoteText, isDark ? styles.textMutedDark : styles.textMutedLight]}
            >
              By continuing, Google shares your name, email address, and profile photo with RN Master Class.
            </CustomText>
          </View>

          {/* Close Action */}
          <TouchableOpacity
            style={[styles.closeBottomBtn, isDark ? styles.closeBtnDark : styles.closeBtnLight]}
            onPress={onClose}
            disabled={loading}
          >
            <CustomText
              variant="body"
              weight="bold"
              style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
            >
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetDark: {
    backgroundColor: '#12141F',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sheetLight: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.4)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  googleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  googleGLogoBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  googleGLetter: {
    fontSize: 24,
    color: '#4285F4',
  },
  brandTextCol: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginBottom: 16,
  },
  separatorDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  separatorLight: {
    backgroundColor: '#E2E8F0',
  },
  accountsList: {
    marginBottom: 14,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  accountItemDark: {
    backgroundColor: '#1A1D2B',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  accountItemLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  deviceGLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  googleGLogoLetter: {
    fontSize: 22,
    color: '#4285F4',
  },
  accountInfo: {
    flex: 1,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addIconDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  addIconLight: {
    backgroundColor: '#EDE9FE',
  },
  addAccountText: {
    flex: 1,
  },
  customFormBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 6,
  },
  customFormDark: {
    backgroundColor: '#1A1D2B',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customFormLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    borderWidth: 1,
  },
  textInputDark: {
    backgroundColor: '#12141F',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
  },
  textInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    color: '#1E293B',
  },
  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtnLight: {
    backgroundColor: '#E2E8F0',
  },
  continueBtn: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
  },
  footerNoteBox: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  footerNoteText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  closeBottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeBtnDark: {
    backgroundColor: '#1A1D2B',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtnLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#0F172A' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#475569' },
  textMutedDark: { color: '#64748B' },
  textMutedLight: { color: '#94A3B8' },
});

export default GoogleSignInModal;
