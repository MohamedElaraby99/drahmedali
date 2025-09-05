import UserDevice from "../models/userDevice.model.js";
import userModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateDeviceFingerprint, parseDeviceInfo, generateDeviceName } from "../utils/deviceUtils.js";
import { getDeviceLimit, updateDeviceLimit as updateConfigLimit } from "../config/device.config.js";

/**
 * Update device limit (Admin only)
 */
export const updateDeviceLimit = asyncHandler(async (req, res, next) => {
    const { newLimit } = req.body;
    
    if (!newLimit || typeof newLimit !== 'number' || newLimit < 1 || newLimit > 10) {
        return next(new ApiError(400, "Device limit must be a number between 1 and 10"));
    }

    try {
        // Get current limit before updating
        const currentLimit = getDeviceLimit();
        
        // If new limit is less than current limit, reset devices for users who exceed it
        let resetUsersCount = 0;
        
        // Update the device limit in config with reset info
        const resetInfo = {
            timestamp: new Date(),
            resetUsersCount,
            reason: `Device limit reduced from ${currentLimit} to ${newLimit}`
        };
        const success = updateConfigLimit(newLimit, resetInfo);
        
        if (!success) {
            return next(new ApiError(500, "Failed to update device limit"));
        }
        if (newLimit < currentLimit) {
            console.log(`New limit (${newLimit}) is less than current limit (${currentLimit}). Checking for users to reset...`);
            
            // Find users who have more active devices than the new limit (exclude SUPER_ADMIN users)
            const usersToReset = await UserDevice.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                {
                    $match: { 
                        isActive: true,
                        'userInfo.role': { $ne: 'SUPER_ADMIN' }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        activeDevices: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        activeDevices: { $gt: newLimit }
                    }
                }
            ]);

            if (usersToReset.length > 0) {
                console.log(`Found ${usersToReset.length} users with more than ${newLimit} active devices. Resetting their devices...`);
                
                // Reset devices for these users
                for (const userData of usersToReset) {
                    const userId = userData._id;
                    
                    // Get user info for logging
                    const user = await userModel.findById(userId).select('email fullName');
                    const userEmail = user?.email || 'Unknown';
                    const userName = user?.fullName || 'Unknown';
                    
                    // Deactivate all devices for this user
                    await UserDevice.updateMany(
                        { user: userId },
                        { 
                            $set: { 
                                isActive: false,
                                deactivatedAt: new Date(),
                                deactivationReason: `Device limit reduced to ${newLimit}`
                            }
                        }
                    );
                    
                    resetUsersCount++;
                    console.log(`Reset devices for user ${userName} (${userEmail}) - had ${userData.activeDevices} active devices`);
                }
                
                console.log(`Successfully reset devices for ${resetUsersCount} users`);
            } else {
                console.log(`No users found with more than ${newLimit} active devices. No reset needed.`);
            }
        } else if (newLimit > currentLimit) {
            console.log(`New limit (${newLimit}) is greater than current limit (${currentLimit}). No device reset needed.`);
        } else {
            console.log(`New limit (${newLimit}) is same as current limit (${currentLimit}). No changes needed.`);
        }
        
        res.status(200).json(
            new ApiResponse(200, {
                maxDevicesPerUser: getDeviceLimit(),
                message: `تم تحديث الحد الأقصى للأجهزة إلى ${newLimit} أجهزة${resetUsersCount > 0 ? ` وتم إعادة تعيين أجهزة ${resetUsersCount} مستخدم` : ''}`,
                resetUsersCount,
                previousLimit: currentLimit
            }, "Device limit updated successfully")
        );
    } catch (error) {
        console.error("Error in updateDeviceLimit:", error);
        return next(new ApiError(500, "Failed to update device limit"));
    }
});

/**
 * Get current device limit
 */
export const getDeviceLimitController = asyncHandler(async (req, res, next) => {
    try {
        const { getLimitChangeHistory } = await import("../config/device.config.js");
        res.status(200).json(
            new ApiResponse(200, {
                maxDevicesPerUser: getDeviceLimit(),
                lastLimitChange: getLimitChangeHistory()
            }, "Device limit retrieved successfully")
        );
    } catch (error) {
        console.error("Error in getDeviceLimitController:", error);
        return next(new ApiError(500, "Failed to retrieve device limit"));
    }
});

