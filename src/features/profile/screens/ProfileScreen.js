import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  ToastAndroid,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { generatePDF } from 'react-native-html-to-pdf';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import Container from '../../../components/common/Container';
import CustomText from '../../../components/common/CustomText';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';

import { userAPI, clearUserSession } from '../../../services/api';
import { colors } from '../../../theme/theme';
import {
  saveToDownloads,
  openDownloadedFile,
  shareDownloadedFile,
} from '../../../services/fileDownloader';

const TOTAL_COMPONENTS = 47;

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const topInset = useTopInset();

  const [userName, setUserName] = useState('');
  const [userTitle, setUserTitle] = useState('React Native Developer');
  const [avatarColor, setAvatarColor] = useState(colors.brand.primary);
  const [profileImage, setProfileImage] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);

  const loadUserData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');

      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
      } else {
        setUserName('Alex');
      }

      const storedTitle = await AsyncStorage.getItem('userTitle');
      if (storedTitle) {
        setUserTitle(storedTitle);
      }

      const storedColor = await AsyncStorage.getItem('avatarColor');
      if (storedColor) {
        setAvatarColor(storedColor);
      }

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
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }

      const storedComponents = await AsyncStorage.getItem('completedComponents');
      if (storedComponents) {
        const list = JSON.parse(storedComponents);
        setCompletedCount(list.length);
      }

      // Fetch live data from backend if userId available
      if (storedId) {
        try {
          const profileRes = await userAPI.getProfile(storedId);
          if (profileRes && profileRes.user) {
            const u = profileRes.user;
            if (u.name && u.name !== 'React Native Developer') {
              setUserName(u.name);
              await AsyncStorage.setItem('userName', u.name);
            }
            if (u.userTitle) {
              setUserTitle(u.userTitle);
              await AsyncStorage.setItem('userTitle', u.userTitle);
            }
            if (u.avatarColor) {
              setAvatarColor(u.avatarColor);
              await AsyncStorage.setItem('avatarColor', u.avatarColor);
            }
            if (u.profileImage) {
              setProfileImage(u.profileImage);
              await AsyncStorage.setItem('profileImage', u.profileImage);
            }
            if (u.completedComponentsCount != null) {
              setCompletedCount(u.completedComponentsCount);
            }
          }
        } catch (apiErr) {
          // Fall back gracefully to local cache
          console.log('Profile API background fetch notice:', apiErr.message);
        }
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    loadUserData();
    return unsubscribe;
  }, [navigation]);



  const progressPercent = Math.min(
    100,
    Math.round((completedCount / TOTAL_COMPONENTS) * 100)
  );

  const handleLogout = () => {
    CustomAlert.show({
      title: 'Logout',
      message: 'Are you sure you want to log out?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearUserSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    });
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'App needs access to your storage to download the certificate PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleDownloadPDF = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        CustomAlert.warning(
          'Permission Denied',
          'Storage permission is required to save the PDF.'
        );
        return;
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show('Generating Certificate PDF...', ToastAndroid.SHORT);
      }

      const todayDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Certificate of Completion</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Great+Vibes&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
            
            @page {
              size: A4 landscape;
              margin: 0;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Montserrat', sans-serif;
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f1f5f9;
              color: #222;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .certificate-page {
              position: relative;
              width: 1050px;
              height: 740px;
              background: #FFFFFF;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 50px 80px 30px 80px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            }
            
            .bg-texture {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: radial-gradient(circle at center, #ffffff 65%, #fcfbf9 100%);
              z-index: 1;
            }
            
            .corner-top-right {
              position: absolute;
              top: 0;
              right: 0;
              width: 290px;
              height: 250px;
              z-index: 2;
              pointer-events: none;
            }
            
            .waves-bottom {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 220px;
              z-index: 2;
              pointer-events: none;
            }
            
            .gold-frame {
              position: absolute;
              top: 32px;
              left: 32px;
              right: 32px;
              bottom: 32px;
              border: 3px solid #D4AF37;
              z-index: 3;
              pointer-events: none;
            }
            
            .gold-frame-inner {
              position: absolute;
              top: 39px;
              left: 39px;
              right: 39px;
              bottom: 39px;
              border: 1px solid #E5C158;
              z-index: 3;
              pointer-events: none;
            }
            
            .rosette-badge {
              position: absolute;
              top: 48px;
              left: 55px;
              width: 135px;
              height: 135px;
              z-index: 5;
            }
            
            .cert-content {
              position: relative;
              z-index: 4;
              text-align: center;
              width: 100%;
              max-width: 840px;
              margin-top: -10px;
            }
            
            .cert-title {
              font-family: 'Cinzel', serif;
              font-size: 52px;
              font-weight: 900;
              color: #1A1D20;
              letter-spacing: 4px;
              line-height: 1.1;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            
            .cert-subtitle {
              font-family: 'Cinzel', serif;
              font-size: 22px;
              font-weight: 700;
              color: #2D3139;
              letter-spacing: 5px;
              text-transform: uppercase;
              margin-bottom: 22px;
            }
            
            .presented-to {
              font-size: 16px;
              font-weight: 500;
              color: #4A5568;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            
            .recipient-name {
              font-family: 'Great Vibes', cursive;
              font-size: 76px;
              line-height: 1.15;
              color: #C59A27;
              padding: 0 20px;
              margin-bottom: 4px;
            }
            
            .divider-line {
              width: 540px;
              height: 1.5px;
              background: linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.85) 50%, rgba(212,175,55,0) 100%);
              margin: 0 auto 20px auto;
            }
            
            .course-description {
              font-size: 15px;
              line-height: 1.6;
              color: #333333;
              max-width: 680px;
              margin: 0 auto 28px auto;
            }
            
            .course-name {
              color: #C59A27;
              font-weight: 700;
            }
            
            .organization {
              font-weight: 600;
              color: #1A1D20;
            }
            
            .date-text {
              display: block;
              margin-top: 4px;
              color: #4A5568;
              font-weight: 500;
            }
            
            .signature-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin-top: 4px;
            }
            
            .signature-svg {
              width: 140px;
              height: 38px;
              margin-bottom: -4px;
            }
            
            .signature-bar {
              width: 220px;
              height: 1.5px;
              background: #1A1D20;
              margin-bottom: 6px;
            }
            
            .signatory-name {
              font-size: 16px;
              font-weight: 700;
              color: #1A1D20;
              letter-spacing: 0.5px;
            }
            
            .signatory-role {
              font-size: 12.5px;
              color: #555555;
              font-weight: 500;
              letter-spacing: 0.3px;
            }
          </style>
        </head>
        <body>
          <div class="certificate-page">
            <div class="bg-texture"></div>
            
            <!-- Top Right Gold & Black Geometric Overlay -->
            <svg viewBox="0 0 290 250" class="corner-top-right" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#F5E497" />
                  <stop offset="50%" stop-color="#D4AF37" />
                  <stop offset="100%" stop-color="#997519" />
                </linearGradient>
                <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#D4AF37" />
                  <stop offset="100%" stop-color="#F0D584" />
                </linearGradient>
              </defs>
              <polygon points="50,0 290,0 290,250 190,250 0,60" fill="#1C1F26" />
              <polygon points="130,0 290,0 290,165" fill="#101216" />
              <polygon points="25,0 52,0 290,242 290,215" fill="url(#goldGrad)" />
              <polygon points="290,148 290,175 175,250 148,250" fill="url(#goldGrad2)" />
            </svg>
            
            <!-- Bottom Sweeping Gold & Black Wave -->
            <svg viewBox="0 0 1050 220" class="waves-bottom" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldWave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#B8860B" />
                  <stop offset="25%" stop-color="#F2D879" />
                  <stop offset="50%" stop-color="#D4AF37" />
                  <stop offset="75%" stop-color="#F7E5A1" />
                  <stop offset="100%" stop-color="#AA7C11" />
                </linearGradient>
                <linearGradient id="darkWave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#111317" />
                  <stop offset="50%" stop-color="#1C1F26" />
                  <stop offset="100%" stop-color="#0E1013" />
                </linearGradient>
              </defs>
              <path d="M 0,220 L 0,80 Q 250,220 525,140 Q 800,60 1050,180 L 1050,220 Z" fill="url(#darkWave)" />
              <path d="M 0,220 L 0,110 C 200,60 380,200 600,190 C 820,180 940,90 1050,0 L 1050,220 Z" fill="#181A20" />
              <path d="M 0,140 C 220,90 380,210 600,198 C 820,188 940,95 1050,12 L 1050,30 C 940,115 820,208 600,218 C 380,230 220,110 0,160 Z" fill="url(#goldWave)" />
              <path d="M 0,220 L 0,165 C 80,140 160,180 220,220 Z" fill="url(#goldWave)" opacity="0.85" />
            </svg>
            
            <!-- Double Gold Borders -->
            <div class="gold-frame"></div>
            <div class="gold-frame-inner"></div>
            
            <!-- Top-Left Scalloped Rosette Medal -->
            <svg viewBox="0 0 160 160" class="rosette-badge" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rosetteGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#FFE494" />
                  <stop offset="35%" stop-color="#D4AF37" />
                  <stop offset="70%" stop-color="#9E7818" />
                  <stop offset="100%" stop-color="#E8C96D" />
                </linearGradient>
              </defs>
              <path d="M 80,10 L 87,22 L 100,15 L 104,29 L 118,26 L 119,40 L 133,41 L 130,55 L 143,60 L 136,73 L 148,80 L 136,87 L 143,100 L 130,105 L 133,119 L 119,120 L 118,134 L 104,131 L 100,145 L 87,138 L 80,150 L 73,138 L 60,145 L 56,131 L 42,134 L 41,120 L 27,119 L 30,105 L 17,100 L 24,87 L 12,80 L 24,73 L 17,60 L 30,55 L 27,41 L 41,40 L 42,26 L 56,29 L 60,15 L 73,22 Z" fill="url(#rosetteGold)" stroke="#B3871B" stroke-width="1.5" />
              <circle cx="80" cy="80" r="54" fill="#D4AF37" stroke="#8A6710" stroke-width="1" />
              <circle cx="80" cy="80" r="46" fill="#181A20" />
              <circle cx="80" cy="80" r="41" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3,3" />
              <polygon points="80,63 84,74 96,74 86,81 90,92 80,85 70,92 74,81 64,74 76,74" fill="url(#rosetteGold)" />
            </svg>
            
            <!-- Certificate Text & Structure -->
            <div class="cert-content">
              <h1 class="cert-title">CERTIFICATE</h1>
              <h2 class="cert-subtitle">OF COMPLETION</h2>
              
              <p class="presented-to">THIS IS PROUDLY PRESENTED TO:</p>
              <h3 class="recipient-name">${userName || 'Kuldip Bharda'}</h3>
              <div class="divider-line"></div>
              
              <p class="course-description">
                For successfully completing the <span class="course-name">"React Native Master Class: Zero to Advanced"</span> organized by <span class="organization">RN Master Class Academy</span>
                <span class="date-text">on ${todayDate} • Credential ID: RNMC-2026-90812</span>
              </p>
              
              <!-- Signature Block -->
              <div class="signature-section" style="display: flex; flex-direction: row; justify-content: space-around; width: 100%; max-width: 650px; margin: 10px auto 0 auto;">
                <div style="text-align: center;">
                  <div style="font-family: 'Great Vibes', cursive; font-size: 26px; color: #1E293B; margin-bottom: 2px;">Kuldip Bharda</div>
                  <div class="signature-bar" style="width: 140px; height: 1.5px; background: #94A3B8; margin: 0 auto 4px auto;"></div>
                  <div class="signatory-name" style="font-size: 13px; font-weight: 700; color: #1E293B;">Kuldip Bharda</div>
                  <div class="signatory-role" style="font-size: 11px; color: #64748B;">Lead Mobile Architect</div>
                </div>

                <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="width: 48px; height: 48px; border-radius: 24px; border: 1.5px dashed #D4AF37; display: flex; align-items: center; justify-content: center; background: #FAF6EA; font-size: 10px; font-weight: 900; color: #B8860B;">SEAL</div>
                  <div style="font-size: 9px; font-weight: 700; color: #B8860B; margin-top: 4px; letter-spacing: 1px;">VERIFIED</div>
                </div>

                <div style="text-align: center;">
                  <div style="font-family: 'Great Vibes', cursive; font-size: 26px; color: #1E293B; margin-bottom: 2px;">Academic Council</div>
                  <div class="signature-bar" style="width: 140px; height: 1.5px; background: #94A3B8; margin: 0 auto 4px auto;"></div>
                  <div class="signatory-name" style="font-size: 13px; font-weight: 700; color: #1E293B;">RN Master Class</div>
                  <div class="signatory-role" style="font-size: 11px; color: #64748B;">Board of Certification</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const fileName = `Certificate_${(userName || 'Developer').replace(/\s+/g, '_')}`;
      const options = {
        html: htmlContent,
        fileName,
        directory: 'Documents',
      };

      const file = await generatePDF(options);

      let publicDownloadSuccess = false;
      let finalPath = file.filePath;

      try {
        const downloadRes = await saveToDownloads(file.filePath, fileName);
        if (downloadRes && downloadRes.success) {
          publicDownloadSuccess = true;
          finalPath = downloadRes.filePath || file.filePath;
        }
      } catch (saveErr) {
        console.log('Public download save fallback notice:', saveErr);
      }

      CustomAlert.show({
        title: 'Certificate downloaded',
        message: publicDownloadSuccess
          ? `Your Certificate has been saved directly to your device's Downloads folder:\n\n📁 ${finalPath}\n\nYou can view it in your "Files" or "Downloads" app.`
          : `Certificate PDF created successfully!\n\nSaved to: ${file.filePath}`,
        type: 'success',
        buttons: [
          {
            text: 'Share',
            onPress: () => {
              shareDownloadedFile(file.filePath).catch(() => {});
            },
          },
          {
            text: 'Open PDF',
            onPress: () => {
              openDownloadedFile(file.filePath).catch(() => {});
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ],
      });
    } catch (error) {
      console.error(error);
      CustomAlert.error('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const menuItems = [
    {
      id: 'edit_profile',
      iconName: 'edit',
      label: t('profile.edit_profile') || 'Edit Profile',
      screen: 'EditProfile',
      color: colors.brand.primary,
    },
    {
      id: 'interview',
      iconName: 'code',
      label: 'Interview Q&A & Cheats',
      screen: 'InterviewPrep',
      color: colors.brand.accent,
    },
    {
      id: 'achievements',
      iconName: 'emoji-events',
      label: t('profile.achievements') || 'Achievements',
      screen: 'Achievements',
      color: colors.category.purple,
    },
    {
      id: 'settings',
      iconName: 'settings',
      label: t('profile.settings') || 'Settings',
      screen: 'Settings',
      color: colors.light.textSecondary,
    },
    {
      id: 'help',
      iconName: 'help-outline',
      label: t('profile.help_support') || 'Help & Support',
      screen: 'HelpSupport',
      color: colors.brand.info,
    },
    {
      id: 'about',
      iconName: 'info-outline',
      label: t('profile.about_app') || 'About App',
      screen: 'AboutApp',
      color: colors.brand.success,
    },
    {
      id: 'terms',
      iconName: 'gavel',
      label: t('profile.terms_conditions') || 'Terms & Privacy',
      screen: 'Terms',
      color: colors.brand.warning,
    },
  ];

  return (
    <Container noPadding safeArea={false} style={isDark ? styles.containerDark : styles.containerLight}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      {/* Top Header */}
      <View style={[styles.topHeader, { paddingTop: topInset + 12 }]}>
        <View style={styles.brandRow}>
          <Icon name="code" size={22} color={colors.brand.primary} style={styles.brandIcon} />
          <CustomText
            variant="headlineMd"
            weight="bold"
            style={styles.brandColor}
          >
            RN Master Class
          </CustomText>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="settings" size={22} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Figma Profile Header Card */}
        <View style={[styles.profileCard, isDark ? styles.cardDark : styles.cardLight]}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarCircle,
                { borderColor: avatarColor, backgroundColor: `${avatarColor}15`, overflow: 'hidden' },
              ]}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarPhoto} resizeMode="cover" />
              ) : (
                <Icon name="person" size={44} color={avatarColor} />
              )}
            </View>
            <View style={[styles.editDot, { backgroundColor: avatarColor }]}>
              <Icon name="photo-camera" size={12} color={colors.brand.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <CustomText
              variant="headlineMd"
              weight="bold"
              style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
            >
              {userName || 'Alex'}
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.userTitleText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              {userTitle}
            </CustomText>
          </View>

          <View style={[styles.xpBadge, isDark ? styles.xpBadgeDark : styles.xpBadgeLight]}>
            <Icon name="emoji-events" size={16} color={colors.brand.accent} style={styles.xpIcon} />
            <CustomText
              variant="small"
              weight="bold"
              style={styles.cyanColor}
            >
              {completedCount * 50 + 250} XP
            </CustomText>
          </View>
        </View>

        {/* Figma Premium Promo / Certificate Banner */}
        <TouchableOpacity
          style={styles.promoCardWrapper}
          activeOpacity={0.9}
          onPress={() => setShowCertModal(true)}
        >
          <LinearGradient
            colors={[colors.brand.primary, colors.brand.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoCard}
          >
            <View style={styles.promoTextCol}>
              <CustomText variant="headlineMd" weight="bold" style={styles.promoTitle}>
                Certificate of Mastery
              </CustomText>
              <CustomText variant="caption" style={styles.promoSubtitle}>
                {progressPercent}% completed • Tap to view & download official certificate
              </CustomText>
            </View>
            <Icon name="emoji-events" size={42} color={colors.brand.white} style={styles.promoIcon} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Grouped Menu List */}
        <View style={[styles.menuListCard, isDark ? styles.cardDark : styles.cardLight]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemRow,
                index < menuItems.length - 1 && (isDark ? styles.menuItemBorderDark : styles.menuItemBorderLight),
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIconBox,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Icon name={item.iconName} size={20} color={item.color} />
                </View>
                <CustomText
                  variant="body"
                  weight="medium"
                  style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
                >
                  {item.label}
                </CustomText>
              </View>

              <Icon name="chevron-right" size={20} color={isDark ? colors.dark.textMuted : colors.light.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isDark ? styles.logoutDark : styles.logoutLight]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconBox}>
            <Icon name="exit-to-app" size={20} color={colors.brand.error} />
          </View>
          <CustomText weight="bold" style={styles.logoutText}>
            Logout
          </CustomText>
        </TouchableOpacity>
      </ScrollView>

           {/* Full-Screen Certificate Viewer Modal */}
      <Modal
        visible={showCertModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCertModal(false)}
      >
        <View style={[styles.certFullScreenContainer, isDark ? styles.containerDark : styles.certFullScreenBgLight]}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={isDark ? colors.dark.background : '#F1F5F9'}
          />

          {/* Full Screen Header Bar */}
          <View style={[styles.certFullScreenHeader, isDark ? styles.headerBorderDark : styles.headerBorderLight, { paddingTop: topInset + 12 }]}>
            <TouchableOpacity
              onPress={() => setShowCertModal(false)}
              style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-back" size={22} color={isDark ? colors.dark.text : colors.light.text} />
            </TouchableOpacity>

            <View style={styles.certHeaderCenter}>
              <CustomText
                variant="headlineMd"
                weight="bold"
                style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}
              >
                Certificate of Completion
              </CustomText>
              <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                Official Verified Credential
              </CustomText>
            </View>

            <TouchableOpacity
              onPress={handleDownloadPDF}
              style={[styles.backButton, isDark ? styles.backButtonDark : styles.backButtonLight]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="get-app" size={22} color={isDark ? colors.dark.text : colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.certFullScreenScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Real Full Luxury Certificate Card */}
            <View style={styles.certCardFullWrapper}>
              <View style={styles.certCanvasLuxuryFull}>
                {/* Double Gold Inset Frame */}
                <View style={styles.luxuryGoldFrameOuterFull}>
                  <View style={styles.luxuryGoldFrameInnerFull}>
                    {/* Symmetrical Ornamental Corners */}
                    <View style={styles.cornerFiligreeTopLeft}>
                      <View style={styles.cornerBorderTL} />
                      <View style={styles.cornerDotTL} />
                    </View>
                    <View style={styles.cornerFiligreeTopRight}>
                      <View style={styles.cornerBorderTR} />
                      <View style={styles.cornerDotTR} />
                    </View>
                    <View style={styles.cornerFiligreeBottomLeft}>
                      <View style={styles.cornerBorderBL} />
                      <View style={styles.cornerDotBL} />
                    </View>
                    <View style={styles.cornerFiligreeBottomRight}>
                      <View style={styles.cornerBorderBR} />
                      <View style={styles.cornerDotBR} />
                    </View>

                    {/* Centered Academy Crest Seal */}
                    <View style={styles.crestContainer}>
                      <LinearGradient
                        colors={['#F7DE92', '#D4AF37', '#997316']}
                        style={styles.crestCircleOuter}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.crestCircleInner}>
                          <Icon name="workspace-premium" size={20} color="#FFD700" />
                        </View>
                      </LinearGradient>
                      <View style={styles.ribbonRow}>
                        <View style={styles.ribbonLeft} />
                        <View style={styles.ribbonRight} />
                      </View>
                    </View>

                    {/* Academy Header */}
                    <CustomText weight="heavy" style={styles.academyHeaderTitle}>
                      RN MASTER CLASS ACADEMY
                    </CustomText>
                    <CustomText style={styles.academyHeaderSub}>
                      OFFICIAL ACCREDITATION & VERIFIED MASTERY
                    </CustomText>

                    {/* Certificate Title */}
                    <CustomText weight="heavy" style={styles.luxuryCertTitleFull}>
                      CERTIFICATE
                    </CustomText>
                    <CustomText weight="bold" style={styles.luxuryCertSubtitleFull}>
                      OF COMPLETION
                    </CustomText>

                    {/* Presentation Label */}
                    <CustomText style={styles.luxuryPresentedToFull}>
                      THIS IS PROUDLY PRESENTED TO
                    </CustomText>

                    {/* Recipient Name */}
                    <CustomText weight="heavy" style={styles.luxuryRecipientNameFull}>
                      {userName || 'Kuldip Bharda'}
                    </CustomText>

                    {/* Decorative Gold Flourish Line */}
                    <View style={styles.flourishContainer}>
                      <View style={styles.flourishLine} />
                      <View style={styles.flourishDiamond} />
                      <View style={styles.flourishLine} />
                    </View>

                    {/* Course Description */}
                    <CustomText style={styles.luxuryCourseDescFull}>
                      For successfully mastering the comprehensive curriculum, architecture patterns, and hands-on production challenges in
                    </CustomText>
                    <CustomText weight="bold" style={styles.luxuryHighlightGold}>
                      "React Native Master Class: Zero to Advanced"
                    </CustomText>

                    {/* Date & Credential ID Pill */}
                    <View style={styles.certCredentialPill}>
                      <CustomText style={styles.certCredentialText}>
                        Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • ID: RNMC-2026-90812
                      </CustomText>
                    </View>

                    {/* Dual Signature & Official Seal Block */}
                    <View style={styles.luxurySignaturesRow}>
                      {/* Left: Lead Instructor */}
                      <View style={styles.signatureCol}>
                        <CustomText style={styles.signatureHandwritten}>
                          Kuldip Bharda
                        </CustomText>
                        <View style={styles.signatureUnderline} />
                        <CustomText weight="bold" style={styles.signatoryNameText}>
                          Kuldip Bharda
                        </CustomText>
                        <CustomText style={styles.signatoryRoleText}>
                          Lead Mobile Architect
                        </CustomText>
                      </View>

                      {/* Center: Wax Seal Stamp */}
                      <View style={styles.signatureSealCol}>
                        <View style={styles.waxSealStamp}>
                          <Icon name="verified" size={16} color="#B8860B" />
                          <CustomText weight="heavy" style={styles.waxSealText}>
                            SEAL
                          </CustomText>
                        </View>
                      </View>

                      {/* Right: Academy Board */}
                      <View style={styles.signatureCol}>
                        <CustomText style={styles.signatureHandwritten}>
                          Academic Council
                        </CustomText>
                        <View style={styles.signatureUnderline} />
                        <CustomText weight="bold" style={styles.signatoryNameText}>
                          RN Master Class
                        </CustomText>
                        <CustomText style={styles.signatoryRoleText}>
                          Board of Certification
                        </CustomText>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Verification & Security Badge */}
            <View style={[styles.certVerifyBox, isDark ? styles.cardDark : styles.cardLight]}>
              <Icon name="security" size={20} color={colors.brand.primary} style={styles.certVerifyIcon} />
              <View style={styles.certVerifyContent}>
                <CustomText variant="caption" weight="bold" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
                  Verified Accreditation • ID: RNMC-2026-90812
                </CustomText>
                <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                  Issued by RN Master Class Academy • Authorized Certification
                </CustomText>
              </View>
            </View>

            {/* Actions */}
            <Button
              title="DOWNLOAD PDF CERTIFICATE"
              onPress={handleDownloadPDF}
              style={styles.fullCertDownloadBtn}
            />

            <Button
              title="Back to profile"
              variant="secondary"
              onPress={() => setShowCertModal(false)}
              style={styles.fullCertCloseBtn}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Profile Modal removed - using dedicated EditProfile screen */}
    </Container>
  );
};

