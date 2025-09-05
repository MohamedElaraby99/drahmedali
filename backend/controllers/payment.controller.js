import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Purchase from "../models/purchase.model.js";
import paymentModel from '../models/payment.model.js';

// Get payment statistics
export const getPaymentStats = asyncHandler(async (req, res) => {
    // Get all completed payments
    const allPayments = await paymentModel.find({ status: 'completed' });
    
    // Calculate total revenue
    const totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get total number of payments
    const totalPayments = allPayments.length;
    
    // Calculate monthly revenue for current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = new Array(12).fill(0);
    
    allPayments.forEach(payment => {
        const paymentYear = payment.createdAt.getFullYear();
        if (paymentYear === currentYear) {
            const month = payment.createdAt.getMonth();
            monthlyRevenue[month] += payment.amount;
        }
    });

    // Get recent payments
    const recentPayments = await paymentModel.find({ status: 'completed' })
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(10);

    return res.status(200).json(
        new ApiResponse(200, {
            totalRevenue,
            totalPayments,
            monthlyRevenue,
            recentPayments: recentPayments.map(payment => ({
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                userName: payment.user?.fullName || 'Unknown User',
                userEmail: payment.user?.email || 'Unknown Email',
                date: payment.createdAt,
                transactionId: payment.transactionId
            }))
        }, "Payment statistics retrieved successfully")
    );
});

// Get user's purchase history (old function - keeping for compatibility)
export const getUserPurchases = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const purchases = await paymentModel.find({ 
        user: userId, 
        status: 'completed' 
    })
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            purchases: purchases.map(purchase => ({
                id: purchase._id,
                amount: purchase.amount,
                currency: purchase.currency,
                date: purchase.createdAt,
                transactionId: purchase.transactionId
            }))
        }, "User purchases retrieved successfully")
    );
});

// Record a course purchase
export const recordCoursePurchase = asyncHandler(async (req, res) => {
    const { courseId, amount, currency = 'USD', transactionId } = req.body;
    const userId = req.user.id;

    if (!courseId || !amount) {
        throw new ApiError(400, 'Course ID and amount are required');
    }

    // Create a new payment record
    const payment = await paymentModel.create({
        user: userId,
        course: courseId,
        amount,
        currency,
        transactionId,
        status: 'completed',
        paymentMethod: req.body.paymentMethod || 'unknown'
    });

    return res.status(201).json(
        new ApiResponse(201, {
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                transactionId: payment.transactionId,
                date: payment.createdAt
            }
        }, 'Course purchase recorded successfully')
    );
});

// Simulate course purchase (for testing)
export const simulateCoursePurchase = asyncHandler(async (req, res) => {
    const { courseId, amount, currency = 'USD', userId } = req.body;

    if (!courseId || !amount || !userId) {
        throw new ApiError(400, 'Course ID, amount, and user ID are required');
    }

    // Create a simulated payment record
    const payment = await paymentModel.create({
        user: userId,
        course: courseId,
        amount,
        currency,
        transactionId: `SIM_${Date.now()}`,
        status: 'completed',
        paymentMethod: 'simulated'
    });

    return res.status(201).json(
        new ApiResponse(201, {
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                transactionId: payment.transactionId,
                date: payment.createdAt
            }
        }, 'Simulated course purchase recorded successfully')
    );
});

// Purchase lesson or unit
export const purchaseContent = asyncHandler(async (req, res) => {
    const { courseId, purchaseType, itemId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!courseId || !purchaseType || !itemId) {
        throw new ApiError(400, "Course ID, purchase type, and item ID are required");
    }

    if (!['lesson', 'unit'].includes(purchaseType)) {
        throw new ApiError(400, "Purchase type must be 'lesson' or 'unit'");
    }

    // Get user with wallet
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    let item, price, description;

    // Find the item and get its price
    if (purchaseType === 'lesson') {
        // Check direct lessons first
        const directLesson = course.directLessons?.find(lesson => lesson._id.toString() === itemId);
        if (directLesson) {
            item = directLesson;
            price = directLesson.price || 0;
            description = `شراء درس: ${directLesson.title}`;
        } else {
            // Check lessons in units
            for (const unit of course.units || []) {
                const lesson = unit.lessons?.find(lesson => lesson._id.toString() === itemId);
                if (lesson) {
                    item = lesson;
                    price = lesson.price || 0;
                    description = `شراء درس: ${lesson.title} من وحدة: ${unit.title}`;
                    break;
                }
            }
        }
    } else if (purchaseType === 'unit') {
        const unit = course.units?.find(unit => unit._id.toString() === itemId);
        if (unit) {
            item = unit;
            price = unit.price || 0;
            description = `شراء وحدة: ${unit.title}`;
        }
    }

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    if (price <= 0) {
        throw new ApiError(400, "This item is free and doesn't require purchase");
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
        userId,
        courseId,
        purchaseType,
        purchasedItemId: itemId
    });

    if (existingPurchase) {
        throw new ApiError(400, "You have already purchased this item");
    }

    // Check wallet balance
    if (user.wallet.balance < price) {
        throw new ApiError(400, "Insufficient wallet balance");
    }

    // Create purchase record
    const purchase = await Purchase.create({
        userId,
        courseId,
        purchaseType,
        purchasedItemId: itemId,
        amount: price,
        description
    });

    // Deduct from wallet
    user.wallet.balance -= price;
    
    // Add transaction record
    user.wallet.transactions.push({
        type: 'purchase',
        amount: price,
        code: `PURCHASE_${purchase._id.toString().slice(-8).toUpperCase()}`,
        description: description,
        date: new Date(),
        status: 'completed'
    });

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {
            purchase,
            newBalance: user.wallet.balance,
            message: "Purchase completed successfully"
        }, "Purchase successful")
    );
});

// Get user's purchase history
export const getPurchaseHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const purchases = await Purchase.find({ userId })
        .populate('courseId', 'title')
        .sort({ purchaseDate: -1 });

    return res.status(200).json(
        new ApiResponse(200, { purchases }, "Purchase history retrieved successfully")
    );
});

// Check if user has purchased specific content
export const checkPurchaseStatus = asyncHandler(async (req, res) => {
    const { courseId, purchaseType, itemId } = req.query;
    const userId = req.user.id;

    if (!courseId || !purchaseType || !itemId) {
        throw new ApiError(400, "Course ID, purchase type, and item ID are required");
    }

    const purchase = await Purchase.findOne({
        userId,
        courseId,
        purchaseType,
        purchasedItemId: itemId
    });

    return res.status(200).json(
        new ApiResponse(200, { 
            isPurchased: !!purchase,
            purchase 
        }, "Purchase status checked successfully")
    );
});



// Get all purchased content for a user
export const getPurchasedContent = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const purchases = await Purchase.find({ userId })
        .populate('courseId', 'title description')
        .sort({ purchaseDate: -1 });

    return res.status(200).json(
        new ApiResponse(200, { purchases }, "Purchased content retrieved successfully")
    );
});

 