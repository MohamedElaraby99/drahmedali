import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Financial from '../models/financial.model.js';
import User from '../models/user.model.js';
import Group from '../models/group.model.js';
import { getCairoNow, toCairoTime, getCairoStartOfMonth, getCairoEndOfMonth, createCairoDateRange } from '../utils/timezone.js';

// Add new income transaction
export const addIncome = asyncHandler(async (req, res) => {
  const {
    userId,
    groupId,
    amount,
    description,
    category,
    transactionDate,
    paymentMethod,
    notes
  } = req.body;

  // Validate required fields
  if (!userId || !groupId || !amount) {
    throw new ApiError(400, "User and group and amount are required");
  }

  // Validate amount
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if group exists
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if user is in the group
  const isUserInGroup = group.students.includes(userId);
  if (!isUserInGroup) {
    throw new ApiError(400, "User not registered in this group");
  }

  // For monthly payments, we don't need to check previous payments
  // Each month is a fresh payment cycle
  console.log(`Adding payment for user ${userId} in group ${groupId} for current month.`);

  // Create income transaction
  const income = await Financial.create({
    type: 'income',
    amount,
    description: description || `رسوم ${group.name}`,
    category: category || 'group_fees',
    userId,
    groupId,
    transactionDate: transactionDate ? toCairoTime(transactionDate) : getCairoNow(),
    paymentMethod: paymentMethod || 'cash',
    notes,
    createdBy: req.user.id
  });

  // Populate the created income with user and group details
  await income.populate([
    { path: 'userId', select: 'fullName email' },
    { path: 'groupId', select: 'name' },
    { path: 'createdBy', select: 'fullName' }
  ]);

  console.log('Created income:', income);
  console.log('Income userId:', income.userId);
  console.log('Income groupId:', income.groupId);

  res.status(201).json(
    new ApiResponse(201, income, "تم إضافة الإيراد بنجاح")
  );
});

// Add new expense transaction
export const addExpense = asyncHandler(async (req, res) => {
  const {
    amount,
    description,
    expenseCategory,
    transactionDate,
    paymentMethod,
    notes,
    receiptUrl
  } = req.body;

  // Validate required fields
  if (!amount || !expenseCategory) {
    throw new ApiError(400, "المبلغ وفئة المصروف مطلوبان");
  }

  // Validate amount
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  // Create expense transaction
  const expense = await Financial.create({
    type: 'expense',
    amount,
    description: description || `مصروف - ${expenseCategory}`,
    expenseCategory,
    transactionDate: transactionDate ? toCairoTime(transactionDate) : getCairoNow(),
    paymentMethod: paymentMethod || 'cash',
    notes,
    receiptUrl,
    createdBy: req.user.id
  });

  // Populate the created expense with creator details
  await expense.populate([
    { path: 'createdBy', select: 'fullName' }
  ]);

  res.status(201).json(
    new ApiResponse(201, expense, "تم إضافة المصروف بنجاح")
  );
});

// Get all financial transactions with pagination and filtering
export const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    userId,
    groupId,
    expenseCategory,
    startDate,
    endDate,
    search,
    sortBy = 'transactionDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (type) {
    query.type = type;
  }

  if (userId) {
    query.userId = userId;
  }

  if (groupId) {
    query.groupId = groupId;
  }

  if (expenseCategory) {
    query.expenseCategory = expenseCategory;
  }

  if (startDate || endDate) {
    query.transactionDate = {};
    if (startDate) {
      query.transactionDate.$gte = toCairoTime(startDate);
    }
    if (endDate) {
      query.transactionDate.$lte = toCairoTime(endDate);
    }
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: 'userId', select: 'fullName email' },
      { path: 'groupId', select: 'name' },
      { path: 'createdBy', select: 'fullName' }
    ]
  };

  const transactions = await Financial.paginate(query, options);

  res.status(200).json(
    new ApiResponse(200, transactions, "تم جلب المعاملات المالية بنجاح")
  );
});

