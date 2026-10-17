import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import { useQuiz } from '../../../context/QuizContext';
import { soundService } from '../../../services/soundService';
import { hapticService } from '../../../services/hapticService';
import reactNativeComponents from '../../../data/componentsData';
import { colors } from '../../../theme/theme';

const QUESTIONS_COUNT = 12;

const PracticalScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const topInset = useTopInset();
  const { addQuizResult } = useQuiz();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const generateQuestions = useCallback(() => {
    let sourceData = reactNativeComponents || [];
    if (sourceData.length === 0) {
      sourceData = [
        {
          data: [
            {
              id: '1',
              name: 'Drawer Navigator',
              description:
                'To offer a side-menu accessible via a swipe gesture or hamburger icon.',
            },
          ],
        },
      ];
    }
    const allComponents = sourceData.flatMap((section) => section.data || []);
    const shuffled = [...allComponents].sort(() => 0.5 - Math.random());
    const count = Math.min(QUESTIONS_COUNT, shuffled.length);
    const selected = shuffled.slice(0, count);

    const generatedQuestions = selected.map((component) => {
      const otherComponents = allComponents.filter((c) => c.id !== component.id);
      const safeOther =
        otherComponents.length > 0 ? otherComponents : allComponents;
      const wrongOptions = safeOther
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((c) => c.description || c.name);
      while (wrongOptions.length < 3)
        wrongOptions.push('Basic building block for application layout structure');

      const options = [...wrongOptions, component.description || component.name];
      const shuffledOptions = options.sort(() => 0.5 - Math.random());

      return {
        question: `What is the primary use of ${component.name} in React Native?`,
        componentName: component.name,
        correctAnswer: component.description || component.name,
        options: shuffledOptions,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  }, []);

  const handleExitQuiz = useCallback(() => {
    if (showResult) {
      navigation.navigate('MainTabs', { screen: 'Home' });
      return;
    }
    CustomAlert.show({
      title: 'Exit Quiz?',
      message: 'Are you sure you want to quit the quiz? Your current progress will be lost.',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'Home' });
          },
        },
      ],
    });
  }, [navigation, showResult]);

  useFocusEffect(
    useCallback(() => {
      // Always restart quiz from Question 1 when entering the screen
      generateQuestions();

      const onBackPress = () => {
        handleExitQuiz();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [generateQuestions, handleExitQuiz])
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue:
        questions.length > 0
          ? (currentQuestionIndex + 1) / questions.length
          : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, progress, questions.length]);

  const handleOptionSelect = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      soundService.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      soundService.playError();
    }
  };

  const handleNext = () => {
    soundService.playClick();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
      soundService.playChime();
      addQuizResult(score, questions.length);
    }
  };

  if (questions.length === 0) {
    return (
      <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
        <View style={styles.loadingContainer}>
          <CustomText variant="h3">Loading Quiz...</CustomText>
        </View>
      </Container>
    );
  }

  // Result Summary Screen
  if (showResult) {
    const percent = Math.round((score / questions.length) * 100);
    const isPassing = percent >= 70;

    return (
      <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? colors.dark.background : colors.light.background}
        />
        <View style={styles.resultContainer}>
          <Icon
            name={isPassing ? 'emoji-events' : 'adjust'}
            size={48}
            color={isPassing ? colors.brand.warning : colors.brand.primary}
            style={{ marginBottom: 12 }}
          />
          {/* Circular Score Badge */}
          <View
            style={[
              styles.scoreCircle,
              isPassing
                ? styles.scorePassingBg
                : styles.scoreFailBg,
            ]}
          >
            <CustomText
              variant="headlineXl"
              weight="heavy"
              style={[
                styles.scoreText,
                isPassing ? styles.scorePassingText : styles.scoreFailText,
              ]}
            >
              {score}/{questions.length}
            </CustomText>
            <CustomText
              variant="small"
              weight="bold"
              style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
            >
              {percent}% SCORE
            </CustomText>
          </View>

          <CustomText
            variant="headlineLg"
            weight="bold"
            style={[styles.resultTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            {score === questions.length
              ? 'Outstanding!'
              : isPassing
              ? 'Well Done!'
              : 'Keep Practicing!'}
          </CustomText>

          <CustomText
            variant="body"
            style={[styles.resultSubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
          >
            {isPassing
              ? "You've successfully demonstrated your React Native expertise."
              : 'Review the lessons and try again to improve your score.'}
          </CustomText>

          <View style={styles.resultActions}>
            <Button
              title="START NEW QUIZ"
              onPress={generateQuestions}
              style={styles.actionButtonMargin}
            />
            <Button
              title="FINISH & GO HOME"
              variant="secondary"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            />
          </View>
        </View>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      {/* Top Bar with Back Icon */}
      <View style={[styles.headerBar, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          onPress={handleExitQuiz}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={22} color={isDark ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>
        <CustomText
          variant="headlineMd"
          weight="bold"
          style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
        >
          Practical Quiz
        </CustomText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Figma Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={[styles.progressBarBg, isDark ? styles.progressTrackDark : styles.progressTrackLight]}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
        <CustomText
          variant="caption"
          weight="bold"
          style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
        >
          Question {currentQuestionIndex + 1} of {questions.length}
        </CustomText>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Title */}
        <View style={styles.questionContainer}>
          <CustomText
            variant="headlineXl"
            weight="bold"
            style={[styles.questionText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
          >
            {currentQuestion.question}
          </CustomText>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {currentQuestion.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.correctAnswer;

            let cardStyle = isDark ? styles.optionCardDark : styles.optionCardLight;
            let textColorStyle = isDark ? styles.textPrimaryDark : styles.textPrimaryLight;

            if (selectedOption) {
              if (isCorrect) {
                cardStyle = isDark ? styles.optionCardCorrectDark : styles.optionCardCorrectLight;
              } else if (isSelected) {
                cardStyle = isDark ? styles.optionCardIncorrectDark : styles.optionCardIncorrectLight;
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  cardStyle,
                ]}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.8}
                disabled={!!selectedOption}
              >
                <View style={[styles.letterCircle, isDark ? styles.letterCircleDark : styles.letterCircleLight]}>
                  {selectedOption && isCorrect ? (
                    <Icon name="check" size={18} color={colors.brand.success} />
                  ) : selectedOption && isSelected ? (
                    <Icon name="close" size={18} color={colors.brand.error} />
                  ) : (
                    <CustomText
                      variant="caption"
                      weight="bold"
                      style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                    >
                      {letter}
                    </CustomText>
                  )}
                </View>

                <CustomText
                  variant="body"
                  style={[styles.optionText, textColorStyle]}
                >
                  {option}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footerContainer}>
        {selectedOption ? (
          <Button
            title={
              currentQuestionIndex < questions.length - 1
                ? 'Next Question'
                : 'See Results'
            }
            onPress={handleNext}
          />
        ) : (
          <View style={styles.footerPlaceholder} />
        )}
      </View>
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
  iconLight: { tintColor: colors.dark.text },
  iconDark: { tintColor: colors.light.text },
  scorePassingBg: { borderColor: colors.brand.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  scoreFailBg: { borderColor: colors.brand.primary, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  scorePassingText: { color: colors.brand.success },
  scoreFailText: { color: colors.brand.primary },
  actionButtonMargin: { marginBottom: 12 },
  headerSpacer: { width: 36 },
  footerPlaceholder: { height: 52 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
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
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    width: '100%',
  },
  progressTrackDark: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  progressTrackLight: { backgroundColor: colors.light.border },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 30,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    minHeight: 64,
  },
  optionCardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
  },
  optionCardLight: {
    backgroundColor: colors.light.elevated,
    borderColor: 'transparent',
    borderWidth: 1,
  },
  optionCardCorrectDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.brand.success,
    borderWidth: 2,
  },
  optionCardCorrectLight: {
    backgroundColor: '#D1FAE5',
    borderColor: colors.brand.success,
    borderWidth: 2,
  },
  optionCardIncorrectDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.brand.error,
    borderWidth: 2,
  },
  optionCardIncorrectLight: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.brand.error,
    borderWidth: 2,
  },
  letterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  letterCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  letterCircleLight: {
    backgroundColor: colors.light.border,
  },
  optionText: {
    flex: 1,
    lineHeight: 22,
    fontSize: 15,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreText: {
    fontSize: 36,
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 26,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  resultActions: {
    width: '100%',
  },
});

export default PracticalScreen;
