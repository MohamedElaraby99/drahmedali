import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import userModel from '../models/user.model.js';
import UserDevice from '../models/userDevice.model.js';
import { generateDeviceFingerprint, parseDeviceInfo } from '../utils/deviceUtils.js';

const isLoggedIn = async (req, res, next) => {
    console.log('=== IS LOGGED IN MIDDLEWARE ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Cookies:', req.cookies);
    console.log('Full URL:', req.originalUrl);
    
    const { token } = req.cookies;

    if (!token) {
        console.log('No token found in cookies');
        return next(new AppError("لازم تسجل دخول الأول عشان تكمل", 400))
    }

    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded user details:', userDetails);
        console.log('User role from JWT:', userDetails.role);
        req.user = userDetails;
        console.log('Set req.user:', req.user);
        next();
    } catch (error) {
        console.log('JWT verification failed:', error.message);
        return next(new AppError("الرمز غير صالح، يرجى تسجيل الدخول مرة أخرى", 400));
    }
}

// authorised roles
const authorisedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;
    console.log('=== AUTHORISED ROLES CHECK ===');
    console.log('Current user role:', currentUserRoles);
    console.log('Required roles:', roles);
    console.log('User object:', req.user);
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    
    // SUPER_ADMIN has access to all admin routes
    if (currentUserRoles === 'SUPER_ADMIN') {
        console.log('ACCESS GRANTED: User is SUPER_ADMIN');
        return next();
    }
    
    if (!roles.includes(currentUserRoles)) {
        console.log('ACCESS DENIED: User role not in required roles');
        return next(new AppError("ليس لديك صلاحية للوصول إلى هذه الطريقة", 403))
    }
    console.log('ACCESS GRANTED: User has required role');
    next();
}

const authorizeSubscriber = async (req, res, next) => {
    const {role, id} = req.user; 
    console.log('=== AUTHORIZE SUBSCRIBER CHECK ===');
    console.log('User role:', role);
    console.log('User ID:', id);
    
    const user = await userModel.findById(id);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
        console.log('User not found in database');
        return next(new AppError('المستخدم غير موجود', 404));
    }
    
    const subscriptionStatus = user.subscription?.status;
    console.log('Subscription status:', subscriptionStatus);
    console.log('User subscription object:', user.subscription);
    
    // For now, allow all logged-in users to access courses (temporary fix)
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role) && subscriptionStatus !== 'active') {
        console.log('ACCESS DENIED: User needs subscription, but allowing access for now');
        // return next(
        //     new AppError('Please subscribce to access this route!', 403)
        // )
    }
    
    console.log('ACCESS GRANTED: User has valid subscription or is admin');
    next();
}

// Device verification middleware
const checkDeviceAuthorization = async (req, res, next) => {
    console.log('=== DEVICE AUTHORIZATION CHECK ===');
    
    // Skip device check for device management routes to avoid circular dependency
    if (req.originalUrl.includes('/device-management/')) {
        console.log('Skipping device check for device management routes');
        return next();
    }

    // Skip device check for admin users
    if (req.user && ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        console.log('Skipping device check for admin user');
        return next();
    }

    try {
        const userId = req.user._id || req.user.id;
        
        // Generate device fingerprint for current request
        const deviceFingerprint = generateDeviceFingerprint(req, {
            platform: req.get('X-Device-Platform') || '',
            screenResolution: req.get('X-Screen-Resolution') || '',
            timezone: req.get('X-Timezone') || ''
        });

        console.log('Checking device authorization for user:', userId);
        console.log('Device fingerprint:', deviceFingerprint);

        // Check if device is authorized
        const authorizedDevice = await UserDevice.findOne({
            user: userId,
            deviceFingerprint,
            isActive: true
        });

        if (!authorizedDevice) {
            console.log('Device not authorized');
            return next(new AppError(
                "هذا الجهاز غير مصرح له بالوصول. يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة المصرحة",
                403,
                "DEVICE_NOT_AUTHORIZED"
            ));
        }

        // Update last activity
        authorizedDevice.lastActivity = new Date();
        await authorizedDevice.save();

        console.log('Device authorized successfully');
        next();

    } catch (error) {
        console.error('Error in device authorization check:', error);
        // Don't block access if there's an error with device checking
        console.log('Device check failed, allowing access due to system error');
        next();
    }
};

// Admin role check middleware
const requireAdmin = async (req, res, next) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return next(new AppError("ليس لديك صلاحية للوصول إلى هذه الطريقة", 403));
    }
    next();
};

export {
    isLoggedIn,
    authorisedRoles,
    authorizeSubscriber,
    checkDeviceAuthorization,
    requireAdmin
}