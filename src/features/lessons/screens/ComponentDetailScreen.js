import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SectionList,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../../../context/ThemeContext';
import { icons } from '../../../constants/assets';
import { CustomAlert } from '../../../context/AlertContext';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { userAPI } from '../../../services/api';
import { lessonProgressService } from '../../../services/lessonProgressService';
import { soundService } from '../../../services/soundService';
import { hapticService } from '../../../services/hapticService';

const ComponentDetailScreen = ({ route, navigation }) => {
  const { isDark } = useTheme();
  const { componentData, component } = route.params || {};
  const rawTarget = componentData || component;

  // Unpack nested componentData if passed inside item wrapper
  const rawData =
    rawTarget && typeof rawTarget === 'object' && rawTarget.componentData
      ? rawTarget.componentData
      : rawTarget;

  const lessonId =
    route.params?.lessonId ||
    lessonProgressService.resolveLessonId(rawData);

  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (lessonId) {
      lessonProgressService.getProgress(lessonId).then((val) => {
        if (val !== undefined && val !== null) {
          setReadingProgress(val);
        }
      });
    }
  }, [lessonId]);

  const handleScroll = (event) => {
    if (!lessonId) return;
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    if (scrollableHeight > 30) {
      const scrollPercent = Math.min(
        100,
        Math.max(10, Math.round(((contentOffset.y + layoutMeasurement.height * 0.4) / scrollableHeight) * 100))
      );
      if (scrollPercent > readingProgress) {
        setReadingProgress(scrollPercent);
        lessonProgressService.updateProgress(lessonId, scrollPercent);
      }
    }
  };

  const handleToggleComplete = async () => {
    if (!lessonId) return;
    if (readingProgress >= 100) {
      await lessonProgressService.updateProgress(lessonId, 0);
      setReadingProgress(0);
      soundService.playClick();
      hapticService.light();
      if (Platform.OS === 'android') {
        ToastAndroid.show('Progress reset for this lesson', ToastAndroid.SHORT);
      }
    } else {
      await lessonProgressService.updateProgress(lessonId, 100);
      setReadingProgress(100);
      if (Platform.OS === 'android') {
        ToastAndroid.show('🎉 Lesson completed! 100% saved.', ToastAndroid.SHORT);
      } else {
        CustomAlert.success('Complete!', 'Lesson marked as 100% complete.');
      }
    }
  };

  useEffect(() => {
    const markComponentCompleted = async () => {
      const componentId =
        rawData?.id || rawData?.component || rawData?.name || rawData?.title;
      if (!componentId) return;

      try {
        const storedStr = await AsyncStorage.getItem('completedComponents');
        let list = storedStr ? JSON.parse(storedStr) : [];
        if (!list.includes(String(componentId))) {
          list.push(String(componentId));
          await AsyncStorage.setItem('completedComponents', JSON.stringify(list));

          // Sync with server if logged in
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            const streakVal = parseInt(await AsyncStorage.getItem('streak') || '1', 10);
            const todayStr = new Date().toISOString().split('T')[0];
            userAPI.updateProgress(storedUserId, {
              componentName: String(componentId),
              streak: streakVal,
              lastActiveDate: todayStr,
            }).catch((err) => console.log('Component sync error:', err.message));
          }
        }
      } catch (err) {
        console.error('Failed to update completed components', err);
      }
    };
    markComponentCompleted();
  }, [rawData]);

  if (!rawData || typeof rawData !== 'object') {
    return (
      <Container>
        <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomText style={{ fontSize: 18, color: isDark ? '#F8FAFC' : '#1A1B1F' }}>←</CustomText>
          </TouchableOpacity>
          <CustomText weight="bold" style={styles.topBarTitle}>
            Details
          </CustomText>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <CustomText variant="h3" color="secondary">
            No data available for this item.
          </CustomText>
        </View>
      </Container>
    );
  }

  const formatTitle = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  const formatValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
      return val
        .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
        .join('\n• ');
    }
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n');
    }
    return String(val);
  };

  const processItems = (items) => {
    if (!items) return [];

    if (Array.isArray(items)) {
      return items.map((item, idx) => {
        if (typeof item === 'string') {
          return { id: String(idx), name: item, description: '' };
        }
        if (typeof item === 'object' && item !== null) {
          return {
            id: item.id || String(idx),
            name: item.name || item.title || item.problem || `Item ${idx + 1}`,
            description: formatValue(
              item.description || item.purpose || item.solution || item.details || ''
            ),
            type: item.type,
            signature: item.signature,
            platform: item.platform,
            default: item.default,
            required: item.required,
            values: item.values,
            examples: item.examples,
            parameters: item.parameters,
            returns: item.returns,
            notes: item.notes,
            usage: item.usage,
          };
        }
        return { id: String(idx), name: String(item), description: '' };
      });
    }

    if (typeof items === 'object') {
      return Object.keys(items).map((key, idx) => {
        const val = items[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return {
            id: String(idx),
            name: key,
            description: formatValue(val.description || ''),
            type: val.type,
            signature: val.signature,
            platform: val.platform,
            default: val.default,
            required: val.required,
            values: val.values,
            examples: val.examples,
            parameters: val.parameters,
            returns: val.returns,
            notes: val.notes,
            usage: val.usage || val.valueExample || '',
          };
        }
        return {
          id: String(idx),
          name: key,
          description: formatValue(val),
        };
      });
    }

    if (typeof items === 'string') {
      return [{ id: '1', name: 'Info', description: items }];
    }

    return [];
  };

  const normalizeData = (data) => {
    let sections = [];

    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((cat) => {
        const items = processItems(cat.data || cat.items || []);
        if (items.length > 0) {
          sections.push({ title: cat.title || 'General', data: items });
        }
      });
    }

    const priorityKeys = [
      'props',
      'properties',
      'requiredProps',
      'importantProps',
      'methods',
      'methodsForDrawerControl',
      'refMethods',
      'events',
      'hooks',
      'constants',
      'types',
      'screenOptions',
      'transitionAnimations',
      'installation',
      'usage',
      'coreConcepts',
      'bestPractices',
      'knownIssues',
      'whenToUse',
      'features',
      'notes',
    ];

    priorityKeys.forEach((key) => {
      if (data[key] && !data.categories) {
        const items = processItems(data[key]);
        if (items.length > 0) {
          let title = formatTitle(key);
          if (key === 'props' || key === 'properties') title = 'Properties';
          if (key === 'methods') title = 'Methods';
          if (key === 'refMethods') title = 'Ref Methods';
          if (key === 'screenOptions') title = 'Screen Options';
          if (key === 'coreConcepts') title = 'Core Concepts';
          if (key === 'bestPractices') title = 'Best Practices';
          sections.push({ title, data: items });
        }
      }
    });

    if (!data.categories) {
      Object.keys(data).forEach((key) => {
        if (
          priorityKeys.includes(key) ||
          [
            'component',
            'name',
            'module',
            'library',
            'description',
            'example',
            'basicExample',
            'title',
            'sections',
            'courseTitle',
          ].includes(key)
        ) {
          return;
        }

        const items = processItems(data[key]);
        if (items.length > 0) {
          sections.push({ title: formatTitle(key), data: items });
        }
      });
    }

    if (data.sections && Array.isArray(data.sections)) {
      data.sections.forEach((sec) => {
        const items = [];
        if (sec.description) items.push({ name: 'Overview', description: sec.description });
        if (sec.steps) {
          sec.steps.forEach((step, idx) => {
            let desc =
              typeof step === 'string'
                ? step
                : step.details || step.description || '';
            if (step.verify) desc += `\nVerify: ${step.verify}`;
            items.push({ name: step.name || `Step ${idx + 1}`, description: desc });
          });
        }
        if (sec.commands)
          sec.commands.forEach((cmd) =>
            items.push({ name: 'Command', description: cmd, type: 'code' })
          );
        if (sec.keyPoints)
          sec.keyPoints.forEach((kp) => items.push({ name: 'Key Point', description: kp }));
        if (sec.components)
          sec.components.forEach((c) =>
            items.push({ name: c.name, description: c.purpose || c.description })
          );
        if (sec.code)
          items.push({ name: 'Code Example', usage: sec.code.example || sec.code.snippet });
        if (items.length > 0) {
          sections.push({ title: sec.title || 'Section', data: items });
        }
      });
    }

    return sections;
  };

  const getExample = (data) => {
    if (!data) return null;

    if (data.example && data.example.code) {
      const codeVal = data.example.code;
      const snippet = typeof codeVal === 'string' ? codeVal : codeVal.snippet || '';
      const language =
        typeof codeVal === 'object' ? codeVal.language || 'tsx' : 'tsx';
      return {
        title: data.example.title || 'Example Usage',
        description: data.example.description || '',
        code: { language, snippet },
      };
    }

    if (data.example && typeof data.example === 'object' && !Array.isArray(data.example)) {
      const langKey = Object.keys(data.example).find((k) =>
        ['tsx', 'jsx', 'js', 'javascript', 'typescript'].includes(k.toLowerCase())
      );
      if (langKey && typeof data.example[langKey] === 'string') {
        return {
          title: 'Example Usage',
          description: '',
          code: { language: langKey, snippet: data.example[langKey] },
        };
      }
    }

    if (Array.isArray(data.example) && data.example.length > 0) {
      const ex = data.example[0];
      const snippet =
        typeof ex.code === 'string'
          ? ex.code
          : ex.code?.snippet || ex.snippet || '';
      if (snippet) {
        return {
          title: ex.title || 'Example Usage',
          description: ex.description || '',
          code: { language: ex.code?.language || 'tsx', snippet },
        };
      }
    }

    if (data.basicExample && typeof data.basicExample === 'object') {
      const keys = Object.keys(data.basicExample);
      if (keys.length > 0 && typeof data.basicExample[keys[0]] === 'string') {
        return {
          title: 'Basic Usage',
          description: 'Basic example of the component.',
          code: { language: keys[0], snippet: data.basicExample[keys[0]] },
        };
      }
    }

    return null;
  };

  const sections = normalizeData(rawData);
  const exampleData = getExample(rawData);
  const titleText =
    rawData.component ||
    rawData.name ||
    rawData.module ||
    rawData.courseTitle ||
    rawData.title ||
    'Component Detail';
  const descriptionText = rawData.description || '';

  const handleCopyCode = (code) => {
    if (!code) return;
    Clipboard.setString(code);
    setCopied(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Code copied to clipboard!', ToastAndroid.SHORT);
    } else {
      CustomAlert.success('Success', 'Code copied to clipboard!');
    }
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <CustomText
        variant="headlineXl"
        weight="heavy"
        style={[styles.title, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
      >
        {titleText}
      </CustomText>
      {!!descriptionText && (
        <CustomText
          variant="body"
          style={[styles.description, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
        >
          {descriptionText}
        </CustomText>
      )}

      {exampleData && exampleData.code && !!exampleData.code.snippet && (
        <View style={[styles.exampleContainer, isDark ? styles.cardDark : styles.cardLight]}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={[styles.sectionTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            {exampleData.title}
          </CustomText>
          {!!exampleData.description && (
            <CustomText
              variant="body"
              style={[styles.exampleDescription, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              {exampleData.description}
            </CustomText>
          )}

          <View style={[styles.codeBlockContainer, isDark ? styles.codeBlockContainerDark : styles.codeBlockContainerLight]}>
            <View style={[styles.codeHeader, isDark ? styles.codeHeaderDark : styles.codeHeaderLight]}>
              <CustomText weight="bold" style={styles.codeLanguage}>
                {exampleData.code.language || 'tsx'}
              </CustomText>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopyCode(exampleData.code.snippet)}
              >
                <Icon
                  name={copied ? 'check-circle' : 'content-copy'}
                  size={16}
                  color={copied ? '#10B981' : '#94A3B8'}
                  style={{ marginRight: 4 }}
                />
                <CustomText
                  variant="small"
                  weight="bold"
                  style={copied ? styles.successColor : styles.cyanColor}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </CustomText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.codeScrollView}
            >
              <View style={styles.codeBlock}>
                <CustomText variant="code" style={styles.codeText}>
                  {exampleData.code.snippet}
                </CustomText>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {sections.length > 0 && (
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={[styles.propsTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          Documentation & Reference
        </CustomText>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.propItem, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.propHeader}>
        <CustomText
          variant="bodyLg"
          weight="bold"
          style={[styles.propName, styles.brandColor]}
        >
          {item.name}
        </CustomText>

        {item.required && (
          <View style={styles.requiredBadge}>
            <CustomText style={styles.badgeText}>Required</CustomText>
          </View>
        )}

        {item.platform && (
          <View style={[styles.platformBadge, isDark ? styles.platformBadgeDark : styles.platformBadgeLight]}>
            <CustomText
              variant="small"
              weight="bold"
              style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
            >
              {item.platform}
            </CustomText>
          </View>
        )}
      </View>

      {item.signature && (
        <CustomText variant="code" style={styles.propType}>
          {item.signature}
        </CustomText>
      )}
      {item.type && (
        <CustomText variant="code" style={styles.propType}>
          Type: {item.type}
        </CustomText>
      )}
      {item.usage && (
        <CustomText
          variant="code"
          style={[styles.usageText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          Usage: {item.usage}
        </CustomText>
      )}

      <View style={styles.metaContainer}>
        {item.default !== undefined && (
          <CustomText
            variant="caption"
            style={[styles.metaText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Default:{' '}
            <CustomText variant="code" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
              {typeof item.default === 'object'
                ? JSON.stringify(item.default)
                : String(item.default)}
            </CustomText>
          </CustomText>
        )}
        {(item.examples || item.values) && (
          <CustomText
            variant="caption"
            style={[styles.metaText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            Values:{' '}
            <CustomText variant="code" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
              {Array.isArray(item.examples || item.values)
                ? (item.examples || item.values).join(', ')
                : String(item.examples || item.values)}
            </CustomText>
          </CustomText>
        )}
      </View>

      {item.returns && (
        <CustomText variant="caption" style={styles.returnsText}>
          Returns:{' '}
          <CustomText variant="code">
            {typeof item.returns === 'object'
              ? JSON.stringify(item.returns)
              : String(item.returns)}
          </CustomText>
        </CustomText>
      )}

      {item.parameters && (
        <View style={[styles.nestedContainer, isDark ? styles.nestedContainerDark : styles.nestedContainerLight]}>
          <CustomText
            variant="small"
            weight="bold"
            style={styles.nestedLabel}
          >
            Parameters:
          </CustomText>
          <CustomText
            variant="code"
            style={[styles.nestedText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            {formatValue(item.parameters)}
          </CustomText>
        </View>
      )}

      {item.notes && (
        <View style={[styles.nestedContainer, isDark ? styles.nestedContainerDark : styles.nestedContainerLight]}>
          <CustomText
            variant="small"
            weight="bold"
            style={styles.nestedLabel}
          >
            Notes:
          </CustomText>
          <CustomText
            variant="code"
            style={[styles.nestedText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            {formatValue(item.notes)}
          </CustomText>
        </View>
      )}

      {!!item.description && (
        <CustomText
          variant="body"
          style={[styles.propDescription, isDark ? styles.propDescDark : styles.propDescLight]}
        >
          {item.description}
        </CustomText>
      )}
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[styles.sectionHeader, isDark ? styles.sectionHeaderDark : styles.sectionHeaderLight]}>
      <CustomText variant="small" weight="bold" style={styles.sectionHeaderText}>
        {title}
      </CustomText>
    </View>
  );

  const renderFooter = () => {
    if (!lessonId) return null;
    const isCompleted = readingProgress >= 100;

    return (
      <View style={[styles.lessonFooterCard, isDark ? styles.lessonFooterDark : styles.lessonFooterLight]}>
        <View style={styles.lessonFooterRow}>
          <View style={styles.lessonFooterInfo}>
            <CustomText
              variant="headlineMd"
              weight="bold"
              style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
            >
              {isCompleted ? '🎉 Lesson Completed!' : '📖 Reading Progress'}
            </CustomText>
            <CustomText
              variant="small"
              style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
            >
              {isCompleted
                ? 'Great job! This topic is 100% finished.'
                : `Scroll or mark done • ${readingProgress}% completed`}
            </CustomText>
          </View>
          <View
            style={[
              styles.percentPill,
              { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 193, 253, 0.15)' },
            ]}
          >
            <CustomText
              variant="small"
              weight="bold"
              style={{ color: isCompleted ? '#10B981' : '#00C1FD' }}
            >
              {readingProgress}%
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            isCompleted ? styles.completeButtonDone : styles.completeButtonActive,
          ]}
          onPress={handleToggleComplete}
          activeOpacity={0.8}
        >
          <CustomText weight="bold" style={styles.completeButtonText}>
            {isCompleted ? '✅ Mark Incomplete (Reset)' : 'Mark as Complete (100%) 🔥'}
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
        >
          <CustomText style={{ fontSize: 18, color: isDark ? '#F8FAFC' : '#1A1B1F' }}>←</CustomText>
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          {titleText}
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      {lessonId && (
        <View style={[styles.topProgressBarTrack, isDark ? styles.topTrackDark : styles.topTrackLight]}>
          <View
            style={[
              styles.topProgressBarFill,
              {
                width: `${Math.max(readingProgress > 0 ? 5 : 0, readingProgress)}%`,
                backgroundColor: readingProgress >= 100 ? '#10B981' : '#00C1FD',
              },
            ]}
          />
        </View>
      )}

      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => (item.name || 'item') + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={32}
        >
          {renderHeader()}
          {renderFooter()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDark: { backgroundColor: '#050510' },
  containerLight: { backgroundColor: '#FAF9FE' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  topBarDark: {
    backgroundColor: '#050510',
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  topBarLight: {
    backgroundColor: '#FAF9FE',
    borderBottomColor: '#E3E2E7',
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
  backIcon: { width: 16, height: 16, transform: [{ rotate: '90deg' }] },
  iconLight: { tintColor: '#F8FAFC' },
  iconDark: { tintColor: '#1A1B1F' },
  headerSpacer: { width: 36 },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#414755' },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  headerContainer: { marginBottom: 20 },
  title: { fontSize: 28, marginBottom: 8 },
  description: { lineHeight: 22, marginBottom: 20 },
  exampleContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, marginBottom: 6 },
  exampleDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  codeBlockContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  codeBlockContainerDark: {
    backgroundColor: '#050510',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  codeBlockContainerLight: {
    backgroundColor: '#1E202E',
    borderColor: '#2A2D3D',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  codeHeaderDark: {
    backgroundColor: '#0A0B10',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  codeHeaderLight: {
    backgroundColor: '#161823',
    borderBottomColor: '#2A2D3D',
  },
  codeLanguage: {
    color: '#00C1FD',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyIcon: { width: 14, height: 14 },
  cyanTint: { tintColor: '#00C1FD' },
  successTint: { tintColor: '#10B981' },
  cyanColor: { color: '#00C1FD' },
  successColor: { color: '#10B981' },
  brandColor: { color: '#007AFF' },
  codeScrollView: { maxHeight: 260 },
  codeBlock: { padding: 16 },
  codeText: { color: '#F8FAFC', fontSize: 13, lineHeight: 20 },
  propsTitle: { fontSize: 20, marginBottom: 12, marginTop: 8 },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 14,
    borderWidth: 1,
  },
  sectionHeaderDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionHeaderLight: {
    backgroundColor: '#F4F3F8',
    borderColor: '#E3E2E7',
  },
  sectionHeaderText: {
    color: '#007AFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  propItem: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  propHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  propName: { marginRight: 8, fontSize: 16 },
  requiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: { fontSize: 10, color: '#EF4444', fontWeight: 'bold' },
  platformBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  platformBadgeDark: { backgroundColor: '#161823' },
  platformBadgeLight: { backgroundColor: '#F4F3F8' },
  propType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  usageText: { fontSize: 13, marginBottom: 6 },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  metaText: { marginRight: 12, marginBottom: 2 },
  returnsText: { color: '#00C1FD', marginBottom: 6 },
  nestedContainer: { padding: 10, borderRadius: 8, marginTop: 4, marginBottom: 6 },
  nestedContainerDark: { backgroundColor: '#161823' },
  nestedContainerLight: { backgroundColor: '#F4F3F8' },
  nestedLabel: { color: '#007AFF', marginBottom: 2 },
  nestedText: { fontSize: 12 },
  propDescription: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  propDescDark: { color: '#CBD5E1' },
  propDescLight: { color: '#414755' },
  topBarTitle: { color: '#1A1B1F' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topProgressBarTrack: {
    height: 4,
    width: '100%',
  },
  topTrackDark: {
    backgroundColor: '#1E202E',
  },
  topTrackLight: {
    backgroundColor: '#E3E2E7',
  },
  topProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  lessonFooterCard: {
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  lessonFooterDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  lessonFooterLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  lessonFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  lessonFooterInfo: {
    flex: 1,
    paddingRight: 10,
  },
  percentPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completeButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonActive: {
    backgroundColor: '#007AFF',
  },
  completeButtonDone: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});

export default ComponentDetailScreen;
