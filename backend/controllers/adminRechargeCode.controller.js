import rechargeCodeModel from "../models/rechargeCode.model.js";
import AppError from "../utils/error.utils.js";

// Generate new recharge code
const generateRechargeCode = async (req, res, next) => {
    try {
        const { amount, quantity = 1 } = req.body;
        const adminId = req.user.id;

        if (!amount || amount <= 0) {
            return next(new AppError("Valid amount is required", 400));
        }

        if (quantity < 1 || quantity > 100) {
            return next(new AppError("Quantity must be between 1 and 100", 400));
        }

        const codes = [];

        for (let i = 0; i < quantity; i++) {
            let code;
            let isUnique = false;
            
            // Generate unique code
            while (!isUnique) {
                code = rechargeCodeModel.generateCode();
                const existingCode = await rechargeCodeModel.findOne({ code });
                if (!existingCode) {
                    isUnique = true;
                }
            }

            const rechargeCode = await rechargeCodeModel.create({
                code,
                amount: parseFloat(amount),
                createdBy: adminId
            });

            codes.push(rechargeCode);
        }

        res.status(201).json({
            success: true,
            message: `${quantity} recharge code(s) generated successfully`,
            data: {
                codes: codes.map(code => ({
                    id: code._id,
                    code: code.code,
                    amount: code.amount,
                    isUsed: code.isUsed,
                    expiresAt: code.expiresAt,
                    createdAt: code.createdAt
                }))
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get all recharge codes (with pagination and filters)
const getAllRechargeCodes = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, amount } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by status
        if (status === 'used') {
            query.isUsed = true;
        } else if (status === 'unused') {
            query.isUsed = false;
        }

        // Filter by amount
        if (amount) {
            query.amount = parseFloat(amount);
        }

        const codes = await rechargeCodeModel.find(query)
            .populate('createdBy', 'fullName email')
            .populate('usedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await rechargeCodeModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Calculate statistics
        const stats = await rechargeCodeModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalCodes: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    usedCodes: { $sum: { $cond: ['$isUsed', 1, 0] } },
                    unusedCodes: { $sum: { $cond: ['$isUsed', 0, 1] } },
                    totalUsedAmount: { $sum: { $cond: ['$isUsed', '$amount', 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Recharge codes retrieved successfully",
            data: {
                codes: codes.map(code => ({
                    id: code._id,
                    code: code.code,
                    amount: code.amount,
                    isUsed: code.isUsed,
                    usedBy: code.usedBy,
                    usedAt: code.usedAt,
                    createdBy: code.createdBy,
                    expiresAt: code.expiresAt,
                    createdAt: code.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total,
                    limit: parseInt(limit)
                },
                stats: stats[0] || {
                    totalCodes: 0,
                    totalAmount: 0,
                    usedCodes: 0,
                    unusedCodes: 0,
                    totalUsedAmount: 0
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete recharge code
const deleteRechargeCode = async (req, res, next) => {
    try {
        const { id } = req.params;

        const code = await rechargeCodeModel.findById(id);
        if (!code) {
            return next(new AppError("Recharge code not found", 404));
        }

        if (code.isUsed) {
            return next(new AppError("Cannot delete used codes", 400));
        }

        await rechargeCodeModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Recharge code deleted successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get recharge code statistics
const getRechargeCodeStats = async (req, res, next) => {
    try {
        const stats = await rechargeCodeModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalCodes: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    usedCodes: { $sum: { $cond: ['$isUsed', 1, 0] } },
                    unusedCodes: { $sum: { $cond: ['$isUsed', 0, 1] } },
                    totalUsedAmount: { $sum: { $cond: ['$isUsed', '$amount', 0] } },
                    totalUnusedAmount: { $sum: { $cond: ['$isUsed', 0, '$amount'] } }
                }
            }
        ]);

        // Get recent codes
        const recentCodes = await rechargeCodeModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'fullName');

        // Get monthly stats
        const monthlyStats = await rechargeCodeModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.status(200).json({
            success: true,
            message: "Statistics retrieved successfully",
            data: {
                stats: stats[0] || {
                    totalCodes: 0,
                    totalAmount: 0,
                    usedCodes: 0,
                    unusedCodes: 0,
                    totalUsedAmount: 0,
                    totalUnusedAmount: 0
                },
                recentCodes: recentCodes.map(code => ({
                    id: code._id,
                    code: code.code,
                    amount: code.amount,
                    isUsed: code.isUsed,
                    createdBy: code.createdBy,
                    createdAt: code.createdAt
                })),
                monthlyStats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    generateRechargeCode,
    getAllRechargeCodes,
    deleteRechargeCode,
    getRechargeCodeStats
}; 