import { z } from 'zod';

/**
 * Helper functions untuk validasi email yang lebih fleksibel
 * Berguna untuk handle email yang sudah ada di database yang mungkin tidak valid
 */

// Email schema yang strict (untuk registrasi baru)
export const strictEmailSchema = z.string()
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter')
  .toLowerCase()
  .trim();

// Email schema yang lebih fleksibel (untuk existing data)
export const flexibleEmailSchema = z.string()
  .max(255, 'Email maksimal 255 karakter')
  .refine((email) => {
    if (!email || email.trim() === '') return false;
    // Basic email format check (less strict)
    // Allow emails that might have been manually entered
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return basicEmailRegex.test(email.trim().toLowerCase());
  }, {
    message: 'Format email tidak valid'
  });

/**
 * Normalize email (trim, lowercase, remove extra spaces)
 * @param {string} email - Email to normalize
 * @returns {string} - Normalized email
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  
  let normalized = email.trim().toLowerCase();
  // Remove multiple spaces
  normalized = normalized.replace(/\s+/g, ' ');
  // Remove spaces around @
  normalized = normalized.replace(/\s*@\s*/g, '@');
  
  return normalized;
}

/**
 * Try to fix invalid email
 * @param {string} email - Email to fix
 * @returns {string|null} - Fixed email or null if cannot be fixed
 */
export function tryFixEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  const normalized = normalizeEmail(email);
  
  // Validate normalized email
  const validation = strictEmailSchema.safeParse(normalized);
  
  if (validation.success) {
    return normalized;
  }
  
  return null;
}

/**
 * Check if email is valid according to strict schema
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const validation = strictEmailSchema.safeParse(email);
  return validation.success;
}

