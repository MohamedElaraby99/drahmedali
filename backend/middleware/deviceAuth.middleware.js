import { ApiError } from "../utils/ApiError.js";
import UserDevice from "../models/userDevice.model.js";
import { generateDeviceFingerprint } from "../utils/deviceUtils.js";

/**
 * Middleware to check device authorization on every authenticated request
 * This ensures that only authorized devices can access protected resources
 */
export const checkDeviceAuthorization = async (req, res, next) => {
    try {
        // Skip device check for admin users
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Skip device check for non-authenticated routes
        if (!req.user) {
            return next();
        }

        // Skip device check in development environment
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
            console.log('Skipping device authorization check in development environment');
            return next();
        }

        const { deviceInfo } = req.body;
        
        if (!deviceInfo) {
            // If no device info in body, try to get from headers (for GET requests)
            const deviceInfoHeader = req.headers['x-device-info'];
            if (deviceInfoHeader) {
                try {
                    req.body.deviceInfo = JSON.parse(deviceInfoHeader);
                } catch (e) {
                    console.log('Failed to parse device info from header');
                }
            }
        }

        if (!req.body.deviceInfo) {
            // For non-authentication routes, we'll be more lenient
            // but still log the attempt
            console.log('Device info missing for user:', req.user._id, 'on route:', req.originalUrl);
            return next();
        }

        // Generate device fingerprint
        const deviceFingerprint = generateDeviceFingerprint(req, req.body.deviceInfo);
        
        // Check if device is authorized
        const device = await UserDevice.findOne({
            user: req.user._id,
            deviceFingerprint,
            isActive: true
        });

        if (!device) {
            return next(new ApiError(
                403,
                "هذا الجهاز غير مصرح له بالوصول. يرجى تسجيل الدخول مرة أخرى.",
                "DEVICE_NOT_AUTHORIZED"
            ));
        }

        // Update last activity
        device.lastActivity = new Date();
        await device.save();

        // Add device info to request for use in controllers
        req.currentDevice = device;
        
        next();
    } catch (error) {
        console.error('Device authorization check error:', error);
        // Continue with request if device check fails (fallback)
        next();
    }
};

/**
 * Middleware to log device access attempts
 */
export const logDeviceAccess = (req, res, next) => {
    if (req.user && req.currentDevice) {
        console.log(`Device ${req.currentDevice._id} accessed ${req.originalUrl} for user ${req.user._id}`);
    }
    next();
};
