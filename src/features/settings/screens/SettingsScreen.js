import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
  ToastAndroid,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import CustomText from '../../../components/common/CustomText';
import { icons } from '../../../constants/assets';
import { notificationService } from '../../../services/notificationService';
import { soundService } from '../../../services/soundService';
import { hapticService } from '../../../services/hapticService';
import { systemAPI, getBaseUrl } from '../../../services/api';
import packageJson from '../../../../package.json';

const SettingItem = ({
  icon,
  title,
  subtitle,
  type = 'navigate',
  value,
  onValueChange,
  onPress,
  danger,
  isDark,
}) => (
  <TouchableOpacity
    style={[
      styles.settingItem,
      isDark ? styles.borderDark : styles.borderLight,
    ]}
    onPress={
      type === 'navigate' || type === 'action'
        ? () => {
            hapticService.selection();
            onPress && onPress();
          }
        : null
    }
    activeOpacity={type === 'navigate' || type === 'action' ? 0.7 : 1}
    disabled={type === 'toggle'}
  >
    <View
      style={[
        styles.iconBox,
        danger
          ? isDark
            ? styles.iconBoxDangerDark
            : styles.iconBoxDangerLight
          : isDark
          ? styles.iconBoxNormalDark
          : styles.iconBoxNormalLight,
      ]}
    >
      {typeof icon === 'string' ? (
        <CustomText style={styles.emojiIconText}>{icon}</CustomText>
      ) : (
        <Image
          source={icon}
          style={[
            styles.settingIcon,
            danger
              ? styles.tintDanger
              : isDark
              ? styles.tintDark
              : styles.tintLight,
          ]}
          resizeMode="contain"
        />
      )}
    </View>

    <View style={styles.titleCol}>
      <CustomText
        variant="body"
        weight="medium"
        style={[
          styles.settingTitle,
          danger
            ? styles.textDanger
            : isDark
            ? styles.textPrimaryDark
            : styles.textPrimaryLight,
        ]}
      >
        {title}
      </CustomText>
      {subtitle && (
        <CustomText
          variant="small"
          style={[styles.subtitleText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
        >
          {subtitle}
        </CustomText>
      )}
    </View>

    {type === 'toggle' && (
      <Switch
        trackColor={{
          false: isDark ? '#2A2D3D' : '#E3E2E7',
          true: '#007AFF',
        }}
        thumbColor="#FFFFFF"
        onValueChange={(val) => {
          hapticService.light();
          onValueChange && onValueChange(val);
        }}
        value={value}
      />
    )}

    {type === 'navigate' && (
      <CustomText style={[styles.chevronText, isDark ? styles.textMutedDark : styles.chevronLight]}>›</CustomText>
    )}
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState(i18n.language || 'en');

  const languages = [
    { code: 'en', label: 'English', subLabel: 'English', flag: '🇬🇧' },
    { code: 'gu', label: 'ગુજરાતી', subLabel: 'Gujarati', flag: '🇮🇳' },
    { code: 'hi', label: 'हिंदी', subLabel: 'Hindi', flag: '🇮🇳' },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedNotif, savedSound, savedHaptic] = await Promise.all([
          AsyncStorage.getItem('daily_reminder_enabled'),
          AsyncStorage.getItem('sound_effects_enabled'),
          AsyncStorage.getItem('haptic_feedback_enabled'),
        ]);
        if (savedNotif !== null) {
          setNotificationsEnabled(savedNotif === 'true');
        }
        if (savedSound !== null) {
          setSoundsEnabled(savedSound === 'true');
        }
        if (savedHaptic !== null) {
          setHapticEnabled(savedHaptic === 'true');
        }
      } catch (e) {
        console.error('Failed loading settings', e);
      }
    };
    loadSettings();
  }, []);

  const handleToggleNotification = async (enabled) => {
    setNotificationsEnabled(enabled);
    await AsyncStorage.setItem('daily_reminder_enabled', String(enabled));
    if (enabled) {
      soundService.playSuccess();
      await notificationService.scheduleDailyReminder(19, 0); // 7:00 PM daily
      await notificationService.triggerInstantTestNotification();
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Daily streak reminder active for 7:00 PM 🔥',
          ToastAndroid.SHORT
        );
      }
    } else {
      soundService.playClick();
      await notificationService.cancelDailyReminder();
      if (Platform.OS === 'android') {
        ToastAndroid.show('Daily reminders disabled', ToastAndroid.SHORT);
      }
    }
  };

  const handleToggleSound = async (enabled) => {
    setSoundsEnabled(enabled);
    await soundService.setEnabled(enabled);
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        enabled ? 'Sound effects enabled 🔊' : 'Sound effects muted 🔇',
        ToastAndroid.SHORT
      );
    }
  };

  const handleToggleHaptic = async (enabled) => {
    setHapticEnabled(enabled);
    await hapticService.setEnabled(enabled);
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        enabled ? 'Haptic feedback enabled 📳' : 'Haptic feedback disabled',
        ToastAndroid.SHORT
      );
    }
  };

  const handleClearCache = () => {
    CustomAlert.show({
      title: t('settings.clear_cache') || 'Clear Cache',
      message:
        t('settings.clear_cache_confirm') ||
        'Are you sure you want to clear completed component history?',
      type: 'warning',
      buttons: [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.yes') || 'Clear',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('completedComponents');
              if (Platform.OS === 'android') {
                ToastAndroid.show('Cache cleared successfully!', ToastAndroid.SHORT);
              } else {
                CustomAlert.success('Success', 'Cache cleared successfully!');
              }
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    });
  };

  const handleDeleteAccount = () => {
    CustomAlert.show({
      title: t('settings.delete_account') || 'Delete Account',
      message:
        t('settings.delete_account_confirm') ||
        'All your progress, streak data, and account details will be permanently removed.',
      type: 'error',
      buttons: [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.yes') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  t('settings.account_deleted') || 'Account deleted',
                  ToastAndroid.SHORT
                );
              }
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.error('Delete account error', err);
            }
          },
        },
      ],
    });
  };

  const handleSelectLanguage = async (langCode) => {
    setShowLanguageModal(false);
    setCurrentLangCode(langCode);

    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('appLanguage', langCode);

    if (Platform.OS === 'android') {
      const selected = languages.find((l) => l.code === langCode);
      ToastAndroid.show(
        `Language set to ${selected ? selected.label : langCode}`,
        ToastAndroid.SHORT
      );
    }
  };

  const handleTestBackendConnection = async () => {
    try {
      const currentUrl = await getBaseUrl();
      const res = await systemAPI.checkHealth();
      CustomAlert.success(
        'Server Online! 🟢',
        `Successfully connected to backend:\n• URL: ${currentUrl}\n• Status: ${res.status}\n• DB: ${res.mongodbStatus || 'Connected'}`
      );
    } catch (err) {
      const currentUrl = await getBaseUrl();
      CustomAlert.error(
        'Connection Failed 🔴',
        `Cannot reach backend server at:\n${currentUrl}\n\nError: ${err.message}\n\nPlease check if 'npm run dev' is running in D:\\Backend.`
      );
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomText style={[styles.backArrowText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>←</CustomText>
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Settings
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Account Section */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          ACCOUNT & SECURITY
        </CustomText>
        <View style={[styles.sectionCard, isDark ? styles.sectionCardDark : styles.sectionCardLight]}>
          <SettingItem
            icon={icons.privacy || icons.settings}
            title={t('settings.change_password') || 'Change Password'}
            subtitle="Update your sign-in credentials"
            onPress={() => navigation.navigate('ChangePassword')}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* Preferences */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          PREFERENCES
        </CustomText>
        <View style={[styles.sectionCard, isDark ? styles.sectionCardDark : styles.sectionCardLight]}>
          <SettingItem
            icon={icons.notification || icons.settings}
            title="Daily Streak Reminder"
            subtitle="Scheduled daily at 7:00 PM"
            type="toggle"
            value={notificationsEnabled}
            onValueChange={handleToggleNotification}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.play}
            title={t('settings.sound_effects') || 'Sound Effects'}
            subtitle={soundsEnabled ? 'Interactive audio enabled' : 'Muted'}
            type="toggle"
            value={soundsEnabled}
            onValueChange={handleToggleSound}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.check}
            title={t('settings.haptic_feedback') || 'Haptic Feedback'}
            subtitle={hapticEnabled ? 'Tactile vibration enabled' : 'Vibration disabled'}
            type="toggle"
            value={hapticEnabled}
            onValueChange={handleToggleHaptic}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.settings}
            title="Dark Theme"
            subtitle={isDark ? 'Dark mode enabled' : 'Light mode enabled'}
            type="toggle"
            value={isDark}
            onValueChange={toggleTheme}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.profile}
            title={`Language (${languages.find((l) => l.code === currentLangCode)?.label || 'English'})`}
            subtitle="Tap to select language"
            type="action"
            onPress={() => setShowLanguageModal(true)}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon="🌐"
            title="Backend Server Status"
            subtitle="Tap to test connection & health check"
            type="action"
            onPress={handleTestBackendConnection}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* Support & Legal */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          SUPPORT & LEGAL
        </CustomText>
        <View style={[styles.sectionCard, isDark ? styles.sectionCardDark : styles.sectionCardLight]}>
          <SettingItem
            icon={icons.help}
            title={t('settings.help_support') || 'Help & Support'}
            onPress={() => navigation.navigate('HelpSupport')}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.info}
            title={t('settings.about_app') || 'About App'}
            subtitle={`v${packageJson.version}`}
            onPress={() => navigation.navigate('AboutApp')}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.terms || icons.privacy}
            title={t('settings.terms_privacy') || 'Terms & Privacy'}
            onPress={() => navigation.navigate('Terms')}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* Danger Zone */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitle, styles.textDanger]}
        >
          DATA & STORAGE
        </CustomText>
        <View style={[styles.sectionCard, isDark ? styles.sectionCardDark : styles.sectionCardLight]}>
          <SettingItem
            icon={icons.settings}
            title={t('settings.clear_cache') || 'Clear Completed History'}
            type="action"
            onPress={handleClearCache}
            theme={theme}
            isDark={isDark}
          />
          <SettingItem
            icon={icons.logout}
            title={t('settings.delete_account') || 'Delete Account & Reset Data'}
            type="action"
            danger
            onPress={handleDeleteAccount}
            theme={theme}
            isDark={isDark}
          />
        </View>
      </ScrollView>

      {/* Language Selection Dropdown Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View
            style={[
              styles.langModalCard,
              isDark ? styles.langModalCardDark : styles.langModalCardLight,
            ]}
          >
            <View style={styles.langModalHeader}>
              <View>
                <CustomText
                  variant="headlineMd"
                  weight="bold"
                  style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                >
                  Select Language
                </CustomText>
                <CustomText
                  variant="small"
                  style={[styles.langModalSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
                >
                  Choose your preferred app language
                </CustomText>
              </View>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={[styles.langCloseBtn, isDark ? styles.langCloseBtnDark : styles.langCloseBtnLight]}
              >
                <CustomText style={[styles.closeIconText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>✕</CustomText>
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {languages.map((item) => {
                const isSelected = currentLangCode === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.langOptionItem,
                      isDark ? styles.langOptionDark : styles.langOptionLight,
                      isSelected && (isDark ? styles.langOptionActiveDark : styles.langOptionActiveLight),
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectLanguage(item.code)}
                  >
                    <View style={styles.langOptionLeft}>
                      <CustomText style={styles.langFlagText}>{item.flag}</CustomText>
                      <View style={styles.langOptionTextCol}>
                        <CustomText
                          variant="body"
                          weight={isSelected ? 'bold' : 'medium'}
                          style={[
                            styles.langOptionTitle,
                            isSelected
                              ? styles.textBlue
                              : isDark
                              ? styles.textPrimaryDark
                              : styles.textPrimaryLight,
                          ]}
                        >
                          {item.label}
                        </CustomText>
                        <CustomText
                          variant="small"
                          style={isDark ? styles.textMutedDark : styles.textMutedLight}
                        >
                          {item.subLabel}
                        </CustomText>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected
                          ? styles.radioCircleActive
                          : isDark
                          ? styles.radioCircleInactiveDark
                          : styles.radioCircleInactiveLight,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#050510',
  },
  containerLight: {
    backgroundColor: '#FAF9FE',
  },
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
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  backArrowText: {
    fontSize: 18,
  },
  headerSpacer: {
    width: 36,
  },
  textPrimaryDark: {
    color: '#F8FAFC',
  },
  textPrimaryLight: {
    color: '#1A1B1F',
  },
  textSecondaryDark: {
    color: '#94A3B8',
  },
  textSecondaryLight: {
    color: '#717786',
  },
  textMutedDark: {
    color: '#64748B',
  },
  textMutedLight: {
    color: '#717786',
  },
  textDanger: {
    color: '#EF4444',
  },
  sectionCardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  borderLight: {
    borderBottomColor: '#F2F2F7',
  },
  iconBoxDangerDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  iconBoxDangerLight: {
    backgroundColor: '#FFDAD6',
  },
  iconBoxNormalDark: {
    backgroundColor: '#161823',
  },
  iconBoxNormalLight: {
    backgroundColor: '#F4F3F8',
  },
  emojiIconText: {
    fontSize: 20,
  },
  tintDanger: {
    tintColor: '#EF4444',
  },
  tintDark: {
    tintColor: '#F8FAFC',
  },
  tintLight: {
    tintColor: '#1A1B1F',
  },
  subtitleText: {
    marginTop: 1,
  },
  chevronText: {
    fontSize: 18,
  },
  chevronLight: {
    color: '#C1C6D7',
  },
  backIcon: {
    width: 16,
    height: 16,
    transform: [{ rotate: '90deg' }],
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    letterSpacing: 1,
    fontSize: 11,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingIcon: {
    width: 18,
    height: 18,
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 15,
  },
  nextIcon: {
    width: 14,
    height: 14,
    transform: [{ rotate: '-90deg' }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  langModalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  langModalCardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  langModalCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  langModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  langModalSubtitle: {
    marginTop: 2,
  },
  langCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  langCloseBtnDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langCloseBtnLight: {
    backgroundColor: '#F4F3F8',
    borderColor: '#E3E2E7',
  },
  closeIconText: {
    fontSize: 14,
  },
  langList: {
    gap: 10,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langOptionDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  langOptionLight: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
  },
  langOptionActiveDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: '#007AFF',
  },
  langOptionActiveLight: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderColor: '#007AFF',
  },
  langOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langFlagText: {
    fontSize: 24,
    marginRight: 14,
  },
  langOptionTextCol: {
    justifyContent: 'center',
  },
  langOptionTitle: {
    fontSize: 16,
  },
  textBlue: {
    color: '#007AFF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#007AFF',
  },
  radioCircleInactiveDark: {
    borderColor: '#4A4D5A',
  },
  radioCircleInactiveLight: {
    borderColor: '#CBD5E1',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
});

export default SettingsScreen;
