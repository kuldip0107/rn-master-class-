import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import { icons } from '../../../constants/assets';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Master React Native',
    subtitle: 'INTERACTIVE LESSONS',
    description: 'Learn to build high-performance mobile applications with our production-grade curriculum.',
    iconName: 'computer',
    iconColor: '#007AFF',
  },
  {
    id: '2',
    title: 'Practice & Quiz',
    subtitle: 'REAL-WORLD CHALLENGES',
    description: 'Test your knowledge with real-world scenarios and track your progress with daily streaks.',
    iconName: 'emoji-events',
    iconColor: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Get Certified',
    subtitle: 'ARCHITECT LEVEL',
    description: 'Complete modules, earn badges, and join an elite community of React Native architects.',
    iconName: 'school',
    iconColor: '#10B981',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      navigation.replace('Signup');
    } catch (error) {
      console.log('Error setting first launch', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Icon Card */}
      <View style={styles.imageCard}>
        <View style={[styles.glowBg, isDark ? styles.glowBgDark : styles.glowBgLight]} />
        <View style={[styles.iconSquare, isDark ? styles.iconSquareDark : styles.iconSquareLight]}>
          <Icon name={item.iconName} size={56} color={item.iconColor} />
        </View>
      </View>

      {/* Text Cluster */}
      <View style={styles.textSection}>
        <View style={[styles.tagPill, isDark ? styles.tagPillDark : styles.tagPillLight]}>
          <CustomText weight="bold" style={styles.tagText}>
            {item.subtitle}
          </CustomText>
        </View>
        <CustomText
          variant="headlineXl"
          weight="bold"
          style={[styles.slideTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
        >
          {item.title}
        </CustomText>
        <CustomText
          variant="body"
          style={[styles.slideDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
        >
          {item.description}
        </CustomText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      {/* Header */}
      <View style={styles.topHeader}>
        <CustomText
          weight="bold"
          style={[styles.brandTitle, isDark ? styles.textMutedDark : styles.textMutedLight]}
        >
          RN MASTER CLASS
        </CustomText>
        <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <CustomText weight="bold" style={styles.skipButtonText}>
            SKIP
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Footer Controls */}
      <View style={styles.footerContainer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                isDark ? styles.dotInactiveDark : styles.dotInactiveLight,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <LinearGradient
            colors={['#007AFF', '#00C1FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <CustomText weight="bold" style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'GET STARTED' : 'CONTINUE'}
            </CustomText>
            <CustomText style={{ fontSize: 18, color: '#FFFFFF', marginLeft: 8 }}>→</CustomText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  textMutedDark: { color: '#64748B' },
  textMutedLight: { color: '#717786' },
  cyanTint: { tintColor: '#00C1FD' },
  skipButtonText: { color: '#007AFF' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  brandTitle: {
    letterSpacing: 1.5,
    fontSize: 12,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  imageCard: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 36,
  },
  glowBg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowBgDark: { backgroundColor: 'rgba(0, 193, 253, 0.08)' },
  glowBgLight: { backgroundColor: 'rgba(0, 122, 255, 0.08)' },
  iconSquare: {
    width: 130,
    height: 130,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  iconSquareDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(0, 193, 253, 0.25)',
  },
  iconSquareLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  slideImage: {
    width: 60,
    height: 60,
  },
  textSection: {
    alignItems: 'center',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tagPillDark: {
    backgroundColor: 'rgba(0, 193, 253, 0.12)',
    borderColor: 'rgba(0, 193, 253, 0.25)',
  },
  tagPillLight: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  tagText: {
    color: '#007AFF',
    letterSpacing: 1.5,
    fontSize: 11,
  },
  slideTitle: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
  },
  slideDesc: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
    maxWidth: 300,
  },
  footerContainer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotInactiveDark: { backgroundColor: 'rgba(255,255,255,0.15)' },
  dotInactiveLight: { backgroundColor: '#E3E2E7' },
  dotActive: {
    width: 24,
    backgroundColor: '#007AFF',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 52,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  buttonArrow: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginLeft: 8,
    transform: [{ rotate: '-90deg' }],
  },
});

export default OnboardingScreen;
