import { NativeModules, Platform, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, saveUserSession } from './api';

const { NativeGoogleAuth } = NativeModules;

export const isGoogleAuthAvailable = () => {
  return Platform.OS === 'android' && !!NativeGoogleAuth;
};

/**
 * Initiates Real Device Google Sign-In:
 * 1. Opens Google Play Services Account Chooser or Android System Account Palette.
 * 2. Gets the chosen account's email, name, and profile photo.
 * 3. Syncs with backend or falls back locally if server is offline.
 * 4. Saves profileImage to AsyncStorage so HomeScreen and ProfileScreen immediately display it.
 */
export const signInWithGoogle = async () => {
  if (!NativeGoogleAuth) {
    throw new Error('Google Sign-In native module is not available.');
  }

  const account = await NativeGoogleAuth.signIn();

  if (!account || !account.email) {
    throw new Error('No account was selected.');
  }

  const email = account.email;
  const name =
    account.name ||
    email
      .split('@')[0]
      .replace(/[._\d]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Google User';

  const photoUrl =
    account.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=4285F4&color=fff&size=512&rounded=true&bold=true`;

  let loggedInUser = null;

  try {
    const response = await authAPI.googleLogin({
      email,
      name,
      profileImage: photoUrl,
      userTitle: 'React Native Developer',
    });
    if (response && response.user) {
      loggedInUser = response.user;
    }
  } catch (apiErr) {
    console.warn(
      'Backend server offline, logging in locally with selected Google account:',
      apiErr.message
    );
    loggedInUser = {
      id: account.id || email,
      email,
      name,
      profileImage: photoUrl,
      photoUrl,
      userTitle: 'React Native Developer',
      streak: 1,
    };
  }

  if (loggedInUser) {
    loggedInUser.profileImage = photoUrl;
    loggedInUser.photoUrl = photoUrl;
    await saveUserSession(loggedInUser);
    await AsyncStorage.setItem('profileImage', photoUrl);
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(`Signed in as ${name} 👋`, ToastAndroid.SHORT);
  }

  return loggedInUser;
};

export const signOutGoogle = async () => {
  if (NativeGoogleAuth && NativeGoogleAuth.signOut) {
    try {
      await NativeGoogleAuth.signOut();
    } catch (_) {}
  }
};
