import React, { useEffect, useState } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaCoins,
  FaPlay,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

const ModernAlert = ({ 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  showIcon = true,
  showCloseButton = true,
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
  size = 'medium', // 'small', 'medium', 'large'
  customIcon,
  customColor,
  showProgress = true,
  actions = []
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setProgress(100);
      setTimeout(() => setAnimate(true), 100);
      
      // Auto-close timer
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        // Progress bar animation
        if (showProgress) {
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev <= 0) {
                clearInterval(progressInterval);
                return 0;
              }
              return prev - (100 / (duration / 100));
            });
          }, 100);
          
          return () => clearInterval(progressInterval);
        }
        
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [isVisible, duration, showProgress]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 300);
  };

  if (!show) return null;

  // Configuration based on type
  const config = {
    success: {
      icon: <FaCheck />,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: <FaTimes />,
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-600',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: <FaExclamationTriangle />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      progressColor: 'bg-blue-500'
    },
    info: {
      icon: <FaInfoCircle />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      progressColor: 'bg-blue-500'
    }
  };

  const currentConfig = customColor ? {
    icon: customIcon || config[type].icon,
    bgColor: customColor,
    borderColor: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-gray-800 dark:text-gray-200',
    bgLight: 'bg-gray-50 dark:bg-gray-900/20',
    progressColor: 'bg-gray-500'
  } : config[type];

  // Size configurations
  const sizeConfig = {
    small: 'max-w-xs p-4',
    medium: 'max-w-sm p-6',
    large: 'max-w-md p-8'
  };

  // Position configurations
  const positionConfig = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionConfig[position]} z-[9999]`}>
      <div className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border ${currentConfig.borderColor}
        ${sizeConfig[size]} w-full transform transition-all duration-300 ease-out
        ${animate ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        backdrop-blur-sm
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className={`w-10 h-10 ${currentConfig.bgColor} rounded-full flex items-center justify-center text-white animate-pulse`}>
                {currentConfig.icon}
              </div>
            )}
            <div>
              <h3 className={`text-lg font-bold ${currentConfig.textColor}`}>
                {title}
              </h3>
              {message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {message}
                </p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FaTimes className="text-gray-500 text-sm" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Custom content slot */}
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                    action.primary 
                      ? `${currentConfig.bgColor} text-white hover:opacity-90`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && duration > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div 
                className={`${currentConfig.progressColor} h-full rounded-full transition-all duration-100`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Success Alert Component
export const PaymentSuccessAlert = ({ isVisible, onClose, lessonTitle, amount, remainingBalance }) => {
  return (
    <ModernAlert
      type="success"
      title="تم الشراء بنجاح! 🎉"
      message="تم فتح الدرس وجاهز للمشاهدة"
      isVisible={isVisible}
      onClose={onClose}
      duration={4000}
      size="medium"
      position="top-right"
      actions={[
        {
          label: "مشاهدة الآن",
          icon: <FaPlay className="text-sm" />,
          primary: true,
          onClick: onClose
        },
        {
          label: "إغلاق",
          icon: <FaTimes className="text-sm" />,
          primary: false,
          onClick: onClose
        }
      ]}
    />
  );
};

// Payment Error Alert Component
export const PaymentErrorAlert = ({ isVisible, onClose, error }) => {
  return (
    <ModernAlert
      type="error"
      title="فشل في الشراء"
      message={error || "حدث خطأ أثناء عملية الشراء"}
      isVisible={isVisible}
      onClose={onClose}
      duration={5000}
      size="medium"
      position="top-right"
      actions={[
        {
          label: "إعادة المحاولة",
          icon: <FaArrowRight className="text-sm" />,
          primary: true,
          onClick: onClose
        },
        {
          label: "إغلاق",
          icon: <FaTimes className="text-sm" />,
          primary: false,
          onClick: onClose
        }
      ]}
    />
  );
};

// Wallet Alert Component
export const WalletAlert = ({ isVisible, onClose, type, title, message, balance }) => {
  const alertType = type === 'recharge' ? 'success' : type;
  
  return (
    <ModernAlert
      type={alertType}
      title={title}
      message={message}
      isVisible={isVisible}
      onClose={onClose}
      duration={4000}
      size="medium"
      position="top-right"
      customIcon={type === 'recharge' ? <FaCoins /> : undefined}
      actions={[
        {
          label: "عرض المحفظة",
          icon: <FaStar className="text-sm" />,
          primary: true,
          onClick: onClose
        }
      ]}
    />
  );
};

export default ModernAlert;
