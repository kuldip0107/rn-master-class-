import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  SectionList,
  Platform,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { icons } from '../../../constants/assets';
import reactNativeComponents from '../../../data/componentsData';

const LessonScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter the data based on searchQuery
  const filteredData = reactNativeComponents
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

      {/* Figma Search Bar */}
      <View style={[styles.searchBar, isDark ? styles.searchBarDark : styles.searchBarLight]}>
        <Icon name="search" size={18} color={isDark ? '#64748B' : '#717786'} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search components & APIs..."
          placeholderTextColor={isDark ? '#64748B' : '#717786'}
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
            <CustomText style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
              ✕
            </CustomText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }) => {
    return (
      <View style={[styles.sectionHeader, isDark ? styles.sectionHeaderDark : styles.sectionHeaderLight]}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionDot} />
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
          >
            {section.title}
          </CustomText>
        </View>
        <CustomText
          variant="small"
          weight="bold"
          style={isDark ? styles.textMutedDark : styles.textMutedLight}
        >
          {section.data.length} ITEMS
        </CustomText>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const title = item.title || item.name;
    const desc = item.desc || item.description;

    return (
      <TouchableOpacity
        style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ComponentDetail', { component: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
            <CustomText
              variant="headlineMd"
              weight="bold"
              style={[styles.itemTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              {title}
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.itemDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
              numberOfLines={2}
            >
              {desc}
            </CustomText>
          </View>

          <CustomText style={{ fontSize: 20, color: isDark ? '#64748B' : '#C1C6D7' }}>›</CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      <SectionList
        sections={filteredData}
        keyExtractor={(item, index) => item.id || `${item.name}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
  textMutedDark: { color: '#64748B', letterSpacing: 0.5 },
  textMutedLight: { color: '#717786', letterSpacing: 0.5 },
  iconSecondaryDark: { tintColor: '#64748B' },
  iconSecondaryLight: { tintColor: '#717786' },
  chevronDark: { tintColor: '#64748B' },
  chevronLight: { tintColor: '#C1C6D7' },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 90,
  },
  headerContainer: { marginBottom: 20 },
  headerTitle: { fontSize: 30, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
  },
  searchBarDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchBarLight: {
    backgroundColor: '#F4F3F8',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 22,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  sectionHeaderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeaderLight: {
    borderBottomColor: '#E3E2E7',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C1FD',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: { flex: 1, marginRight: 12 },
  itemTitle: { fontSize: 17, marginBottom: 4 },
  itemDesc: { fontSize: 14, lineHeight: 20 },
  arrowIcon: {
    width: 16,
    height: 16,
    transform: [{ rotate: '-90deg' }],
  },
});

export default LessonScreen;