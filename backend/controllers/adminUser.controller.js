import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

// Get all users with pagination and filters
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, status, search, stage, codeSearch } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by role
        if (role && role !== 'all') {
            query.role = role;
        }

        // Filter by status (active/inactive)
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        // Filter by stage
        if (stage && stage !== 'all') {
            query.stage = stage;
        }

        // Search by name, email, or phone number
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Search by code
        if (codeSearch) {
            query.code = { $regex: codeSearch, $options: 'i' };
        }

        console.log('Query:', query);
        console.log('Admin requesting users. User ID:', req.user.id);

        const users = await userModel.find(query)
            .select('-password -forgotPasswordToken -forgotPasswordExpiry')
            .populate({
                path: 'stage',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Found users:', users.length);

        const total = await userModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Calculate statistics
        const stats = await userModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                    inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0] } },
                    superAdminUsers: { $sum: { $cond: [{ $eq: ['$role', 'SUPER_ADMIN'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'USER'] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users: users.map(user => ({
                    id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    adminPermissions: user.adminPermissions || [],
                    isActive: user.isActive !== false, // Default to true if not set
                    governorate: user.governorate,
                    stage: user.stage,
                    age: user.age,
                    code: user.code,
                    walletBalance: user.wallet?.balance || 0,
                    totalTransactions: user.wallet?.transactions?.length || 0,
                    subscriptionStatus: user.subscription?.status || 'inactive',
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total,
                    limit: parseInt(limit)
                },
                stats: stats[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    inactiveUsers: 0,
                    adminUsers: 0,
                    superAdminUsers: 0,
                    regularUsers: 0
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Create new user (Admin only)
const createUser = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            password, 
            role = 'USER',
            phoneNumber,
            fatherPhoneNumber,
            governorate,
            stage,
            age 
        } = req.body;

        // Validate required fields
        if (!fullName || !password || !role) {
            return next(new AppError("Full name, password, and role are required", 400));
        }

        // Validate role
        if (!['USER', 'ADMIN'].includes(role)) {
            return next(new AppError("Role must be either USER or ADMIN", 400));
        }

        // Check if current admin can create admin users
        if (role === 'ADMIN') {
            const currentUser = await userModel.findById(req.user.id);
            if (!currentUser) {
                return next(new AppError("Current user not found", 404));
            }
            
            // Only SUPER_ADMIN can create ADMIN users
            if (currentUser.role !== 'SUPER_ADMIN') {
                return next(new AppError("You don't have permission to create admin users. Only super admins can create admin accounts.", 403));
            }
        }

        // Role-specific field validation
        if (role === 'USER') {
            // For USER role: phone number is required, email is optional
            if (!phoneNumber || !governorate || !stage || !age) {
                return next(new AppError("Phone number, governorate, stage, and age are required for regular users", 400));
            }
        } else if (role === 'ADMIN') {
            // For ADMIN role: email is required
            if (!email) {
                return next(new AppError("Email is required for admin users", 400));
            }
        }

        // Check if user already exists based on role
        let existingUser;
        if (role === 'USER') {
            // For USER role: check phone number
            existingUser = await userModel.findOne({ phoneNumber });
            if (existingUser) {
                return next(new AppError("Phone number already exists", 400));
            }
        } else {
            // For ADMIN role: check email
            existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return next(new AppError("Email already exists", 400));
            }
        }

        // Prepare user data
        const userData = {
            fullName,
            password,
            role,
            isActive: true,
            avatar: {
                public_id: role === 'USER' ? phoneNumber : email,
                secure_url: "",
            }
        };

        // Add role-specific fields
        if (role === 'USER') {
            userData.phoneNumber = phoneNumber;
            if (email) userData.email = email; // Optional email for USER
            if (fatherPhoneNumber) userData.fatherPhoneNumber = fatherPhoneNumber;
            userData.governorate = governorate;
            userData.stage = stage;
            userData.age = parseInt(age);
        } else if (role === 'ADMIN') {
            userData.email = email;
        }

        // Create user
        const user = await userModel.create(userData);

        if (!user) {
            return next(new AppError("Failed to create user", 500));
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: `${role} account created successfully`,
                            data: {
                    user: {
                        id: userResponse._id,
                        fullName: userResponse.fullName,
                        email: userResponse.email,
                        role: userResponse.role,
                        isActive: userResponse.isActive,
                        phoneNumber: userResponse.phoneNumber,
                        fatherPhoneNumber: userResponse.fatherPhoneNumber,
                        governorate: userResponse.governorate,
                        stage: userResponse.stage,
                        age: userResponse.age,
                        createdAt: userResponse.createdAt
                    }
                }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user details with activities
const getUserDetails = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId)
            .select('-password -forgotPasswordToken -forgotPasswordExpiry')
            .populate('stage', 'name');

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Get user statistics
        const userStats = {
            walletBalance: user.wallet?.balance || 0,
            totalTransactions: user.wallet?.transactions?.length || 0,
            totalRecharges: user.wallet?.transactions?.filter(t => t.type === 'recharge').length || 0,
            totalPurchases: user.wallet?.transactions?.filter(t => t.type === 'purchase').length || 0,
            subscriptionStatus: user.subscription?.status || 'inactive'
        };

        res.status(200).json({
            success: true,
            message: "User details retrieved successfully",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    fatherPhoneNumber: user.fatherPhoneNumber,
                    governorate: user.governorate,
                    stage: user.stage,
                    age: user.age,
                    role: user.role,
                    code: user.code,
                    isActive: user.isActive !== false,
                    avatar: user.avatar,
                    subscription: user.subscription,
                    wallet: user.wallet,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                },
                stats: userStats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Toggle user active status
const toggleUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot deactivate your own account", 400));
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                userId: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot delete your own account", 400));
        }

        // Check if current admin can delete admin users
        if (user.role === 'ADMIN') {
            const currentUser = await userModel.findById(req.user.id);
            if (!currentUser) {
                return next(new AppError("Current user not found", 404));
            }
            
            // Only SUPER_ADMIN can delete ADMIN users
            if (currentUser.role !== 'SUPER_ADMIN') {
                return next(new AppError("You don't have permission to delete admin users. Only super admins can do this.", 403));
            }
        }

        await userModel.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update user role
const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return next(new AppError("Invalid role", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot change your own role", 400));
        }

        // Check if current admin can change roles to ADMIN
        if (role === 'ADMIN') {
            const currentUser = await userModel.findById(req.user.id);
            if (!currentUser) {
                return next(new AppError("Current user not found", 404));
            }
            
            // Only SUPER_ADMIN can change roles to ADMIN
            if (currentUser.role !== 'SUPER_ADMIN') {
                return next(new AppError("You don't have permission to change user roles to ADMIN. Only super admins can do this.", 403));
            }
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: {
                userId: user._id,
                role: user.role
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user activities (transactions, etc.)
const getUserActivities = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];
        const totalTransactions = transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);

        // Paginate transactions
        const paginatedTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            message: "User activities retrieved successfully",
            data: {
                activities: paginatedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total: totalTransactions,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];
        
        const stats = {
            walletBalance: user.wallet?.balance || 0,
            totalTransactions: transactions.length,
            totalRecharges: transactions.filter(t => t.type === 'recharge').length,
            totalPurchases: transactions.filter(t => t.type === 'purchase').length,
            totalRefunds: transactions.filter(t => t.type === 'refund').length,
            totalSpent: transactions
                .filter(t => t.type === 'purchase')
                .reduce((sum, t) => sum + t.amount, 0),
            totalRecharged: transactions
                .filter(t => t.type === 'recharge')
                .reduce((sum, t) => sum + t.amount, 0),
            subscriptionStatus: user.subscription?.status || 'inactive',
            accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // days
        };

        res.status(200).json({
            success: true,
            message: "User statistics retrieved successfully",
            data: {
                stats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update user information
const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated
        delete updateData.password;
        delete updateData.email; // Email updates should be handled separately for security
        delete updateData.forgotPasswordToken;
        delete updateData.forgotPasswordExpiry;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Update user fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                user[key] = updateData[key];
            }
        });

        // Ensure required fields are not empty
        if (!user.fullName || user.fullName.trim() === '') {
            return next(new AppError("Full name is required", 400));
        }
        if (!user.username || user.username.trim() === '') {
            return next(new AppError("Username is required", 400));
        }

        await user.save();

        // Populate stage information before sending response
        await user.populate('stage', 'name');

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                userId: user._id,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    fatherPhoneNumber: user.fatherPhoneNumber,
                    governorate: user.governorate,
                    stage: user.stage,
                    age: user.age,
                    role: user.role,
                    code: user.code,
                    isActive: user.isActive !== false,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update user password
const updateUserPassword = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        if (!password) {
            return next(new AppError("Password is required", 400));
        }
        
        if (password.length < 6) {
            return next(new AppError("Password must be at least 6 characters long", 400));
        }
        
        if (password.trim() === '') {
            return next(new AppError("Password cannot be empty or contain only whitespace", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Hash the new password
        user.password = password;
        await user.save();
        
        console.log(`Password updated successfully for user: ${user.email} (ID: ${user._id})`);

        res.status(200).json({
            success: true,
            message: "User password updated successfully",
            data: {
                userId: user._id
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Reset all users wallet points
const resetAllUserWallets = async (req, res, next) => {
    try {
        // Update all users to reset their wallet balance to 0
        const result = await userModel.updateMany(
            {},
            { 
                $set: { 
                    "wallet.balance": 0,
                    "wallet.transactions": []
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: `Successfully reset wallet points for ${result.modifiedCount} users`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Reset wallet for specific user
const resetUserWallet = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Reset wallet
        user.wallet = {
            balance: 0,
            transactions: []
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully reset wallet for user: ${user.fullName}`,
            data: {
                userId: user._id,
                fullName: user.fullName,
                email: user.email,
                wallet: user.wallet
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Reset all recharge codes
const resetAllRechargeCodes = async (req, res, next) => {
    try {
        // Import recharge code model
        const rechargeCodeModel = (await import("../models/rechargeCode.model.js")).default;
        
        // Delete all recharge codes
        const result = await rechargeCodeModel.deleteMany({});

        res.status(200).json({
            success: true,
            message: `Successfully reset all recharge codes. Deleted ${result.deletedCount} codes.`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Bulk import users from Excel data
const bulkImportUsers = async (req, res, next) => {
    try {
        const { students } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return next(new AppError('لا توجد بيانات طلاب للاستيراد', 400));
        }

        let imported = 0;
        let failed = 0;
        const errors = [];

        // Import stages model to validate stage names
        const stageModel = (await import("../models/stage.model.js")).default;
        const stages = await stageModel.find({}).select('name _id');
        const stageMap = new Map(stages.map(stage => [stage.name, stage._id]));

        for (const studentData of students) {
            try {
                // Validate required fields
                if (!studentData.fullName || !studentData.phoneNumber) {
                    failed++;
                    errors.push(`طالب مفقود الاسم أو رقم الهاتف: ${studentData.fullName || 'غير محدد'}`);
                    continue;
                }

                // Check if user already exists
                const existingUser = await userModel.findOne({
                    $or: [
                        { phoneNumber: studentData.phoneNumber },
                        ...(studentData.email ? [{ email: studentData.email }] : [])
                    ]
                });

                if (existingUser) {
                    failed++;
                    errors.push(`الطالب موجود مسبقاً: ${studentData.fullName} (${studentData.phoneNumber})`);
                    continue;
                }

                // Prepare user data with all required fields
                const userData = {
                    fullName: String(studentData.fullName || '').trim(),
                    phoneNumber: String(studentData.phoneNumber || '').trim(),
                    email: studentData.email ? String(studentData.email).trim() : undefined,
                    fatherPhoneNumber: studentData.fatherPhoneNumber ? String(studentData.fatherPhoneNumber).trim() : undefined,
                    password: studentData.password || '123456', // Default password
                    role: 'USER',
                    isActive: true,
                    // Required fields for USER role
                    governorate: studentData.governorate ? String(studentData.governorate).trim() : 'غير محدد', // Default governorate
                    age: studentData.age ? Number(studentData.age) : 18 // Default age
                };

                // Handle stage assignment - required for USER role
                if (studentData.stage) {
                    const stageId = stageMap.get(String(studentData.stage).trim());
                    if (stageId) {
                        userData.stage = stageId;
                    } else {
                        // If stage name not found, use the first available stage as default
                        userData.stage = stages.length > 0 ? stages[0]._id : null;
                    }
                } else {
                    // Use the first available stage as default if not provided
                    userData.stage = stages.length > 0 ? stages[0]._id : null;
                }

                // Ensure stage is provided (required field)
                if (!userData.stage) {
                    failed++;
                    errors.push(`لا توجد مرحلة متاحة للطالب: ${studentData.fullName}`);
                    continue;
                }

                // Create user
                const newUser = await userModel.create(userData);
                
                if (newUser) {
                    imported++;
                } else {
                    failed++;
                    errors.push(`فشل في إنشاء الطالب: ${studentData.fullName}`);
                }

            } catch (error) {
                failed++;
                errors.push(`خطأ في إنشاء الطالب ${studentData.fullName}: ${error.message}`);
                console.error('Error creating user:', error);
            }
        }

        res.status(200).json({
            success: true,
            message: `تم استيراد ${imported} طالب بنجاح${failed > 0 ? ` وفشل في ${failed} طالب` : ''}`,
            data: {
                imported,
                failed,
                total: students.length,
                errors: errors.slice(0, 10) // Only return first 10 errors to avoid large response
            }
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        return next(new AppError('حدث خطأ أثناء الاستيراد: ' + error.message, 500));
    }
};

export {
    getAllUsers,
    createUser,
    getUserDetails,
    toggleUserStatus,
    deleteUser,
    updateUserRole,
    updateUser,
    updateUserPassword,
    resetAllUserWallets,
    resetUserWallet,
    resetAllRechargeCodes,
    getUserActivities,
    getUserStats,
    bulkImportUsers
}; 