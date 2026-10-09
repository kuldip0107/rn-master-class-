/**
 * Formatting Utilities
 */

export const formatDate = (date = new Date(), locale = 'en-GB') => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (_) {
    return '';
  }
};

export const formatXP = (xp = 0) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k XP`;
  }
  return `${xp} XP`;
};

export const formatStreak = (streak = 1) => {
  return `${streak} Day${streak !== 1 ? 's' : ''}`;
};
