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
  return count === 1 ? word : `${word}${suffix}`;
};

/**
 * Format a count with pluralized word
 * @param {number} count - The count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, will add 's' if not provided)
 * @returns {string} Formatted string like "3 houses" or "1 house"
 */
export const formatCount = (count, singular, plural) => {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
};
