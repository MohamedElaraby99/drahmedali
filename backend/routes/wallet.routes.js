import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { 
    getWallet, 
    rechargeWallet, 
    getTransactionHistory, 
    validateRechargeCode 
} from "../controllers/wallet.controller.js";

const router = express.Router();

// All routes require authentication
router.use(isLoggedIn);

// Get wallet balance and basic info
router.get("/balance", getWallet);

// Recharge wallet with code
router.post("/recharge", rechargeWallet);

// Get transaction history
router.get("/transactions", getTransactionHistory);

// Validate recharge code
router.post("/validate-code", validateRechargeCode);

export default router; 