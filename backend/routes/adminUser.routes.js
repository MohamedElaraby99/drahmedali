import express from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import { 
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
} from "../controllers/adminUser.controller.js";

const router = express.Router();

// All routes require admin authentication
router.use(isLoggedIn);
router.use(authorisedRoles("ADMIN", "SUPER_ADMIN"));

// Get all users with filters and pagination
router.get("/users", (req, res, next) => {
    console.log('=== ADMIN USERS ROUTE HIT ===');
    console.log('User making request:', req.user);
    next();
}, getAllUsers);

// Create new user
router.post("/create", createUser);

// Bulk import users
router.post("/bulk-import", bulkImportUsers);

// Get user details
router.get("/users/:userId", getUserDetails);

// Toggle user active status
router.patch("/users/:userId/status", toggleUserStatus);

// Update user role
router.patch("/users/:userId/role", updateUserRole);

// Update user information
router.patch("/users/:userId", updateUser);

// Update user password
router.patch("/users/:userId/password", updateUserPassword);

// Reset all user wallets
router.post("/reset-all-wallets", resetAllUserWallets);

// Reset specific user wallet
router.post("/users/:userId/reset-wallet", resetUserWallet);

// Reset all recharge codes
router.post("/reset-all-codes", resetAllRechargeCodes);

// Delete user
router.delete("/users/:userId", deleteUser);

// Get user activities
router.get("/users/:userId/activities", getUserActivities);

// Get user statistics
router.get("/users/:userId/stats", getUserStats);

export default router; 