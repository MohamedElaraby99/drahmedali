import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to ensure device fingerprinting is present in authentication requests
 * This helps prevent unauthorized access and ensures proper device tracking
 */
export const requireDeviceFingerprint = (req, res, next) => {
    console.log('=== DEVICE FINGERPRINT MIDDLEWARE DEBUG ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body type:', typeof req.body);
    console.log('Full request body:', req.body);
    console.log('Device info from body:', req.body.deviceInfo);
    console.log('Device info type:', typeof req.body.deviceInfo);
    console.log('=== END DEBUG ===');
    
    const { deviceInfo } = req.body;
    
    if (!deviceInfo) {
        return next(new ApiError(
            400, 
            "Device information is required for security purposes. Please enable JavaScript and try again.",
            "DEVICE_INFO_MISSING"
        ));
    }
    
    // Validate basic device info structure
    if (!deviceInfo.platform || !deviceInfo.screenResolution || !deviceInfo.timezone) {
        return next(new ApiError(
            400, 
            "Invalid device information format. Please refresh the page and try again.",
            "INVALID_DEVICE_INFO"
        ));
    }
    
    next();
};

/**
 * Middleware to log device fingerprinting attempts for security monitoring
 */
export const logDeviceFingerprint = (req, res, next) => {
    const { deviceInfo } = req.body;
    
    if (deviceInfo) {
        console.log('=== DEVICE FINGERPRINT LOG ===');
        console.log('Endpoint:', req.originalUrl);
        console.log('Method:', req.method);
        console.log('User Agent:', req.get('User-Agent'));
        console.log('IP Address:', req.ip);
        console.log('Device Platform:', deviceInfo.platform);
        console.log('Screen Resolution:', deviceInfo.screenResolution);
        console.log('Timezone:', deviceInfo.timezone);
        console.log('Timestamp:', new Date().toISOString());
        console.log('================================');
    }
    
    next();
};
