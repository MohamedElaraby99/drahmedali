import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';
import Layout from '../../Layout/Layout';
import { getArabicCity } from "../../utils/governorateMapping";
import { 
  FaUsers, 
  FaPlay, 
  FaCheckCircle, 
  FaClock, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaCalendarAlt,
  FaChartBar,
  FaGraduationCap,
  FaSpinner,
  FaUserCircle,
  FaTrophy,
  FaDownload,
  FaSyncAlt
} from 'react-icons/fa';

const UserProgressDashboard = () => {
  const [usersProgress, setUsersProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    courseId: '',
    stageId: '',
    sortBy: 'lastWatched',
    sortOrder: 'desc'
  });
  const [courses, setCourses] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch courses for filter dropdown
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch stages for filter dropdown
  const fetchStages = async () => {
    try {
      const response = await axiosInstance.get('/stages');
      if (response.data.success) {
        setStages(response.data.data.stages || []);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  // Fetch users progress data
  const fetchUsersProgress = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosInstance.get(`/video-progress/admin/all-users?${queryParams}`);
      
      if (response.data.success) {
        setUsersProgress(response.data.data);
        setSummary(response.data.summary);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users progress:', error);
      toast.error('فشل في تحميل بيانات تقدم المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch courses and stages only once on component mount
    fetchCourses();
    fetchStages();
  }, []);

  useEffect(() => {
    // Fetch users progress data whenever filters change
    fetchUsersProgress();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when other filters change
    }));
  };

  // Format time duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}س ${minutes}د`;
    }
    return `${minutes}د`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'لم يشاهد بعد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get progress bar color
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-blue-500';
    return 'bg-red-500';
  };

  // Show user details modal
  const showUserDetailsModal = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['الاسم', 'اسم المستخدم', 'إجمالي الفيديوهات', 'الفيديوهات المكتملة', 'معدل الإنجاز %', 'إجمالي وقت المشاهدة (ساعات)', 'آخر نشاط'],
      ...usersProgress.map(user => [
        user.user.fullName,
        user.user.username,
        user.stats.totalVideosWatched,
        user.stats.completedVideos,
        user.stats.completionRate,
        user.stats.totalWatchTimeHours,
        formatDate(user.stats.lastWatched)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_progress_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaChartBar className="text-blue-600" />
                لوحة تحكم تقدم الطلاب
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                تتبع ومراقبة تقدم جميع الطلاب في مشاهدة الدروس
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaDownload />
                تصدير البيانات
              </button>
              <button
                onClick={fetchUsersProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaSyncAlt />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold text-blue-600">{summary.totalUniqueUsers || 0}</p>
                </div>
                <FaUsers className="text-4xl text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المشاهدات</p>
                  <p className="text-3xl font-bold text-green-600">{summary.totalVideosWatched || 0}</p>
                </div>
                <FaPlay className="text-4xl text-green-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الفيديوهات المكتملة</p>
                  <p className="text-3xl font-bold text-blue-600">{summary.totalCompletedVideos || 0}</p>
                </div>
                <FaCheckCircle className="text-4xl text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">معدل الإنجاز العام</p>
                  <p className="text-3xl font-bold text-blue-600">{summary.overallCompletionRate || 0}%</p>
                </div>
                <FaTrophy className="text-4xl text-blue-600 opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن طالب..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={filters.courseId}
                onChange={(e) => handleFilterChange('courseId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الدورات</option>
                {courses && Array.isArray(courses) && courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <select
                value={filters.stageId}
                onChange={(e) => handleFilterChange('stageId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع المراحل</option>
                {stages && Array.isArray(stages) && stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="lastWatched">آخر نشاط</option>
                <option value="totalVideosWatched">عدد الفيديوهات</option>
                <option value="completedVideos">الفيديوهات المكتملة</option>
                <option value="totalWatchTime">وقت المشاهدة</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Progress Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-600 ml-4" />
                <span className="text-lg text-gray-600 dark:text-gray-300">جاري تحميل البيانات...</span>
              </div>
            ) : usersProgress.length === 0 ? (
              <div className="text-center py-12">
                <FaUserCircle className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-300">لا توجد بيانات لعرضها</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      إجمالي الفيديوهات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الفيديوهات المكتملة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      معدل الإنجاز
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      وقت المشاهدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      آخر نشاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {usersProgress.map((userProgress) => (
                    <tr key={userProgress.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {userProgress.user.fullName?.charAt(0) || 'ط'}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {userProgress.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{userProgress.user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaPlay className="text-blue-500 ml-2" />
                          {userProgress.stats.totalVideosWatched}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 ml-2" />
                          {userProgress.stats.completedVideos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 ml-3">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(userProgress.stats.completionRate)}`}
                              style={{ width: `${userProgress.stats.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {userProgress.stats.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaClock className="text-blue-500 ml-2" />
                          {userProgress.stats.totalWatchTimeHours}س
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <FaCalendarAlt className="ml-2" />
                          {formatDate(userProgress.stats.lastWatched)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => showUserDetailsModal(userProgress)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <FaEye />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.currentPage + 1))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    عرض{' '}
                    <span className="font-medium">
                      {((pagination.currentPage - 1) * pagination.resultsPerPage) + 1}
                    </span>{' '}
                    إلى{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.resultsPerPage, pagination.totalResults)}
                    </span>{' '}
                    من{' '}
                    <span className="font-medium">{pagination.totalResults}</span>{' '}
                    نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handleFilterChange('page', pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    تفاصيل تقدم الطالب: {selectedUser.user.fullName}
                  </h3>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">معلومات الطالب</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>الاسم:</strong> {selectedUser.user.fullName}</p>
                      <p><strong>اسم المستخدم:</strong> @{selectedUser.user.username}</p>
                      <p><strong>البريد الإلكتروني:</strong> {selectedUser.user.email}</p>
                      {selectedUser.user.phoneNumber && (
                        <p><strong>رقم الهاتف:</strong> {selectedUser.user.phoneNumber}</p>
                      )}
                      {selectedUser.user.governorate && (
                        <p><strong>المدينة:</strong> {getArabicCity(selectedUser.user.governorate)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">إحصائيات التقدم</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>إجمالي الفيديوهات:</strong> {selectedUser.stats.totalVideosWatched}</p>
                      <p><strong>الفيديوهات المكتملة:</strong> {selectedUser.stats.completedVideos}</p>
                      <p><strong>معدل الإنجاز:</strong> {selectedUser.stats.completionRate}%</p>
                      <p><strong>وقت المشاهدة:</strong> {selectedUser.stats.totalWatchTimeHours} ساعة</p>
                      <p><strong>متوسط التقدم:</strong> {selectedUser.stats.averageProgress}%</p>
                      <p><strong>آخر نشاط:</strong> {formatDate(selectedUser.stats.lastWatched)}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">النشاط الأخير</h4>
                  <div className="space-y-3">
                    {selectedUser.recentActivity?.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.videoTitle || `فيديو: ${activity.videoId}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.courseName || 'دورة غير محددة'}
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${activity.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <span className="text-sm font-medium">
                              {activity.progress}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(activity.lastWatched)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default UserProgressDashboard;
