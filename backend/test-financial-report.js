import mongoose from 'mongoose';
import Financial from './models/financial.model.js';
import User from './models/user.model.js';
import Group from './models/group.model.js';
import { config } from 'dotenv';

// Load environment variables
config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test financial report data
const testFinancialReport = async () => {
  try {
    console.log('\n🔍 Testing Financial Report Data...\n');

    // Get date range for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`📅 Date Range: ${firstDay.toISOString().split('T')[0]} to ${lastDay.toISOString().split('T')[0]}`);

    // Build date filter
    const dateFilter = {
      transactionDate: {
        $gte: firstDay,
        $lte: lastDay
      }
    };

    // Get all transactions for the period
    const transactions = await Financial.find(dateFilter)
      .populate('userId', 'fullName username email')
      .populate('groupId', 'name')
      .populate('createdBy', 'fullName username')
      .sort({ transactionDate: -1 });

    console.log(`📊 Total Transactions: ${transactions.length}`);

    // Check for transactions with missing data
    const transactionsWithIssues = transactions.filter(t => {
      return !t.userId || !t.groupId || !t.amount || !t.description;
    });

    if (transactionsWithIssues.length > 0) {
      console.log('\n⚠️  Transactions with missing data:');
      transactionsWithIssues.forEach((t, index) => {
        console.log(`${index + 1}. ID: ${t._id}`);
        console.log(`   Type: ${t.type}`);
        console.log(`   Amount: ${t.amount}`);
        console.log(`   Description: ${t.description || 'MISSING'}`);
        console.log(`   User: ${t.userId ? t.userId.fullName : 'MISSING'}`);
        console.log(`   Group: ${t.groupId ? t.groupId.name : 'MISSING'}`);
        console.log(`   Date: ${t.transactionDate}`);
        console.log('');
      });
    } else {
      console.log('✅ All transactions have complete data');
    }

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

    console.log('\n📈 Financial Statistics:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.total.toLocaleString()} EGP (${stat.count} transactions, avg: ${stat.avgAmount.toFixed(2)} EGP)`);
    });

    // Get income by category
    const incomeByCategory = await Financial.aggregate([
      { $match: { type: 'income', ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    console.log('\n💰 Income by Category:');
    incomeByCategory.forEach(category => {
      console.log(`• ${category._id || 'Unknown'}: ${category.total.toLocaleString()} EGP (${category.count} transactions)`);
    });

    // Get expenses by category
    const expensesByCategory = await Financial.aggregate([
      { $match: { type: 'expense', ...dateFilter } },
      { $group: { _id: '$expenseCategory', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    console.log('\n💸 Expenses by Category:');
    expensesByCategory.forEach(category => {
      console.log(`• ${category._id || 'Unknown'}: ${category.total.toLocaleString()} EGP (${category.count} transactions)`);
    });

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
          username: '$user.username',
          totalPaid: 1,
          paymentCount: 1
        }
      }
    ]);

    console.log('\n👥 Top Paying Students:');
    topStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.studentName || student.username || 'Unknown'}: ${student.totalPaid.toLocaleString()} EGP (${student.paymentCount} payments)`);
    });

    // Calculate summary
    const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
    const totalExpenses = stats.find(s => s._id === 'expense')?.total || 0;
    const netProfit = totalIncome - totalExpenses;

    console.log('\n📋 Summary:');
    console.log(`Total Income: ${totalIncome.toLocaleString()} EGP`);
    console.log(`Total Expenses: ${totalExpenses.toLocaleString()} EGP`);
    console.log(`Net Profit: ${netProfit.toLocaleString()} EGP`);
    console.log(`Total Transactions: ${transactions.length}`);
    console.log(`Period Days: ${Math.ceil((lastDay - firstDay) / (1000 * 60 * 60 * 24))}`);

    console.log('\n✅ Financial report test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing financial report:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testFinancialReport();
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
  process.exit(0);
};

runTest();
