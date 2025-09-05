import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import QRCodeScanner from '../../Components/QRCodeScanner';
import { 
  getAllAttendance,
  getUserAttendance,
  getUserAttendanceStats,
  getAttendanceDashboard,
  updateAttendance,
  deleteAttendance,
  clearAttendanceError
} from '../../Redux/Slices/AttendanceSlice';
import { 
  FaQrcode, 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaClock, 
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEdit,
  FaTrash,
  FaEye,
  FaChartBar,
  FaMapMarkerAlt,
  FaBook,
  FaVideo
} from 'react-icons/fa';

export default function AttendanceDashboard() {
  const dispatch = useDispatch();
  const { data: user, role } = useSelector((state) => state.auth);
  const { 
    allAttendance, 
    dashboard, 
    userAttendance,
    userStats,
    updateLoading,
    deleteLoading
  } = useSelector((state) => state.attendance);

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    attendanceType: '',
    status: '',
    userId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ status: '', notes: '' });

  // Load dashboard data on component mount
  useEffect(() => {
    if (['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(role)) {
      dispatch(getAttendanceDashboard());
      loadAttendanceData();
    }
  }, [dispatch, role]);

  const loadAttendanceData = () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    dispatch(getAllAttendance(params));
  };

  useEffect(() => {
    loadAttendanceData();
  }, [currentPage, filters]);

  const handleQRScanSuccess = (scanData) => {
    toast.success('تم تسجيل الحضور بنجاح');
    setShowQRScanner(false);
    loadAttendanceData(); // Refresh the list
    dispatch(getAttendanceDashboard()); // Refresh dashboard stats
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setEditData({
      status: attendance.status,
      notes: attendance.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAttendance = async () => {
    if (!selectedAttendance) return;

    try {
      await dispatch(updateAttendance({
        id: selectedAttendance._id,
        updateData: editData
      })).unwrap();
      
      toast.success('تم تحديث سجل الحضور بنجاح');
      setShowEditModal(false);
      loadAttendanceData();
    } catch (error) {
      toast.error(error || 'حدث خطأ في تحديث سجل الحضور');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm('هل أنت متأكد من حذف سجل الحضور؟')) {
      return;
    }

    try {
      await dispatch(deleteAttendance(attendanceId)).unwrap();
      toast.success('تم حذف سجل الحضور بنجاح');
      loadAttendanceData();
    } catch (error) {
      toast.error(error || 'حدث خطأ في حذف سجل الحضور');
    }
  };

  const exportAttendanceData = () => {
    // Simple CSV export
    const csvData = allAttendance.data.map(attendance => ({
      'الاسم': attendance.user?.fullName || '',
      'اسم المستخدم': attendance.user?.username || '',
      'رقم الهاتف': attendance.user?.phoneNumber || '',
      'نوع الحضور': attendance.attendanceType,
      'الحالة': attendance.status,
      'التاريخ': new Date(attendance.attendanceDate).toLocaleDateString('ar-EG'),
      'المسح بواسطة': attendance.scannedBy?.fullName || '',
      'الملاحظات': attendance.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(role)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <FaUserTimes size={64} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              غير مصرح لك بالوصول
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              يجب أن تكون مدرب أو مدير للوصول إلى لوحة تحكم الحضور
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              لوحة تحكم الحضور
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة وتسجيل حضور الطلاب
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <FaQrcode size={16} />
              مسح رمز الحضور
            </button>
            
            <button
              onClick={exportAttendanceData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <FaDownload size={16} />
              تصدير البيانات
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {dashboard.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الحضور</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.data.overallStats?.totalRecords || 0}
                  </p>
                </div>
                <FaUsers className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">حاضر</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard.data.overallStats?.presentCount || 0}
                  </p>
                </div>
                <FaUserCheck className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">متأخر</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboard.data.overallStats?.lateCount || 0}
                  </p>
                </div>
                <FaClock className="text-yellow-500" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">غائب</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboard.data.overallStats?.absentCount || 0}
                  </p>
                </div>
                <FaUserTimes className="text-red-500" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaFilter className="text-blue-500" />
            فلاتر البحث
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تاريخ البداية
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تاريخ النهاية
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع الحضور
              </label>
              <select
                value={filters.attendanceType}
                onChange={(e) => handleFilterChange('attendanceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الأنواع</option>
                <option value="course">دورة</option>
                <option value="live_meeting">اجتماع مباشر</option>
                <option value="general">عام</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الحالات</option>
                <option value="present">حاضر</option>
                <option value="late">متأخر</option>
                <option value="absent">غائب</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              سجلات الحضور
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    نوع الحضور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    المسح بواسطة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allAttendance.data?.map((attendance) => (
                  <tr key={attendance._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {attendance.user?.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attendance.user?.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {attendance.attendanceType === 'course' && <FaBook className="text-blue-500" />}
                        {attendance.attendanceType === 'live_meeting' && <FaVideo className="text-green-500" />}
                        {attendance.attendanceType === 'general' && <FaUsers className="text-gray-500" />}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {attendance.attendanceType === 'course' && 'دورة'}
                          {attendance.attendanceType === 'live_meeting' && 'اجتماع مباشر'}
                          {attendance.attendanceType === 'general' && 'عام'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendance.status === 'present' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : attendance.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {attendance.status === 'present' && 'حاضر'}
                        {attendance.status === 'late' && 'متأخر'}
                        {attendance.status === 'absent' && 'غائب'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(attendance.attendanceDate).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {attendance.scannedBy?.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAttendance(attendance)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(attendance._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          disabled={deleteLoading}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {allAttendance.pagination && allAttendance.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, allAttendance.pagination.totalDocs)} من {allAttendance.pagination.totalDocs} سجل
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <span className="px-3 py-1 text-sm">
                    صفحة {currentPage} من {allAttendance.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, allAttendance.pagination.totalPages))}
                    disabled={currentPage === allAttendance.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRCodeScanner
            onScanSuccess={handleQRScanSuccess}
            onClose={() => setShowQRScanner(false)}
            courseId={selectedCourse}
            liveMeetingId={selectedMeeting}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                تعديل سجل الحضور
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="present">حاضر</option>
                    <option value="late">متأخر</option>
                    <option value="absent">غائب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateAttendance}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateLoading ? 'جاري التحديث...' : 'تحديث'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
