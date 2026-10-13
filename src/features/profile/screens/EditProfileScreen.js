import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ToastAndroid,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { CustomAlert } from '../../../context/AlertContext';
import CustomText from '../../../components/common/CustomText';
import AppTextInput from '../../../components/common/AppTextInput';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import { useTopInset } from '../../../hooks/useTopInset';
import { userAPI } from '../../../services/api';
import { colors } from '../../../theme/theme';

const EditProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const topInset = useTopInset();

  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedTitle = await AsyncStorage.getItem('userTitle');
        let storedImage = await AsyncStorage.getItem('profileImage');
        if (!storedImage) {
          const userStr = await AsyncStorage.getItem('userObject');
          if (userStr) {
            try {
              const parsed = JSON.parse(userStr);
              if (parsed.profileImage || parsed.photoUrl) {
                storedImage = parsed.profileImage || parsed.photoUrl;
              }
            } catch (_) {}
          }
        }

        setUserId(storedId);
        if (storedEmail) setUserEmail(storedEmail);
        if (storedName) setName(storedName);
        if (storedTitle) setTitle(storedTitle);
        if (storedImage) setProfileImage(storedImage);
      } catch (e) {
        console.error('Failed to load user profile in EditProfileScreen', e);
      }
    };
    fetchUserData();
  }, []);

  const handleChooseFromGallery = () => {
    setShowPhotoModal(false);
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.7,
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        CustomAlert.error('Gallery Error', response.errorMessage || 'Failed to select image.');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageUri = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setProfileImage(imageUri);
      }
    });
  };

  const handleTakePhoto = () => {
    setShowPhotoModal(false);
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.7,
      includeBase64: true,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        CustomAlert.error('Camera Error', response.errorMessage || 'Failed to capture image.');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageUri = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setProfileImage(imageUri);
      }
    });
  };

  const handleRemovePhoto = () => {
    setShowPhotoModal(false);
    setProfileImage(null);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      CustomAlert.error(t('common.error') || 'Error', 'Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const finalTitle = title.trim() || 'React Native Developer';

      await AsyncStorage.setItem('userName', trimmedName);
      await AsyncStorage.setItem('userTitle', finalTitle);
      if (profileImage) {
        await AsyncStorage.setItem('profileImage', profileImage);
      } else {
        await AsyncStorage.removeItem('profileImage');
      }

      // Keep userObject in sync
      try {
        const userStr = await AsyncStorage.getItem('userObject');
        const userObj = userStr ? JSON.parse(userStr) : {};
        userObj.name = trimmedName;
        userObj.userTitle = finalTitle;
        userObj.profileImage = profileImage || null;
        if (!profileImage) {
          userObj.photoUrl = null;
        }
        await AsyncStorage.setItem('userObject', JSON.stringify(userObj));
      } catch (_) {}

      const currentId = userId || (await AsyncStorage.getItem('userId'));
      const currentEmail = userEmail || (await AsyncStorage.getItem('userEmail'));
      if (currentId || currentEmail) {
        try {
          await userAPI.updateProfile(currentId || currentEmail, {
            name: trimmedName,
            userTitle: finalTitle,
            profileImage: profileImage || null,
            email: currentEmail,
          });
        } catch (serverErr) {
          console.log('Profile server update notice:', serverErr.message);
        }
      }

      setSaving(false);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Profile updated successfully!', ToastAndroid.SHORT);
      }
      CustomAlert.success(
        t('common.success') || 'Success',
        'Profile changes saved successfully!',
        () => {
          navigation.goBack();
        }
      );
    } catch (error) {
      setSaving(false);
      CustomAlert.error('Error', error.message || 'Failed to update profile.');
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.dark.background : colors.light.background}
      />

      {/* Header Bar */}
      <View style={[styles.header, isDark ? styles.headerBorderDark : styles.headerBorderLight, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
          {t('profile.edit_profile') || 'Edit Profile'}
        </CustomText>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveHeaderBtn, saving && styles.btnDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CustomText weight="bold" style={styles.saveHeaderText}>
            Save
          </CustomText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Live Avatar Preview & Image Picker Card */}
          <View style={[styles.previewCard, isDark ? styles.cardDark : styles.cardLight]}>
            <TouchableOpacity
              style={styles.avatarTouchWrapper}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarCircle}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarPhoto} resizeMode="cover" />
                ) : (
                  <Icon name="person" size={56} color={colors.brand.primary} />
                )}
              </View>
              <View style={styles.editBadge}>
                <Icon name="photo-camera" size={14} color={colors.brand.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPhotoModal(true)}
              style={styles.changePhotoBtn}
              activeOpacity={0.7}
            >
              <CustomText weight="bold" style={styles.changePhotoText}>
                {profileImage ? 'Change Photo' : 'Upload Profile Photo'}
              </CustomText>
            </TouchableOpacity>

            <CustomText
              variant="headlineMd"
              weight="bold"
              style={[styles.previewName, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              {name || 'Your Name'}
            </CustomText>
            <CustomText
              variant="body"
              style={[styles.previewTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              {title || 'React Native Developer'}
            </CustomText>
          </View>

          {/* Edit Form Fields */}
          <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
            <CustomText
              variant="caption"
              weight="bold"
              style={[styles.sectionLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}
            >
              PERSONAL DETAILS
            </CustomText>

            <AppTextInput
              label="FULL NAME"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              iconName="person"
              containerStyle={styles.inputMargin}
            />

            <AppTextInput
              label="TITLE / ROLE"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. React Native Developer"
              iconName="badge"
              containerStyle={styles.inputMargin}
            />

            {userEmail ? (
              <AppTextInput
                label="EMAIL ADDRESS (LINKED ACCOUNT)"
                value={userEmail}
                editable={false}
                iconName="email"
                placeholder="Account email"
                containerStyle={styles.inputMargin}
              />
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title={saving ? 'SAVING...' : 'SAVE CHANGES'}
              onPress={handleSave}
              disabled={saving}
              style={styles.actionBtnMargin}
            />

            <Button
              title="CANCEL"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Picker Modal Sheet */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={[styles.photoSheet, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.sheetHandle} />
            <CustomText
              variant="headlineMd"
              weight="bold"
              style={[styles.sheetTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
            >
              Profile Photo
            </CustomText>

            <TouchableOpacity
              style={[styles.sheetOption, isDark ? styles.sheetOptionDark : styles.sheetOptionLight]}
              onPress={handleChooseFromGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, styles.galleryIconBg]}>
                <Icon name="photo-library" size={22} color={colors.brand.primary} />
              </View>
              <View style={styles.optionTextBox}>
                <CustomText weight="bold" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
                  Choose from Gallery
                </CustomText>
                <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                  Select a picture from your device
                </CustomText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetOption, isDark ? styles.sheetOptionDark : styles.sheetOptionLight]}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, styles.cameraIconBg]}>
                <Icon name="photo-camera" size={22} color={colors.brand.primary} />
              </View>
              <View style={styles.optionTextBox}>
                <CustomText weight="bold" style={isDark ? styles.textPrimaryDark : styles.textPrimaryLight}>
                  Take Photo
                </CustomText>
                <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                  Capture a new photo with camera
                </CustomText>
              </View>
            </TouchableOpacity>

            {profileImage ? (
              <TouchableOpacity
                style={[styles.sheetOption, isDark ? styles.sheetOptionDark : styles.sheetOptionLight]}
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconBox, styles.deleteIconBg]}>
                  <Icon name="delete" size={22} color={colors.brand.error} />
                </View>
                <View style={styles.optionTextBox}>
                  <CustomText weight="bold" style={styles.deleteText}>
                    Remove Photo
                  </CustomText>
                  <CustomText variant="small" style={isDark ? styles.textSecondaryDark : styles.textSecondaryLight}>
                    Delete current profile picture
                  </CustomText>
                </View>
              </TouchableOpacity>
            ) : null}

            <Button
              title="CANCEL"
              variant="secondary"
              onPress={() => setShowPhotoModal(false)}
              style={styles.sheetCancelBtn}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  containerLight: {
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBorderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: colors.dark.background,
  },
  headerBorderLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: colors.light.background,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  backArrowText: {
    fontSize: 18,
  },
  saveHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.brand.primary,
  },
  saveHeaderText: {
    color: colors.brand.white,
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardDark: {
    backgroundColor: '#0D0E1A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: colors.brand.white,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  textPrimaryDark: {
    color: colors.dark.text,
  },
  textPrimaryLight: {
    color: colors.light.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  textSecondaryLight: {
    color: colors.light.textSecondary,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarTouchWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.brand.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brand.white,
  },
  changePhotoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  changePhotoText: {
    color: colors.brand.primary,
    fontSize: 13,
  },
  previewName: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  inputMargin: {
    marginBottom: 14,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionBtnMargin: {
    marginBottom: 12,
  },
  // Modal Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  photoSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 44,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.textSecondary,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.5,
  },
  sheetTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  sheetOptionDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sheetOptionLight: {
    backgroundColor: colors.dark.text,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  galleryIconBg: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  cameraIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  deleteIconBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  deleteText: {
    color: colors.brand.error,
  },
  optionTextBox: {
    flex: 1,
  },
  sheetCancelBtn: {
    marginTop: 6,
  },
});

export default EditProfileScreen;
