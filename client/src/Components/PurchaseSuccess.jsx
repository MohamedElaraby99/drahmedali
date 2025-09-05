import React, { useEffect, useState } from 'react';
import { FaCheck, FaPlay, FaCoins, FaStar, FaTimes } from 'react-icons/fa';

const PurchaseSuccess = ({ 
  isVisible, 
  onClose, 
  lessonTitle, 
  amount, 
  remainingBalance 
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <div className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 
        max-w-sm w-full p-6 transform transition-all duration-300 ease-out
        ${animate ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}>
        {/* Success Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
            <FaCheck className="text-white text-xl" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaTimes className="text-gray-500 text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Purchase Successful! 🎉
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You've successfully unlocked this lesson
            </p>
          </div>

          {/* Lesson Info */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaPlay className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {lessonTitle}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ready to watch
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                <div className="flex items-center gap-1">
                  <FaCoins className="text-blue-500 text-xs" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {amount} EGP
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {remainingBalance} EGP
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FaPlay className="text-sm" />
              Watch Now
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FaStar className="text-sm" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess; 