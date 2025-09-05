import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // Debug logging
  console.log('🔧 API URL Configuration:', {
    isDev: import.meta.env.DEV,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    NODE_ENV: import.meta.env.MODE,
    envApiUrl: import.meta.env.VITE_REACT_APP_API_URL
  });

  // Check for environment variable first
  if (import.meta.env.VITE_REACT_APP_API_URL) {
    const envUrl = import.meta.env.VITE_REACT_APP_API_URL;
    console.log('✅ Using environment API URL:', envUrl);
    return envUrl;
  }

  // For development, always use localhost
  if (import.meta.env.DEV || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' ||
      window.location.port === '5190') {
    const devUrl = 'http://localhost:4007/api/v1';
    console.log('✅ Using development API URL:', devUrl);
    return devUrl;
  }
  
  // Production fallback
  const prodUrl = 'https://api.almongz.online/api/v1';
  console.log('🌐 Using production API URL:', prodUrl);
  return prodUrl;
};

const BASE_URL = getBaseUrl();

console.log('🚀 Axios Instance Created with BASE_URL:', BASE_URL);

// Create axios instance with proper CORS configuration
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Keep this for authentication
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to include device info in headers for cross-domain requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Add device info to headers for cross-domain requests
        if (!import.meta.env.DEV && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                // Generate basic device info for cross-domain requests
                const deviceInfo = {
                    platform: navigator.platform || 'unknown',
                    screenResolution: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    userAgent: navigator.userAgent
                };
                
                config.headers['x-device-info'] = JSON.stringify(deviceInfo);
            } catch (error) {
                console.log('Failed to add device info to headers:', error);
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('DEVICE_NOT_AUTHORIZED')) {
            // Handle device authorization errors
            console.error('Device not authorized:', error.response.data);
            // You could redirect to login or show a device authorization message
        }
        return Promise.reject(error);
    }
);