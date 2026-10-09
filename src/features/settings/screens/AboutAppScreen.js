import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import { icons } from '../../../constants/assets';
import packageJson from '../../../../package.json';

const AboutAppScreen = ({ navigation }) => {
  const { isDark } = useTheme();

  const handleEmailPress = () => {
    Linking.openURL(
      'mailto:dnklabs07@gmail.com?subject=Inquiry%20regarding%20RN%20Master%20Class'
    );
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
          <CustomText style={{ fontSize: 18, color: isDark ? '#F8FAFC' : '#1A1B1F' }}>←</CustomText>
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          About App
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* App Hero Badge */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, isDark ? styles.logoBoxDark : styles.logoBoxLight]}>
            <CustomText style={{ fontSize: 36 }}>💻</CustomText>
          </View>
          <CustomText
            variant="headlineXl"
            weight="heavy"
            style={[styles.appName, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            RN Master Class
          </CustomText>
          <View style={[styles.versionPill, isDark ? styles.versionPillDark : styles.versionPillLight]}>
            <CustomText
              variant="small"
              weight="bold"
              style={styles.versionText}
            >
              VERSION {packageJson.version}
            </CustomText>
          </View>
        </View>

        {/* Managed By Card (DnK Labs) */}
        <View style={[styles.managedCard, isDark ? styles.managedCardDark : styles.managedCardLight]}>
          <View style={styles.managedHeader}>
            <View style={[styles.companyIconBox, isDark ? styles.companyIconBoxDark : styles.companyIconBoxLight]}>
              <CustomText style={styles.emojiText}>🏢</CustomText>
            </View>
            <View style={styles.flexOne}>
              <CustomText
                variant="caption"
                weight="bold"
                style={styles.managedByCaption}
              >
                DEVELOPED & MANAGED BY
              </CustomText>
              <CustomText
                variant="headlineMd"
                weight="heavy"
                style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
              >
                DnK Labs
              </CustomText>
            </View>
          </View>
          <CustomText
            variant="body"
            style={[styles.managedDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            DnK Labs builds world-class, production-ready mobile engineering platforms, interactive courses, and developer tooling.
          </CustomText>

          <TouchableOpacity
            style={[styles.emailButton, isDark ? styles.emailButtonDark : styles.emailButtonLight]}
            onPress={handleEmailPress}
            activeOpacity={0.8}
          >
            <CustomText style={{ fontSize: 18, marginRight: 8 }}>✉️</CustomText>
            <CustomText
              weight="bold"
              style={styles.emailText}
            >
              dnklabs07@gmail.com
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Overview */}
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={[styles.cardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            Overview
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.overviewText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            RN Master Class is an interactive documentation, interview preparation, and practice platform engineered for developers striving for mastery in React Native.
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.overviewTextMargin, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            From foundational layout primitives like Flexbox to advanced navigation patterns, TurboModules, Reanimated 3, and performance optimizations.
          </CustomText>
        </View>

        {/* Key Features */}
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={[styles.cardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            Key Highlights
          </CustomText>
          {[
            '47+ Interactive Components & Real Code Sandbox',
            'Multi-Language (English, Gujarati, Hindi)',
            'Dynamic Dark & Light Themes',
            'Senior React Native Interview Prep & Cheatsheets',
            'Daily Streak Reminders & Verified PDF Certifications',
            'Engineered & Maintained by DnK Labs',
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={[styles.featureBullet, isDark ? styles.featureBulletDark : styles.featureBulletLight]}>
                <CustomText style={{ fontSize: 13, color: '#10B981' }}>✓</CustomText>
              </View>
              <CustomText
                variant="body"
                style={[styles.featureText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
              >
                {feature}
              </CustomText>
            </View>
          ))}
        </View>

        {/* Footer info */}
        <View style={styles.footerSection}>
          <CustomText
            variant="small"
            style={isDark ? styles.textMutedDark : styles.textMutedLight}
          >
            Designed & Maintained by DnK Labs
          </CustomText>
          <CustomText
            variant="small"
            style={[styles.copyrightText, isDark ? styles.textMutedDark : styles.textMutedLight]}
          >
            © 2026 DnK Labs. All rights reserved.
          </CustomText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: '#050510' },
  containerLight: { backgroundColor: '#FAF9FE' },
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  backIcon: { width: 16, height: 16, transform: [{ rotate: '90deg' }] },
  iconLight: { tintColor: '#F8FAFC' },
  iconDark: { tintColor: '#1A1B1F' },
  brandTint: { tintColor: '#007AFF' },
  successTint: { tintColor: '#10B981' },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#414755' },
  textMutedDark: { color: '#64748B' },
  textMutedLight: { color: '#717786' },
  headerSpacer: { width: 36 },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  logoSection: { alignItems: 'center', marginVertical: 20 },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoBoxDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(0, 193, 253, 0.3)',
  },
  logoBoxLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  appLogo: { width: 38, height: 38 },
  appName: { fontSize: 24, marginBottom: 8 },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  versionPillDark: {
    backgroundColor: 'rgba(0, 193, 253, 0.12)',
    borderColor: 'rgba(0, 193, 253, 0.3)',
  },
  versionPillLight: {
    backgroundColor: '#D8E2FF',
    borderColor: 'transparent',
  },
  versionText: { color: '#0058BC', letterSpacing: 1 },
  managedCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    borderColor: '#007AFF',
  },
  managedCardDark: {
    backgroundColor: '#0F111A',
  },
  managedCardLight: {
    backgroundColor: '#FFFFFF',
  },
  managedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyIconBoxDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  companyIconBoxLight: {
    backgroundColor: '#D8E2FF',
  },
  emojiText: { fontSize: 22 },
  flexOne: { flex: 1 },
  managedByCaption: { color: '#007AFF', letterSpacing: 1 },
  managedDesc: { marginTop: 10, lineHeight: 20 },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 14,
    alignSelf: 'flex-start',
    gap: 8,
  },
  emailButtonDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  emailButtonLight: {
    backgroundColor: '#F4F3F8',
  },
  emailIcon: { width: 16, height: 16 },
  emailText: { color: '#007AFF', fontSize: 13 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  cardTitle: { fontSize: 17, marginBottom: 12 },
  overviewText: { lineHeight: 22 },
  overviewTextMargin: { marginTop: 10, lineHeight: 22 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureBulletDark: {
    backgroundColor: 'rgba(0, 193, 253, 0.15)',
  },
  featureBulletLight: {
    backgroundColor: '#D1FAE5',
  },
  checkIcon: { width: 10, height: 10 },
  featureText: { fontSize: 14 },
  footerSection: { alignItems: 'center', marginTop: 16 },
  copyrightText: { marginTop: 4 },
});

export default AboutAppScreen;
