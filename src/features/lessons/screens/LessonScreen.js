import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  SectionList,
  Platform,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import reactNativeComponents from '../../../data/componentsData';
import { contentService } from '../../../services/contentService';
import { colors } from '../../../theme/theme';

const SECTION_LOOK = {
  'View & Layout Components': { icon: 'dashboard', color: colors.brand.primary },
  'Text & Input Components': { icon: 'text-fields', color: colors.category.purple },
  'Buttons & Controls': { icon: 'smart-button', color: colors.brand.warning },
  Touchables: { icon: 'touch-app', color: colors.category.pink },
  'Media & Feedback': { icon: 'perm-media', color: colors.brand.success },
  'System & Dialogs': { icon: 'phonelink', color: colors.category.sky },
  'Animations & Gestures': { icon: 'gesture', color: colors.category.orange },
  'APIs & Utilities': { icon: 'extension', color: colors.category.indigo },
  Navigation: { icon: 'explore', color: colors.category.teal },
};

const FALLBACK_LOOK = { icon: 'menu-book', color: colors.brand.primary };

const lookForSection = (title) => SECTION_LOOK[title] || FALLBACK_LOOK;

const LessonScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const [searchQuery, setSearchQuery] = useState('');
  const [componentsList, setComponentsList] = useState(reactNativeComponents);

  useEffect(() => {
    let isMounted = true;
    contentService
      .getComponentsList((fresh) => {
        if (isMounted && fresh) {
          setComponentsList(fresh);
        }
      })
      .then((initial) => {
        if (isMounted && initial) {
          setComponentsList(initial);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter the data based on searchQuery
  const filteredData = componentsList
    .map((section) => ({
      ...section,
      data: section.data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((section) => section.data.length > 0);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomText
        variant="headlineXl"
        weight="bold"
        style={[styles.headerTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
      >
        Learn
      </CustomText>
      <CustomText
        variant="body"
        style={[styles.headerSubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
      >
        {reactNativeComponents.reduce((sum, section) => sum + section.data.length, 0)} components, grouped by topic
      </CustomText>

      {/* Figma Search Bar */}
      <View style={[styles.searchBar, isDark ? styles.searchBarDark : styles.searchBarLight]}>
        <Icon name="search" size={18} color={isDark ? colors.dark.textMuted : colors.light.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search components & APIs..."
          placeholderTextColor={isDark ? colors.dark.textMuted : colors.light.textSecondary}
          style={[styles.searchInput, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
            style={styles.clearButton}
          >
            <Icon name="close" size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }) => {
    const look = lookForSection(section.title);
    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${look.color}18` }]}>
          <Icon name={look.icon} size={16} color={look.color} />
        </View>
        <CustomText
          variant="body"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          numberOfLines={1}
        >
          {section.title}
        </CustomText>
        <View style={[styles.countPill, { backgroundColor: `${look.color}18` }]}>
          <CustomText variant="small" weight="bold" style={{ color: look.color }}>
            {section.data.length}
          </CustomText>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, section }) => {
    const title = item.title || item.name;
    const desc = item.desc || item.description;
    const look = lookForSection(section.title);

    return (
      <TouchableOpacity
        style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ComponentDetail', { component: item })}
      >
        <View style={[styles.cardAccent, { backgroundColor: look.color }]} />
        <View style={[styles.itemIcon, { backgroundColor: `${look.color}16` }]}>
          <Icon name={look.icon} size={18} color={look.color} />
        </View>
        <View style={styles.cardInfo}>
          <CustomText
            variant="body"
            weight="bold"
            style={[styles.itemTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            numberOfLines={1}
          >
            {title}
          </CustomText>
          <CustomText
            variant="small"
            style={[styles.itemDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            numberOfLines={2}
          >
            {desc}
          </CustomText>
        </View>
        <Icon name="chevron-right" size={22} color={isDark ? colors.dark.textMuted : colors.light.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      <SectionList
        sections={filteredData}
        keyExtractor={(item, index) => item.id || `${item.name}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, { paddingTop: topInset + 12 }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: colors.dark.background },
  containerLight: { backgroundColor: colors.light.background },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  textSecondaryDark: { color: colors.dark.textSecondary },
  textSecondaryLight: { color: colors.light.textSecondary },
  textMutedDark: { color: colors.dark.textMuted, letterSpacing: 0.5 },
  textMutedLight: { color: colors.light.textSecondary, letterSpacing: 0.5 },
  iconSecondaryDark: { tintColor: colors.dark.textMuted },
  iconSecondaryLight: { tintColor: colors.light.textSecondary },
  chevronDark: { tintColor: colors.dark.textMuted },
  chevronLight: { tintColor: colors.light.chevron },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 20,
  },
  headerContainer: { marginBottom: 20 },
  headerTitle: { fontSize: 30, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
  },
  searchBarDark: {
    backgroundColor: colors.dark.elevated,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchBarLight: {
    backgroundColor: colors.light.elevated,
    borderColor: 'transparent',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: { padding: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
  },
  countPill: {
    minWidth: 26,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 15, marginBottom: 2 },
  itemDesc: { fontSize: 12, lineHeight: 16 },
  arrowIcon: {
    width: 16,
    height: 16,
    transform: [{ rotate: '-90deg' }],
  },
});

export default LessonScreen;