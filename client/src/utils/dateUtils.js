/**
 * Calculate remaining days until a given date
 * @param {Date|string} endDate - The end date to calculate from
 * @returns {number} - Number of days remaining (can be negative if expired)
 */
export const calculateRemainingDays = (endDate) => {
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  
  // Reset time to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

/**
 * Format remaining days into a human-readable string
 * @param {number} remainingDays - Number of days remaining
 * @returns {string} - Formatted string in Arabic
 */
export const formatRemainingDays = (remainingDays) => {
  if (remainingDays === null || remainingDays === undefined) return '';
  
  if (remainingDays < 0) {
    return 'انتهت صلاحية الوصول';
  } else if (remainingDays === 0) {
    return 'ينتهي الوصول اليوم';
  } else if (remainingDays === 1) {
    return 'ينتهي الوصول غداً';
  } else if (remainingDays <= 7) {
    return `ينتهي الوصول خلال ${remainingDays} أيام`;
  } else if (remainingDays <= 30) {
    const weeks = Math.ceil(remainingDays / 7);
    return `ينتهي الوصول خلال ${weeks} أسابيع`;
  } else {
    const months = Math.ceil(remainingDays / 30);
    return `ينتهي الوصول خلال ${months} أشهر`;
  }
};

/**
 * Get CSS class for remaining days styling
 * @param {number} remainingDays - Number of days remaining
 * @returns {string} - CSS class name
 */
export const getRemainingDaysClass = (remainingDays) => {
  if (remainingDays === null || remainingDays === undefined) return '';
  
  if (remainingDays < 0) {
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  } else if (remainingDays <= 3) {
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
  } else if (remainingDays <= 7) {
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
  } else {
    return 'text-green-600 bg-green-50 dark:bg-green-900/20';
  }
};
