import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { icons } from '../../../constants/assets';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';

const TermsScreen = ({ navigation }) => {
  const { isDark } = useTheme();

  const handleOpenOnlinePrivacy = () => {
    Linking.openURL('https://rnmasterclass.pages.dev/privacy-policy').catch(
      (err) => {
        console.log('Error opening privacy policy URL', err);
      }
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      {/* Header */}
      <View style={[styles.header, isDark ? styles.headerBorderDark : styles.headerBorderLight]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomText style={{ fontSize: 18, color: isDark ? '#F8FAFC' : '#1A1B1F' }}>←</CustomText>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
          >
            Terms & Privacy
          </CustomText>
          <CustomText
            variant="small"
            style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
          >
            Last updated: January 2026
          </CustomText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={styles.sectionTitle}
          >
            1. Introduction
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.text, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Welcome to RN Master Class. By creating an account or accessing our services, you agree to comply with and be bound by these terms. Please read them carefully.
          </CustomText>

          <CustomText
            variant="headlineMd"
            weight="bold"
            style={styles.sectionTitle}
          >
            2. Usage License
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.text, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Permission is granted to temporarily access the learning materials, code benchmarks, and interactive quizzes for personal, non-commercial educational use only.
          </CustomText>

          <CustomText
            variant="headlineMd"
            weight="bold"
            style={styles.sectionTitle}
          >
            3. Privacy & Data
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.text, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Your learning progress, quiz scores, and settings preferences are stored locally on your device to ensure maximum performance and data privacy.
          </CustomText>

          <TouchableOpacity
            style={[styles.privacyLinkButton, isDark ? styles.privacyBtnDark : styles.privacyBtnLight]}
            onPress={handleOpenOnlinePrivacy}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="language" size={16} color="#007AFF" style={{ marginRight: 6 }} />
              <CustomText weight="bold" style={styles.privacyLinkText}>
                View Online Privacy Policy (Web)
              </CustomText>
            </View>
          </TouchableOpacity>

          <CustomText
            variant="headlineMd"
            weight="bold"
            style={styles.sectionTitle}
          >
            4. Disclaimer & Warranties
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.text, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            The learning materials are provided "as is". While we strive for architectural excellence, we make no warranties regarding zero-defect performance in production applications.
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
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#414755' },
  iconLight: { tintColor: '#F8FAFC' },
  iconDark: { tintColor: '#1A1B1F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerBorderDark: { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerBorderLight: { borderBottomColor: '#E3E2E7' },
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
  headerInfo: { flex: 1, marginLeft: 14 },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 60,
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  sectionTitle: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  text: { lineHeight: 22 },
  privacyLinkButton: {
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  privacyBtnDark: { backgroundColor: 'rgba(0, 122, 255, 0.12)' },
  privacyBtnLight: { backgroundColor: '#D8E2FF' },
  privacyLinkText: {
    color: '#0058BC',
    fontSize: 13,
  },
});

export default TermsScreen;
