import React, { useState, useEffect } from 'react';
import { 
  FaShoppingCart, 
  FaCreditCard, 
  FaWallet, 
  FaCheck, 
  FaTimes, 
  FaSpinner,
  FaCoins,
  FaLock,
  FaUnlock,
  FaPlay,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';

const PurchaseModal = ({ 
  isOpen, 
  onClose, 
  lesson, 
  price, 
  balance, 
  onPurchase, 
  loading, 
  success, 
  error,
  role = 'USER'
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  }, [success, onClose]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  }, [error]);

  if (!isOpen) return null;

  // Admin doesn't need to purchase
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUnlock className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">وصول المدير</h2>
                  <p className="text-sm opacity-90">لديك وصول كامل لجميع المحتوى</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                مرحباً بك كمدير!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                يمكنك الوصول إلى جميع الدروس والمحتوى بدون الحاجة للشراء
              </p>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canAfford = balance >= price;
  const remainingBalance = balance - price;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Success Animation */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaCheck className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">تم الشراء بنجاح!</h3>
              <p className="text-sm opacity-90">تم فتح الدرس وجاهز للمشاهدة</p>
            </div>
          </div>
        )}

        {/* Error Animation */}
        {showError && (
          <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaTimes className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">فشل في الشراء</h3>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaShoppingCart className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold">شراء الدرس</h2>
                <p className="text-sm opacity-90">افتح هذا الدرس لبدء التعلم</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Lesson Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaPlay className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {lesson?.title || 'درس بدون عنوان'}
                </h3>
                {lesson?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                    درس فيديو
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                    جودة عالية
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">سعر الدرس</span>
              <div className="flex items-center gap-2">
                <FaCoins className="text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {price} نقطة
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">رصيدك</span>
              <div className="flex items-center gap-2">
                <FaWallet className="text-green-500" />
                <span className={`font-semibold ${canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {balance} نقطة
                </span>
              </div>
            </div>

            {canAfford && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الرصيد المتبقي</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {remainingBalance} نقطة
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Insufficient Balance Warning */}
          {!canAfford && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <FaLock className="text-red-600 dark:text-red-400 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">رصيد غير كافي</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    تحتاج {price - balance} نقطة إضافية لشراء هذا الدرس
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canAfford ? (
              <button
                onClick={() => onPurchase(lesson)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    جاري معالجة الشراء...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    شراء الدرس
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <FaWallet />
                شحن المحفظة
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FaStar className="text-blue-500" />
              ما ستحصل عليه
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-500 text-xs" />
                فيديوهات تعليمية عالية الجودة
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-500 text-xs" />
                ملفات PDF للدراسة
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-500 text-xs" />
                امتحان تدريبي للفهم
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-500 text-xs" />
                امتحان  شامل
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 