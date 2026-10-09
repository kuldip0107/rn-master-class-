/**
 * Input Validation Utilities
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};