// Get financial statistics
export const getFinancialStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.transactionDate = {};
    if (startDate) {
      dateFilter.transactionDate.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.transactionDate.$lte = new Date(endDate);
    }
  }

  // Get total income
  const totalIncome = await Financial.aggregate([
    { $match: { type: 'income', ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Get total expenses
  const totalExpenses = await Financial.aggregate([
    { $match: { type: 'expense', ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Get net profit
  const netProfit = (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0);

  // Get pending payments (income transactions with pending status)
  const pendingPayments = await Financial.aggregate([
    { $match: { type: 'income', status: 'pending', ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Get income by category
  const incomeByCategory = await Financial.aggregate([
    { $match: { type: 'income', ...dateFilter } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Get expenses by category
  const expensesByCategory = await Financial.aggregate([
    { $match: { type: 'expense', ...dateFilter } },
    { $group: { _id: '$expenseCategory', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  const stats = {
    totalIncome: totalIncome[0]?.total || 0,
    totalExpenses: totalExpenses[0]?.total || 0,
    netProfit,
    pendingPayments: pendingPayments[0]?.total || 0,
    incomeByCategory,
    expensesByCategory
  };

  res.status(200).json(
    new ApiResponse(200, stats, "تم جلب الإحصائيات المالية بنجاح")
  );
});

// Get transaction by ID
export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Financial.findById(id)
    .populate('userId', 'fullName email')
    .populate('groupId', 'name')
    .populate('createdBy', 'fullName');

  if (!transaction) {
    throw new ApiError(404, "المعاملة المالية غير موجودة");
  }

  res.status(200).json(
    new ApiResponse(200, transaction, "تم جلب المعاملة المالية بنجاح")
  );
});

// Update transaction
export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.type;
  delete updateData.createdBy;

  const transaction = await Financial.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'userId', select: 'fullName email' },
    { path: 'groupId', select: 'name' },
    { path: 'createdBy', select: 'fullName' }
  ]);

  if (!transaction) {
    throw new ApiError(404, "المعاملة المالية غير موجودة");
  }

  res.status(200).json(
    new ApiResponse(200, transaction, "تم تحديث المعاملة المالية بنجاح")
  );
});

// Delete transaction
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Financial.findByIdAndDelete(id);

  if (!transaction) {
    throw new ApiError(404, "المعاملة المالية غير موجودة");
  }

  res.status(200).json(
    new ApiResponse(200, null, "تم حذف المعاملة المالية بنجاح")
  );
});

// Get monthly payment status for a group
export const getGroupPaymentStatus = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { month, year } = req.query;

  // Use current month/year if not provided
  const currentDate = new Date();
  const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // month is 0-indexed
  const targetYear = year ? parseInt(year) : currentDate.getFullYear();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  // Get group with students
  const group = await Group.findById(groupId).populate('students', 'fullName email');
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Get payments for this month
  const payments = await Financial.find({
    type: 'income',
    groupId: groupId,
    transactionDate: {
      $gte: startOfMonth,
      $lte: endOfMonth
    },
    status: { $ne: 'cancelled' }
  }).populate('userId', 'fullName email');

  // Create payment status for each student (current month only)
  const paymentStatus = group.students.map(student => {
    // Find all payments for this student in this month only
    const studentPayments = payments.filter(p => p.userId._id.toString() === student._id.toString());
    
    console.log(`=== BACKEND DEBUG for ${student.fullName} ===`);
    console.log('Student ID:', student._id);
    console.log('All payments this month:', payments.length);
    console.log('Student payments found:', studentPayments.length);
    console.log('Student payments:', studentPayments);
    
    // Calculate total amount paid this month
    const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    console.log('Total paid:', totalPaid);
    console.log('Group price:', group.price);
    console.log('Has paid:', totalPaid > 0);
    console.log('=====================================');
    
    // Get the latest payment date this month
    const latestPayment = studentPayments.length > 0 
      ? studentPayments.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))[0]
      : null;
    
    return {
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email
      },
      hasPaid: totalPaid > 0,
      totalPaid: totalPaid,
      remainingAmount: group.price - totalPaid,
      paymentDate: latestPayment ? latestPayment.transactionDate : null,
      amount: group.price, // Full group price for this month
      status: totalPaid >= group.price ? 'fully_paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid',
      paymentCount: studentPayments.length,
      month: targetMonth + 1,
      year: targetYear
    };
  });

  const stats = {
    totalStudents: group.students.length,
    paidStudents: paymentStatus.filter(p => p.hasPaid).length,
    unpaidStudents: paymentStatus.filter(p => !p.hasPaid).length,
    totalExpected: group.students.length * group.price,
    totalCollected: payments.reduce((sum, p) => sum + p.amount, 0),
    month: targetMonth + 1,
    year: targetYear,
    groupName: group.name
  };

  res.status(200).json(
    new ApiResponse(200, {
      stats,
      paymentStatus
    }, "تم جلب حالة الدفع الشهري بنجاح")
  );
});

// Generate comprehensive financial report
export const generateFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, reportType = 'comprehensive' } = req.query;

  // Validate date range
  if (!startDate || !endDate) {
    throw new ApiError(400, "تاريخ البداية والنهاية مطلوبان");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new ApiError(400, "تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
  }

  // Build date filter
  const dateFilter = {
    transactionDate: {
      $gte: start,
      $lte: end
    }
  };

  // Get transactions based on report type
  let query = { ...dateFilter };
  if (reportType === 'income') {
    query.type = 'income';
  } else if (reportType === 'expenses') {
    query.type = 'expense';
  }

  // Get all transactions for the period
  const transactions = await Financial.find(query)
    .populate('userId', 'fullName email')
    .populate('groupId', 'name')
    .populate('createdBy', 'fullName')
    .sort({ transactionDate: -1 });

  // Calculate statistics
  const stats = await Financial.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  // Get income by category
  const incomeByCategory = await Financial.aggregate([
    { $match: { type: 'income', ...dateFilter } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Get expenses by category
  const expensesByCategory = await Financial.aggregate([
    { $match: { type: 'expense', ...dateFilter } },
    { $group: { _id: '$expenseCategory', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Get daily transaction summary
  const dailySummary = await Financial.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Get top students by payments
  const topStudents = await Financial.aggregate([
    { $match: { type: 'income', ...dateFilter } },
    {
      $group: {
        _id: '$userId',
        totalPaid: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    { $sort: { totalPaid: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        studentName: '$user.fullName',
        totalPaid: 1,
        paymentCount: 1
      }
    }
  ]);

  // Calculate summary statistics
  const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
  const totalExpenses = stats.find(s => s._id === 'expense')?.total || 0;
  const netProfit = totalIncome - totalExpenses;
  const totalTransactions = transactions.length;

  const reportData = {
    period: {
      startDate,
      endDate,
      days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    },
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
      totalTransactions,
      avgTransactionAmount: totalTransactions > 0 ? (totalIncome + totalExpenses) / totalTransactions : 0
    },
    transactions,
    incomeByCategory,
    expensesByCategory,
    dailySummary,
    topStudents,
    generatedAt: new Date(),
    generatedBy: req.user.fullName
  };

  res.status(200).json(
    new ApiResponse(200, reportData, "تم إنشاء التقرير المالي بنجاح")
  );
});
