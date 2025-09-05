/**
 * Frontend Timezone Utilities for Cairo
 * Ensures consistent Cairo timezone handling across the frontend application
 */

// Cairo timezone identifier
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Get current time in Cairo timezone
 * @returns {Date} Current date/time in Cairo timezone
 */
export const getCairoNow = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: CAIRO_TIMEZONE }));
};

/**
 * Convert any date to Cairo timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date converted to Cairo timezone
 */
export const toCairoTime = (date) => {
  if (!date) return getCairoNow();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  return new Date(inputDate.toLocaleString("en-US", { timeZone: CAIRO_TIMEZONE }));
};

/**
 * Format date in Cairo timezone with Arabic locale
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in Arabic
 */
export const formatCairoDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CAIRO_TIMEZONE,
    ...options
  };
  
  const targetDate = date ? new Date(date) : getCairoNow();
  return targetDate.toLocaleDateString('ar-EG', defaultOptions);
};

/**
 * Format date in Cairo timezone with English locale
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in English
 */
export const formatCairoDateEN = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CAIRO_TIMEZONE,
    ...options
  };
  
  const targetDate = date ? new Date(date) : getCairoNow();
  return targetDate.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format time only in Cairo timezone
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatCairoTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: CAIRO_TIMEZONE,
    ...options
  };
  
  const targetDate = date ? new Date(date) : getCairoNow();
  return targetDate.toLocaleTimeString('ar-EG', defaultOptions);
};

/**
 * Get Cairo timestamp for QR codes and API calls
 * @param {Date|string} date - Optional date, defaults to now
 * @returns {string} ISO string in Cairo timezone
 */
export const getCairoTimestamp = (date) => {
  const cairoDate = date ? toCairoTime(date) : getCairoNow();
  return cairoDate.toISOString();
};

/**
 * Check if a date is today in Cairo timezone
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today in Cairo timezone
 */
export const isCairoToday = (date) => {
  const today = getCairoNow();
  const checkDate = toCairoTime(date);
  
  return today.toDateString() === checkDate.toDateString();
};

/**
 * Get relative time string in Arabic
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string in Arabic
 */
export const getRelativeTimeArabic = (date) => {
  const now = getCairoNow();
  const targetDate = toCairoTime(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنة`;
};

/**
 * Create date range for API queries in Cairo timezone
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} Object with start and end dates
 */
export const createCairoDateRange = (startDate, endDate) => {
  const start = startDate ? toCairoTime(startDate) : getCairoNow();
  const end = endDate ? toCairoTime(endDate) : getCairoNow();
  
  // Set to start and end of day
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString()
  };
};

/**
 * Get month boundaries in Cairo timezone
 * @param {Date|string} date - Optional date, defaults to current month
 * @returns {Object} Object with month start and end dates
 */
export const getCairoMonthRange = (date) => {
  const targetDate = date ? toCairoTime(date) : getCairoNow();
  
  const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

/**
 * Convert browser timezone to Cairo for display purposes
 * @param {Date|string} date - Date in any timezone
 * @returns {string} Display string showing both local and Cairo time
 */
export const showCairoTime = (date) => {
  const inputDate = new Date(date);
  const cairoTime = formatCairoDate(inputDate, { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  return `${cairoTime} (توقيت القاهرة)`;
};

// Export timezone constant
export { CAIRO_TIMEZONE };

// Default export for convenience
export default {
  getCairoNow,
  toCairoTime,
  formatCairoDate,
  formatCairoDateEN,
  formatCairoTime,
  getCairoTimestamp,
  isCairoToday,
  getRelativeTimeArabic,
  createCairoDateRange,
  getCairoMonthRange,
  showCairoTime,
  CAIRO_TIMEZONE
};