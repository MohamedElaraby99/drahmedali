import express from 'express';
import {
  addIncome,
  addExpense,
  getAllTransactions,
  getFinancialStats,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getGroupPaymentStatus,
  generateFinancialReport
} from '../controllers/financial.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(isLoggedIn);

// Add new income transaction
router.post('/income', addIncome);

// Add new expense transaction
router.post('/expense', addExpense);

// Get all financial transactions with filtering and pagination
router.get('/', getAllTransactions);

// Get financial statistics
router.get('/stats', getFinancialStats);

// Generate comprehensive financial report
router.get('/report', generateFinancialReport);

// Get group payment status for a specific month
router.get('/group/:groupId/payment-status', getGroupPaymentStatus);

// Get transaction by ID
router.get('/:id', getTransactionById);

// Update transaction
router.put('/:id', updateTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

export default router;
