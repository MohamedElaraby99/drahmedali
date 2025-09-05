import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaDownload, FaCalendarAlt, FaFilePdf, FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { axiosInstance } from '../Helpers/axiosInstance';

const FinancialReportModal = ({ isOpen, onClose }) => {
  const componentRef = useRef();
  const [reportData, setReportData] = useState({
    startDate: '',
    endDate: '',
    reportType: 'comprehensive'
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fetchedReportData, setFetchedReportData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Set default date range (current month)
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setReportData({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
        reportType: 'comprehensive'
      });
    }
  }, [isOpen]);

  // Trigger print when report data is fetched
  useEffect(() => {
    if (fetchedReportData) {
      // Small delay to ensure component is rendered
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fetchedReportData]);

  const showSuccessToast = (message) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  const showErrorToast = (message) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `تقرير_مالي_${reportData.startDate}_${reportData.endDate}`,
    onAfterPrint: () => {
      showSuccessToast('تم إنشاء التقرير المالي بنجاح');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchReportData = async () => {
    if (!reportData.startDate || !reportData.endDate) {
      showErrorToast('يرجى تحديد تاريخ البداية والنهاية');
      return;
    }

    setGenerating(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        reportType: reportData.reportType
      });

      const reportResponse = await axiosInstance.get(`/financial/report?${queryParams.toString()}`);

      if (!reportResponse.data.success) {
        throw new Error('فشل في جلب البيانات المالية');
      }

      setFetchedReportData(reportResponse.data.data);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      showErrorToast('حدث خطأ أثناء جلب بيانات التقرير');
    } finally {
      setGenerating(false);
    }
  };

  // Helper functions for safe text and numbers
  const safeText = (text, fallback = '—') => {
    if (text === null || text === undefined || text === '') return fallback;
    return String(text).trim();
  };

  const safeNumber = (num) => {
    if (num === null || num === undefined || num === '') return 0;
    const parsed = parseFloat(num);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Format numbers with Arabic-Indic numerals
  const formatAmount = (num) => {
    const value = safeNumber(num);
    return value.toLocaleString('ar-EG', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const formatInt = (num) => {
    const value = safeNumber(num);
    return value.toLocaleString('ar-EG');
  };

  // Format dates with Arabic locale
  const formatGBDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ar-EG');
  };

  // Arabic translations
  const arabicStatus = {
    completed: 'مكتمل',
    pending: 'معلق',
    cancelled: 'ملغي',
    failed: 'فشل',
    refunded: 'مسترد'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return '—';
    }
  };

  const handleClose = () => {
    setReportData({
      startDate: '',
      endDate: '',
      reportType: 'comprehensive'
    });
    setFetchedReportData(null);
    onClose();
  };

  // Printable report component
  const PrintableReport = () => {
    if (!fetchedReportData) return null;

    const summary = fetchedReportData.summary || {};
    const transactions = fetchedReportData.transactions || [];

    return (
      <div ref={componentRef} className="p-8 bg-white" style={{ fontFamily: 'Amiri, Cairo, sans-serif', direction: 'rtl' }}>
        <style>{`
          @page {
            size: A4;
            margin: 1cm;
          }
          @media print {
            body {
              font-family: 'Amiri', 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
            }
            .no-print {
              display: none !important;
            }
            .print-break {
              page-break-before: always;
            }
            table {
              page-break-inside: avoid;
            }
            .summary-card {
              break-inside: avoid;
            }
          }
        `}</style>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">التقرير المالي</h1>
          <div className="flex justify-between text-gray-700 text-sm mb-2">
            <span>تاريخ الإنشاء: {formatGBDate(new Date())}</span>
            <span>الفترة: {formatGBDate(reportData.startDate)} - {formatGBDate(reportData.endDate)}</span>
          </div>
          <p className="text-gray-600">أنشئ بواسطة: {safeText(fetchedReportData.generatedBy, 'النظام')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="summary-card bg-green-100 p-4 rounded-lg text-center">
            <h3 className="font-bold text-green-800">إجمالي الدخل</h3>
            <p className="text-2xl font-bold text-green-900">{formatAmount(summary.totalIncome)} جنيه</p>
          </div>
          <div className="summary-card bg-red-100 p-4 rounded-lg text-center">
            <h3 className="font-bold text-red-800">إجمالي المصروفات</h3>
            <p className="text-2xl font-bold text-red-900">{formatAmount(summary.totalExpenses)} جنيه</p>
          </div>
          <div className="summary-card bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="font-bold text-blue-800">صافي الربح</h3>
            <p className="text-2xl font-bold text-blue-900">{formatAmount(summary.netProfit)} جنيه</p>
          </div>
          <div className="summary-card bg-orange-100 p-4 rounded-lg text-center">
            <h3 className="font-bold text-orange-800">عدد المعاملات</h3>
            <p className="text-2xl font-bold text-orange-900">{formatInt(summary.totalTransactions)}</p>
          </div>
        </div>

        {/* Top Students Table */}
        {fetchedReportData.topStudents && fetchedReportData.topStudents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">أعلى الطلاب دفعاً</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">الترتيب</th>
                  <th className="border border-gray-300 px-4 py-2">اسم الطالب</th>
                  <th className="border border-gray-300 px-4 py-2">عدد الدفعات</th>
                  <th className="border border-gray-300 px-4 py-2">إجمالي المدفوع</th>
                </tr>
              </thead>
              <tbody>
                {fetchedReportData.topStudents.slice(0, 10).map((student, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{safeText(student.studentName || student.username, 'طالب مجهول')}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{formatInt(student.paymentCount)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{formatAmount(student.totalPaid)} جنيه</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions Table */}
        <div className="print-break">
          <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل المعاملات</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2">نوع المعاملة</th>
                <th className="border border-gray-300 px-2 py-2">الوصف</th>
                <th className="border border-gray-300 px-2 py-2">المبلغ</th>
                <th className="border border-gray-300 px-2 py-2">التاريخ</th>
                <th className="border border-gray-300 px-2 py-2">الحالة</th>
                <th className="border border-gray-300 px-2 py-2">الطالب</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 50).map((transaction, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {transaction.type === 'income' ? 'إيراد' : 'مصروف'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">{safeText(transaction.description)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{formatAmount(transaction.amount)} جنيه</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{formatGBDate(transaction.transactionDate)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{arabicStatus[transaction.status] || transaction.status}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    {safeText(transaction.userId?.fullName, 'مجهول')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length > 50 && (
            <p className="text-gray-600 text-sm mt-2">تم عرض أول 50 معاملة فقط. إجمالي المعاملات: {transactions.length}</p>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Printable component - positioned off-screen but visible to print */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <PrintableReport />
      </div>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <FaFilePdf className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white" dir="rtl">
                إنشاء تقرير مالي مفصل
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir="rtl">
                نوع التقرير
              </label>
              <select
                name="reportType"
                value={reportData.reportType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="comprehensive">تقرير شامل (إيرادات ومصروفات)</option>
                <option value="income">تقرير الإيرادات فقط</option>
                <option value="expenses">تقرير المصروفات فقط</option>
                <option value="summary">ملخص مالي</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir="rtl">
                  <FaCalendarAlt className="inline ml-2" />
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={reportData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir="rtl">
                  <FaCalendarAlt className="inline ml-2" />
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={reportData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir="rtl">
                معاينة التقرير
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1" dir="rtl">
                <p>• نوع التقرير: {reportData.reportType === 'comprehensive' ? 'تقرير شامل' : 
                                    reportData.reportType === 'income' ? 'تقرير الإيرادات' :
                                    reportData.reportType === 'expenses' ? 'تقرير المصروفات' : 'ملخص مالي'}</p>
                <p>• الفترة: {reportData.startDate && reportData.endDate ? 
                             `${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}` : 
                             'غير محدد'}</p>
                <p>• سيتم تضمين جميع المعاملات المالية في هذه الفترة</p>
                <p>• التقرير سيكون بصيغة PDF قابلة للطباعة</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              dir="rtl"
            >
              إلغاء
            </button>
            <button
              onClick={fetchReportData}
              disabled={generating || !reportData.startDate || !reportData.endDate}
              className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              dir="rtl"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>  
                  <FaPrint />
                  <span>طباعة التقرير</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse" dir="rtl">
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FinancialReportModal;