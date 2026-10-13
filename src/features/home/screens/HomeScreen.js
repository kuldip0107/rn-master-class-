import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';

import { userAPI } from '../../../services/api';
import { lessonProgressService } from '../../../services/lessonProgressService';
import { appUsageService } from '../../../services/appUsageService';
import { useTopInset } from '../../../hooks/useTopInset';

import flexboxData from '../../../data/Homescreen Data/flexbox.json';
import stateManagementData from '../../../data/Homescreen Data/state_management.json';
import basicRnData from '../../../data/Homescreen Data/basic react-native.json';
import { colors } from '../../../theme/theme';

const LEARNING_PATHS = [
  {
    title: 'Introduction to Flexbox',
    duration: '15 min',
    id: 'flexbox',
    data: flexboxData,
  },
  {
    title: 'State Management with Context',
    duration: '20 min',
    id: 'state_management',
    data: stateManagementData,
  },
  {
    title: 'Basic React-Native Components',
    duration: '25 min',
    id: 'basic_rn',
    data: basicRnData,
  },
];

const HERO_COPY = {
  resume: { eyebrow: 'Pick up where you left off', action: 'Resume', icon: 'play-arrow' },
  start: { eyebrow: 'Start your first lesson', action: 'Start', icon: 'play-arrow' },
  done: { eyebrow: 'All lessons complete', action: 'Review', icon: 'replay' },
};

const ScalePressable = ({ onPress, style, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      style={style}
    >
      <Animated.View style={[styles.pressFill, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

const ProgressFill = ({ percent, color, style }) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(percent, 100)),
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [percent, width]);

  const animatedWidth = width.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return <Animated.View style={[styles.progressBarFill, { width: animatedWidth, backgroundColor: color }, style]} />;
};

const NameSkeleton = ({ isDark }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.nameSkeleton, isDark ? styles.skeletonDark : styles.skeletonLight, { opacity }]}
    />
  );
};

const HomeScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const [userName, setUserName] = useState('');
  const [nameReady, setNameReady] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streak, setStreak] = useState(1);
  const [avatarColor, setAvatarColor] = useState(colors.brand.primary);
  const [profileImage, setProfileImage] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({
    flexbox: 0,
    state_management: 0,
    basic_rn: 0,
  });
  const [usageStats, setUsageStats] = useState({
    totalSeconds: 0,
    todaySeconds: 0,
    formattedTotal: '0s',
    formattedToday: '0s',
  });
  const initLock = useRef(false);

  useEffect(() => {
    const unsubscribeUsage = appUsageService.subscribe((stats) => {
      setUsageStats(stats);
    });
    return unsubscribeUsage;
  }, []);

  useEffect(() => {
    if (!showStreakCelebration) return undefined;
    const timer = setTimeout(() => setShowStreakCelebration(false), 4500);
    return () => clearTimeout(timer);
  }, [showStreakCelebration]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      lessonProgressService.getAllProgress().then((progress) => {
        if (isMounted) {
          setLessonProgress(progress);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    const initializeData = async () => {
      if (initLock.current) return;
      initLock.current = true;
      try {
        const storedId = await AsyncStorage.getItem('userId');
        let currentName = await AsyncStorage.getItem('userName');

        // Resolve real user name (cleanse any placeholder/fallback 'React Native Developer')
        if (
          !currentName ||
          currentName === 'React Native Developer' ||
          currentName === 'Alex' ||
          currentName === 'User'
        ) {
          const userStr = await AsyncStorage.getItem('userObject');
          if (userStr) {
            try {
              const parsed = JSON.parse(userStr);
              if (parsed.name && parsed.name !== 'React Native Developer') {
                currentName = parsed.name;
              }
            } catch (_) {}
          }
        }

        if (!currentName || currentName === 'React Native Developer') {
          const userEmail = await AsyncStorage.getItem('userEmail');
          if (userEmail) {
            const derived = userEmail
              .split('@')[0]
              .replace(/[._\d]+/g, ' ')
              .trim()
              .replace(/\b\w/g, (c) => c.toUpperCase());
            if (derived) currentName = derived;
          }
        }

        if (currentName && currentName !== 'React Native Developer') {
          setUserName(currentName);
          await AsyncStorage.setItem('userName', currentName);
        }
        setNameReady(true);

        const storedAvatarColor =
          (await AsyncStorage.getItem('avatarColor')) ||
          (await AsyncStorage.getItem('userAvatarColor'));
        if (storedAvatarColor) setAvatarColor(storedAvatarColor);

        let storedProfileImage = await AsyncStorage.getItem('profileImage');
        if (!storedProfileImage) {
          const userStr = await AsyncStorage.getItem('userObject');
          if (userStr) {
            try {
              const parsed = JSON.parse(userStr);
              if (parsed.profileImage || parsed.photoUrl) {
                storedProfileImage = parsed.profileImage || parsed.photoUrl;
              }
            } catch (_) {}
          }
        }
        if (storedProfileImage) setProfileImage(storedProfileImage);

        const lastDate = await AsyncStorage.getItem('lastActiveDate');
        const currentStreak = await AsyncStorage.getItem('streak');
        const todayStr = new Date().toISOString().split('T')[0];

        let newStreak = 1;

        if (lastDate === todayStr) {
          // Same day app open
          newStreak = currentStreak ? parseInt(currentStreak, 10) : 1;
        } else if (lastDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yesterdayStr) {
            // Consecutive day login: increment streak
            newStreak = currentStreak ? parseInt(currentStreak, 10) + 1 : 2;
          } else {
            // Missed a day: reset streak
            newStreak = 1;
          }
        } else if (currentStreak) {
          // Logged in previously (e.g. yesterday) without lastActiveDate cached
          newStreak = parseInt(currentStreak, 10) + 1;
        }

        setStreak(newStreak);
        await AsyncStorage.setItem('lastActiveDate', todayStr);
        await AsyncStorage.setItem('streak', String(newStreak));

        const previousStreak = currentStreak ? parseInt(currentStreak, 10) : 0;
        if (lastDate !== todayStr && newStreak > previousStreak && previousStreak > 0) {
          const celebratedDate = await AsyncStorage.getItem('streakCelebratedDate');
          if (celebratedDate !== todayStr) {
            setShowStreakCelebration(true);
            await AsyncStorage.setItem('streakCelebratedDate', todayStr);
          }
        }

        // Sync with backend if user is logged in
        if (storedId) {
          try {
            const [profileRes, progressRes] = await Promise.allSettled([
              userAPI.getProfile(storedId),
              userAPI.getProgress(storedId),
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value?.user) {
              const u = profileRes.value.user;
              if (u.name && u.name !== 'React Native Developer') {
                setUserName(u.name);
                await AsyncStorage.setItem('userName', u.name);
              }
              if (u.avatarColor) setAvatarColor(u.avatarColor);
              if (u.profileImage) {
                setProfileImage(u.profileImage);
                await AsyncStorage.setItem('profileImage', u.profileImage);
              }
              if (u.streak != null) {
                const effectiveStreak = Math.max(newStreak, u.streak);
                setStreak(effectiveStreak);
                await AsyncStorage.setItem('streak', String(effectiveStreak));
              }
            }

            if (progressRes.status === 'fulfilled' && progressRes.value?.progress) {
              const p = progressRes.value.progress;
              if (p.streak != null) {
                const effectiveStreak = Math.max(newStreak, p.streak);
                setStreak(effectiveStreak);
                await AsyncStorage.setItem('streak', String(effectiveStreak));
                if (p.lastActiveDate) {
                  await AsyncStorage.setItem('lastActiveDate', p.lastActiveDate);
                }
                // If client has higher streak, sync with server
                if (effectiveStreak > p.streak) {
                  userAPI.updateProgress(storedId, {
                    streak: effectiveStreak,
                    lastActiveDate: todayStr,
                  }).catch(() => {});
                }
              }
            }
          } catch (syncErr) {
            console.log('Home background sync notice:', syncErr.message);
          }
        }
        // Auto-sync screen time data with backend
        appUsageService.syncNow().catch(() => {});
      } catch (e) {
        console.error(e);
      } finally {
        initLock.current = false;
        setNameReady(true);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      initializeData();
    });
    initializeData();
    return unsubscribe;
  }, [navigation]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = userName.trim().split(/\s+/)[0];
  const avatarAccent = avatarColor || (isDark ? colors.brand.accent : colors.brand.primary);

  const lessons = useMemo(
    () =>
      LEARNING_PATHS.map((item) => ({
        ...item,
        percent: lessonProgress[item.id] || 0,
      })),
    [lessonProgress]
  );

  const resumeTarget = useMemo(() => {
    const inProgress = lessons
      .filter((item) => item.percent > 0 && item.percent < 100)
      .sort((a, b) => b.percent - a.percent);
    if (inProgress.length) {
      return { lesson: inProgress[0], mode: 'resume' };
    }
    const next = lessons.find((item) => item.percent < 100);
    if (next) {
      return { lesson: next, mode: 'start' };
    }
    return { lesson: lessons[0], mode: 'done' };
  }, [lessons]);

  const continueLessons = useMemo(
    () => lessons.filter((item) => item.id !== resumeTarget.lesson.id).slice(0, 2),
    [lessons, resumeTarget]
  );

  const lessonPathStats = useMemo(() => {
    const avg = Math.round(lessons.reduce((sum, item) => sum + item.percent, 0) / lessons.length);
    const started = lessons.filter((item) => item.percent > 0).length;
    return {
      avg,
      text: started === 0 ? 'Not started' : `${avg}% complete`,
    };
  }, [lessons]);

  const openLesson = (item) => {
    if (item?.data) {
      navigation.navigate('ComponentDetail', {
        componentData: item.data,
        lessonId: item.id,
      });
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Lessons' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeftCol}>
        <CustomText
          variant="small"
          weight="medium"
          style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
        >
          {greeting}
          {nameReady && firstName ? ',' : ''}
        </CustomText>
        {nameReady ? (
          <CustomText
            variant="headlineXl"
            weight="bold"
            style={[styles.userNameText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            numberOfLines={1}
          >
            {firstName || 'Welcome'}
          </CustomText>
        ) : (
          <NameSkeleton isDark={isDark} />
        )}
        <View style={styles.chipRow}>
          <View style={[styles.chip, isDark ? styles.streakChipDark : styles.streakChipLight]}>
            <Icon name="local-fire-department" size={15} color={colors.brand.streak} />
            <CustomText weight="bold" style={styles.streakChipText}>
              {streak}
            </CustomText>
          </View>
          <View style={[styles.chip, isDark ? styles.timeChipDark : styles.timeChipLight]}>
            <Icon name="schedule" size={14} color={isDark ? colors.brand.accent : colors.brand.primary} />
            <CustomText
              weight="bold"
              style={isDark ? styles.timeChipTextDark : styles.timeChipTextLight}
              numberOfLines={1}
            >
              {usageStats.formattedToday || '0s'}
            </CustomText>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        activeOpacity={0.8}
        style={styles.avatarButton}
      >
        <View
          style={[
            styles.avatarCircle,
            {
              borderColor: avatarAccent,
              backgroundColor: `${avatarAccent}18`,
              overflow: 'hidden',
            },
          ]}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImg} resizeMode="cover" />
          ) : (
            <Icon name="person" size={26} color={avatarAccent} />
          )}
        </View>
        <View style={[styles.avatarBadge, isDark ? styles.avatarBadgeBorderDark : styles.avatarBadgeBorderLight]} />
      </TouchableOpacity>
    </View>
  );

  const renderCelebration = () => (
    <LinearGradient
      colors={[colors.brand.streak, colors.brand.streakEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.celebrateCard}
    >
      <Icon name="local-fire-department" size={22} color={colors.brand.white} />
      <View style={styles.celebrateText}>
        <CustomText weight="bold" style={styles.celebrateTitle}>
          You're on fire
        </CustomText>
        <CustomText style={styles.celebrateSub}>
          {streak} day streak. Keep learning today.
        </CustomText>
      </View>
      <TouchableOpacity
        onPress={() => setShowStreakCelebration(false)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={18} color={colors.brand.white} />
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderHero = () => {
    const copy = HERO_COPY[resumeTarget.mode];
    const lesson = resumeTarget.lesson;
    const finished = resumeTarget.mode === 'done';

    return (
      <ScalePressable onPress={() => openLesson(lesson)} style={styles.heroWrap}>
        <LinearGradient
          colors={[colors.brand.primary, colors.brand.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlow} />
          <CustomText weight="bold" style={styles.heroEyebrow}>
            {copy.eyebrow}
          </CustomText>
          <CustomText weight="heavy" style={styles.heroTitle} numberOfLines={2}>
            {finished ? 'You finished this path' : lesson.title}
          </CustomText>
          <CustomText style={styles.heroMeta}>
            {finished ? `Review ${lesson.title}` : `${lesson.duration}  ·  ${lesson.percent}%`}
          </CustomText>
          <View style={styles.heroTrack}>
            <ProgressFill percent={lesson.percent} color={colors.brand.white} />
          </View>
          <View style={styles.heroCta}>
            <Icon name={copy.icon} size={18} color={colors.brand.primary} />
            <CustomText weight="bold" style={styles.heroCtaText}>
              {copy.action}
            </CustomText>
          </View>
        </LinearGradient>
      </ScalePressable>
    );
  };

  const renderExplorePaths = () => {
    const cards = [
      {
        id: 'lessons',
        title: 'Lessons',
        subtitle: lessonPathStats.text,
        icon: 'menu-book',
        iconColor: colors.brand.primary,
        light: ['#EAF3FF', '#D9EAFF'],
        dark: ['#10243F', '#0E3358'],
        showProgress: true,
        onPress: () => navigation.navigate('MainTabs', { screen: 'Lessons' }),
      },
      {
        id: 'quiz',
        title: 'Practical Quiz',
        subtitle: 'Test your skills',
        icon: 'emoji-events',
        iconColor: colors.category.purple,
        light: ['#F4EEFF', '#E9DEFF'],
        dark: ['#241838', '#321E4E'],
        onPress: () => navigation.navigate('MainTabs', { screen: 'Practice' }),
      },
      {
        id: 'interview',
        title: 'Interview Q&A',
        subtitle: 'Cheatsheets',
        icon: 'code',
        iconColor: colors.brand.success,
        light: ['#E9FBF4', '#D7F6EA'],
        dark: ['#0F2A22', '#12382C'],
        onPress: () => navigation.navigate('InterviewPrep'),
      },
      {
        id: 'android',
        title: 'Android Setup',
        subtitle: 'CLI and tools',
        icon: 'android',
        iconColor: colors.category.sky,
        light: ['#E7F7FE', '#D4F1FC'],
        dark: ['#0E2433', '#123044'],
        onPress: () => navigation.navigate('AndroidSetup'),
      },
    ];

    return (
      <View style={styles.section}>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={[styles.sectionTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          Explore paths
        </CustomText>
        <View style={styles.grid}>
          {cards.map((card) => (
            <ScalePressable key={card.id} onPress={card.onPress} style={styles.gridSlot}>
              <LinearGradient
                colors={isDark ? card.dark : card.light}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreCard}
              >
                <View style={[styles.iconBubble, isDark ? styles.iconBubbleDark : styles.iconBubbleLight]}>
                  <Icon name={card.icon} size={22} color={card.iconColor} />
                </View>
                <CustomText
                  weight="bold"
                  style={[styles.exploreTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                  numberOfLines={1}
                >
                  {card.title}
                </CustomText>
                <CustomText
                  variant="small"
                  style={isDark ? styles.exploreSubDark : styles.exploreSubLight}
                  numberOfLines={1}
                >
                  {card.subtitle}
                </CustomText>
                {card.showProgress ? (
                  <View style={[styles.miniTrack, isDark ? styles.miniTrackDark : styles.miniTrackLight]}>
                    <ProgressFill
                      percent={lessonPathStats.avg}
                      color={isDark ? '#7DD3FC' : colors.brand.primary}
                    />
                  </View>
                ) : (
                  <View style={[styles.accentDash, { backgroundColor: card.iconColor }]} />
                )}
              </LinearGradient>
            </ScalePressable>
          ))}
        </View>
      </View>
    );
  };

  const renderContinueLearning = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Continue learning
        </CustomText>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Lessons' })}>
          <CustomText variant="caption" weight="bold" style={styles.viewAllText}>
            View all
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.continueList}>
        {continueLessons.map((item) => {
          const isCompleted = item.percent >= 100;
          const accentColor = isCompleted
            ? colors.brand.success
            : item.percent > 0
            ? colors.brand.accent
            : isDark
            ? '#334155'
            : '#D5D8E2';

          return (
            <ScalePressable key={item.id} onPress={() => openLesson(item)}>
              <View style={[styles.continueCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={[styles.continueAccent, { backgroundColor: accentColor }]} />
                <View
                  style={[
                    styles.playCircle,
                    isCompleted ? styles.playCircleCompleted : isDark ? styles.playCircleDark : styles.playCircleLight,
                  ]}
                >
                  <Icon
                    name={isCompleted ? 'check' : 'play-arrow'}
                    size={22}
                    color={isCompleted ? colors.brand.success : isDark ? colors.brand.accent : colors.brand.primary}
                  />
                </View>
                <View style={styles.continueInfo}>
                  <CustomText
                    variant="body"
                    weight="bold"
                    style={[styles.continueTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </CustomText>
                  <View style={styles.progressRow}>
                    <View style={[styles.progressTrack, isDark ? styles.progressTrackDark : styles.progressTrackLight]}>
                      <ProgressFill percent={item.percent} color={isCompleted ? colors.brand.success : colors.brand.accent} />
                    </View>
                    <CustomText
                      variant="small"
                      weight="bold"
                      style={[styles.percentLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                    >
                      {item.percent}%
                    </CustomText>
                  </View>
                  <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                    {isCompleted ? `${item.duration}  ·  Completed` : item.duration}
                  </CustomText>
                </View>
                <Icon name="chevron-right" size={22} color={isDark ? colors.dark.textMuted : colors.light.chevron} />
              </View>
            </ScalePressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.topSection, { paddingTop: topInset + 8 }]}>
          {renderHeader()}
          {showStreakCelebration ? renderCelebration() : null}
          {renderHero()}
        </View>
        {renderExplorePaths()}
        {renderContinueLearning()}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  pressFill: {
    width: '100%',
  },
  containerDark: { backgroundColor: colors.dark.background },
  containerLight: { backgroundColor: colors.light.background },
  scrollContent: {
    paddingBottom: 90,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  userNameText: {
    fontSize: 26,
    marginTop: 2,
  },
  nameSkeleton: {
    height: 28,
    width: 148,
    borderRadius: 8,
    marginTop: 8,
  },
  skeletonLight: { backgroundColor: colors.light.border },
  skeletonDark: { backgroundColor: '#1E202E' },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  textSecondaryDark: { color: colors.dark.textSecondary },
  textSecondaryLight: { color: colors.light.textSecondary },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  streakChipLight: {
    backgroundColor: '#FFF4EE',
    borderColor: 'rgba(255, 107, 61, 0.28)',
  },
  streakChipDark: {
    backgroundColor: '#2A1814',
    borderColor: 'rgba(255, 107, 61, 0.45)',
  },
  streakChipText: {
    color: colors.brand.streak,
    fontSize: 13,
  },
  timeChipLight: {
    backgroundColor: '#EAF6FF',
    borderColor: 'rgba(0, 122, 255, 0.22)',
  },
  timeChipDark: {
    backgroundColor: '#102033',
    borderColor: 'rgba(0, 193, 253, 0.35)',
  },
  timeChipTextLight: {
    color: colors.brand.primary,
    fontSize: 13,
  },
  timeChipTextDark: {
    color: colors.brand.accent,
    fontSize: 13,
  },
  avatarButton: {
    position: 'relative',
    marginTop: 2,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand.success,
    borderWidth: 2.5,
  },
  avatarBadgeBorderDark: {
    borderColor: colors.dark.background,
  },
  avatarBadgeBorderLight: {
    borderColor: colors.light.background,
  },
  celebrateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
  },
  celebrateText: {
    flex: 1,
  },
  celebrateTitle: {
    color: colors.brand.white,
    fontSize: 15,
  },
  celebrateSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    marginTop: 2,
  },
  heroWrap: {
    marginBottom: 22,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    top: -46,
    right: -24,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginBottom: 6,
  },
  heroTitle: {
    color: colors.brand.white,
    fontSize: 22,
    lineHeight: 28,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 12,
  },
  heroTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 14,
  },
  heroCtaText: {
    color: colors.brand.primary,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    marginBottom: 14,
  },
  viewAllText: {
    color: colors.brand.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridSlot: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  exploreCard: {
    borderRadius: 18,
    padding: 16,
    minHeight: 154,
    overflow: 'hidden',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBubbleLight: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  iconBubbleDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  exploreTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  exploreSubLight: {
    color: colors.light.textSecondary,
  },
  exploreSubDark: {
    color: '#B6C2D2',
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12,
  },
  miniTrackLight: {
    backgroundColor: 'rgba(0, 122, 255, 0.16)',
  },
  miniTrackDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  accentDash: {
    height: 3,
    width: 28,
    borderRadius: 2,
    marginTop: 12,
  },
  continueList: {
    gap: 10,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingRight: 12,
    paddingLeft: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
    shadowColor: colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  continueAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playCircleDark: {
    backgroundColor: colors.dark.elevated,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playCircleLight: {
    backgroundColor: colors.light.elevated,
    borderColor: colors.light.border,
  },
  playCircleCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.brand.success,
  },
  continueInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  continueTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressTrackDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressTrackLight: {
    backgroundColor: colors.light.border,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentLabel: {
    width: 40,
    textAlign: 'right',
    marginLeft: 8,
  },
});

export default HomeScreen;
