import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import { supportAPI } from '../../../services/api';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import { colors } from '../../../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    id: '1',
    question: 'How do I start a module?',
    answer:
      'Navigate to the Learn tab, choose a category, and click on any component to view its interactive docs and code examples.',
  },
  {
    id: '2',
    question: 'How does daily streak tracking work?',
    answer:
      'Complete at least one quiz or lesson practice per day to maintain your learning streak!',
  },
  {
    id: '3',
    question: 'Can I access content offline?',
    answer:
      'All component definitions, cheatsheets, and interview questions are stored locally on your device.',
  },
  {
    id: '4',
    question: 'Who manages and maintains this platform?',
    answer:
      'RN Master Class is engineered and maintained by DnK Labs. For queries or partnerships, contact dnklabs07@gmail.com.',
  },
];

const FAQItem = ({ item, isDark }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.8}
      style={[styles.faqCard, isDark ? styles.cardDark : styles.cardLight]}
    >
      <View style={styles.faqHeader}>
        <CustomText
          weight="bold"
          style={[styles.questionText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          {item.question}
        </CustomText>
        <Icon
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={22}
          color={isDark ? colors.dark.textSecondary : colors.light.textSecondary}
        />
      </View>
      {expanded && (
        <View style={[styles.answerContainer, isDark ? styles.answerBorderDark : styles.answerBorderLight]}>
          <CustomText
            variant="body"
            style={[styles.answerText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            {item.answer}
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const HelpSupportScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSupport = () => {
    Linking.openURL(
      'mailto:dnklabs07@gmail.com?subject=Support%20Request%20-%20RN%20Master%20Class'
    );
  };

  const handleSendFeedback = async () => {
    if (!feedbackSubject.trim() || !feedbackMessage.trim()) {
      CustomAlert.error('Required', 'Please enter both subject and message.');
      return;
    }

    setSubmitting(true);
    try {
      const userId = (await AsyncStorage.getItem('userId')) || 'guest_user';
      const name = (await AsyncStorage.getItem('userName')) || 'Student User';
      const email = (await AsyncStorage.getItem('userEmail')) || 'user@example.com';

      const response = await supportAPI.submitFeedback({
        userId,
        name,
        email,
        subject: feedbackSubject.trim(),
        message: feedbackMessage.trim(),
      });

      setSubmitting(false);
      setShowFeedbackModal(false);
      setFeedbackSubject('');
      setFeedbackMessage('');

      CustomAlert.success(
        'Feedback Sent!',
        response.message || 'Thank you for your feedback! Our team has received it.'
      );
    } catch (err) {
      setSubmitting(false);
      CustomAlert.error('Error', err.message || 'Failed to submit feedback.');
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
          <Icon name="arrow-back" size={20} color={isDark ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Help & Support
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Support Action Cards */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          DIRECT SUPPORT (DNK LABS)
        </CustomText>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, isDark ? styles.cardDark : styles.cardLight]}
            activeOpacity={0.8}
            onPress={handleEmailSupport}
          >
            <View style={[styles.actionIconCircle, isDark ? styles.actionIconCircleDark : styles.actionIconCircleLight]}>
              <Icon name="mail-outline" size={24} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
            </View>
            <CustomText
              weight="bold"
              style={[styles.actionCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              Email DnK Labs
            </CustomText>
            <CustomText
              variant="caption"
              style={styles.brandText}
            >
              dnklabs07@gmail.com
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, isDark ? styles.cardDark : styles.cardLight]}
            activeOpacity={0.8}
            onPress={() => setShowFeedbackModal(true)}
          >
            <View style={[styles.actionIconCircle, isDark ? styles.actionIconCircleDark : styles.actionIconCircleLight]}>
              <Icon name="feedback" size={24} color={colors.brand.primary} />
            </View>
            <CustomText
              weight="bold"
              style={[styles.actionCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              Send Feedback
            </CustomText>
            <CustomText
              variant="caption"
              style={[styles.actionSubtext, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              Direct to Server
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Modal for Feedback */}
        <Modal
          visible={showFeedbackModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFeedbackModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}>
              <CustomText variant="headlineMd" weight="bold" style={[styles.modalTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                Send Feedback / Query
              </CustomText>

              <CustomText variant="caption" style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Subject</CustomText>
              <TextInput
                placeholder="e.g. Question about Animations"
                placeholderTextColor={isDark ? colors.dark.textMuted : colors.dark.textSecondary}
                value={feedbackSubject}
                onChangeText={setFeedbackSubject}
                style={[styles.subjectInput, isDark ? styles.inputDark : styles.inputLight]}
              />

              <CustomText variant="caption" style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Your Message</CustomText>
              <TextInput
                placeholder="Write your feedback or suggestion..."
                placeholderTextColor={isDark ? colors.dark.textMuted : colors.dark.textSecondary}
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                multiline
                numberOfLines={4}
                style={[styles.messageInput, isDark ? styles.inputDark : styles.inputLight]}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtnCancel, isDark ? styles.modalBtnCancelDark : styles.modalBtnCancelLight]}
                  onPress={() => setShowFeedbackModal(false)}
                >
                  <CustomText style={[styles.modalBtnCancelText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>Cancel</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalBtnSubmit}
                  onPress={handleSendFeedback}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.brand.white} />
                  ) : (
                    <CustomText style={styles.modalBtnSubmitText}>Submit</CustomText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* FAQs */}
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.sectionTitleFaq, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          FREQUENTLY ASKED QUESTIONS
        </CustomText>
        {faqs.map((item) => (
          <FAQItem key={item.id} item={item} isDark={isDark} />
        ))}

        <View style={styles.footerNote}>
          <CustomText
            variant="caption"
            style={[styles.footerText, isDark ? styles.textMutedDark : styles.textMutedLight]}
          >
            Managed & Maintained by DnK Labs
          </CustomText>
        </View>
      </ScrollView>
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
  iconSecondaryDark: { tintColor: colors.dark.textSecondary },
  iconSecondaryLight: { tintColor: colors.light.textSecondary },
  arrowExpanded: { transform: [{ rotate: '-90deg' }] },
  brandTint: { tintColor: colors.brand.primary },
  brandText: { color: colors.brand.primary, marginTop: 2 },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  textSecondaryDark: { color: colors.dark.textSecondary },
  textSecondaryLight: { color: colors.light.textSecondary },
  textMutedDark: { color: colors.dark.textMuted },
  textMutedLight: { color: colors.light.textSecondary },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { letterSpacing: 1, fontSize: 11, marginTop: 16, marginBottom: 12, marginLeft: 4 },
  sectionTitleFaq: { letterSpacing: 1, fontSize: 11, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconCircleDark: {
    backgroundColor: 'rgba(0, 193, 253, 0.12)',
  },
  actionIconCircleLight: {
    backgroundColor: '#D8E2FF',
  },
  actionIcon: { width: 20, height: 20 },
  actionCardTitle: { fontSize: 14 },
  actionSubtext: { marginTop: 2 },
  faqCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionText: { flex: 1, fontSize: 15, marginRight: 10 },
  arrowIcon: { width: 14, height: 14, transform: [{ rotate: '-180deg' }] },
  answerContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  answerBorderDark: { borderTopColor: 'rgba(255, 255, 255, 0.06)' },
  answerBorderLight: { borderTopColor: '#F2F2F7' },
  answerText: { lineHeight: 20 },
  footerNote: { marginTop: 24, alignItems: 'center' },
  footerText: { textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalCardDark: {
    backgroundColor: '#111422',
    borderColor: '#1F2438',
  },
  modalCardLight: {
    backgroundColor: colors.brand.white,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    marginBottom: 12,
  },
  inputLabel: {
    marginBottom: 6,
  },
  subjectInput: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  messageInput: {
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: '#0A0C14',
    color: colors.brand.white,
    borderColor: '#1F2438',
  },
  inputLight: {
    backgroundColor: colors.dark.text,
    color: '#0F172A',
    borderColor: '#CBD5E1',
  },
  modalBtnRow: {
    flexDirection: 'row',
  },
  modalBtnCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnCancelDark: {
    backgroundColor: '#1F2438',
  },
  modalBtnCancelLight: {
    backgroundColor: '#E2E8F0',
  },
  modalBtnCancelText: {
    fontWeight: 'bold',
  },
  modalBtnSubmit: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    marginLeft: 8,
  },
  modalBtnSubmitText: {
    color: colors.brand.white,
    fontWeight: 'bold',
  },
});

export default HelpSupportScreen;
