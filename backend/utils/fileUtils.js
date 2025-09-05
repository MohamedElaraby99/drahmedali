/**
 * Utility functions for handling file URLs and uploads
 */

/**
 * Generate the correct file URL based on environment
 * @param {string} filename - The filename in the uploads directory
 * @param {string} subfolder - Optional subfolder within uploads (e.g., 'avatars', 'pdfs')
 * @returns {string} Complete URL to access the file
 */
export const generateFileUrl = (filename, subfolder = '') => {
  if (!filename) return null;
  
  // Get the base URL from environment variables
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4007}`;
  
  // Build the path
  let path = '/api/v1/uploads/';
  if (subfolder) {
    path += `${subfolder}/`;
  }
  path += filename;
  
  return `${baseUrl}${path}`;
};

/**
 * Generate file URL for production domain
 * @param {string} filename 
 * @param {string} subfolder 
 * @returns {string}
 */
export const generateProductionFileUrl = (filename, subfolder = '') => {
  if (!filename) return null;
  
  // Always use production domain for now to ensure consistency
  const baseUrl = process.env.PRODUCTION_URL || 'https://api.almongz.online';
  
  let path = '/api/v1/uploads/';
  if (subfolder) {
    path += `${subfolder}/`;
  }
  path += filename;
  
  const fullUrl = `${baseUrl}${path}`;
  
  // Debug logging
  console.log('generateProductionFileUrl:', {
    filename,
    subfolder,
    baseUrl,
    path,
    fullUrl,
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_URL: process.env.BACKEND_URL
  });
  
  return fullUrl;
};

/**
 * Extract filename from a full path or URL
 * @param {string} pathOrUrl 
 * @returns {string}
 */
export const extractFilename = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  return pathOrUrl.split('/').pop();
};

/**
 * Check if a file path is a Cloudinary URL
 * @param {string} url 
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  return url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'));
};

/**
 * Generate appropriate file URL (Cloudinary URLs remain unchanged, local files get proper API URLs)
 * @param {string} filePathOrUrl 
 * @param {string} subfolder 
 * @returns {string}
 */
export const generateAppropriateFileUrl = (filePathOrUrl, subfolder = '') => {
  if (!filePathOrUrl) return null;
  
  // If it's already a Cloudinary URL, return as is
  if (isCloudinaryUrl(filePathOrUrl)) {
    return filePathOrUrl;
  }
  
  // If it's already a full URL, return as is
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl;
  }
  
  // Otherwise, generate the proper API URL
  const filename = extractFilename(filePathOrUrl);
  return generateProductionFileUrl(filename, subfolder);
};
