/**
 * String utility functions
 */

/**
 * Pluralize a word based on count
 * @param {string} word - The word to pluralize
 * @param {number} count - The count to check
 * @param {string} suffix - The suffix to add (default: 's')
 * @returns {string} Pluralized word
 */
export const pluralize = (word, count, suffix = 's') => {
  return Number(count) === 1 ? word : `${word}${suffix}`;
};

/**
 * Format a count with pluralized word
 * @param {number} count - The count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, will add 's' if not provided)
 * @returns {string} Formatted string like "3 houses" or "1 house"
 */
export const formatCount = (count, singular, plural) => {
  const numericCount = Number(count);
  const word = numericCount === 1 ? singular : (plural || `${singular}s`);
  return `${numericCount} ${word}`;
};

/**
 * Normalize a phase string value to 'A' | 'B' | 'C' or null
 * Handles both old array format ["A"] and new string format "A", "BAC", etc.
 * @param {string|string[]} value
 * @returns {'A'|'B'|'C'|null}
 */
export const normalizePhase = (value) => {
  if (!value) return null;
  
  // Handle array format (old format)
  if (Array.isArray(value)) {
    const raw = value.length > 0 ? value[0] : null;
    const normalized = (raw || '').toString().trim().toUpperCase();
    return normalized === 'A' || normalized === 'B' || normalized === 'C' ? normalized : null;
  }
  
  // Handle string format (new format)
  const normalized = value.toString().trim().toUpperCase();
  
  // For single character phases (A, B, C)
  if (normalized === 'A' || normalized === 'B' || normalized === 'C') {
    return normalized;
  }
  
  // For multi-character phases (BAC, BCA, ACB, etc.), return the first character
  if (normalized.length > 0) {
    const firstChar = normalized[0];
    if (firstChar === 'A' || firstChar === 'B' || firstChar === 'C') {
      return firstChar;
    }
  }
  
  return null;
};