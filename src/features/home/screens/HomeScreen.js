import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { icons } from '../../../constants/assets';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';

import { userAPI } from '../../../services/api';
import { lessonProgressService } from '../../../services/lessonProgressService';
import { appUsageService } from '../../../services/appUsageService';

import flexboxData from '../../../data/Homescreen Data/flexbox.json';
import stateManagementData from '../../../data/Homescreen Data/state_management.json';
import basicRnData from '../../../data/Homescreen Data/basic react-native.json';

const HomeScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [userName, setUserName] = useState('Alex');
  const [streak, setStreak] = useState(1);
  const [avatarColor, setAvatarColor] = useState('#007AFF');
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

  useEffect(() => {
    const unsubscribeUsage = appUsageService.subscribe((stats) => {
      setUsageStats(stats);
    });
    return unsubscribeUsage;
  }, []);

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
      } catch (e) {
        console.error(e);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      initializeData();
    });
    initializeData();
    return unsubscribe;
  }, [navigation]);

  // Header displaying User's Real Full Name, Streak Badge, and Avatar
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeftCol}>
        <CustomText
          variant="small"
          weight="bold"
          style={[styles.welcomeCaption, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
        >
          WELCOME BACK
        </CustomText>
        <View style={styles.userNameRow}>
          <CustomText
            variant="headlineXl"
            weight="bold"
            style={[styles.userNameText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            numberOfLines={1}
          >
            {userName}
          </CustomText>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* Profile Avatar with Google DP / Uploaded Photo */}
      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        activeOpacity={0.8}
        style={styles.avatarButton}
      >
        <View
          style={[
            styles.avatarCircle,
            {
              borderColor: avatarColor || (isDark ? '#00C1FD' : '#007AFF'),
              backgroundColor: `${avatarColor || (isDark ? '#00C1FD' : '#007AFF')}18`,
              overflow: 'hidden',
            },
          ]}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImg} resizeMode="cover" />
          ) : (
            <Icon name="person" size={26} color={avatarColor || (isDark ? '#00C1FD' : '#007AFF')} />
          )}
        </View>
        <View style={[styles.avatarBadge, isDark ? styles.avatarBadgeBorderDark : styles.avatarBadgeBorderLight]} />
      </TouchableOpacity>
    </View>
  );

  // High-End Authentic Streak Mode Card with 3D Fire Emblem
  const renderStreakCard = () => (
    <View style={styles.streakCardWrapper}>
      <LinearGradient
        colors={['#FF3366', '#FF5E3A', '#FFA000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakCard}
      >
        {/* Ambient Glow Circles */}
        <View style={styles.streakGlowCircleOne} />
        <View style={styles.streakGlowCircleTwo} />

        {/* Top Status Header */}
        <View style={styles.streakBadgeRow}>
          <View style={styles.streakActiveBadge}>
            <View style={styles.streakActiveDot} />
            <CustomText variant="caption" weight="bold" style={styles.streakActiveText}>
              DAILY STREAK
            </CustomText>
          </View>
          <CustomText variant="caption" weight="heavy" style={styles.streakMultiplierText}>
            🔥 ON FIRE
          </CustomText>
        </View>

        {/* Center Content Row */}
        <View style={styles.streakContent}>
          <View style={styles.streakTextCol}>
            <CustomText variant="headlineXl" weight="heavy" style={styles.streakTitle}>
              {streak} Day Streak!
            </CustomText>
            <CustomText variant="body" style={styles.streakSubtitle}>
              You're on fire! Complete a quick quiz or lesson today.
            </CustomText>
          </View>

          {/* Glowing 3D Flame Emblem */}
          <View style={styles.streakFlameContainer}>
            <View style={styles.streakFlameAura} />
            <LinearGradient
              colors={['#FFE600', '#FF8500', '#FF1E56']}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={styles.streakFlameCircle}
            >
              <CustomText style={styles.streakFlameIcon}>🔥</CustomText>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Real-Time Persistent In-App Time Tracker Card
  const renderTimeSpentCard = () => (
    <View style={styles.timeSpentCardWrapper}>
      <View style={[styles.timeSpentCard, isDark ? styles.timeCardDark : styles.timeCardLight]}>
        {/* Top Header Row */}
        <View style={styles.timeHeaderRow}>
          <View style={styles.timeBadge}>
            <View style={styles.livePulseDot} />
            <CustomText variant="caption" weight="heavy" style={styles.timeBadgeText}>
              TOTAL SCREEN TIME
            </CustomText>
          </View>
          <View style={styles.liveActiveIndicator}>
            <View style={styles.livePulseDotGreen} />
            <CustomText variant="caption" weight="bold" style={styles.liveActiveText}>
              LIVE
            </CustomText>
          </View>
        </View>

        {/* Counter Content */}
        <View style={styles.timeContentRow}>
          <View style={styles.timeTextCol}>
            <CustomText
              variant="headlineXl"
              weight="heavy"
              style={[
                styles.timeMainText,
                isDark ? styles.timeMainTextDark : styles.timeMainTextLight,
              ]}
            >
              {usageStats.formattedTotal || '0s'}
            </CustomText>
            <CustomText
              variant="small"
              style={[styles.timeSubtext, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              Total time spent in app • Resumes across all sessions
            </CustomText>
          </View>

          {/* Clock Emblem */}
          <LinearGradient
            colors={isDark ? ['#0070EB', '#00C1FD'] : ['#E0F2FE', '#BAE6FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.timeIconCircle}
          >
            <Icon name="schedule" size={26} color={isDark ? '#FFFFFF' : '#0070EB'} />
          </LinearGradient>
        </View>

        {/* Stats Divider & Session Details */}
        <View style={[styles.timeDivider, isDark ? styles.timeDividerDark : styles.timeDividerLight]} />
        <View style={styles.timeFooterRow}>
          <View style={styles.timeFooterItem}>
            <CustomText variant="caption" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
              Today's Session:
            </CustomText>
            <CustomText variant="small" weight="bold" style={styles.todayValueText}>
              {usageStats.formattedToday || '0s'}
            </CustomText>
          </View>

          <View style={styles.timeFooterItem}>
            <CustomText variant="caption" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
              Status:
            </CustomText>
            <CustomText variant="small" weight="bold" style={styles.statusActiveValue}>
              ● Active Now
            </CustomText>
          </View>
        </View>
      </View>
    </View>
  );

  // Figma 2x2 Explore Paths Grid
  const renderExplorePaths = () => (
    <View style={styles.section}>
      <CustomText
        variant="headlineMd"
        weight="bold"
        style={[styles.sectionTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
      >
        Explore Paths
      </CustomText>

      <View style={styles.gridContainer}>
        {/* Lessons Path */}
        <TouchableOpacity
          style={[styles.gridCard, isDark ? styles.cardDark : styles.cardLight]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Lessons' })}
        >
          <View style={[styles.gridIconCircle, styles.blueIconBg]}>
            <Icon name="book" size={24} color="#007AFF" />
          </View>
          <CustomText weight="bold" style={[styles.gridCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
            Lessons
          </CustomText>
          <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
            Start Learning
          </CustomText>
        </TouchableOpacity>

        {/* Practical / Quiz Path */}
        <TouchableOpacity
          style={[styles.gridCard, isDark ? styles.cardDark : styles.cardLight]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Practice' })}
        >
          <View style={[styles.gridIconCircle, styles.purpleIconBg]}>
            <Icon name="emoji-events" size={24} color="#8B5CF6" />
          </View>
          <CustomText weight="bold" style={[styles.gridCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
            Practical Quiz
          </CustomText>
          <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
            Test Skills
          </CustomText>
        </TouchableOpacity>

        {/* Interview Prep Path */}
        <TouchableOpacity
          style={[styles.gridCard, isDark ? styles.cardDark : styles.cardLight]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('InterviewPrep')}
        >
          <View style={[styles.gridIconCircle, styles.greenIconBg]}>
            <Icon name="code" size={24} color="#10B981" />
          </View>
          <CustomText weight="bold" style={[styles.gridCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
            Interview Q&A
          </CustomText>
          <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
            Cheatsheets
          </CustomText>
        </TouchableOpacity>

        {/* Android Setup Guide */}
        <TouchableOpacity
          style={[styles.gridCard, isDark ? styles.cardDark : styles.cardLight]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AndroidSetup')}
        >
          <View style={[styles.gridIconCircle, styles.skyIconBg]}>
            <Icon name="android" size={24} color="#0EA5E9" />
          </View>
          <CustomText weight="bold" style={[styles.gridCardTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
            Android Setup
          </CustomText>
          <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
            CLI & Tools
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Figma Continue Learning section
  const renderContinueLearning = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Continue Learning
        </CustomText>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Lessons' })}>
          <CustomText
            variant="caption"
            weight="bold"
            style={styles.viewAllText}
          >
            VIEW ALL
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.continueList}>
        {[
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
        ].map((item, idx) => {
          const percent = lessonProgress[item.id] || 0;
          const isCompleted = percent >= 100;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.continueCard,
                isDark ? styles.cardDark : styles.cardLight,
                isCompleted && (isDark ? styles.cardCompletedDark : styles.cardCompletedLight),
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (item.data) {
                  navigation.navigate('ComponentDetail', {
                    componentData: item.data,
                    lessonId: item.id,
                  });
                } else {
                  navigation.navigate('MainTabs', { screen: 'Lessons' });
                }
              }}
            >
              {/* Play / Completed Circle */}
              <View
                style={[
                  styles.playCircle,
                  isCompleted
                    ? styles.playCircleCompleted
                    : isDark
                    ? styles.playCircleDark
                    : styles.playCircleLight,
                ]}
              >
                <CustomText style={{ fontSize: 16 }}>{isCompleted ? '✅' : '▶️'}</CustomText>
              </View>

              {/* Info */}
              <View style={styles.continueInfo}>
                <CustomText
                  variant="body"
                  weight="bold"
                  style={[styles.continueTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
                  numberOfLines={1}
                >
                  {item.title}
                </CustomText>

                {/* Progress Bar */}
                <View style={[styles.progressBarBg, isDark ? styles.progressTrackDark : styles.progressTrackLight]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.max(4, percent)}%`,
                        backgroundColor: isCompleted ? '#10B981' : '#00C1FD',
                      },
                    ]}
                  />
                </View>

                <CustomText
                  variant="small"
                  style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
                >
                  {item.duration} •{' '}
                  {isCompleted
                    ? 'Completed (100%)'
                    : percent > 0
                    ? `${percent}% Complete`
                    : 'Not Started (0%)'}
                </CustomText>
              </View>

              {/* Chevron */}
              <CustomText style={{ fontSize: 20, color: isDark ? '#64748B' : '#C1C6D7' }}>›</CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topSection}>
          {renderHeader()}
          {renderStreakCard()}
          {renderTimeSpentCard()}
        </View>
        {renderExplorePaths()}
        {renderContinueLearning()}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  containerDark: { backgroundColor: '#050510' },
  containerLight: { backgroundColor: '#FAF9FE' },
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1.5,
  },
  headerStreakDark: {
    backgroundColor: '#1E1B2E',
    borderColor: 'rgba(255, 107, 74, 0.4)',
  },
  headerStreakLight: {
    backgroundColor: '#FFF5F0',
    borderColor: 'rgba(255, 107, 74, 0.3)',
  },
  headerStreakFlame: {
    fontSize: 16,
  },
  headerStreakNumber: {
    fontSize: 14,
  },
  welcomeCaption: {
    letterSpacing: 1.2,
    marginBottom: 2,
    fontSize: 11,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userNameText: {
    fontSize: 26,
  },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#717786' },
  brandTint: { tintColor: '#007AFF' },
  blueTint: { tintColor: '#0070EB' },
  purpleTint: { tintColor: '#8B5CF6' },
  greenTint: { tintColor: '#10B981' },
  skyTint: { tintColor: '#3B82F6' },
  blueIconBg: { backgroundColor: 'rgba(0, 112, 235, 0.12)' },
  purpleIconBg: { backgroundColor: 'rgba(139, 92, 246, 0.12)' },
  greenIconBg: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  skyIconBg: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  viewAllText: { color: '#007AFF', letterSpacing: 0.5 },
  chevronDark: { tintColor: '#64748B' },
  chevronLight: { tintColor: '#717786' },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C1FD',
  },
  avatarButton: {
    position: 'relative',
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
    backgroundColor: '#10B981',
    borderWidth: 2.5,
  },
  avatarBadgeBorderDark: {
    borderColor: '#050510',
  },
  avatarBadgeBorderLight: {
    borderColor: '#FAF9FE',
  },
  streakCardWrapper: {
    marginBottom: 24,
  },
  streakCard: {
    borderRadius: 26,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 9,
  },
  streakGlowCircleOne: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  streakGlowCircleTwo: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  streakBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  streakActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFEB3B',
  },
  streakActiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  streakMultiplierText: {
    color: '#FFE600',
    fontSize: 12,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  streakTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  streakTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 4,
  },
  streakSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    lineHeight: 18,
  },
  streakFlameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakFlameAura: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  streakFlameCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    elevation: 8,
  },
  streakFlameIcon: {
    fontSize: 34,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 136,
  },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  gridIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridIcon: {
    width: 24,
    height: 24,
  },
  gridCardTitle: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  continueList: {
    gap: 10,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playCircleDark: {
    backgroundColor: '#161823',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playCircleLight: {
    backgroundColor: '#F4F3F8',
    borderColor: '#E3E2E7',
  },
  playCircleCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  cardCompletedDark: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  cardCompletedLight: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  playIcon: {
    width: 18,
    height: 18,
    marginLeft: 2,
  },
  continueInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  continueTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
    width: '100%',
  },
  progressTrackDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressTrackLight: {
    backgroundColor: '#E3E2E7',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#00C1FD',
  },
  chevronIcon: {
    width: 14,
    height: 14,
    transform: [{ rotate: '-90deg' }],
  },
  timeSpentCardWrapper: {
    marginBottom: 20,
  },
  timeSpentCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  timeCardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(0, 193, 253, 0.22)',
    shadowColor: '#00C1FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  timeCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  timeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 193, 253, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C1FD',
  },
  timeBadgeText: {
    color: '#00C1FD',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  liveActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  livePulseDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveActiveText: {
    color: '#10B981',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  timeContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  timeMainText: {
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeMainTextDark: {
    color: '#F8FAFC',
  },
  timeMainTextLight: {
    color: '#1A1B1F',
  },
  timeSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  timeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  timeDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  timeDividerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeDividerLight: {
    backgroundColor: '#EEEDF3',
  },
  timeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayValueText: {
    color: '#007AFF',
  },
  statusActiveValue: {
    color: '#10B981',
  },
});

export default HomeScreen;
