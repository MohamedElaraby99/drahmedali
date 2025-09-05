import React, { useState } from 'react';
import { FaTimes, FaPlay, FaExclamationTriangle, FaUnlock, FaSpinner } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../Helpers/axiosInstance';

const VideoAccessModal = ({ 
  isOpen, 
  onClose, 
  video, 
  courseId, 
  lessonId, 
  unitId,
  onAccessGranted,
  onAccessDenied 
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('يرجى إدخال كود الوصول');
      return;
    }

    // Basic code format validation
    const codeFormat = /^[A-Z0-9]{8,12}$/;
    if (!codeFormat.test(accessCode.trim().toUpperCase())) {
      setError('تنسيق الكود غير صحيح. يجب أن يتكون الكود من 8-12 حرف وأرقام باللغة الإنجليزية فقط');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/api/v1/courseAccess/redeem-video', {
        code: accessCode.trim().toUpperCase(),
        courseId,
        lessonId,
        unitId,
        videoId: video._id
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onAccessGranted(video);
          onClose();
        }, 1500);
      }
    } catch (err) {
      let errorMessage = 'تعذر تفعيل الكود';
      
      if (err?.response?.data?.message) {
        const message = err.response.data.message.toLowerCase();
        
        if (message.includes('invalid or expired code')) {
          errorMessage = '❌ الكود غير صحيح أو منتهي الصلاحية. تأكد من كتابة الكود بشكل صحيح';
        } else if (message.includes('not valid for this video')) {
          errorMessage = '🚫 هذا الكود غير صالح لهذا الفيديو. تأكد من أنك تستخدم الكود الصحيح للفيديو المطلوب';
        } else if (message.includes('expired for its access window')) {
          errorMessage = '⏰ انتهت صلاحية هذا الكود. يرجى الحصول على كود جديد من المدرس';
        } else if (message.includes('video not found')) {
          errorMessage = '📹 الفيديو المرتبط بهذا الكود غير موجود. يرجى التواصل مع الدعم الفني';
        } else if (message.includes('code is required')) {
          errorMessage = '📝 يرجى إدخال الكود';
        } else if (message.includes('already used')) {
          errorMessage = '🔒 تم استخدام هذا الكود من قبل. كل كود يمكن استخدامه مرة واحدة فقط';
        } else {
          errorMessage = `❌ ${err.response.data.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAccessCode('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9b172a] to-[#9b172a] text-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaPlay className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">الوصول للفيديو</h3>
                  <p className="text-red-100 text-sm">يتطلب كود خاص</p>
                </div>
              </div>
              <p className="text-red-100 text-sm leading-relaxed break-words">
                {video?.title || 'فيديو'}
              </p>
            </div>
            <button
              className="text-white hover:text-red-200 text-xl transition-colors duration-200 flex-shrink-0 p-1"
              onClick={handleClose}
              disabled={loading}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                تم تفعيل الوصول بنجاح!
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                يمكنك الآن مشاهدة الفيديو
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 mb-2">
                  <FaExclamationTriangle />
                  <span className="font-medium text-sm">مطلوب كود وصول</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  هذا الفيديو يتطلب كود وصول خاص. أدخل الكود الذي حصلت عليه من المدرس.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                    كود الوصول للفيديو
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => {
                      // Auto-format: uppercase and remove spaces/special chars
                      const formatted = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                      if (formatted.length <= 12) {
                        setAccessCode(formatted);
                        setError(''); // Clear error on input change
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent space key
                      if (e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="مثال: VID123ABC45"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#9b172a] focus:border-transparent transition-all duration-200 text-center font-mono text-lg tracking-wider"
                    maxLength="12"
                    style={{ letterSpacing: '0.1em' }}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm text-right">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">ملاحظات مهمة:</h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• الكود خاص بهذا الفيديو فقط</li>
                    <li>• كل كود يستخدم مرة واحدة فقط</li>
                    <li>• الكود من 8-12 حرف وأرقام إنجليزي</li>
                    <li>• تأكد من كتابة الكود بشكل صحيح</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#9b172a] hover:bg-[#7d1324] text-white rounded-lg transition-all duration-200 hover:shadow-lg font-medium flex items-center justify-center gap-2"
                    disabled={loading || !accessCode.trim()}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>جاري التحقق...</span>
                      </>
                    ) : (
                      <>
                        <FaUnlock />
                        <span>فتح الفيديو</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAccessModal;
