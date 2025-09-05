import crypto from 'crypto';

/**
 * Generate a device fingerprint based on request headers and client info
 * @param {Object} req - Express request object
 * @param {Object} deviceInfo - Additional device information from client
 * @returns {String} - Unique device fingerprint
 */
export const generateDeviceFingerprint = (req, deviceInfo = {}) => {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';
    
    // Combine various factors for fingerprinting
    const fingerprintData = [
        userAgent,
        ip,
        acceptLanguage,
        acceptEncoding,
        deviceInfo.platform || '',
        deviceInfo.screenResolution || '',
        deviceInfo.timezone || ''
    ].join('|');
    
    // Create hash
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
};

/**
 * Parse user agent to extract device information
 * @param {String} userAgent - User agent string
 * @returns {Object} - Parsed device information
 */
export const parseDeviceInfo = (userAgent) => {
    if (!userAgent) return {};
    
    const info = {
        userAgent,
        browser: 'Unknown',
        os: 'Unknown',
        platform: 'Unknown'
    };
    
    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        info.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        info.browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        info.browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
        info.browser = 'Edge';
    }
    
    // Detect OS
    if (userAgent.includes('Windows')) {
        info.os = 'Windows';
        info.platform = 'Desktop';
    } else if (userAgent.includes('Mac')) {
        info.os = 'macOS';
        info.platform = 'Desktop';
    } else if (userAgent.includes('Linux')) {
        info.os = 'Linux';
        info.platform = 'Desktop';
    } else if (userAgent.includes('Android')) {
        info.os = 'Android';
        info.platform = 'Mobile';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        info.os = 'iOS';
        info.platform = userAgent.includes('iPad') ? 'Tablet' : 'Mobile';
    }
    
    return info;
};

/**
 * Generate a human-readable device name
 * @param {Object} deviceInfo - Device information object
 * @returns {String} - Human-readable device name
 */
export const generateDeviceName = (deviceInfo) => {
    const { browser, os, platform } = deviceInfo;
    
    if (platform === 'Mobile') {
        return `${os} Mobile (${browser})`;
    } else if (platform === 'Tablet') {
        return `${os} Tablet (${browser})`;
    } else {
        return `${os} Desktop (${browser})`;
    }
};
