import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTopInset = () => {
  const { top } = useSafeAreaInsets();
  return Math.max(top, 8);
};