/**
 * Manually reset devices for a specific user (Admin only)
 */
export const resetUserDevicesManually = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    
    if (!userId) {
        return next(new ApiError(400, "User ID is required"));
    }

    try {
        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // Get current active devices count
        const activeDevicesCount = await UserDevice.countDocuments({ 
            user: userId, 
            isActive: true 
        });

        if (activeDevicesCount === 0) {
            return next(new ApiError(400, "User has no active devices to reset"));
        }

        // Reset all devices for this user
        await UserDevice.updateMany(
            { user: userId },
            { 
                $set: { 
                    isActive: false,
                    deactivatedAt: new Date(),
                    deactivationReason: "Manual reset by administrator"
                }
            }
        );

        console.log(`Manually reset ${activeDevicesCount} devices for user ${user.fullName} (${user.email})`);

        res.status(200).json(
            new ApiResponse(200, {
                message: `تم إعادة تعيين ${activeDevicesCount} جهاز للمستخدم ${user.fullName}`,
                resetDevicesCount: activeDevicesCount,
                userId: user._id,
                userName: user.fullName
            }, "User devices reset successfully")
        );
    } catch (error) {
        console.error("Error in resetUserDevicesManually:", error);
        return next(new ApiError(500, "Failed to reset user devices"));
    }
});

/**
 * Register or update device for user
 */
export const registerDevice = asyncHandler(async (req, res, next) => {
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    console.log('=== DEVICE REGISTRATION DEBUG ===');
    console.log('Full req.user object:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Request body:', req.body);
    
    if (!userId) {
        return next(new ApiError(400, "User ID not found in request"));
    }
    
    const { 
        platform, 
        screenResolution, 
        timezone,
        additionalInfo = {} 
    } = req.body;

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req, {
        platform,
        screenResolution,
        timezone,
        ...additionalInfo
    });

    // Parse device info from user agent
    const deviceInfo = parseDeviceInfo(req.get('User-Agent'));
    deviceInfo.platform = platform || deviceInfo.platform;
    deviceInfo.ip = req.ip || req.connection.remoteAddress;
    deviceInfo.screenResolution = screenResolution;
    deviceInfo.timezone = timezone;

    // Generate device name
    const deviceName = generateDeviceName(deviceInfo);

    try {
        // Check if device already exists for this user
        let existingDevice = await UserDevice.findOne({
            user: userId,
            deviceFingerprint
        });

        if (existingDevice) {
            // Update existing device
            existingDevice.lastActivity = new Date();
            existingDevice.loginCount += 1;
            existingDevice.deviceInfo = deviceInfo;
            existingDevice.deviceName = deviceName;
            existingDevice.isActive = true;
            await existingDevice.save();

            return res.status(200).json(
                new ApiResponse(200, {
                    device: existingDevice,
                    isNewDevice: false
                }, "Device updated successfully")
            );
        }

        // Check current device count for user (skip limit check for SUPER_ADMIN)
        const user = await userModel.findById(userId).select('role');
        const isSuperAdmin = user?.role === 'SUPER_ADMIN';
        
        if (!isSuperAdmin) {
            const deviceCount = await UserDevice.countDocuments({
                user: userId,
                isActive: true
            });

            if (deviceCount >= getDeviceLimit()) {
                return next(new ApiError(
                    403, 
                    `تم الوصول للحد الأقصى من الأجهزة المسموحة (${getDeviceLimit()} أجهزة). يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة.`,
                    "DEVICE_LIMIT_EXCEEDED"
                ));
            }
        }

        // Create new device
        const newDevice = await UserDevice.create({
            user: userId,
            deviceFingerprint,
            deviceInfo,
            deviceName,
            isActive: true
        });

        res.status(201).json(
            new ApiResponse(201, {
                device: newDevice,
                isNewDevice: true,
                remainingSlots: isSuperAdmin ? 'unlimited' : getDeviceLimit() - deviceCount - 1,
                isUnlimited: isSuperAdmin
            }, "Device registered successfully")
        );

    } catch (error) {
        console.error("Error in registerDevice:", error);
        return next(new ApiError(500, "Failed to register device"));
    }
});

/**
 * Check if current device is authorized
 */
