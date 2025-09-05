import userModel from "../models/user.model.js";
import rechargeCodeModel from "../models/rechargeCode.model.js";
import AppError from "../utils/error.utils.js";

// Get wallet balance and transactions
const getWallet = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Initialize wallet if it doesn't exist
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
            await user.save();
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = (user.wallet.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            message: "Wallet retrieved successfully",
            data: {
                balance: user.wallet.balance || 0,
                transactions: sortedTransactions
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Recharge wallet with code
const rechargeWallet = async (req, res, next) => {
    try {
        const { code, amount } = req.body;
        const userId = req.user.id;

        if (!code || !amount) {
            return next(new AppError("Code and amount are required", 400));
        }

        // Validate amount (must be positive)
        if (amount <= 0) {
            return next(new AppError("Amount must be greater than 0", 400));
        }

        // Find and validate the recharge code
        console.log('Attempting to validate code:', code);
        const rechargeCode = await rechargeCodeModel.validateCode(code);
        console.log('Found recharge code:', rechargeCode);
        
        if (!rechargeCode) {
            return next(new AppError("Invalid or expired recharge code", 400));
        }

        // Check if amount matches the code
        console.log('Code amount:', rechargeCode.amount, 'User amount:', parseFloat(amount));
        if (rechargeCode.amount !== parseFloat(amount)) {
            return next(new AppError("Amount does not match the code value", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Initialize wallet if it doesn't exist
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
        }

        // Mark code as used
        rechargeCode.isUsed = true;
        rechargeCode.usedBy = userId;
        rechargeCode.usedAt = new Date();
        await rechargeCode.save();

        // Add transaction to history
        const transaction = {
            type: 'recharge',
            amount: rechargeCode.amount,
            code: code,
            description: `Wallet recharged with code: ${code}`,
            date: new Date(),
            status: 'completed'
        };

        user.wallet.transactions.push(transaction);
        user.wallet.balance += rechargeCode.amount;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Wallet recharged successfully",
            data: {
                balance: user.wallet.balance,
                transaction: transaction
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get transaction history
const getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('wallet');

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];
        
        // Sort transactions by date (newest first)
        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            message: "Transaction history retrieved successfully",
            data: {
                transactions: sortedTransactions,
                totalTransactions: sortedTransactions.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Validate recharge code
const validateRechargeCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            return next(new AppError("Code is required", 400));
        }

        // Check if code exists and is valid
        const rechargeCode = await rechargeCodeModel.validateCode(code);
        
        if (!rechargeCode) {
            return next(new AppError("Invalid or expired recharge code", 400));
        }

        res.status(200).json({
            success: true,
            message: "Code is valid",
            data: {
                isValid: true,
                amount: rechargeCode.amount
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getWallet,
    rechargeWallet,
    getTransactionHistory,
    validateRechargeCode
}; 