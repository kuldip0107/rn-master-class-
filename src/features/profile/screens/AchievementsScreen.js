import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { useQuiz } from '../../../context/QuizContext';

const AchievementsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { quizHistory, achievements, summary, refreshHistory } = useQuiz();

  useEffect(() => {
    if (navigation && typeof navigation.addListener === 'function') {
      const unsubscribe = navigation.addListener('focus', () => {
        refreshHistory?.();
      });
      return unsubscribe;
    }
  }, [navigation, refreshHistory]);

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
          Achievements & Quizzes
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Summary Bar if available */}
      {summary && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, isDark ? styles.summaryCardDark : styles.summaryCardLight]}>
            <CustomText variant="headlineMd" weight="bold" style={styles.summaryValBlue}>{summary.totalQuizzes || quizHistory.length}</CustomText>
            <CustomText variant="caption" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>Quizzes</CustomText>
          </View>
          <View style={[styles.summaryCard, isDark ? styles.summaryCardDark : styles.summaryCardLight]}>
            <CustomText variant="headlineMd" weight="bold" style={styles.summaryValGreen}>{summary.bestScore || '100%'}</CustomText>
            <CustomText variant="caption" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>Best Score</CustomText>
          </View>
          <View style={[styles.summaryCard, isDark ? styles.summaryCardDark : styles.summaryCardLight]}>
            <CustomText variant="headlineMd" weight="bold" style={styles.summaryValOrange}>{summary.unlockedAchievementsCount || achievements.length || 0}</CustomText>
            <CustomText variant="caption" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>Badges</CustomText>
          </View>
        </View>
      )}

      {quizHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, isDark ? styles.emptyIconCircleDark : styles.emptyIconCircleLight]}>
            <Icon name="emoji-events" size={36} color="#F59E0B" />
          </View>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={[styles.emptyTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            No Achievements Yet
          </CustomText>
          <CustomText
            variant="body"
            style={[styles.emptySubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Complete quizzes in the Practice tab to unlock achievements and track your mastery!
          </CustomText>
        </View>
      ) : (
        <FlatList
          data={quizHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.historyCard, isDark ? styles.historyCardDark : styles.historyCardLight]}>
              <View style={[styles.iconCircle, isDark ? styles.iconCircleDark : styles.iconCircleLight]}>
                <Icon name="emoji-events" size={22} color="#F59E0B" />
              </View>
              <View style={styles.cardInfo}>
                <CustomText
                  variant="body"
                  weight="bold"
                  style={[styles.quizTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                >
                  Practical Quiz
                </CustomText>
                <CustomText
                  variant="small"
                  style={[styles.quizDate, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                >
                  {new Date(item.date).toLocaleDateString()}
                </CustomText>
              </View>
              <View style={styles.scoreContainer}>
                <CustomText
                  variant="headlineMd"
                  weight="heavy"
                  style={styles.scoreNumber}
                >
                  {item.score != null ? item.score : '0'}/
                  {item.total != null ? item.total : '0'}
                </CustomText>
                <CustomText
                  variant="small"
                  weight="bold"
                  style={isDark ? styles.textMutedDark : styles.textMutedLight}
                >
                  SCORE
                </CustomText>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  backArrowText: {
    fontSize: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryCardDark: {
    backgroundColor: '#111422',
    borderColor: '#1F2438',
  },
  summaryCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  summaryValBlue: { color: '#007AFF' },
  summaryValGreen: { color: '#10B981' },
  summaryValOrange: { color: '#F59E0B' },
  backIcon: { width: 16, height: 16, transform: [{ rotate: '90deg' }] },
  headerSpacer: { width: 36 },
  iconLight: { tintColor: '#F8FAFC' },
  iconDark: { tintColor: '#1A1B1F' },
  brandTint: { tintColor: '#007AFF' },
  cyanTint: { tintColor: '#00C1FD' },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#717786' },
  textMutedDark: { color: '#64748B' },
  textMutedLight: { color: '#717786' },
  scoreNumber: { color: '#007AFF' },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 60,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleDark: {
    backgroundColor: 'rgba(0, 193, 253, 0.12)',
  },
  iconCircleLight: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  trophyIcon: { width: 22, height: 22 },
  cardInfo: { flex: 1 },
  quizTitle: { fontSize: 16 },
  quizDate: { marginTop: 2 },
  scoreContainer: { alignItems: 'flex-end' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircleDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  emptyIconCircleLight: {
    backgroundColor: '#D8E2FF',
  },
  emptyIcon: { width: 38, height: 38 },
  emptyTitle: { fontSize: 20, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', lineHeight: 20 },
});

export default AchievementsScreen;
