export const interviewQuestions = [
  {
    id: '1',
    category: 'Fundamentals',
    level: 'Junior',
    question: 'What is React Native and how does it work under the hood?',
    answer: 'React Native is an open-source framework developed by Meta for building native mobile apps using JavaScript and React. It uses a JavaScript thread to execute code and communicates with native platform modules (iOS/Android) via a Bridge (or the new TurboModules/JSI architecture in the new architecture).',
    codeSnippet: `// Example: Pure React Native Component
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const HelloWorld = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Native UI directly from JS!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' }
});`,
    tips: 'Mention the difference between Native Threads (UI, Shadow, JS) and the new Fabric / JSI architecture.'
  },
  {
    id: '2',
    category: 'Architecture',
    level: 'Senior',
    question: 'Explain the New Architecture of React Native (Fabric, TurboModules, JSI, Yoga).',
    answer: 'The New Architecture eliminates the asynchronous JSON Bridge in favor of JavaScript Interface (JSI). JSI allows JavaScript to hold direct references to C++ host objects, enabling synchronous and direct method execution. Fabric is the concurrent UI renderer, TurboModules enable lazy-loading of native modules, and Yoga handles Flexbox layout calculation.',
    codeSnippet: `// JSI direct invocation concept (Conceptual)
// JS Thread can directly call C++ methods synchronously:
global.__turboModuleProxy("MyNativeModule").performHighPriorityTask();`,
    tips: 'Always highlight that JSI removes JSON serialization/deserialization overhead.'
  },
  {
    id: '3',
    category: 'Performance',
    level: 'Mid',
    question: 'How do you optimize FlatList performance with large datasets?',
    answer: 'Key optimizations for FlatList:\n1. Use `getItemLayout` for fixed size items to skip dynamic layout measurement.\n2. Set `maxToRenderPerBatch` and `windowSize` properly.\n3. Wrap `renderItem` components with `React.memo` or use `useCallback`.\n4. Avoid anonymous inline arrow functions inside `renderItem`.\n5. Enable `removeClippedSubviews={true}`.',
    codeSnippet: `const ITEM_HEIGHT = 70;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

<FlatList
  data={largeDataset}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  getItemLayout={getItemLayout}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>`,
    tips: 'FlashList by Shopify is also a great modern alternative to mention during interviews.'
  },
  {
    id: '4',
    category: 'State Management',
    level: 'Junior',
    question: 'Difference between useMemo, useCallback, and React.memo?',
    answer: '• React.memo: Higher-order component that memoizes a component and skips re-rendering if its props have not changed.\n• useMemo: Memoizes the calculated return value of an expensive computation.\n• useCallback: Memoizes the function definition between re-renders to maintain referential integrity.',
    codeSnippet: `// useMemo caches value
const expensiveTotal = useMemo(() => calculateTotal(items), [items]);

// useCallback caches function instance
const handlePress = useCallback(() => {
  console.log('Button pressed');
}, []);`,
    tips: 'Overusing them adds memory overhead; only use them when performance profiling indicates a bottleneck.'
  },
  {
    id: '5',
    category: 'Fundamentals',
    level: 'Mid',
    question: 'How does Flexbox in React Native differ from Web CSS Flexbox?',
    answer: 'Key differences:\n1. `flexDirection` defaults to `column` in React Native (it is `row` on the web).\n2. `alignContent` defaults to `flex-start` instead of `stretch`.\n3. `flex` accepts a single number indicating proportional space rather than shorthand `flex: 1 1 auto`.\n4. Dimensions don\'t use `px` units; they are density-independent pixels (dp).',
    codeSnippet: `const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes whole available screen
    flexDirection: 'column', // Default in RN
    justifyContent: 'center',
    alignItems: 'center',
  }
});`,
    tips: 'Remember to mention that Yoga is the C++ layout engine that powers this Flexbox implementation.'
  },
  {
    id: '6',
    category: 'Performance',
    level: 'Senior',
    question: 'What causes 60 FPS frame drops and how do you achieve smooth animations?',
    answer: 'Frame drops happen when heavy JavaScript operations block the single JS thread, causing UI thread lag. To achieve 60 FPS:\n1. Use `useNativeDriver: true` with Animated API so calculations run on UI thread.\n2. Use `react-native-reanimated` (v2/v3) with worklets running directly on the UI thread.\n3. Offload intensive computations to Web Workers or C++ TurboModules.',
    codeSnippet: `import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// Runs at 60/120 FPS on UI Thread via Worklet
const onPress = () => {
  scale.value = withSpring(1.2);
};`,
    tips: 'Explain that JS thread handles business logic while UI thread handles touch gestures and screen draws.'
  }
];

export const cheatsheets = [
  {
    title: 'Flexbox Layout Cheat Sheet',
    category: 'Styling',
    items: [
      { name: 'flexDirection', values: "'column' (default) | 'row' | 'column-reverse' | 'row-reverse'" },
      { name: 'justifyContent', values: "'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'" },
      { name: 'alignItems', values: "'stretch' (default) | 'flex-start' | 'center' | 'flex-end' | 'baseline'" },
      { name: 'alignSelf', values: "'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch'" },
      { name: 'flexWrap', values: "'nowrap' (default) | 'wrap' | 'wrap-reverse'" }
    ]
  },
  {
    title: 'Essential React Native CLI Commands',
    category: 'CLI & Tools',
    items: [
      { name: 'Run Android', values: 'npx react-native run-android' },
      { name: 'Run iOS', values: 'npx react-native run-ios' },
      { name: 'Clear Metro Cache', values: 'npx react-native start --reset-cache' },
      { name: 'Reverse ADB Ports', values: 'adb reverse tcp:8081 tcp:8081' },
      { name: 'Generate APK (Release)', values: 'cd android && ./gradlew assembleRelease' },
      { name: 'Generate AAB (Bundle)', values: 'cd android && ./gradlew bundleRelease' }
    ]
  },
  {
    title: 'Hooks Quick Reference',
    category: 'React Hooks',
    items: [
      { name: 'useState', values: 'Manage local component state' },
      { name: 'useEffect', values: 'Handle side-effects, subscriptions, lifecycle' },
      { name: 'useRef', values: 'Persist mutable reference across renders without triggering re-render' },
      { name: 'useMemo', values: 'Cache computation result' },
      { name: 'useCallback', values: 'Cache function reference' },
      { name: 'useColorScheme', values: 'Detect system dark/light theme' }
    ]
  }
];
