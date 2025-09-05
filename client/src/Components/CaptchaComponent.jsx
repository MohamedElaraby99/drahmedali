import React, { useState, useEffect } from 'react';
import { FaSyncAlt, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { axiosInstance } from '../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';

const CaptchaComponent = ({ onVerified, onError, reset }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate new CAPTCHA
  const generateCaptcha = async () => {
    setIsLoading(true);
    setIsVerified(false);
    setUserAnswer('');
    
    try {
      console.log('Generating CAPTCHA...');
      const response = await axiosInstance.get('/captcha/generate');
      console.log('CAPTCHA Response:', response.data);
      
      if (response.data.success) {
        setCaptchaData(response.data.data);
        console.log('CAPTCHA generated successfully:', response.data.data);
      } else {
        console.error('CAPTCHA generation failed:', response.data);
        toast.error('فشل في إنشاء كود الأمان');
      }
    } catch (error) {
      console.error('Error generating CAPTCHA:', error);
      console.error('Error details:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 'خطأ في تحميل كود الأمان';
      toast.error(errorMessage);
      
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify CAPTCHA answer
  const verifyCaptcha = async () => {
    if (!userAnswer.trim()) {
      toast.error('يرجى إدخال الإجابة');
      return;
    }

    setIsVerifying(true);
    
    try {
      console.log('Verifying CAPTCHA:', {
        sessionId: captchaData.sessionId,
        answer: userAnswer.trim()
      });
      
      const response = await axiosInstance.post('/captcha/verify', {
        sessionId: captchaData.sessionId,
        answer: userAnswer.trim()
      });
      
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        setIsVerified(true);
        toast.success('تمام، كده تمت الموافقة');
        console.log('CAPTCHA verified successfully with session ID:', captchaData.sessionId);
        
        // Call the callback with the session ID immediately after verification
        if (onVerified) {
          console.log('Calling onVerified with session ID:', captchaData.sessionId);
          onVerified(captchaData.sessionId);
        }
      }
    } catch (error) {
      console.error('Error verifying CAPTCHA:', error);
      console.error('Error details:', error.response?.data);
      
      const message = error.response?.data?.message || 'خطأ في التحقق';
      toast.error(message);
      
      // If session expired or too many attempts, generate new CAPTCHA
      if (error.response?.status === 400) {
        console.log('Generating new CAPTCHA due to error');
        generateCaptcha();
      }
      
      if (onError) onError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setUserAnswer(value);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isVerified && userAnswer.trim()) {
        verifyCaptcha();
      }
    }
  };

  // Generate CAPTCHA on component mount
  useEffect(() => {
    console.log('CaptchaComponent mounted, generating CAPTCHA...');
    generateCaptcha();
  }, []);

  // Handle reset from parent component
  useEffect(() => {
    if (reset) {
      setIsVerified(false);
      setUserAnswer('');
      generateCaptcha();
    }
  }, [reset]);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log('CAPTCHA State Changed:', {
      captchaData: !!captchaData,
      isLoading,
      isVerified,
      userAnswer
    });
  }, [captchaData, isLoading, isVerified, userAnswer]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        تأكيد الأمان
      </label>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        {/* CAPTCHA Question */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              كود الأمان
            </span>
          </div>
          <button
            type="button"
            onClick={generateCaptcha}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
            title="تحديث كود الأمان"
          >
            <FaSyncAlt className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Question Display */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">جاري تحميل كود الأمان...</span>
              </div>
            </div>
          </div>
        ) : captchaData ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {captchaData.question}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3 border-2 border-dashed border-red-300 dark:border-red-600">
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                فشل في تحميل كود الأمان. يرجى الضغط على زر التحديث.
              </p>
            </div>
          </div>
        )}

        {/* Answer Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="أدخل الإجابة..."
              disabled={isVerified || isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isVerified && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCheck className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          
          {!isVerified && (
            <button
              type="button"
              onClick={verifyCaptcha}
              disabled={!userAnswer.trim() || isVerifying || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'تحقق'
              )}
            </button>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-3 text-sm">
          {isVerified ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <FaCheck className="w-4 h-4" />
              <span>تمام</span>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              حل المسألة دي عشان تكمل
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptchaComponent;
