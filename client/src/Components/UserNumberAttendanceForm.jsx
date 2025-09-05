import React, { useState, useEffect } from 'react';
import { FaIdCard, FaUser, FaMapMarkerAlt, FaStickyNote, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { takeAttendanceByPhone } from '../Redux/Slices/AttendanceSlice';
import { getAllUsers } from '../Redux/Slices/UsersSlice';
import toast from 'react-hot-toast';

const UserNumberAttendanceForm = ({ selectedGroup, selectedDate, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [formData, setFormData] = useState({
    userNumber: '',
    scanLocation: '',
    notes: '',
    status: 'present'
  });

  // Load users when component mounts
  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers({ role: 'USER' }));
    }
  }, [dispatch, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear found user when user number changes
    if (name === 'userNumber') {
      setFoundUser(null);
      setSearchAttempted(false);
    }
  };

  const searchUserByNumber = () => {
    if (!formData.userNumber.trim()) {
      toast.error('يرجى إدخال رقم المستخدم');
      return;
    }

    setSearchAttempted(true);

    // If users are still loading, inform user
    if (usersLoading) {
      toast.info('جاري تحميل بيانات المستخدمين...');
      return;
    }

    // Search for user by ID, phone number, or student ID
    const searchTerm = formData.userNumber.trim();
    const user = users?.find(u => 
      u._id === searchTerm || 
      u.phoneNumber === searchTerm ||
      u.studentId === searchTerm
    );

    if (user) {
      setFoundUser(user);
      toast.success(`تم العثور على الطالب: ${user.fullName}`);
    } else {
      setFoundUser(null);
      toast.warning('لم يتم العثور على الطالب في قاعدة البيانات المحلية. يمكنك المتابعة - سيتم التحقق من قاعدة البيانات الرئيسية.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userNumber.trim()) {
      toast.error('يرجى إدخال رقم المستخدم');
      return;
    }

    if (!selectedGroup || !selectedDate) {
      toast.error('يرجى اختيار المجموعة والتاريخ');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare attendance data based on what we know
      const attendanceData = {
        courseId: undefined,
        liveMeetingId: undefined,
        scanLocation: formData.scanLocation || undefined,
        notes: formData.notes || `تم تسجيل الحضور برقم المستخدم: ${formData.userNumber}`,
        status: formData.status
      };

      // If we found user in frontend search, use their data
      if (foundUser) {
        attendanceData.userId = foundUser._id;
        attendanceData.phoneNumber = foundUser.phoneNumber;
      } else {
        // Let backend handle user lookup using the entered number
        const userNumber = formData.userNumber.trim();
        
        // Try to determine if it's a phone number or user ID
        if (/^01[0-9]{9}$/.test(userNumber)) {
          // Looks like Egyptian phone number
          attendanceData.phoneNumber = userNumber;
        } else if (/^[a-f\d]{24}$/i.test(userNumber)) {
          // Looks like MongoDB ObjectId
          attendanceData.userId = userNumber;
        } else {
          // Could be student ID, try as userId first
          attendanceData.userId = userNumber;
        }
      }

      const result = await dispatch(takeAttendanceByPhone(attendanceData));
      
      if (result.type === 'attendance/takeByPhone/fulfilled') {
        toast.success('تم تسجيل الحضور بنجاح');
        setFormData({
          userNumber: '',
          scanLocation: '',
          notes: '',
          status: 'present'
        });
        setFoundUser(null);
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
          تسجيل الحضور برقم المستخدم
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
        {/* User Number Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaIdCard className="inline mr-2 text-blue-500" />
            رقم المستخدم
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="userNumber"
              value={formData.userNumber}
              onChange={handleInputChange}
              placeholder="رقم الهوية، اسم المستخدم، أو رقم الهاتف"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              dir="ltr"
            />
            <button
              type="button"
              onClick={searchUserByNumber}
              disabled={usersLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {usersLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحميل
                </>
              ) : (
                <>
                  <FaSearch size={14} />
                  بحث
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            يمكن البحث برقم الهوية، اسم المستخدم، أو رقم الهاتف (البحث اختياري - يمكن تسجيل الحضور مباشرة)
          </p>
        </div>

        {/* Search Results Display */}
        {searchAttempted && (
          <div className={`p-4 rounded-lg border ${
            foundUser 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            {foundUser ? (
              <>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                  ✓ تم العثور على الطالب:
                </h4>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <p><strong>الاسم:</strong> {foundUser.fullName}</p>
                  <p><strong>رقم الهاتف:</strong> {foundUser.phoneNumber}</p>
                  {foundUser.email && <p><strong>البريد الإلكتروني:</strong> {foundUser.email}</p>}
                  {foundUser.studentId && <p><strong>رقم الطالب:</strong> {foundUser.studentId}</p>}
                </div>
              </>
            ) : (
              <>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  ⚠️ لم يتم العثور على الطالب محلياً
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  لم يتم العثور على الطالب في قاعدة البيانات المحلية، ولكن يمكنك المتابعة.
                  سيتم التحقق من الرقم في قاعدة البيانات الرئيسية عند تسجيل الحضور.
                </p>
              </>
            )}
          </div>
        )}

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
            disabled={isLoading || !formData.userNumber.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isLoading || !formData.userNumber.trim()
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
          كيفية الاستخدام:
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• أدخل رقم الهوية، اسم المستخدم، أو رقم الهاتف</li>
          <li>• اضغط على "بحث" للتحقق من وجود الطالب محلياً (اختياري)</li>
          <li>• يمكنك تسجيل الحضور حتى لو لم يتم العثور على الطالب محلياً</li>
          <li>• سيتم التحقق النهائي من قاعدة البيانات الرئيسية</li>
          <li>• اختر حالة الحضور واضغط "تسجيل الحضور"</li>
        </ul>
      </div>
    </div>
  );
};

export default UserNumberAttendanceForm;