export const checkDeviceAuthorization = asyncHandler(async (req, res, next) => {
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    console.log('=== DEVICE AUTHORIZATION CHECK DEBUG ===');
    console.log('Full req.user object:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Request body:', req.body);
    
    if (!userId) {
        return next(new ApiError(400, "User ID not found in request"));
    }
    
    const { 
        platform, 
        screenResolution, 
        timezone 
    } = req.body;

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req, {
        platform,
        screenResolution,
        timezone
    });

    try {
        // Check if device exists and is active
        const device = await UserDevice.findOne({
            user: userId,
            deviceFingerprint,
            isActive: true
        });

        if (!device) {
            return next(new ApiError(
                403, 
                "هذا الجهاز غير مصرح له بالوصول. يرجى التواصل مع الإدارة.",
                "DEVICE_NOT_AUTHORIZED"
            ));
        }

        // Update last activity
        device.lastActivity = new Date();
        await device.save();

        res.status(200).json(
            new ApiResponse(200, {
                device,
                isAuthorized: true
            }, "Device authorized")
        );

    } catch (error) {
        console.error("Error in checkDeviceAuthorization:", error);
        return next(new ApiError(500, "Failed to check device authorization"));
    }
});

/**
 * Get user devices (Admin only)
 */
export const getUserDevices = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const devices = await UserDevice.find({ user: userId })
            .populate('user', 'fullName email')
            .sort({ lastActivity: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalDevices = await UserDevice.countDocuments({ user: userId });
        const activeDevices = await UserDevice.countDocuments({ 
            user: userId, 
            isActive: true 
        });

        res.status(200).json(
            new ApiResponse(200, {
                devices,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalDevices / parseInt(limit)),
                    totalDevices,
                    activeDevices,
                    limit: parseInt(limit)
                }
            }, "User devices retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getUserDevices:", error);
        return next(new ApiError(500, "Failed to retrieve user devices"));
    }
});

/**
 * Get all users with device information (Admin only)
 */
