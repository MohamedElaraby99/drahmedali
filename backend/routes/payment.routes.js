import express from 'express';
import { 
    getWalletBalance,
    addToWallet,
    getWalletTransactions
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

// Wallet routes
router.get('/wallet/balance', isLoggedIn, getWalletBalance);
router.post('/wallet/add', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), addToWallet);
router.get('/wallet/transactions', isLoggedIn, getWalletTransactions);

export default router;