const styles = StyleSheet.create({
  containerDark: { backgroundColor: colors.dark.background },
  containerLight: { backgroundColor: colors.light.background },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    marginRight: 8,
  },
  brandTint: { tintColor: colors.brand.primary },
  brandColor: { color: colors.brand.primary },
  cyanTint: { tintColor: colors.brand.accent },
  cyanColor: { color: colors.brand.accent },
  dangerTint: { tintColor: colors.brand.error },
  iconSecondaryDark: { tintColor: colors.dark.textSecondary },
  iconSecondaryLight: { tintColor: colors.light.textSecondary },
  chevronDark: { tintColor: colors.dark.textMuted },
  chevronLight: { tintColor: colors.light.chevron },
  textPrimaryDark: { color: colors.dark.text },
  textPrimaryLight: { color: colors.light.text },
  textSecondaryDark: { color: colors.dark.textSecondary },
  textSecondaryLight: { color: colors.light.textSecondary },
  settingsIcon: {
    width: 22,
    height: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: colors.light.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  editDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand.white,
  },
  editDotEmoji: { fontSize: 10 },
  profileDetails: {
    flex: 1,
  },
  userTitleText: { marginTop: 2 },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  xpBadgeDark: { backgroundColor: colors.dark.elevated },
  xpBadgeLight: { backgroundColor: colors.light.elevated },
  xpIcon: {
    marginRight: 4,
  },
  promoCardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  promoTextCol: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  promoTitle: {
    color: colors.brand.white,
    fontSize: 18,
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  promoWatermark: {
    width: 60,
    height: 60,
    tintColor: colors.brand.white,
    opacity: 0.25,
  },
  menuListCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorderDark: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  menuItemBorderLight: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 18,
    height: 18,
  },
  menuChevron: {
    width: 14,
    height: 14,
    transform: [{ rotate: '-90deg' }],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  logoutDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutLight: {
    backgroundColor: '#FFDAD6',
    borderColor: '#FFDAD6',
  },
  logoutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 20,
    height: 20,
  },
  logoutText: { color: colors.brand.error, fontSize: 15 },
  certFullScreenContainer: {
    flex: 1,
  },
  certFullScreenBgLight: {
    backgroundColor: colors.dark.text,
  },
  certFullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  certHeaderCenter: {
    alignItems: 'center',
  },
  certFullScreenScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  certCardFullWrapper: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 16,
  },
  certCanvasLuxuryFull: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    padding: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  luxuryGoldFrameOuterFull: {
    borderWidth: 2.5,
    borderColor: '#C59A27',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    backgroundColor: '#FAF7EE',
  },
  luxuryGoldFrameInnerFull: {
    borderWidth: 1.5,
    borderColor: '#E5C975',
    borderRadius: 10,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FCFAF4',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  // Symmetrical Corner Ornaments
  cornerFiligreeTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
  },
  cornerBorderTL: {
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#C59A27',
  },
  cornerDotTL: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C59A27',
  },
  cornerFiligreeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    alignItems: 'flex-end',
  },
  cornerBorderTR: {
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C59A27',
  },
  cornerDotTR: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C59A27',
  },
  cornerFiligreeBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    justifyContent: 'flex-end',
  },
  cornerBorderBL: {
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#C59A27',
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C59A27',
  },
  cornerFiligreeBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  cornerBorderBR: {
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C59A27',
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C59A27',
  },
  // Academy Crest Badge
  crestContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  crestCircleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  crestCircleInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3DE9A',
  },
  ribbonRow: {
    flexDirection: 'row',
    marginTop: -4,
    gap: 4,
  },
  ribbonLeft: {
    width: 8,
    height: 10,
    backgroundColor: '#C59A27',
    borderBottomLeftRadius: 3,
    transform: [{ rotate: '15deg' }],
  },
  ribbonRight: {
    width: 8,
    height: 10,
    backgroundColor: '#C59A27',
    borderBottomRightRadius: 3,
    transform: [{ rotate: '-15deg' }],
  },
  academyHeaderTitle: {
    fontSize: 10.5,
    color: '#8B6514',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  academyHeaderSub: {
    fontSize: 7.5,
    color: '#78716C',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  luxuryCertTitleFull: {
    fontSize: 24,
    color: '#1E293B',
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 28,
  },
  luxuryCertSubtitleFull: {
    fontSize: 11,
    color: '#475569',
    letterSpacing: 3.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  luxuryPresentedToFull: {
    fontSize: 9.5,
    color: colors.dark.textMuted,
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  luxuryRecipientNameFull: {
    fontSize: 26,
    color: '#B8860B',
    textAlign: 'center',
    marginVertical: 4,
  },
  flourishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 6,
  },
  flourishLine: {
    width: 55,
    height: 1,
    backgroundColor: '#D4AF37',
  },
  flourishDiamond: {
    width: 6,
    height: 6,
    backgroundColor: '#C59A27',
    marginHorizontal: 8,
    transform: [{ rotate: '45deg' }],
  },
  luxuryCourseDescFull: {
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  luxuryHighlightGold: {
    fontSize: 12.5,
    color: '#8B6514',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  certCredentialPill: {
    backgroundColor: '#F3EEDB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#DFD5B8',
    marginBottom: 14,
  },
  certCredentialText: {
    fontSize: 8.5,
    color: '#605A4D',
    letterSpacing: 0.5,
  },
  luxurySignaturesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  signatureCol: {
    alignItems: 'center',
    flex: 1,
  },
  signatureHandwritten: {
    fontSize: 15,
    color: '#1E293B',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  signatureUnderline: {
    width: '80%',
    maxWidth: 90,
    height: 1.2,
    backgroundColor: colors.dark.textSecondary,
    marginBottom: 4,
  },
  signatoryNameText: {
    fontSize: 10,
    color: '#1E293B',
    textAlign: 'center',
  },
  signatoryRoleText: {
    fontSize: 8,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
  signatureSealCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  waxSealStamp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C59A27',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F2E2',
  },
  waxSealText: {
    fontSize: 6.5,
    color: '#8B6514',
    letterSpacing: 1,
    marginTop: -2,
  },
  certVerifyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  fullCertDownloadBtn: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 10,
  },
  fullCertCloseBtn: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeIconText: { fontSize: 18 },
  modalActionMargin: { marginTop: 20 },
  editModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    position: 'relative',
  },
  editModalTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  fieldLabel: { marginBottom: 8 },
  fieldLabelSmall: { marginBottom: 6 },
  fieldLabelSpaced: { marginBottom: 6, marginTop: 12 },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBubbleSelected: {
    borderWidth: 2.5,
    borderColor: colors.brand.white,
  },
  checkmarkIcon: { color: colors.brand.white, fontSize: 13 },
  editInput: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  editInputDark: {
    backgroundColor: colors.dark.elevated,
    color: colors.dark.text,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editInputLight: {
    backgroundColor: '#F2F2F7',
    color: colors.light.text,
    borderColor: 'transparent',
  },
  promoIcon: {
    opacity: 0.35,
  },
  luxuryOrgName: {
    color: '#1A1D20',
  },
  certVerifyIcon: {
    marginRight: 8,
  },
  certVerifyContent: {
    flex: 1,
  },
});

export default ProfileScreen;
