/**
 * Generate device fingerprint on the client side
 * @returns {Object} Device information for fingerprinting
 */
export const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        touchSupport: 'ontouchstart' in window,
        canvas: canvas.toDataURL(),
        webgl: getWebGLFingerprint(),
        plugins: getPluginsFingerprint(),
        mimeTypes: getMimeTypesFingerprint()
    };
};

/**
 * Get WebGL fingerprint
 * @returns {String} WebGL fingerprint
 */
const getWebGLFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'WebGL not supported';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        return `${vendor}~${renderer}`;
    } catch (e) {
        return 'WebGL error';
    }
};

/**
 * Get plugins fingerprint
 * @returns {String} Plugins fingerprint
 */
const getPluginsFingerprint = () => {
    try {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            const plugin = navigator.plugins[i];
            plugins.push(`${plugin.name}~${plugin.version}~${plugin.description}`);
        }
        return plugins.sort().join('|');
    } catch (e) {
        return 'Plugins unavailable';
    }
};

/**
 * Get MIME types fingerprint
 * @returns {String} MIME types fingerprint
 */
const getMimeTypesFingerprint = () => {
    try {
        const mimeTypes = [];
        for (let i = 0; i < navigator.mimeTypes.length; i++) {
            const mimeType = navigator.mimeTypes[i];
            mimeTypes.push(`${mimeType.type}~${mimeType.suffixes}`);
        }
        return mimeTypes.sort().join('|');
    } catch (e) {
        return 'MIME types unavailable';
    }
};

/**
 * Get device type based on screen size and user agent
 * @returns {String} Device type: 'Mobile', 'Tablet', or 'Desktop'
 */
export const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    const screenWidth = screen.width;
    
    if (/iPhone|iPod/.test(userAgent)) return 'Mobile';
    if (/iPad/.test(userAgent)) return 'Tablet';
    if (/Android/.test(userAgent)) {
        return screenWidth < 768 ? 'Mobile' : 'Tablet';
    }
    
    return screenWidth < 768 ? 'Mobile' : 
           screenWidth < 1024 ? 'Tablet' : 'Desktop';
};

/**
 * Get browser information
 * @returns {Object} Browser name and version
 */
export const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
        const match = userAgent.match(/Chrome\/([0-9]+)/);
        version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        const match = userAgent.match(/Firefox\/([0-9]+)/);
        version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        const match = userAgent.match(/Version\/([0-9]+)/);
        version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
        const match = userAgent.match(/Edg\/([0-9]+)/);
        version = match ? match[1] : 'Unknown';
    }
    
    return { browser, version };
};

/**
 * Get operating system information
 * @returns {String} Operating system name
 */
export const getOperatingSystem = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X')) {
        const match = userAgent.match(/Mac OS X ([0-9_]+)/);
        return match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
    }
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) {
        const match = userAgent.match(/Android ([0-9.]+)/);
        return match ? `Android ${match[1]}` : 'Android';
    }
    if (userAgent.includes('iPhone OS')) {
        const match = userAgent.match(/iPhone OS ([0-9_]+)/);
        return match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    }
    
    return 'Unknown OS';
};

/**
 * Generate a human-readable device name
 * @returns {String} Device name
 */
export const generateDeviceName = () => {
    const deviceType = getDeviceType();
    const { browser } = getBrowserInfo();
    const os = getOperatingSystem();
    
    return `${os} ${deviceType} (${browser})`;
};
