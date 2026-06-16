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

export const validateName = (name: string): boolean => {
  // Only letters and spaces (including Spanish letters with accents/ñ)
  const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
  return nameRegex.test(name.trim());
};

export const validatePhone = (phone: string): boolean => {
  // must be exactly 9 digits
  const phoneRegex = /^\d{9}$/;
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
