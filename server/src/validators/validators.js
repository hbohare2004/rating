const NAME_MIN = 20;
const NAME_MAX = 60;
const ADDRESS_MAX = 400;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`;
  if (trimmed.length > NAME_MAX) return `Name must not exceed ${NAME_MAX} characters.`;
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Password must not exceed ${PASSWORD_MAX} characters.`;
  if (!PASSWORD_REGEX.test(password))
    return 'Password must contain at least one uppercase letter and one special character.';
  return null;
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') return 'Address is required.';
  if (address.trim().length > ADDRESS_MAX) return `Address must not exceed ${ADDRESS_MAX} characters.`;
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) return 'Rating must be an integer between 1 and 5.';
  return null;
}

function validateRole(role) {
  const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) return `Role must be one of: ${validRoles.join(', ')}.`;
  return null;
}

/**
 * Runs an array of { field, error } checks. Returns the first error found, or null.
 */
function runValidations(checks) {
  for (const { error } of checks) {
    if (error) return error;
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
  validateRole,
  runValidations,
};
