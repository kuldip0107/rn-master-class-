import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Clipboard,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Icon from '../../../components/common/Icon';
import setupData from '../../../data/Homescreen Data/android setup.json';

const AndroidSetupScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = (text, label) => {
    if (!text) return;
    Clipboard.setString(text);
    setCopiedText(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label || 'Command'} copied to clipboard!`, ToastAndroid.SHORT);
    }
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  return (
    <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#050510' : '#FAF9FE'}
      />

      {/* Header Bar */}
      <View style={[styles.header, isDark ? styles.headerBorderDark : styles.headerBorderLight]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomText style={{ fontSize: 18, color: isDark ? '#F8FAFC' : '#1A1B1F' }}>←</CustomText>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
          >
            Android Setup Guide
          </CustomText>
          <CustomText
            variant="small"
            style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}
          >
            React Native CLI & Android Studio
          </CustomText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, isDark ? styles.heroCardDark : styles.heroCardLight]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBox}>
              <Icon name="android" size={32} color="#007AFF" />
            </View>
            <View style={styles.heroHeaderText}>
              <CustomText variant="headlineLg" weight="heavy" style={styles.heroTitle}>
                {setupData.courseTitle || 'React Native Android Setup'}
              </CustomText>
              <View style={styles.badgeRow}>
                <View style={styles.badgeItem}>
                  <CustomText variant="small" weight="bold" style={styles.badgeText}>
                    {setupData.level || 'Beginner'}
                  </CustomText>
                </View>
                <View style={[styles.badgeItem, styles.badgeGreen]}>
                  <CustomText variant="small" weight="bold" style={styles.badgeGreenText}>
                    {setupData.platform || 'Android'}
                  </CustomText>
                </View>
                <View style={[styles.badgeItem, styles.badgeSky]}>
                  <CustomText variant="small" weight="bold" style={styles.badgeSkyText}>
                    9 Step-by-Step Sections
                  </CustomText>
                </View>
              </View>
            </View>
          </View>
          <CustomText variant="body" style={[styles.heroDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Complete end-to-end guide to configure Android Studio, JDK 17, Android SDK tools, environment variables, and run your React Native apps on emulators & real devices.
          </CustomText>
        </View>

        {/* Sections List */}
        {setupData.sections.map((section, idx) => (
          <View
            key={section.id || idx}
            style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}
          >
            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionNumberCircle}>
                <CustomText weight="heavy" style={styles.sectionNumberText}>
                  {idx + 1}
                </CustomText>
              </View>
              <View style={styles.sectionHeaderTitleCol}>
                <CustomText
                  variant="headlineMd"
                  weight="bold"
                  style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                >
                  {section.title}
                </CustomText>
                {section.description && (
                  <CustomText
                    variant="small"
                    style={[styles.sectionDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
                  >
                    {section.description}
                  </CustomText>
                )}
              </View>
            </View>

            {/* Step 1: Required Software */}
            {section.steps && section.steps.length > 0 && (
              <View style={styles.stepsContainer}>
                {section.steps.map((step) => (
                  <View key={step.id} style={[styles.stepItem, isDark ? styles.innerBoxDark : styles.innerBoxLight]}>
                    <View style={styles.stepItemHeader}>
                      <Icon name="label" size={14} color="#007AFF" style={{ marginRight: 6 }} />
                      <CustomText weight="bold" style={[styles.stepName, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                        {step.name}
                      </CustomText>
                    </View>
                    <CustomText variant="body" style={[styles.stepDetails, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                      {step.details}
                    </CustomText>
                    {step.verify && (
                      <View style={styles.codeSnippetBox}>
                        <View style={styles.codeRow}>
                          <CustomText style={styles.codeText}>{step.verify}</CustomText>
                          <TouchableOpacity
                            onPress={() => handleCopy(step.verify, 'Verify command')}
                            style={styles.copyBtn}
                          >
                            <Icon
                              name={copiedText === step.verify ? 'check-circle' : 'content-copy'}
                              size={13}
                              color={copiedText === step.verify ? '#10B981' : '#94A3B8'}
                            />
                            <CustomText style={styles.copyBtnText}>
                              {copiedText === step.verify ? ' Copied' : ' Copy'}
                            </CustomText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* SDK Platforms & Tools */}
            {section.sdkPlatforms && (
              <View style={styles.listGroup}>
                <CustomText weight="bold" style={[styles.subGroupTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                  Recommended SDK Platforms:
                </CustomText>
                {section.sdkPlatforms.map((plat, pIdx) => (
                  <View key={pIdx} style={styles.bulletRow}>
                    <Icon name="check-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
                    <CustomText variant="body" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
                      {plat}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}

            {section.sdkTools && (
              <View style={styles.listGroup}>
                <CustomText weight="bold" style={[styles.subGroupTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                  Required SDK Tools:
                </CustomText>
                {section.sdkTools.map((tool, tIdx) => (
                  <View key={tIdx} style={styles.bulletRow}>
                    <Icon name="widgets" size={16} color="#007AFF" style={{ marginRight: 8 }} />
                    <CustomText variant="body" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
                      {tool}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}

            {/* Environment Variables */}
            {section.variables && (
              <View style={styles.listGroup}>
                <CustomText weight="bold" style={[styles.subGroupTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                  User / System Environment Variable:
                </CustomText>
                {section.variables.map((v, vIdx) => (
                  <View key={vIdx} style={[styles.innerBox, isDark ? styles.innerBoxDark : styles.innerBoxLight]}>
                    <CustomText weight="bold" style={styles.varName}>
                      Variable: {v.name}
                    </CustomText>
                    <View style={styles.codeSnippetBox}>
                      <View style={styles.codeRow}>
                        <CustomText style={styles.codeText}>{v.valueExample}</CustomText>
                        <TouchableOpacity
                          onPress={() => handleCopy(v.valueExample, v.name)}
                          style={styles.copyBtn}
                        >
                          <Icon
                            name={copiedText === v.valueExample ? 'check-circle' : 'content-copy'}
                            size={16}
                            color={copiedText === v.valueExample ? '#10B981' : '#94A3B8'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {section.pathAdd && (
              <View style={styles.listGroup}>
                <CustomText weight="bold" style={[styles.subGroupTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                  Add to Path Variable:
                </CustomText>
                {section.pathAdd.map((pathItem, pIdx) => (
                  <View key={pIdx} style={styles.pathRow}>
                    <CustomText style={styles.pathBullet}>•</CustomText>
                    <CustomText style={styles.pathText}>{pathItem}</CustomText>
                    <TouchableOpacity
                      onPress={() => handleCopy(pathItem, 'Path')}
                      style={styles.copyMiniBtn}
                    >
                      <Icon
                        name={copiedText === pathItem ? 'check-circle' : 'content-copy'}
                        size={16}
                        color={copiedText === pathItem ? '#10B981' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Commands */}
            {section.commands && (
              <View style={styles.commandsContainer}>
                {section.commands.map((cmd, cIdx) => (
                  <View key={cIdx} style={styles.codeSnippetBox}>
                    <View style={styles.codeRow}>
                      <CustomText style={styles.codeText}>$ {cmd}</CustomText>
                      <TouchableOpacity
                        onPress={() => handleCopy(cmd, 'Command')}
                        style={styles.copyBtn}
                      >
                        <Icon
                              name={copiedText === cmd ? 'check-circle' : 'content-copy'}
                              size={13}
                              color={copiedText === cmd ? '#10B981' : '#94A3B8'}
                            />
                            <CustomText style={styles.copyBtnText}>
                              {copiedText === cmd ? ' Copied' : ' Copy'}
                            </CustomText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Methods (Emulator / Physical Device) */}
            {section.methods && (
              <View style={styles.methodsContainer}>
                {section.methods.map((method, mIdx) => (
                  <View key={mIdx} style={[styles.methodCard, isDark ? styles.innerBoxDark : styles.innerBoxLight]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Icon
                        name={method.type === 'Emulator' ? 'desktop-windows' : 'smartphone'}
                        size={16}
                        color={isDark ? '#F8FAFC' : '#1A1B1F'}
                        style={{ marginRight: 6 }}
                      />
                      <CustomText weight="bold" style={[styles.methodType, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                        {method.type === 'Emulator' ? 'Android Emulator' : 'Physical Android Device'}
                      </CustomText>
                    </View>
                    {method.steps.map((mStep, sIdx) => (
                      <View key={sIdx} style={styles.bulletRow}>
                        <CustomText style={styles.stepDot}>➔</CustomText>
                        <CustomText variant="body" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                          {mStep}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Path */}
            {section.path && (
              <View style={styles.codeSnippetBox}>
                <View style={styles.codeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon name="folder-open" size={14} color="#38BDF8" style={{ marginRight: 4 }} />
                    <CustomText style={styles.codeText}>{section.path}</CustomText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopy(section.path, 'Path')}
                    style={styles.copyBtn}
                  >
                    <CustomText style={styles.copyBtnText}>
                      {copiedText === section.path ? '✅ Copied' : '📋 Copy'}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Issues & Troubleshooting */}
            {section.issues && (
              <View style={styles.issuesContainer}>
                {section.issues.map((iss, iIdx) => (
                  <View key={iIdx} style={[styles.issueBox, isDark ? styles.issueBoxDark : styles.issueBoxLight]}>
                    <View style={styles.issueHeader}>
                      <CustomText style={{ fontSize: 16 }}>⚠️</CustomText>
                      <CustomText weight="bold" style={styles.issueProblem}>
                        {iss.problem}
                      </CustomText>
                    </View>
                    <CustomText variant="body" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                      💡 <CustomText weight="bold">Fix: </CustomText>{iss.solution}
                    </CustomText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  containerDark: { backgroundColor: '#050510' },
  containerLight: { backgroundColor: '#FAF9FE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerBorderDark: { borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerBorderLight: { borderBottomColor: '#E3E2E7' },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonDark: { backgroundColor: '#161823' },
  backButtonLight: { backgroundColor: '#EDEAF5' },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  headerSpacer: { width: 38 },
  textPrimaryDark: { color: '#F8FAFC' },
  textPrimaryLight: { color: '#1A1B1F' },
  textSecondaryDark: { color: '#94A3B8' },
  textSecondaryLight: { color: '#717786' },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 60,
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },
  heroCardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  heroCardLight: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroHeaderText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    color: '#0284C7',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeItem: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    color: '#0284C7',
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeGreenText: {
    fontSize: 11,
    color: '#10B981',
  },
  badgeSky: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  badgeSkyText: {
    fontSize: 11,
    color: '#0EA5E9',
  },
  heroDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#0F111A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E2E7',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionHeaderTitleCol: {
    flex: 1,
  },
  sectionDesc: {
    marginTop: 2,
    fontSize: 12.5,
  },
  stepsContainer: {
    gap: 10,
  },
  stepItem: {
    borderRadius: 12,
    padding: 12,
  },
  innerBoxDark: {
    backgroundColor: '#161823',
  },
  innerBoxLight: {
    backgroundColor: '#F8FAFC',
  },
  stepItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepName: {
    fontSize: 14,
  },
  stepDetails: {
    fontSize: 13,
    marginBottom: 8,
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12.5,
    flex: 1,
  },
  copyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  copyBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  listGroup: {
    marginTop: 10,
  },
  subGroupTitle: {
    fontSize: 13.5,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 4,
  },
  checkEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  innerBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  varName: {
    color: '#007AFF',
    fontSize: 13,
    marginBottom: 4,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 6,
  },
  pathBullet: {
    color: '#007AFF',
    fontSize: 16,
    marginRight: 8,
  },
  pathText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    flex: 1,
  },
  copyMiniBtn: {
    padding: 4,
  },
  copyMiniText: {
    fontSize: 14,
  },
  commandsContainer: {
    gap: 8,
  },
  methodsContainer: {
    gap: 10,
  },
  methodCard: {
    borderRadius: 12,
    padding: 12,
  },
  methodType: {
    fontSize: 14,
    marginBottom: 8,
  },
  stepDot: {
    color: '#007AFF',
    fontSize: 12,
    marginRight: 8,
  },
  issuesContainer: {
    gap: 10,
  },
  issueBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  issueBoxDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  issueBoxLight: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  issueProblem: {
    color: '#EF4444',
    fontSize: 13.5,
  },
});

export default AndroidSetupScreen;