export const getAllUsersDevices = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 20, 
        search = '',
        deviceStatus = 'all' // all, overLimit, underLimit
    } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build aggregation pipeline
        const pipeline = [];

        // Match users based on search
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { fullName: { $regex: search, $options: 'i' } },
                        { phoneNumber: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Add device information
        pipeline.push(
            {
                $lookup: {
                    from: 'userdevices',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'devices'
                }
            },
            {
                $addFields: {
                    totalDevices: { $size: '$devices' },
                    activeDevices: {
                        $size: {
                            $filter: {
                                input: '$devices',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    },
                    lastDeviceActivity: {
                        $max: '$devices.lastActivity'
                    },
                    isUnlimited: { $eq: ['$role', 'SUPER_ADMIN'] },
                    deviceLimit: {
                        $cond: {
                            if: { $eq: ['$role', 'SUPER_ADMIN'] },
                            then: 'unlimited',
                            else: getDeviceLimit()
                        }
                    }
                }
            }
        );

        // Filter by device status (exclude SUPER_ADMIN from overLimit filter)
        if (deviceStatus === 'overLimit') {
            pipeline.push({
                $match: { 
                    $and: [
                        { activeDevices: { $gt: getDeviceLimit() } },
                        { role: { $ne: 'SUPER_ADMIN' } }
                    ]
                }
            });
        } else if (deviceStatus === 'underLimit') {
            pipeline.push({
                $match: { 
                    $or: [
                        { activeDevices: { $lt: getDeviceLimit() } },
                        { role: 'SUPER_ADMIN' }
                    ]
                }
            });
        }

        // Sort and paginate
        pipeline.push(
            { $sort: { lastDeviceActivity: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        // Project required fields
        pipeline.push({
            $project: {
                fullName: 1,
                email: 1,
                role: 1,
                isActive: 1,
                totalDevices: 1,
                activeDevices: 1,
                lastDeviceActivity: 1,
                createdAt: 1
            }
        });

        const users = await userModel.aggregate(pipeline);

        // Get total count for pagination
        const countPipeline = [];
        if (search) {
            countPipeline.push({
                $match: {
                    $or: [
                        { fullName: { $regex: search, $options: 'i' } },
                        { phoneNumber: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        countPipeline.push(
            {
                $lookup: {
                    from: 'userdevices',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'devices'
                }
            },
            {
                $addFields: {
                    activeDevices: {
                        $size: {
                            $filter: {
                                input: '$devices',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    }
                }
            }
        );

        if (deviceStatus === 'overLimit') {
            countPipeline.push({
                $match: { 
                    $and: [
                        { activeDevices: { $gt: getDeviceLimit() } },
                        { role: { $ne: 'SUPER_ADMIN' } }
                    ]
                }
            });
        } else if (deviceStatus === 'underLimit') {
            countPipeline.push({
                $match: { 
                    $or: [
                        { activeDevices: { $lt: getDeviceLimit() } },
                        { role: 'SUPER_ADMIN' }
                    ]
                }
            });
        }

        countPipeline.push({ $count: "total" });

        const totalResult = await userModel.aggregate(countPipeline);
        const totalUsers = totalResult.length > 0 ? totalResult[0].total : 0;

        res.status(200).json(
            new ApiResponse(200, {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / parseInt(limit)),
                    totalUsers,
                    limit: parseInt(limit)
                },
                maxDevicesPerUser: getDeviceLimit()
            }, "Users with device information retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getAllUsersDevices:", error);
        return next(new ApiError(500, "Failed to retrieve users device information"));
    }
});

/**
 * Reset user devices (Admin only)
 */
export const resetUserDevices = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    try {
        // Verify user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // Deactivate all devices for the user
        const result = await UserDevice.updateMany(
            { user: userId },
            { 
                isActive: false,
                lastActivity: new Date()
            }
        );

        res.status(200).json(
            new ApiResponse(200, {
                userId,
                deactivatedDevices: result.modifiedCount,
                message: `تم إعادة تعيين ${result.modifiedCount} جهاز للمستخدم ${user.fullName}`
            }, "User devices reset successfully")
        );

    } catch (error) {
        console.error("Error in resetUserDevices:", error);
        return next(new ApiError(500, "Failed to reset user devices"));
    }
});

/**
 * Remove specific device (Admin only)
 */
export const removeDevice = asyncHandler(async (req, res, next) => {
    const { deviceId } = req.params;

    try {
        const device = await UserDevice.findById(deviceId).populate('user', 'fullName');
        
        if (!device) {
            return next(new ApiError(404, "Device not found"));
        }

        // Deactivate the device
        device.isActive = false;
        device.lastActivity = new Date();
        await device.save();

        res.status(200).json(
            new ApiResponse(200, {
                device,
                message: `تم إلغاء تفعيل الجهاز ${device.deviceName} للمستخدم ${device.user.fullName}`
            }, "Device deactivated successfully")
        );

    } catch (error) {
        console.error("Error in removeDevice:", error);
        return next(new ApiError(500, "Failed to remove device"));
    }
});

/**
 * Get device statistics (Admin only)
 */
export const getDeviceStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await UserDevice.aggregate([
            {
                $group: {
                    _id: null,
                    totalDevices: { $sum: 1 },
                    activeDevices: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    },
                    inactiveDevices: {
                        $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get platform statistics
        const platformStats = await UserDevice.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$deviceInfo.platform',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get browser statistics
        const browserStats = await UserDevice.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$deviceInfo.browser',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get users over device limit (exclude SUPER_ADMIN users)
        const usersOverLimit = await UserDevice.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { 
                $match: { 
                    isActive: true,
                    'userInfo.role': { $ne: 'SUPER_ADMIN' }
                }
            },
            {
                $group: {
                    _id: '$user',
                    deviceCount: { $sum: 1 }
                }
            },
            { $match: { deviceCount: { $gt: getDeviceLimit() } } },
            { $count: "usersOverLimit" }
        ]);

        const overLimitCount = usersOverLimit.length > 0 ? usersOverLimit[0].usersOverLimit : 0;

        const deviceStats = {
            ...(stats[0] || { totalDevices: 0, activeDevices: 0, inactiveDevices: 0 }),
            platformStats,
            browserStats,
            usersOverLimit: overLimitCount,
            maxDevicesPerUser: getDeviceLimit()
        };

        res.status(200).json(
            new ApiResponse(200, deviceStats, "Device statistics retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getDeviceStats:", error);
        return next(new ApiError(500, "Failed to retrieve device statistics"));
    }
});
