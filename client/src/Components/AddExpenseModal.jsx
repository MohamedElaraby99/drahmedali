import React, { useState, useEffect } from 'react';
import { FaTimes, FaReceipt, FaCalendarAlt, FaMoneyBillWave, FaTag } from 'react-icons/fa';
import { axiosInstance } from '../Helpers/axiosInstance';

const AddExpenseModal = ({ isOpen, onClose, onSubmit }) => {
  const [expenseCategory, setExpenseCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Expense categories - mapping Arabic labels to English backend enum values
  const expenseCategories = [
    { value: 'salary', label: 'الرواتب' },
    { value: 'rent', label: 'الإيجار' },
    { value: 'utilities', label: 'المرافق (كهرباء، ماء، غاز)' },
    { value: 'supplies', label: 'المستلزمات' },
    { value: 'marketing', label: 'التسويق' },
    { value: 'other', label: 'أخرى' }
  ];

  // Payment methods - mapping Arabic labels to English backend enum values
  const paymentMethods = [
    { value: 'cash', label: 'نقداً' },
    { value: 'bank_transfer', label: 'تحويل بنكي' },
    { value: 'card', label: 'بطاقة' },
    { value: 'other', label: 'أخرى' }
  ];

  // Toast functions
  const showSuccessToast = (message) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const showErrorToast = (message) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expenseCategory || !amount) {
      showErrorToast('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (parseFloat(amount) <= 0) {
      showErrorToast('المبلغ يجب أن يكون أكبر من صفر');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        amount: parseFloat(amount),
        description: description || `مصروف - ${expenseCategories.find(cat => cat.value === expenseCategory)?.label}`,
        expenseCategory,
        transactionDate: expenseDate,
        paymentMethod,
        notes
      };

      console.log('Expense Data:', expenseData);

      const response = await axiosInstance.post('/financial/expense', expenseData);

      if (response.data.success) {
        const savedExpense = response.data.data;
        const expenseInfo = {
          amount: savedExpense.amount,
          category: expenseCategories.find(cat => cat.value === expenseCategory)?.label,
          description: savedExpense.description,
          date: savedExpense.transactionDate
        };
        
        console.log('Expense Info:', expenseInfo);
        
        // Show success message
        showSuccessToast(`تم إضافة المصروف بنجاح: ${expenseInfo.amount} جنيه - ${expenseInfo.category}`);
        
        onSubmit(expenseInfo);
        handleClose();
      } else {
        throw new Error(response.data.message || 'فشل في إضافة المصروف');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء إضافة المصروف';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setExpenseCategory('');
    setAmount('');
    setDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setNotes('');
    setToast({ show: false, message: '', type: 'success' });
    onClose();
  };

  if (!isOpen) return null;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FaReceipt className="text-2xl text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إضافة مصروف جديد
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تسجيل مصروف جديد مثل الرواتب أو الفواتير
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expense Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  فئة المصروف *
                </label>
                <div className="relative">
                  <FaTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">اختر فئة المصروف</option>
                    {expenseCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المبلغ (جنيه) *
                </label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف المصروف
                </label>
                <div className="relative">
                  <FaReceipt className="absolute right-3 top-3 text-gray-400" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف تفصيلي للمصروف..."
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ المصروف *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || !expenseCategory || !amount}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaReceipt />
                    <span>إضافة المصروف</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

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
      </div>
    </>
  );
};

export default AddExpenseModal;
