import React, { useState } from 'react';
import { FaPhone, FaIdCard, FaUser, FaMapMarkerAlt, FaStickyNote, FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { takeAttendanceByPhone } from '../Redux/Slices/AttendanceSlice';
import toast from 'react-hot-toast';

const PhoneAttendanceForm = ({ courseId, liveMeetingId, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    userId: '',
    scanLocation: '',
    notes: '',
    status: 'present'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least phone number or userId is provided
    if (!formData.phoneNumber && !formData.userId) {
      toast.error('يجب إدخال رقم الهاتف أو رقم الهوية على الأقل');
      return;
    }

    setIsLoading(true);
    
    try {
      const attendanceData = {
        phoneNumber: formData.phoneNumber || undefined,
        userId: formData.userId || undefined,
        courseId: courseId || undefined,
        liveMeetingId: liveMeetingId || undefined,
        scanLocation: formData.scanLocation || undefined,
        notes: formData.notes || undefined,
        status: formData.status
      };

      const result = await dispatch(takeAttendanceByPhone(attendanceData));
      
      if (result.type === 'attendance/takeByPhone/fulfilled') {
        toast.success('تم تسجيل الحضور بنجاح');
        setFormData({
          phoneNumber: '',
          userId: '',
          scanLocation: '',
          notes: '',
          status: 'present'
        });
        if (onSuccess) onSuccess(result.payload);
      } else {
        toast.error(result.payload || 'حدث خطأ في تسجيل الحضور');
      }
    } catch (error) {
      console.error('Error taking attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          تسجيل الحضور برقم الهاتف والهوية
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaPhone className="inline mr-2 text-blue-500" />
            رقم الهاتف
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="01234567890"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            dir="ltr"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            أدخل رقم الهاتف المسجل للطالب
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaUser className="inline mr-2 text-purple-500" />
            حالة الحضور
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="present">حاضر</option>
            <option value="late">متأخر</option>
            <option value="absent">غائب</option>
          </select>
        </div>

        {/* Location (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaMapMarkerAlt className="inline mr-2 text-orange-500" />
            موقع المسح (اختياري)
          </label>
          <input
            type="text"
            name="scanLocation"
            value={formData.scanLocation}
            onChange={handleInputChange}
            placeholder="مثال: قاعة المحاضرات الرئيسية"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaStickyNote className="inline mr-2 text-yellow-500" />
            ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="أي ملاحظات إضافية..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || (!formData.phoneNumber && !formData.userId)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isLoading || (!formData.phoneNumber && !formData.userId)
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري التسجيل...
              </>
            ) : (
              <>
                <FaCheck size={16} />
                تسجيل الحضور
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <FaTimes size={16} />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          معلومات مهمة:
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• يجب إدخال رقم الهاتف أو رقم الهوية على الأقل</li>
          <li>• في حالة إدخال كلاهما، سيتم التحقق من تطابقهما</li>
          <li>• يمكن البحث عن الطالب باستخدام رقم الهاتف فقط</li>
          <li>• يمكن التحقق من صحة البيانات باستخدام رقم الهوية</li>
        </ul>
      </div>
    </div>
  );
};

export default PhoneAttendanceForm;