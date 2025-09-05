import React, { useState, useEffect } from 'react';
import Layout from '../../../Layout/Layout';
import CenterManagementHeader from '../../../Components/CenterManagementHeader';
import MonthlyDataManager from '../../../Components/MonthlyDataManager';
import AddIncomeModal from '../../../Components/AddIncomeModal';
import AddExpenseModal from '../../../Components/AddExpenseModal';
import FinancialReportModal from '../../../Components/FinancialReportModal';
import { FaMoneyBillWave, FaChartBar, FaReceipt, FaCreditCard, FaPiggyBank, FaFilePdf } from 'react-icons/fa';
import { axiosInstance } from '../../../Helpers/axiosInstance';

const Financial = () => {
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0
  });
  const [pendingPaymentsData, setPendingPaymentsData] = useState({
    totalPending: 0,
    totalExpected: 0,
    paidAmount: 0
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionsPerPage] = useState(10);

  // Toast functions
  const showSuccessToast = (message) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const showErrorToast = (message) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  // Initialize with current month data when component loads
  useEffect(() => {
    if (!selectedMonthData) {
      // Set current month as default
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const currentMonthData = {
        key: currentMonthKey,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: startDate.toLocaleDateString('ar-EG', { 
          month: 'long', 
          year: 'numeric' 
        }),
        isCurrent: true,
        isFuture: false
      };
      
      setSelectedMonthData(currentMonthData);
      setDateRange({
        start: currentMonthData.startDate,
        end: currentMonthData.endDate
      });
    }
  }, []);

  // Fetch financial data
  useEffect(() => {
    if (selectedMonthData) {
      fetchFinancialDataForMonth(selectedMonthData);
    }
  }, [selectedMonthData]);

  const handleMonthChange = (monthData) => {
    setSelectedMonthData(monthData);
    // Update date range filters for the selected month
    setDateRange({
      start: monthData.startDate,
      end: monthData.endDate
    });
  };

  const fetchFinancialDataForMonth = async (monthData) => {
    setLoading(true);
    try {
      await fetchFinancialData(1, searchTerm, transactionType, monthData.startDate, monthData.endDate);
    } catch (error) {
      console.error('Error fetching financial data for month:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending payments on component mount
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchFinancialData = async (page = currentPage, search = searchTerm, type = transactionType, startDate = dateRange.start, endDate = dateRange.end) => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: transactionsPerPage.toString(),
        sortBy: 'transactionDate',
        sortOrder: 'desc'
      });

      if (search) queryParams.append('search', search);
      if (type) queryParams.append('type', type);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Build stats query parameters with same date range
      const statsQueryParams = new URLSearchParams();
      if (startDate) statsQueryParams.append('startDate', startDate);
      if (endDate) statsQueryParams.append('endDate', endDate);

      // Fetch transactions, stats, and pending payments in parallel
      const [transactionsResponse, statsResponse, pendingPaymentsResponse] = await Promise.all([
        axiosInstance.get(`/financial?${queryParams.toString()}`),
        axiosInstance.get(`/financial/stats?${statsQueryParams.toString()}`),
        fetchPendingPayments()
      ]);

      if (transactionsResponse.data.success) {
        const transactionData = transactionsResponse.data.data;
        setTransactions(transactionData.docs || []);
        setTotalPages(transactionData.totalPages || 1);
        setTotalTransactions(transactionData.totalDocs || 0);
        setCurrentPage(transactionData.page || 1);
      }

      if (statsResponse.data.success) {
        const statsData = statsResponse.data.data;
        setStats({
          totalIncome: statsData.totalIncome || 0,
          totalExpenses: statsData.totalExpenses || 0,
          netProfit: statsData.netProfit || 0,
          pendingPayments: pendingPaymentsData.totalPending || 0
        });
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      // Get all groups to calculate pending payments
      const groupsResponse = await axiosInstance.get('/groups');
      if (!groupsResponse.data.success) return;

      const groups = groupsResponse.data.data.docs || [];
      let totalPending = 0;
      let totalExpected = 0;
      let paidAmount = 0;

      // Use selected month or current month
      const targetDate = selectedMonthData ? 
        new Date(selectedMonthData.year, selectedMonthData.month - 1, 1) :
        new Date();
      const targetMonth = targetDate.getMonth() + 1;
      const targetYear = targetDate.getFullYear();

      // Calculate pending payments for each group
      for (const group of groups) {
        if (group.students && group.students.length > 0) {
          // Get payment status for this group
          const paymentStatusResponse = await axiosInstance.get(
            `/financial/group/${group._id}/payment-status?month=${targetMonth}&year=${targetYear}`
          );

          if (paymentStatusResponse.data.success) {
            const paymentStatus = paymentStatusResponse.data.data.paymentStatus;
            const groupExpected = group.students.length * (group.price || 0);
            const groupPaid = paymentStatus.reduce((sum, status) => sum + (status.totalPaid || 0), 0);
            const groupPending = groupExpected - groupPaid;

            totalExpected += groupExpected;
            paidAmount += groupPaid;
            totalPending += groupPending;
          }
        }
      }

      setPendingPaymentsData({
        totalPending,
        totalExpected,
        paidAmount
      });

      return { totalPending, totalExpected, paidAmount };
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return { totalPending: 0, totalExpected: 0, paidAmount: 0 };
    }
  };

  const financialStats = [
    {
      title: selectedMonthData?.isCurrent ? 'إجمالي الإيرادات' : `إيرادات ${selectedMonthData?.label || 'الشهر'}`,
      value: `${stats.totalIncome.toLocaleString()} جنيه`,
      change: selectedMonthData?.isCurrent ? '+12.5%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived',
      icon: FaMoneyBillWave,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: selectedMonthData?.isCurrent ? 'المصروفات الشهرية' : `مصروفات ${selectedMonthData?.label || 'الشهر'}`,
      value: `${stats.totalExpenses.toLocaleString()} جنيه`,
      change: selectedMonthData?.isCurrent ? '+8.2%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'negative' : 'archived',
      icon: FaReceipt,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      title: selectedMonthData?.isCurrent ? 'الربح الصافي' : `ربح ${selectedMonthData?.label || 'الشهر'}`,
      value: `${stats.netProfit.toLocaleString()} جنيه`,
      change: selectedMonthData?.isCurrent ? '+15.3%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived',
      icon: FaChartBar,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: selectedMonthData?.isCurrent ? 'المدفوعات المعلقة' : `مدفوعات ${selectedMonthData?.label || 'الشهر'}`,
      value: `${pendingPaymentsData.totalPending.toLocaleString()} جنيه`,
      change: selectedMonthData?.isCurrent ? (
        pendingPaymentsData.totalExpected > 0 ? 
        `${Math.round(((pendingPaymentsData.totalExpected - pendingPaymentsData.totalPending) / pendingPaymentsData.totalExpected) * 100)}% مدفوع` : 
        '0% مدفوع'
      ) : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? (pendingPaymentsData.totalPending > 0 ? 'negative' : 'positive') : 'archived',
      icon: FaCreditCard,
      color: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  const handleAddIncome = (incomeData) => {
    console.log('New income added:', incomeData);
    // Refresh the financial data to show the new transaction and update pending payments
    fetchFinancialData();
    fetchPendingPayments();
    showSuccessToast(`تم إضافة إيراد جديد: ${incomeData.amount} جنيه من ${incomeData.userName}`);
  };

  const handleAddExpense = (expenseData) => {
    console.log('New expense added:', expenseData);
    // Refresh the financial data to show the new transaction
    fetchFinancialData();
    showSuccessToast(`تم إضافة مصروف جديد: ${expenseData.amount} جنيه - ${expenseData.category}`);
  };

  // Search and filter handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFinancialData(1, searchTerm, transactionType, dateRange.start, dateRange.end);
  };

  const handleTypeFilter = (type) => {
    setTransactionType(type);
    setCurrentPage(1);
    fetchFinancialData(1, searchTerm, type, dateRange.start, dateRange.end);
  };

  const handleDateFilter = (start, end) => {
    setDateRange({ start, end });
    setCurrentPage(1);
    fetchFinancialData(1, searchTerm, transactionType, start, end);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFinancialData(page, searchTerm, transactionType, dateRange.start, dateRange.end);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTransactionType('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    fetchFinancialData(1, '', '', '', '');
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          <CenterManagementHeader />

          {/* Monthly Data Manager */}
          <MonthlyDataManager 
            onMonthChange={handleMonthChange}
            showStartNewMonth={false}
            className="mb-6"
          />
        
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financialStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : stat.changeType === 'negative'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {stat.changeType === 'archived' ? stat.change : `${stat.change} من الشهر الماضي`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                    <Icon className="text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaPiggyBank className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                إضافة إيراد
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تسجيل إيراد جديد من رسوم الدورات أو الخدمات
            </p>
            <button 
              onClick={() => setIsAddIncomeModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              إضافة إيراد
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaReceipt className="text-2xl text-red-600 dark:text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تسجيل مصروف
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تسجيل مصروف جديد مثل الرواتب أو الفواتير
            </p>
            <button 
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              تسجيل مصروف
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaFilePdf className="text-2xl text-green-600 dark:text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تقرير مالي
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              إنشاء تقرير مالي مفصل لفترة محددة
            </p>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <FaFilePdf />
              <span>إنشاء تقرير</span>
            </button>
          </div>
                 </div>

                  {/* Recent Transactions */}
        <div className="bg-white mt-8 dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              المعاملات المالية الأخيرة
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              إجمالي المعاملات: {totalTransactions}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث في المعاملات..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                بحث
              </button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Transaction Type Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeFilter('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    transactionType === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => handleTypeFilter('income')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    transactionType === 'income' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  الإيرادات
                </button>
                <button
                  onClick={() => handleTypeFilter('expense')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    transactionType === 'expense' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  المصروفات
                </button>
              </div>

              {/* Date Range Filter */}
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateFilter(e.target.value, dateRange.end)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="من تاريخ"
                />
                <span className="text-gray-500 dark:text-gray-400">إلى</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateFilter(dateRange.start, e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="إلى تاريخ"
                />
              </div>

              {/* Clear Filters */}
              {(searchTerm || transactionType || dateRange.start || dateRange.end) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    النوع
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    الطالب
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    الوصف
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    المبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    التاريخ
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    الحالة
                  </th>
                </tr>
              </thead>
                             <tbody>
                 {loading ? (
                   <tr>
                     <td colSpan="6" className="py-8 text-center">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                       <p className="text-gray-500 dark:text-gray-400">جاري تحميل المعاملات...</p>
                     </td>
                   </tr>
                 ) : transactions.length === 0 ? (
                   <tr>
                     <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                       لا توجد معاملات مالية
                     </td>
                   </tr>
                 ) : (
                   transactions.map((transaction) => (
                     <tr key={transaction._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                       <td className="py-3 px-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           transaction.type === 'income'
                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                             : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                         }`}>
                           {transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                         </span>
                       </td>
                       <td className="py-3 px-4 text-gray-900 dark:text-white">
                         {transaction.type === 'income' ? (
                           transaction.userId ? (
                             <div>
                               <div className="font-medium">{transaction.userId.fullName || transaction.userId.username || 'غير محدد'}</div>
                               {transaction.groupId && (
                                 <div className="text-sm text-gray-500 dark:text-gray-400">
                                   {transaction.groupId.name}
                                 </div>
                               )}
                             </div>
                           ) : (
                             <span className="text-gray-500 dark:text-gray-400">-</span>
                           )
                         ) : (
                           <div>
                             <div className="font-medium text-red-600 dark:text-red-400">مصروف</div>
                             {transaction.expenseCategory && (
                               <div className="text-sm text-gray-500 dark:text-gray-400">
                                 {transaction.expenseCategory}
                               </div>
                             )}
                           </div>
                         )}
                       </td>
                       <td className="py-3 px-4 text-gray-900 dark:text-white">
                         {transaction.description || 'لا يوجد وصف'}
                       </td>
                       <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                         {transaction.amount.toLocaleString()} جنيه
                       </td>
                       <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                         {new Date(transaction.transactionDate).toLocaleDateString('en-GB')}
                       </td>
                       <td className="py-3 px-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           transaction.status === 'completed'
                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                             : transaction.status === 'pending'
                             ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                             : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                         }`}>
                           {transaction.status === 'completed' ? 'مكتمل' : 
                            transaction.status === 'pending' ? 'معلق' : 'ملغي'}
                         </span>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                عرض {((currentPage - 1) * transactionsPerPage) + 1} إلى {Math.min(currentPage * transactionsPerPage, totalTransactions)} من {totalTransactions} معاملة
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1 space-x-reverse">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        </div>
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        onSubmit={handleAddIncome}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
      />

      {/* Financial Report Modal */}
      <FinancialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-4 right-4 z-50"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className={`flex items-center p-4 rounded-lg shadow-lg max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: toast.type })}
              className="flex-shrink-0 mr-2 text-white hover:text-gray-200 focus:outline-none focus:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
    </>
  );
};

export default Financial;
