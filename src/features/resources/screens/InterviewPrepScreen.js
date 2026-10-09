import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { icons } from '../../../constants/assets';
import { interviewQuestions, cheatsheets } from '../../../data/interviewData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['All', 'Fundamentals', 'Architecture', 'Performance', 'State Management'];

const InterviewPrepScreen = ({ navigation }) => {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'cheatsheets'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const saved = await AsyncStorage.getItem('bookmarked_interview_ids');
        if (saved) setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    loadBookmarks();
  }, []);

  const toggleBookmark = async (id) => {
    try {
      let updated;
      if (bookmarkedIds.includes(id)) {
        updated = bookmarkedIds.filter((item) => item !== id);
      } else {
        updated = [...bookmarkedIds, id];
      }
      setBookmarkedIds(updated);
      await AsyncStorage.setItem('bookmarked_interview_ids', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredQuestions = interviewQuestions.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          style={[styles.headerTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          Interview Prep & Cheats
        </CustomText>
      </View>

      {/* Segmented Tab Switcher */}
      <View style={[styles.tabSwitcher, isDark ? styles.tabSwitcherDark : styles.tabSwitcherLight]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'questions' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('questions')}
        >
          <CustomText
            variant="small"
            weight="bold"
            style={activeTab === 'questions' ? styles.tabTextActive : (isDark ? styles.textSecondaryDark : styles.textSecondaryLight)}
          >
            Top Questions ({interviewQuestions.length})
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'cheatsheets' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('cheatsheets')}
        >
          <CustomText
            variant="small"
            weight="bold"
            style={activeTab === 'cheatsheets' ? styles.tabTextActive : (isDark ? styles.textSecondaryDark : styles.textSecondaryLight)}
          >
            Quick Cheatsheets
          </CustomText>
        </TouchableOpacity>
      </View>

      {activeTab === 'questions' ? (
        <>
          {/* Search Box */}
          <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
            <Icon name="search" size={18} color={isDark ? '#64748B' : '#717786'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
              placeholder="Search interview questions..."
              placeholderTextColor={isDark ? '#64748B' : '#717786'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter Pills */}
          <View style={styles.categoryScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContent}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryPill,
                      isSelected
                        ? styles.categoryPillActive
                        : isDark
                        ? styles.categoryPillDark
                        : styles.categoryPillLight,
                    ]}
                  >
                    <CustomText
                      variant="small"
                      weight="bold"
                      style={isSelected ? styles.categoryTextActive : (isDark ? styles.textSecondaryDark : styles.textSecondaryLight)}
                    >
                      {cat}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Questions List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              const isBookmarked = bookmarkedIds.includes(q.id);

              return (
                <View
                  key={q.id}
                  style={[styles.questionCard, isDark ? styles.cardDark : styles.cardLight]}
                >
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(q.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.levelBadge,
                          q.level === 'Senior'
                            ? styles.seniorBadgeBg
                            : q.level === 'Mid'
                            ? styles.midBadgeBg
                            : styles.juniorBadgeBg,
                        ]}
                      >
                        <CustomText
                          style={[
                            styles.levelBadgeText,
                            q.level === 'Senior'
                              ? styles.seniorBadgeText
                              : q.level === 'Mid'
                              ? styles.midBadgeText
                              : styles.juniorBadgeText,
                          ]}
                        >
                          {q.level.toUpperCase()}
                        </CustomText>
                      </View>
                      <CustomText
                        variant="caption"
                        style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
                      >
                        {q.category}
                      </CustomText>
                    </View>

                    <View style={styles.questionRow}>
                      <CustomText
                        variant="bodyLg"
                        weight="bold"
                        style={[styles.questionText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                      >
                        {q.question}
                      </CustomText>
                      <TouchableOpacity
                        onPress={() => toggleBookmark(q.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon
                          name={isBookmarked ? 'star' : 'star-border'}
                          size={22}
                          color={isBookmarked ? '#F59E0B' : (isDark ? '#64748B' : '#C1C6D7')}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.expandedContent, isDark ? styles.expandedBorderDark : styles.expandedBorderLight]}>
                      <CustomText
                        variant="body"
                        style={[styles.answerText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                      >
                        {q.answer}
                      </CustomText>

                      {q.codeSnippet && (
                        <View style={[styles.codeBlock, isDark ? styles.codeBlockDark : styles.codeBlockLight]}>
                          <CustomText variant="code" style={styles.codeText}>
                            {q.codeSnippet}
                          </CustomText>
                        </View>
                      )}

                      {q.tips && (
                        <View style={[styles.tipsBox, isDark ? styles.tipsBoxDark : styles.tipsBoxLight]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Icon name="lightbulb-outline" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
                            <CustomText
                              variant="caption"
                              weight="bold"
                              style={styles.tipHeader}
                            >
                              Interview Pro Tip:
                            </CustomText>
                          </View>
                          <CustomText
                            variant="caption"
                            style={[styles.tipBody, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                          >
                            {q.tips}
                          </CustomText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : (
        /* Cheatsheets List */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {cheatsheets.map((sheet, index) => (
            <View
              key={index}
              style={[styles.cheatCard, isDark ? styles.cardDark : styles.cardLight]}
            >
              <View style={styles.cheatHeader}>
                <CustomText
                  variant="headlineMd"
                  weight="bold"
                  style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                >
                  {sheet.title}
                </CustomText>
                <View style={[styles.cheatCategoryBadge, isDark ? styles.cheatCategoryBadgeDark : styles.cheatCategoryBadgeLight]}>
                  <CustomText
                    variant="small"
                    weight="bold"
                    style={styles.darkBlueColor}
                  >
                    {sheet.category}
                  </CustomText>
                </View>
              </View>

              {sheet.items.map((item, i) => (
                <View
                  key={i}
                  style={[styles.cheatItemRow, isDark ? styles.cheatItemBorderDark : styles.cheatItemBorderLight]}
                >
                  <CustomText
                    weight="bold"
                    style={[styles.cheatItemName, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                  >
                    {item.name}
                  </CustomText>
                  <CustomText
                    variant="code"
                    style={[styles.cheatItemValues, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                  >
                    {item.values}
                  </CustomText>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
  },
  headerTitle: { flex: 1 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#414755' },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 14,
  },
  tabSwitcherDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabSwitcherLight: {
    backgroundColor: '#F4F3F8',
    borderColor: '#E3E2E7',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabTextActive: { color: '#FFFFFF' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 12,
    height: 48,
  },
  searchBoxDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBoxLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchIconDark: { tintColor: '#64748B' },
  searchIconLight: { tintColor: '#717786' },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    height: '100%',
  },
  categoryScrollContainer: { marginBottom: 12 },
  categoryContent: { paddingHorizontal: 20, gap: 8 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryPillActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryPillDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  categoryTextActive: { color: '#FFFFFF' },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  cardHeader: { padding: 16 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seniorBadgeBg: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  midBadgeBg: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  juniorBadgeBg: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  levelBadgeText: { fontSize: 10, fontWeight: 'bold' },
  seniorBadgeText: { color: '#EF4444' },
  midBadgeText: { color: '#F59E0B' },
  juniorBadgeText: { color: '#10B981' },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionText: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  bookmarkStar: { fontSize: 18 },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
  },
  expandedBorderDark: { borderTopColor: 'rgba(255, 255, 255, 0.06)' },
  expandedBorderLight: { borderTopColor: '#F2F2F7' },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  codeBlockDark: { backgroundColor: '#050510' },
  codeBlockLight: { backgroundColor: '#1E202E' },
  codeText: {
    fontSize: 12,
    color: '#00C1FD',
    lineHeight: 18,
  },
  tipsBox: {
    padding: 12,
    borderRadius: 8,
  },
  tipsBoxDark: { backgroundColor: 'rgba(0, 193, 253, 0.08)' },
  tipsBoxLight: { backgroundColor: 'rgba(0, 122, 255, 0.08)' },
  tipHeader: { color: '#007AFF' },
  tipBody: { marginTop: 2 },
  cheatCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cheatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cheatCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cheatCategoryBadgeDark: { backgroundColor: 'rgba(0, 122, 255, 0.15)' },
  cheatCategoryBadgeLight: { backgroundColor: '#D8E2FF' },
  darkBlueColor: { color: '#0058BC' },
  cheatItemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cheatItemBorderDark: { borderBottomColor: 'rgba(255, 255, 255, 0.06)' },
  cheatItemBorderLight: { borderBottomColor: '#F2F2F7' },
  cheatItemName: { fontSize: 14, marginBottom: 2 },
  cheatItemValues: { fontSize: 13 },
});

export default InterviewPrepScreen;
