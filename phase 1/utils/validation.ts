/**
 * Centralized Validation Utilities for OnePlace Application
 * Frontend and Backend Validation Rules
 */

// Indian Mobile Number: Exactly 10 digits starting with 6-9
export const PHONE_REGEX = /^[6-9][0-9]{9}$/;

// Indian PIN Code: Exactly 6 digits starting with 1-9
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Password Policy Rules:
// - At least 8 characters
// - At least 1 uppercase letter (A-Z)
// - At least 1 lowercase letter (a-z)
// - At least 1 digit (0-9)
// - At least 1 special character (including hyphen)
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
export const PASSWORD_DIGIT_REGEX = /[0-9]/;
export const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Email format
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Address format: Allows letters, numbers, spaces, commas, dots, hyphens, slashes, hashes
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s,.\-/#]{3,200}$/;

// City format: Allows letters, spaces, hyphens, dots
export const CITY_REGEX = /^[a-zA-Z\s.\-]{2,50}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

/**
 * Validates Indian 10-digit mobile number
 */
export function validatePhone(phone: string): ValidationResult {
  const cleaned = (phone || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'Mobile phone number is required.' };
  }
  if (!PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 10-digit Indian mobile number.' };
  }
  return { isValid: true };
}

/**
 * Validates password strength against policy
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const str = password || '';
  const hasMinLength = str.length >= PASSWORD_MIN_LENGTH;
  const hasUppercase = PASSWORD_UPPERCASE_REGEX.test(str);
  const hasLowercase = PASSWORD_LOWERCASE_REGEX.test(str);
  const hasDigit = PASSWORD_DIGIT_REGEX.test(str);
  const hasSpecial = PASSWORD_SPECIAL_REGEX.test(str);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
    isValid,
  };
}

/**
 * Validates password with user-friendly error message
 */
export function validatePassword(password: string): ValidationResult {
  const strength = checkPasswordStrength(password);
  if (!strength.isValid) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters and contain uppercase letters, lowercase letters, numbers, and special characters.',
    };
  }
  return { isValid: true };
}

/**
 * Validates confirm password match
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true };
}

/**
 * Validates Indian PIN code
 */
export function validatePincode(pincode: string): ValidationResult {
  const cleaned = (pincode || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'PIN code is required.' };
  }
  if (!PINCODE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 6-digit PIN code.' };
  }
  return { isValid: true };
}

/**
 * Validates city name
 */
export function validateCity(city: string): ValidationResult {
  const cleaned = (city || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'Please enter your city.' };
  }
  if (cleaned.length < 2 || cleaned.length > 50) {
    return { isValid: false, error: 'City name must be between 2 and 50 characters.' };
  }
  if (!CITY_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid city name.' };
  }
  return { isValid: true };
}

/**
 * Validates address string
 */
export function validateAddress(address: string): ValidationResult {
  const cleaned = (address || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'Please enter a valid address.' };
  }
  if (cleaned.length < 5 || cleaned.length > 200) {
    return { isValid: false, error: 'Address must be between 5 and 200 characters.' };
  }
  if (!ADDRESS_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Address contains invalid characters.' };
  }
  return { isValid: true };
}

/**
 * Validates email address
 */
export function validateEmail(email: string): ValidationResult {
  const cleaned = (email || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!EMAIL_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

/**
 * Validates full name
 */
export function validateFullName(name: string): ValidationResult {
  const cleaned = (name || '').trim();
  if (!cleaned) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (cleaned.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long.' };
  }
  return { isValid: true };
}
