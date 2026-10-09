# 📱 RN Master Class — Feature-Sliced & Domain-Driven Architecture Guide

## 🌟 Overview
This project strictly follows an **Industry-Standard Feature-Sliced Design (FSD)** architecture and **Domain-Driven Design (DDD)** for React Native (version 0.83+ with React 19).

Each distinct feature of the application (Authentication, Dashboard, Curriculum, Practice, Profile, Resources, Settings) is encapsulated in its own self-contained module under `src/features/`.

---

## 🗂️ Complete Feature-Based Directory Tree

```text
RNApp/
├── android/                     # Native Android Gradle configuration & Kotlin modules
│   └── app/src/main/java/com/reactnative/
│       ├── filedownload/        # Native MediaStore public download manager (Scoped Storage)
│       └── googleauth/          # Native Google Play Services One-Tap Sign-In
├── ios/                         # Native iOS workspace and Pods configuration
├── docs/                        # Design specifications & reference archives
│   └── figma/                   # Figma design references and assets
├── src/                         # Core Application Source Code
│   │
│   ├── features/                # 🚀 FEATURE DOMAINS (Feature-Sliced Architecture)
│   │   │
│   │   ├── auth/                # 🔐 AUTHENTICATION FLOW & DOMAIN
│   │   │   ├── screens/         # Complete Authentication Flow
│   │   │   │   ├── SplashScreen.js        # Brand startup animation
│   │   │   │   ├── OnboardingScreen.js    # 3-step value proposition carousel
│   │   │   │   ├── LoginScreen.js         # Email & Google One-Tap sign-in
│   │   │   │   ├── SignupScreen.js        # New learner registration
│   │   │   │   ├── ForgotPasswordScreen.js# 6-digit OTP reset
│   │   │   │   └── ChangePasswordScreen.js# In-app password rotation
│   │   │   ├── components/      # Auth-specific UI elements
│   │   │   │   └── GoogleSignInModal.js   # Bottom sheet Google account picker
│   │   │   ├── routes.js        # AUTH_ROUTES constants
│   │   │   └── index.js         # Public API for Auth domain
│   │   │
│   │   ├── home/                # 🏠 HOME & DASHBOARD DOMAIN
│   │   │   ├── screens/
│   │   │   │   └── HomeScreen.js          # Learning dashboard, streak fire & quick tracks
│   │   │   └── index.js
│   │   │
│   │   ├── lessons/             # 📚 CURRICULUM & COMPONENTS DOMAIN
│   │   │   ├── screens/
│   │   │   │   ├── LessonScreen.js        # 47 Component curriculum search & list
│   │   │   │   └── ComponentDetailScreen.js # Live interactive component playground
│   │   │   └── index.js
│   │   │
│   │   ├── practice/            # 💡 PRACTICAL QUIZ & CODE RUNNER DOMAIN
│   │   │   ├── screens/
│   │   │   │   └── PracticalScreen.js     # Code runner, questions & timer
│   │   │   └── index.js
│   │   │
│   │   ├── profile/             # 👤 PROFILE & CERTIFICATION DOMAIN
│   │   │   ├── screens/
│   │   │   │   ├── ProfileScreen.js       # Profile card, XP & Certificate viewer
│   │   │   │   ├── EditProfileScreen.js   # Name, title, DP picker & camera
│   │   │   │   └── AchievementsScreen.js  # Badges & mastery milestones
│   │   │   └── index.js
│   │   │
│   │   ├── resources/           # 🛠️ DEVELOPER RESOURCES DOMAIN
│   │   │   ├── screens/
│   │   │   │   ├── InterviewPrepScreen.js # Junior-to-Lead RN Interview Cheatsheet
│   │   │   │   └── AndroidSetupScreen.js  # JDK, SDK, ADB device setup guide
│   │   │   └── index.js
│   │   │
│   │   ├── settings/            # ⚙️ SETTINGS & SUPPORT DOMAIN
│   │   │   ├── screens/
│   │   │   │   ├── SettingsScreen.js      # Language, theme, cache & push toggle
│   │   │   │   ├── AboutAppScreen.js      # App version, license & team accreditation
│   │   │   │   ├── HelpSupportScreen.js   # FAQs, WhatsApp & Email direct contact
│   │   │   │   └── TermsScreen.js         # Privacy policy & terms
│   │   │   └── index.js
│   │   │
│   │   └── index.js             # Centralized barrel exporting all features
│   │
│   ├── components/              # 🧩 SHARED DESIGN SYSTEM (Atomic & Molecular UI)
│   │   ├── common/              # Universal primitives (Button, AppTextInput, Card, Icon...)
│   │   └── index.js
│   │
│   ├── navigation/              # 🧭 REACT NAVIGATION
│   │   ├── AppNavigator.js      # Root Native Stack Navigator
│   │   ├── TabNavigator.js      # Bottom 4-Tab Bar Navigator
│   │   ├── routes.js            # Centralized ROUTES constants
│   │   └── index.js
│   │
│   ├── context/                 # 🌐 GLOBAL STATE (React Context Providers)
│   │   ├── AlertContext.js      # Universal Alert & Modal feedback
│   │   ├── QuizContext.js       # Interactive Quiz & score tracking
│   │   ├── ThemeContext.js      # Dark/Light theme switching
│   │   └── index.js
│   │
│   ├── services/                # 🔌 NETWORKING & DEVICE SERVICES
│   │   ├── api.js               # REST API client with local offline fallback
│   │   ├── fileDownloader.js    # Native PDF Downloads storage & sharing bridge
│   │   ├── googleAuth.js        # Native Google Sign-In orchestration
│   │   ├── notificationService.js # Daily streak push reminders
│   │   └── index.js
│   │
│   ├── data/                    # 📊 CURRICULUM & STATIC JSON DATABASE
│   │   ├── Homescreen Data/     # Track curriculum JSONs (Flexbox, State, Basics)
│   │   ├── commponent data/     # Component detail definitions
│   │   ├── componentsData.js    # 47 React Native components curriculum
│   │   ├── interviewData.js     # Senior/Lead React Native interview Q&A
│   │   └── index.js
│   │
│   ├── hooks/                   # 🪝 REUSABLE CUSTOM HOOKS
│   │   ├── useDebounce.js       # Fast-input debouncing
│   │   ├── useUser.js           # Live authenticated user session hook
│   │   └── index.js
│   │
│   ├── theme/                   # 🎨 DESIGN TOKENS & PALETTES
│   │   ├── theme.js             # Colors, typography, spacing, shadows, radii
│   │   └── index.js
│   │
│   ├── utils/                   # 🧰 UNIVERSAL UTILITIES
│   │   ├── formatters.js        # Date, XP & streak text formatters
│   │   ├── storage.js           # Crash-resilient AsyncStorage wrapper (get/set Object)
│   │   ├── validators.js        # Email & password validation routines
│   │   └── index.js
│   │
│   ├── config/                  # ⚙️ APP CONFIGURATION
│   │   └── index.js             # APP_CONFIG & STORAGE_KEYS
│   │
│   ├── i18n/                    # 🌐 MULTI-LANGUAGE ENGINE
│   │   ├── en.json              # English translations
│   │   ├── gu.json              # Gujarati translations
│   │   ├── hi.json              # Hindi translations
│   │   └── index.js
│   │
│   ├── assets/                  # 🖼️ STATIC ASSET REGISTRY
│   │   ├── icons/               # 47 PNG icons
│   │   └── index.js
│   │
│   └── screens/                 # 🔄 BACKWARD-COMPATIBILITY BARRELS
│       └── index.js             # Re-exports features for legacy paths
│
├── App.tsx                      # Root Application Entrypoint
├── index.js                     # React Native Registry Entrypoint
└── package.json                 # NPM dependencies & operational scripts
```

---

## 🏛️ Best Practices & Import Conventions

### 1. Feature Imports
Import feature screens directly from their domain:
```javascript
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from '../features/auth';
import { HomeScreen } from '../features/home';
import { LessonScreen } from '../features/lessons';
import { ProfileScreen } from '../features/profile';
```

### 2. Design System Components
Import universal UI primitives from `components`:
```javascript
import { Button, AppTextInput, CustomText, Icon, Container } from '../components';
```

### 3. Navigation Routes
Always use `ROUTES` constants from `navigation`:
```javascript
import { ROUTES } from '../navigation';

navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.PROFILE });
```

### 4. Storage & Utilities
Use crash-resilient storage:
```javascript
import { storage, formatDate, isValidEmail } from '../utils';

const user = await storage.getObject('userObject');
await storage.setObject('userObject', updatedUser);
```
