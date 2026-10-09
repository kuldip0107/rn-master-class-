export const strings = {
  common: {
    back: 'Back',
    next: 'Next',
    continue: 'CONTINUE',
    viewAll: 'VIEW ALL',
    searchPlaceholder: 'Search components...',
    version: 'Version 1.0.0',
    copyright: '© 2026 RN Learning Team. All rights reserved.',
  },
  home: {
    welcome: 'WELCOME BACK',
    student: 'Student',
    streakTitle: (days) => `${days} Day Streak`,
    streakSubtitle: "You're on fire! Keep it up!",
    explorePaths: 'Explore Paths',
    continueLearning: 'Continue Learning',
    lessons: 'Lessons',
    lastQuiz: 'Last Quiz',
    score: (score, total) => `Score: ${score}/${total}`,
    noAttempt: 'No Attempt',
    startLearning: 'Start Learning',
    modules: '12 Modules',
    complete: (percent) => `${percent}% Complete`,
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    premiumTitle: 'Join Premium Class',
    premiumSubtitle: 'Unlock all features and get unlimited access',
    menu: {
      achievements: 'Achievements',
      settings: 'Settings',
      help: 'Help & Support',
      about: 'About App',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      learning: 'My Learning', // Kept for reference if needed
      whatsapp: 'Join WhatsApp Channel'
    },
    historyModal: {
      title: 'Quiz History',
      date: 'Date',
      score: 'Score',
      noHistory: 'No quizzes taken yet. Start practicing!',
      close: 'Close',
      quizType: 'Practice Quiz',
      scoreLabel: 'Final Score',
    }
  },
  lesson: {
    title: 'Learn',
  },
  about: {
    title: 'About App',
    appName: 'RN Master Class',
    overviewTitle: 'Overview',
    overviewText1: 'Welcome to the React Native Master Class app! This application is designed to help you learn and master React Native components, hooks, and best practices through practical examples and quizzes.',
    overviewText2: 'Whether you are a beginner just starting or an experienced developer looking to brush up on your skills, this app provides comprehensive documentation and interactive playground for all core components.',
    featuresTitle: 'Key Features',
    features: [
      'Comprehensive Component Library',
      'Interactive Examples',
      'Practical Quizzes to Test Knowledge',
      'Daily Streaks & Progress Tracking'
    ]
  },
  help: {
    title: 'Help & Support',
    faqTitle: 'Frequently Asked Questions',
    contactTitle: 'Contact Us',
    messagePlaceholder: 'Type your message here...',
    sendButton: 'Send Message',
    contactInfo: 'You can also reach us at kuldipbharda0@gmail.com',
    faqs: [
      {
        question: 'How do I unlock premium features?',
        answer: 'You can unlock premium features by subscribing to our Premium Class plan in the Profile section.'
      },
      {
        question: 'Can I use this offline?',
        answer: 'Yes! Most of the content is available offline once downloaded.'
      },
      {
        question: 'How do I reset my progress?',
        answer: 'Currently, progress reset is not available directly. Please contact support if you need this.'
      }
    ]
  },
  practical: {
    title: 'Practice',
    question: (current, total) => `Question ${current} of ${total}`,
    submit: 'Submit Answer',
    next: 'Next Question',
    finish: 'See Results', 
    resultTitle: 'Quiz Complete!',
    scoreLabel: 'Your Score',
    totalQuestions: 'Total Questions',
    correctAnswers: 'Correct Answers',
    wrongAnswers: 'Wrong Answers',
    restart: 'Restart Quiz',
    home: 'Back to Home',
  },
  settings: {
    title: 'Settings',
    general: 'General',
    notifications: 'Push Notifications',
    sounds: 'App Sounds',
    haptic: 'Haptic Feedback',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    account: 'Account',
    clearCache: 'Clear Cache',
    deleteAccount: 'Delete Account',
    cacheCleared: 'Cache Cleared Successfully',
    confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.',
    delete: 'Delete',
    cancel: 'Cancel',
  }
};
