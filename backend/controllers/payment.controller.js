import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

// Get wallet balance for a user
export const getWalletBalance = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('wallet');
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { 
            balance: user.wallet.balance,
            transactions: user.wallet.transactions 
        }, "Wallet balance retrieved successfully")
    );
});

// Add money to wallet (for admin/recharge codes)
export const addToWallet = asyncHandler(async (req, res) => {
    const { userId, amount, description = "رصيد مضاف" } = req.body;

    if (!userId || !amount || amount <= 0) {
        throw new ApiError(400, "Valid user ID and positive amount are required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Add to wallet balance
    user.wallet.balance += amount;
    
    // Add transaction record
    user.wallet.transactions.push({
        type: 'credit',
        amount: amount,
        code: `ADD_${Date.now().toString().slice(-8).toUpperCase()}`,
        description: description,
        date: new Date(),
        status: 'completed'
    });

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {
            newBalance: user.wallet.balance,
            message: "Amount added to wallet successfully"
        }, "Wallet updated successfully")
    );
});

// Get wallet transaction history
export const getWalletTransactions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('wallet.transactions');
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { 
            transactions: user.wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        }, "Wallet transactions retrieved successfully")
    );
});