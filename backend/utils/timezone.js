import moment from 'moment-timezone';

// Cairo timezone identifier
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Get current time in Cairo timezone
 * @returns {Date} Current date/time in Cairo timezone
 */
export const getCairoNow = () => {
  return moment.tz(CAIRO_TIMEZONE).toDate();
};

/**
 * Convert any date to Cairo timezone
 * @param {Date|string|moment} date - Date to convert
 * @returns {Date} Date converted to Cairo timezone
 */
export const toCairoTime = (date) => {
  if (!date) return getCairoNow();
  return moment.tz(date, CAIRO_TIMEZONE).toDate();
};

/**
 * Create a new date in Cairo timezone
 * @param {string|number} dateString - Date string or timestamp
 * @returns {Date} Date created in Cairo timezone
 */
export const createCairoDate = (dateString) => {
  if (!dateString) return getCairoNow();
  return moment.tz(dateString, CAIRO_TIMEZONE).toDate();
};

/**
 * Get start of day in Cairo timezone
 * @param {Date|string} date - Optional date, defaults to today
 * @returns {Date} Start of day in Cairo timezone
 */
export const getCairoStartOfDay = (date) => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).startOf('day').toDate();
};

/**
 * Get end of day in Cairo timezone
 * @param {Date|string} date - Optional date, defaults to today
 * @returns {Date} End of day in Cairo timezone
 */
export const getCairoEndOfDay = (date) => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).endOf('day').toDate();
};

/**
 * Get start of month in Cairo timezone
 * @param {Date|string} date - Optional date, defaults to this month
 * @returns {Date} Start of month in Cairo timezone
 */
export const getCairoStartOfMonth = (date) => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).startOf('month').toDate();
};

/**
 * Get end of month in Cairo timezone
 * @param {Date|string} date - Optional date, defaults to this month
 * @returns {Date} End of month in Cairo timezone
 */
export const getCairoEndOfMonth = (date) => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).endOf('month').toDate();
};

/**
 * Format date in Cairo timezone
 * @param {Date|string} date - Date to format
 * @param {string} format - Moment format string, defaults to 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} Formatted date string
 */
export const formatCairoDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).format(format);
};

/**
 * Check if a date is today in Cairo timezone
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today in Cairo timezone
 */
export const isCairoToday = (date) => {
  const today = moment.tz(CAIRO_TIMEZONE);
  const checkDate = moment.tz(date, CAIRO_TIMEZONE);
  return today.isSame(checkDate, 'day');
};

/**
 * Add time to a date in Cairo timezone
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit to add ('days', 'hours', 'minutes', etc.)
 * @returns {Date} New date with time added
 */
export const addCairoTime = (date, amount, unit) => {
  const baseDate = date || getCairoNow();
  return moment.tz(baseDate, CAIRO_TIMEZONE).add(amount, unit).toDate();
};

/**
 * Subtract time from a date in Cairo timezone
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit to subtract ('days', 'hours', 'minutes', etc.)
 * @returns {Date} New date with time subtracted
 */
export const subtractCairoTime = (date, amount, unit) => {
  const baseDate = date || getCairoNow();
  return moment.tz(baseDate, CAIRO_TIMEZONE).subtract(amount, unit).toDate();
};

/**
 * Get difference between two dates in Cairo timezone
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} unit - Unit for difference ('days', 'hours', 'minutes', etc.)
 * @returns {number} Difference between dates
 */
export const getCairoDifference = (date1, date2, unit = 'milliseconds') => {
  const moment1 = moment.tz(date1, CAIRO_TIMEZONE);
  const moment2 = moment.tz(date2, CAIRO_TIMEZONE);
  return moment1.diff(moment2, unit);
};

/**
 * Convert Cairo date to ISO string
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string representation
 */
export const toCairoISOString = (date) => {
  const targetDate = date || getCairoNow();
  return moment.tz(targetDate, CAIRO_TIMEZONE).toISOString();
};

/**
 * Create date range for queries in Cairo timezone
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} Object with start and end dates in Cairo timezone
 */
export const createCairoDateRange = (startDate, endDate) => {
  const start = startDate ? toCairoTime(startDate) : getCairoStartOfDay();
  const end = endDate ? toCairoTime(endDate) : getCairoEndOfDay();
  
  return {
    start: getCairoStartOfDay(start),
    end: getCairoEndOfDay(end)
  };
};

// Export the timezone constant for reference
export { CAIRO_TIMEZONE };

// Default export for convenience
export default {
  getCairoNow,
  toCairoTime,
  createCairoDate,
  getCairoStartOfDay,
  getCairoEndOfDay,
  getCairoStartOfMonth,
  getCairoEndOfMonth,
  formatCairoDate,
  isCairoToday,
  addCairoTime,
  subtractCairoTime,
  getCairoDifference,
  toCairoISOString,
  createCairoDateRange,
  CAIRO_TIMEZONE
};