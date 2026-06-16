export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // 6+ characters, 1 uppercase, 1 number
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
};

export const validatePhone = (phone: string): boolean => {
  // basic validation (at least 7 numbers)
  const phoneRegex = /^\+?[\d\s-]{7,15}$/;
  return phoneRegex.test(phone.trim());
};

export const validateUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};
