export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required.';
  const len = name.trim().length;
  if (len < 20) return 'Name must be at least 20 characters.';
  if (len > 60) return 'Name must not exceed 60 characters.';
  return '';
}

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 16) return 'Password must not exceed 16 characters.';
  if (!PASSWORD_REGEX.test(password))
    return 'Password must contain at least one uppercase letter and one special character.';
  return '';
}

export function validateAddress(address) {
  if (!address || !address.trim()) return 'Address is required.';
  if (address.trim().length > 400) return 'Address must not exceed 400 characters.';
  return '';
}

export function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) return 'Rating must be between 1 and 5.';
  return '';
}
