import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';
import { colors } from '../theme/theme';

/**
 * Custom hook to manage current user profile state with local cache fallback
 */
export const useUser = () => {
  const [user, setUser] = useState({
    id: null,
    name: 'Alex',
    email: '',
    userTitle: 'React Native Developer',
    avatarColor: colors.brand.primary,
    profileImage: null,
    streak: 1,
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const storedName = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedTitle = await AsyncStorage.getItem('userTitle');
      const storedColor = await AsyncStorage.getItem('avatarColor');
      const storedImage = await AsyncStorage.getItem('profileImage');
      const storedStreak = await AsyncStorage.getItem('streak');

      setUser((prev) => ({
        ...prev,
        id: storedId || prev.id,
        name: storedName || prev.name,
        email: storedEmail || prev.email,
        userTitle: storedTitle || prev.userTitle,
        avatarColor: storedColor || prev.avatarColor,
        profileImage: storedImage || prev.profileImage,
        streak: storedStreak ? parseInt(storedStreak, 10) : prev.streak,
      }));

      if (storedId) {
        try {
          const res = await userAPI.getProfile(storedId);
          if (res?.user) {
            const u = res.user;
            if (u.streak != null) {
              await AsyncStorage.setItem('streak', String(u.streak));
            }
            if (u.lastActiveDate) {
              await AsyncStorage.setItem('lastActiveDate', String(u.lastActiveDate));
            }
            setUser((prev) => ({
              ...prev,
              name: u.name || prev.name,
              userTitle: u.userTitle || prev.userTitle,
              avatarColor: u.avatarColor || prev.avatarColor,
              profileImage: u.profileImage || prev.profileImage,
              streak: u.streak != null ? u.streak : prev.streak,
            }));
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('useUser load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return { user, loading, refreshUser };
};

export default useUser;
