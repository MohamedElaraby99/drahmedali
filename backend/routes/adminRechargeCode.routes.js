import express from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import rechargeCodeModel from "../models/rechargeCode.model.js";
import { 
    generateRechargeCode, 
    getAllRechargeCodes, 
    deleteRechargeCode, 
    getRechargeCodeStats 
} from "../controllers/adminRechargeCode.controller.js";

const router = express.Router();

// Generate new recharge codes
router.post("/generate", isLoggedIn, authorisedRoles("ADMIN"), generateRechargeCode);

// Get all recharge codes with filters and pagination
router.get("/codes", isLoggedIn, authorisedRoles("ADMIN"), getAllRechargeCodes);

// Get recharge code statistics
router.get("/stats", isLoggedIn, authorisedRoles("ADMIN"), getRechargeCodeStats);

// Delete a recharge code
router.delete("/codes/:id", isLoggedIn, authorisedRoles("ADMIN"), deleteRechargeCode);

// Test endpoint to check user role
router.get("/test-role", isLoggedIn, (req, res) => {
    res.json({
        success: true,
        message: "Role check successful",
        user: req.user
    });
});

// Test endpoint to list all codes (for debugging)
router.get("/list-codes", isLoggedIn, authorisedRoles("ADMIN"), async (req, res) => {
    try {
        const codes = await rechargeCodeModel.find().select('code amount isUsed createdAt');
        res.json({
            success: true,
            message: "Codes retrieved successfully",
            data: codes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 