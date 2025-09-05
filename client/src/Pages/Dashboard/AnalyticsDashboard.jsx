import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../Layout/Layout';
import { 
  FaUsers, 
  FaChartBar, 
  FaVideo, 
  FaGraduationCap,
  FaEye,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { axiosInstance } from '../../Helpers/axiosInstance';

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { data: userData } = useSelector((state) => state.auth);
  
  // State for exam results
  const [examResults, setExamResults] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examStats, setExamStats] = useState({});
  
  // State for video progress
  const [videoProgress, setVideoProgress] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStats, setVideoStats] = useState({});
  
  // Filters and pagination
  const [activeTab, setActiveTab] = useState('overview');
  const [examFilters, setExamFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    course: ''
  });
  const [videoFilters, setVideoFilters] = useState({
    search: '',
    minProgress: '',
    maxProgress: '',
    course: ''
  });
  
  // Fetch exam results analytics
  const fetchExamAnalytics = async () => {
    setExamLoading(true);
    try {
      const response = await axiosInstance.get('/exams/admin/analytics', {
        params: examFilters
      });
      if (response.data.success) {
        setExamResults(response.data.data.results);
        setExamStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching exam analytics:', error);
    } finally {
      setExamLoading(false);
    }
  };
  
  // Fetch video progress analytics
  const fetchVideoAnalytics = async () => {
    setVideoLoading(true);
    try {
      const response = await axiosInstance.get('/video-progress/admin/analytics', {
        params: videoFilters
      });
      if (response.data.success) {
        setVideoProgress(response.data.data.progress);
        setVideoStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching video analytics:', error);
    } finally {
      setVideoLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN') {
      fetchExamAnalytics();
      fetchVideoAnalytics();
    }
  }, [userData]);
  
  // Handle filter changes
  const handleExamFilterChange = (field, value) => {
    setExamFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleVideoFilterChange = (field, value) => {
    setVideoFilters(prev => ({ ...prev, [field]: value }));
  };
  
  // Apply filters
  const applyExamFilters = () => {
    fetchExamAnalytics();
  };
  
  const applyVideoFilters = () => {
    fetchVideoAnalytics();
  };
  
  // Export data functions
  const exportExamData = async () => {
    try {
      const response = await axiosInstance.get('/exams/admin/export', {
        params: examFilters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam-results-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting exam data:', error);
    }
  };
  
  const exportVideoData = async () => {
    try {
      const response = await axiosInstance.get('/video-progress/admin/export', {
        params: videoFilters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `video-progress-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting video data:', error);
    }
  };

  if (userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              غير مخول للوصول
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              يجب أن تكون مديراً للوصول إلى هذه الصفحة
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  لوحة تحليلات التعلم
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  متابعة نتائج الامتحانات وتقدم الطلاب في المقاطع المرئية
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportExamData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaDownload />
                  تصدير نتائج الامتحانات
                </button>
                <button
                  onClick={exportVideoData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FaDownload />
                  تصدير تقدم المقاطع
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex gap-8">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: FaChartBar },
                { id: 'exams', label: 'نتائج الامتحانات', icon: FaGraduationCap },
                { id: 'videos', label: 'تقدم المقاطع المرئية', icon: FaVideo }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FaGraduationCap className="text-blue-600 dark:text-blue-300 text-2xl" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الامتحانات</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {examStats.totalExams || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <FaCheckCircle className="text-green-600 dark:text-green-300 text-2xl" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">معدل النجاح</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {examStats.averagePassRate || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FaVideo className="text-blue-600 dark:text-blue-300 text-2xl" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المقاطع</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {videoStats.totalVideos || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FaClock className="text-blue-600 dark:text-blue-300 text-2xl" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">ساعات المشاهدة</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round((videoStats.totalWatchTime || 0) / 3600)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    آخر نتائج الامتحانات
                  </h3>
                  <div className="space-y-4">
                    {examResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {result.user?.fullName || result.user?.username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.course?.title}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${
                            result.percentage >= 50 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.percentage}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.takenAt).toLocaleDateString('ar')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    آخر نشاط مشاهدة
                  </h3>
                  <div className="space-y-4">
                    {videoProgress.slice(0, 5).map((progress, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {progress.user?.fullName || progress.user?.username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {progress.videoTitle || `فيديو: ${progress.videoId}`}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-blue-600">
                            {progress.progress}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round(progress.totalWatchTime / 60)} دقيقة
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exams Tab */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              {/* Exam Filters */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  فلاتر نتائج الامتحانات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      البحث
                    </label>
                    <input
                      type="text"
                      placeholder="اسم الطالب..."
                      value={examFilters.search}
                      onChange={(e) => handleExamFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      من تاريخ
                    </label>
                    <input
                      type="date"
                      value={examFilters.dateFrom}
                      onChange={(e) => handleExamFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      إلى تاريخ
                    </label>
                    <input
                      type="date"
                      value={examFilters.dateTo}
                      onChange={(e) => handleExamFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الحالة
                    </label>
                    <select
                      value={examFilters.status}
                      onChange={(e) => handleExamFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">الكل</option>
                      <option value="passed">نجح</option>
                      <option value="failed">رسب</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={applyExamFilters}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      تطبيق الفلاتر
                    </button>
                  </div>
                </div>
              </div>

              {/* Exam Results Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    نتائج الامتحانات ({examResults.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الطالب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الدرس
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          النتيجة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {examLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          </td>
                        </tr>
                      ) : examResults.length > 0 ? (
                        examResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.user?.fullName || result.user?.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {result.user?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {result.course?.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-bold ${
                                result.percentage >= 50 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.percentage}% ({result.score}/{result.totalQuestions})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                result.examType === 'training' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {result.examType === 'training' ? 'تدريب' : 'امتحان '}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(result.takenAt).toLocaleDateString('ar')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <FaEye />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            لا توجد نتائج امتحانات
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Video Filters */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  فلاتر تقدم المقاطع المرئية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      البحث
                    </label>
                    <input
                      type="text"
                      placeholder="اسم الطالب..."
                      value={videoFilters.search}
                      onChange={(e) => handleVideoFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الحد الأدنى للتقدم (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={videoFilters.minProgress}
                      onChange={(e) => handleVideoFilterChange('minProgress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الحد الأقصى للتقدم (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={videoFilters.maxProgress}
                      onChange={(e) => handleVideoFilterChange('maxProgress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={applyVideoFilters}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                      تطبيق الفلاتر
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Progress Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تقدم المقاطع المرئية ({videoProgress.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الطالب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          المقطع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          التقدم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          وقت المشاهدة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          آخر مشاهدة
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {videoLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                          </td>
                        </tr>
                      ) : videoProgress.length > 0 ? (
                        videoProgress.map((progress, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {progress.user?.fullName || progress.user?.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {progress.user?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                فيديو: {progress.videoId}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {progress.course?.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${progress.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {progress.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {Math.round(progress.totalWatchTime / 60)} دقيقة
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                progress.isCompleted 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {progress.isCompleted ? 'مكتمل' : 'قيد المشاهدة'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(progress.lastWatched).toLocaleDateString('ar')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            لا توجد بيانات تقدم المقاطع المرئية
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
