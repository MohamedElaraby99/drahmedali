import express from 'express';
import { 
    getPaymentStats, 
    recordCoursePurchase, 
    simulateCoursePurchase,
    purchaseContent,
    getPurchaseHistory,
    checkPurchaseStatus,
    getPurchasedContent
} from '../controllers/payment.controller.js';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Test route to verify payment routes are working
router.get('/test', (req, res) => {
    console.log('=== PAYMENT TEST ROUTE HIT ===');
    res.json({ message: 'Payment routes are working!' });
});

router.get('/simple-test', (req, res) => {
    console.log('=== SIMPLE TEST ROUTE HIT ===');
    res.json({ message: 'Simple test route working!' });
});

// Payment statistics (Admin only)
router.get('/stats', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), getPaymentStats);

// Course purchase simulation (Admin only)
router.post('/simulate-course-purchase', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), simulateCoursePurchase);

// Record course purchase
router.post('/record-course-purchase', isLoggedIn, recordCoursePurchase);

// New payment routes for lesson/unit purchases
router.post('/purchase-content', isLoggedIn, (req, res, next) => {
    console.log('=== PURCHASE CONTENT ROUTE HIT ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    purchaseContent(req, res, next);
});
router.get('/purchase-history', isLoggedIn, getPurchaseHistory);
router.get('/check-purchase-status', isLoggedIn, checkPurchaseStatus);

router.get('/purchased-content', isLoggedIn, getPurchasedContent);

export default router;