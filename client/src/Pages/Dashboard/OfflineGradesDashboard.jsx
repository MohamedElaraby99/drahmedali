import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaFileExcel, FaUsers, FaCheckCircle, FaExclamationTriangle, FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { axiosInstance } from '../../Helpers/axiosInstance';
import CenterManagementHeader from '../../Components/CenterManagementHeader';
import MonthlyDataManager from '../../Components/MonthlyDataManager';
import Layout from '../../Layout/Layout';

const OfflineGradesDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [quizName, setQuizName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  
  // CRUD States
  const [grades, setGrades] = useState([]);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterQuiz, setFilterQuiz] = useState('');

  // Initialize with current month data when component loads
  useEffect(() => {
    if (!selectedMonthData) {
      // Set current month as default
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const currentMonthData = {
        key: currentMonthKey,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: startDate.toLocaleDateString('ar-EG', { 
          month: 'long', 
          year: 'numeric' 
        }),
        isCurrent: true,
        isFuture: false
      };
      
      setSelectedMonthData(currentMonthData);
    }
  }, []);

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch data when selectedMonthData changes
  useEffect(() => {
    if (selectedMonthData) {
      fetchUploadedFiles();
      fetchGrades();
    }
  }, [selectedMonthData]);

  const handleMonthChange = (monthData) => {
    setSelectedMonthData(monthData);
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/groups?populate=students');
      if (response.data && response.data.success) {
        // Handle the correct response structure: data.docs contains the groups
        const groups = response.data.data?.docs || response.data.data || [];
        if (Array.isArray(groups)) {
          setGroups(groups);
        } else {
          console.warn('Unexpected groups response format:', response.data);
          setGroups([]);
        }
      } else {
        console.warn('Groups API response not successful:', response.data);
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      showMessage('فشل في جلب المجموعات', 'error');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      // Build query parameters with date range
      const queryParams = new URLSearchParams();
      if (selectedMonthData) {
        queryParams.append('startDate', selectedMonthData.startDate);
        queryParams.append('endDate', selectedMonthData.endDate);
      }
      
      const response = await axiosInstance.get(`/offline-grades/offline-files?${queryParams.toString()}`);
      if (response.data && response.data.success) {
        // Handle both array and object responses
        const files = Array.isArray(response.data.data) ? response.data.data : [];
        setUploadedFiles(files);
      } else {
        console.warn('Unexpected response format:', response.data);
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      // Don't show error message to user for this, just set empty array
      setUploadedFiles([]);
    }
  };

  // CRUD: Fetch Grades
  const fetchGrades = async () => {
    try {
      // Build query parameters with date range
      const queryParams = new URLSearchParams();
      if (selectedMonthData) {
        queryParams.append('startDate', selectedMonthData.startDate);
        queryParams.append('endDate', selectedMonthData.endDate);
      }
      
      const response = await axiosInstance.get(`/offline-grades?${queryParams.toString()}`);
      if (response.data && response.data.success) {
        // Handle the correct response structure: data.data.data contains the grades array
        const gradesData = response.data.data?.data || response.data.data || [];
        if (Array.isArray(gradesData)) {
          console.log('Fetched grades data:', gradesData);
          setGrades(gradesData);
        } else {
          console.warn('Unexpected grades response format:', response.data);
          setGrades([]);
        }
      } else {
        console.warn('Grades API response not successful:', response.data);
        setGrades([]);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      showMessage('فشل في جلب الدرجات', 'error');
      setGrades([]);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ show: true, text, type });
    setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 5000);
  };

  const downloadTemplate = async () => {
    if (!selectedGroup) {
      showMessage('يرجى اختيار مجموعة أولاً', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/offline-grades/download-template/${selectedGroup}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template_${selectedGroup}_${quizName || 'quiz'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showMessage('تم تحميل القالب بنجاح');
    } catch (error) {
      console.error('Error downloading template:', error);
      showMessage('فشل في تحميل القالب', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showMessage('يرجى اختيار ملف Excel (.xlsx أو .xls)', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadGrades = async () => {
    if (!selectedFile) {
      showMessage('يرجى اختيار ملف أولاً', 'error');
      return;
    }

    if (!selectedGroup) {
      showMessage('يرجى اختيار مجموعة أولاً', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('groupId', selectedGroup);
      formData.append('quizName', quizName);

      const response = await axiosInstance.post('/offline-grades/upload-offline', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showMessage('تم رفع الدرجات بنجاح');
        setSelectedFile(null);
        setQuizName('');
        fetchUploadedFiles(); // Refresh the list
        fetchGrades(); // Refresh grades
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        showMessage(response.data.message || 'فشل في رفع الدرجات', 'error');
      }
    } catch (error) {
      console.error('Error uploading grades:', error);
      showMessage('فشل في رفع الدرجات', 'error');
    } finally {
      setUploading(false);
    }
  };

  const viewFileDetails = (file) => {
    // This would open a modal or navigate to a detailed view
    console.log('View file details:', file);
    showMessage(`عرض تفاصيل الملف: ${file.originalName}`, 'info');
  };

  // CRUD: Create Grade
  const createGrade = async (gradeData) => {
    console.log('createGrade called with:', gradeData);
    try {
      const response = await axiosInstance.post('/offline-grades', gradeData);
      console.log('API response:', response.data);
      if (response.data.success) {
        showMessage('تم إنشاء الدرجة بنجاح');
        setShowCreateModal(false);
        fetchGrades();
      } else {
        showMessage(response.data.message || 'فشل في إنشاء الدرجة', 'error');
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      showMessage('فشل في إنشاء الدرجة', 'error');
    }
  };

  // CRUD: Update Grade
  const updateGrade = async (gradeId, gradeData) => {
    try {
      const response = await axiosInstance.put(`/offline-grades/${gradeId}`, gradeData);
      if (response.data.success) {
        showMessage('تم تحديث الدرجة بنجاح');
        setShowGradesModal(false);
        setEditingGrade(null);
        fetchGrades();
      } else {
        showMessage(response.data.message || 'فشل في تحديث الدرجة', 'error');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      showMessage('فشل في تحديث الدرجة', 'error');
    }
  };

  // CRUD: Delete Grade
  const deleteGrade = async (gradeId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدرجة؟')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/offline-grades/${gradeId}`);
      if (response.data.success) {
        showMessage('تم حذف الدرجة بنجاح');
        fetchGrades();
      } else {
        showMessage(response.data.message || 'فشل في حذف الدرجة', 'error');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      showMessage('فشل في حذف الدرجة', 'error');
    }
  };

  // Filter and search grades
  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.quizName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Fix group filtering - handle both object and string groupId structures
    const gradeGroupId = typeof grade.groupId === 'object' ? grade.groupId._id : grade.groupId;
    const matchesGroup = !filterGroup || gradeGroupId?.toString() === filterGroup?.toString();
    
    const matchesQuiz = !filterQuiz || grade.quizName === filterQuiz;
    
    // Debug logging for first few grades
    if (grades.indexOf(grade) < 3) {
      console.log('Grade filtering debug:', {
        gradeId: grade._id,
        studentName: grade.studentName,
        groupId: gradeGroupId,
        groupIdType: typeof gradeGroupId,
        filterGroup,
        filterGroupType: typeof filterGroup,
        matchesGroup,
        matchesSearch,
        matchesQuiz
      });
    }
    
    return matchesSearch && matchesGroup && matchesQuiz;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Center Management Header */}
          <CenterManagementHeader />

          {/* Monthly Data Manager */}
          <MonthlyDataManager 
            onMonthChange={handleMonthChange}
            showStartNewMonth={false}
            className="mb-6"
          />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              رصد الدرجات {selectedMonthData && !selectedMonthData.isCurrent && `- ${selectedMonthData.label}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              تحميل قوالب الدرجات للمجموعات ورفع الدرجات المكتملة وإدارة الدرجات
              {selectedMonthData && !selectedMonthData.isCurrent && (
                <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                  عرض بيانات مؤرشفة من {selectedMonthData.label}
                </span>
              )}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Download Template Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <FaDownload className="text-2xl text-blue-500 ml-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  تحميل قالب الدرجات
                </h2>
              </div>

              <div className="space-y-4">
                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر المجموعة
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  >
                    <option value="">اختر مجموعة...</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.students?.length || 0} طالب)
                      </option>
                    ))}
                  </select>
                  
                  {/* Show selected group info */}
                  {selectedGroup && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <FaUsers className="text-blue-500 text-sm" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                                                     المجموعة المختارة: {groups.find(g => g._id === selectedGroup)?.name}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        عدد الطلاب: {groups.find(g => g._id === selectedGroup)?.students?.length || 0} طالب
                      </div>
                    </div>
                  )}
                </div>

                {/* Quiz Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم الاختبار (اختياري)
                  </label>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="مثال: اختبار الوحدة الأولى"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadTemplate}
                  disabled={!selectedGroup || loading}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaFileExcel className="text-lg" />
                  )}
                  <span>{loading ? 'جاري التحميل...' : 'تحميل القالب'}</span>
                </button>
              </div>
            </div>

            {/* Upload Grades Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <FaUpload className="text-2xl text-green-500 ml-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  رفع الدرجات
                </h2>
              </div>

              <div className="space-y-4">
                {/* Group Selection for Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر المجموعة
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={uploading}
                  >
                    <option value="">اختر مجموعة...</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.students?.length || 0} طالب)
                      </option>
                    ))}
                  </select>
                  
                  {/* Show selected group info */}
                  {selectedGroup && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <FaUsers className="text-green-500 text-sm" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                                                     المجموعة المختارة: {groups.find(g => g._id === selectedGroup)?.name}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                        عدد الطلاب: {groups.find(g => g._id === selectedGroup)?.students?.length || 0} طالب
                      </div>
                    </div>
                  )}
                </div>

                {/* Quiz Name for Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم الاختبار
                  </label>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="مثال: اختبار الوحدة الأولى"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={uploading}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر ملف Excel
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    يدعم ملفات Excel (.xlsx, .xls) فقط
                  </p>
                </div>

                {/* Upload Button */}
                <button
                  onClick={uploadGrades}
                  disabled={!selectedFile || !selectedGroup || !quizName || uploading}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaUpload className="text-lg" />
                  )}
                  <span>{uploading ? 'جاري الرفع...' : 'رفع الدرجات'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CRUD: Grades Management Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                         <div className="flex items-center justify-between mb-6" dir="rtl">
               <div className="flex items-center">
                 <FaUsers className="text-2xl text-purple-500 ml-3" />
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                   إدارة الدرجات
                 </h2>
               </div>
               <button
                 onClick={() => setShowCreateModal(true)}
                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 space-x-reverse"
               >
                 <FaPlus className="text-lg" />
                 <span>إضافة درجة جديدة</span>
               </button>
             </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث في اسم الطالب أو الاختبار..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تصفية حسب المجموعة
                </label>
                                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">جميع المجموعات</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.students?.length || 0} طالب)
                      </option>
                    ))}
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تصفية حسب الاختبار
                </label>
                <select
                  value={filterQuiz}
                  onChange={(e) => setFilterQuiz(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">جميع الاختبارات</option>
                  {Array.from(new Set(grades.map(g => g.quizName))).map(quiz => (
                    <option key={quiz} value={quiz}>{quiz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grades Table */}
            {/* Debug Information */}
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="font-semibold">إجمالي الدرجات:</span>
                  <div className="text-lg font-bold text-blue-600">{grades.length}</div>
                </div>
                <div>
                  <span className="font-semibold">الدرجات المفلترة:</span>
                  <div className="text-lg font-bold text-green-600">{filteredGrades.length}</div>
                </div>
                                 <div>
                   <span className="font-semibold">المجموعة المختارة:</span>
                   <div className="text-sm">
                     {filterGroup ? groups.find(g => g._id === filterGroup)?.name || filterGroup : 'جميع المجموعات'}
                   </div>
                 </div>
                <div>
                  <span className="font-semibold">الاختبار المختار:</span>
                  <div className="text-sm">{filterQuiz || 'جميع الاختبارات'}</div>
                </div>
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد درجات لعرضها</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">اسم الطالب</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">المجموعة</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">اسم الاختبار</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الدرجة</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">التاريخ</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredGrades.map((grade) => (
                      <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {grade.studentName}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {grade.groupName}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {grade.quizName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            grade.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            grade.score >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            grade.score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {grade.score}/100
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {new Date(grade.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => {
                                setEditingGrade(grade);
                                setShowGradesModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteGrade(grade._id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Uploaded Files Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaUsers className="text-2xl text-purple-500 ml-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                الملفات المرفوعة
              </h2>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد ملفات مرفوعة بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">اسم الملف</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">المجموعة</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">اسم الاختبار</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">تاريخ الرفع</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الحالة</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {uploadedFiles.map((file) => (
                      <tr key={file._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {file.originalName}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {file.groupName}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {file.quizName}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            file.status === 'processed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : file.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {file.status === 'processed' ? (
                              <>
                                <FaCheckCircle className="ml-1" />
                                معالج
                              </>
                            ) : file.status === 'processing' ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 ml-1"></div>
                                قيد المعالجة
                              </>
                            ) : (
                              <>
                                <FaExclamationTriangle className="ml-1" />
                                خطأ
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewFileDetails(file)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : message.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>{message.text}</span>
          </div>
        </div>
      )}

             {/* Create Grade Modal */}
       {showCreateModal && (
         <CreateGradeModal
           groups={groups}
           grades={grades}
           onClose={() => setShowCreateModal(false)}
           onSubmit={createGrade}
         />
       )}

      {/* Edit Grade Modal */}
      {showGradesModal && editingGrade && (
        <EditGradeModal
          grade={editingGrade}
          groups={groups}
          onClose={() => {
            setShowGradesModal(false);
            setEditingGrade(null);
          }}
          onSubmit={(gradeData) => updateGrade(editingGrade._id, gradeData)}
        />
      )}
    </Layout>
  );
};

// Create Grade Modal Component
const CreateGradeModal = ({ groups, grades, onClose, onSubmit }) => {
  const { useEffect } = React;
  const [formData, setFormData] = useState({
    studentName: '',
    groupId: '',
    quizName: '',
    score: '',
    notes: ''
  });
  
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [availableExams, setAvailableExams] = useState([]);

  // Get students when group changes
  useEffect(() => {
    if (formData.groupId) {
      const selectedGroup = groups.find(g => g._id === formData.groupId);
      if (selectedGroup && selectedGroup.students) {
        setSelectedGroupStudents(selectedGroup.students);
      }
    } else {
      setSelectedGroupStudents([]);
    }
  }, [formData.groupId, groups]);

  // Get available exams when group changes
  useEffect(() => {
    if (formData.groupId) {
      // Get exams from existing grades for this group + predefined list
      // Handle both string and object groupId structures
      const existingExams = grades
        .filter(grade => {
          // Check if groupId is an object with _id or a string
          const gradeGroupId = typeof grade.groupId === 'object' ? grade.groupId._id : grade.groupId;
          return gradeGroupId === formData.groupId;
        })
        .map(grade => grade.quizName)
        .filter(Boolean);
      
      console.log('Available exams for group:', formData.groupId);
      console.log('Existing exams from grades:', existingExams);
      console.log('All grades:', grades.map(g => ({ 
        groupId: typeof g.groupId === 'object' ? g.groupId._id : g.groupId, 
        quizName: g.quizName 
      })));
      
      const predefinedExams = [
        'اختبار الوحدة الأولى',
        'اختبار الوحدة الثانية', 
        'اختبار منتصف الفصل',
        'اختبار نهاية الفصل',
        'اختبار تجريبي'
      ];
      
      // Combine and remove duplicates
      const allExams = [...new Set([...existingExams, ...predefinedExams])];
      console.log('Final available exams:', allExams);
      setAvailableExams(allExams);
    } else {
      setAvailableExams([]);
    }
  }, [formData.groupId, grades]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.studentName || !formData.groupId || !formData.quizName || !formData.score) {
      console.log('Validation failed:', {
        studentName: !!formData.studentName,
        groupId: !!formData.groupId,
        quizName: !!formData.quizName,
        score: !!formData.score
      });
      return;
    }
    
    // Call the onSubmit function passed from parent
    console.log('Calling onSubmit with:', formData);
    onSubmit(formData);
  };

  const filteredStudents = selectedGroupStudents.filter(student =>
    student.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.phoneNumber?.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const filteredExams = availableExams.filter(exam =>
    exam.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
    examSearchTerm.toLowerCase().includes(exam.toLowerCase())
  );
  
  console.log('Exam search debug:', {
    examSearchTerm,
    availableExams,
    filteredExams,
    searchTermLength: examSearchTerm.length
  });

     return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" dir="rtl">
         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إضافة درجة جديدة</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <FaTimes className="text-xl" />
           </button>
         </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               المجموعة
             </label>
             <select
               value={formData.groupId}
               onChange={(e) => {
                 setFormData({...formData, groupId: e.target.value, studentName: '', quizName: ''});
                 setStudentSearchTerm('');
                 setExamSearchTerm('');
               }}
               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
               required
             >
               <option value="">اختر مجموعة...</option>
               {groups.map((group) => (
                 <option key={group._id} value={group._id}>
                   {group.name} ({group.students?.length || 0} طالب)
                 </option>
               ))}
             </select>
             
                           {/* Show selected group info */}
              {formData.groupId && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    المجموعة المختارة: {groups.find(g => g._id === formData.groupId)?.name}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    عدد الطلاب: {selectedGroupStudents.length} طالب
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    الاختبارات المتاحة: {availableExams.join(', ')}
                  </div>
                </div>
              )}
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               اسم الطالب
             </label>
             {formData.groupId ? (
               <div className="space-y-2">
                 <input
                   type="text"
                   value={studentSearchTerm}
                   onChange={(e) => setStudentSearchTerm(e.target.value)}
                   placeholder="ابحث عن الطالب..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                 />
                 {studentSearchTerm && (
                   <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                     {filteredStudents.length > 0 ? (
                       filteredStudents.map((student) => (
                         <button
                           key={student._id}
                           type="button"
                           onClick={() => {
                             setFormData({...formData, studentName: student.fullName});
                             setStudentSearchTerm('');
                           }}
                           className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                         >
                           {student.fullName}
                         </button>
                       ))
                     ) : (
                       <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                         لا يوجد طلاب بهذا الاسم
                       </div>
                     )}
                   </div>
                 )}
                 {formData.studentName && (
                   <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                     <span className="text-sm text-green-700 dark:text-green-300">
                       الطالب المختار: {formData.studentName}
                     </span>
                   </div>
                 )}
               </div>
             ) : (
               <div className="text-sm text-gray-500 dark:text-gray-400">
                 اختر مجموعة أولاً لاختيار الطالب
               </div>
             )}
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               اسم الاختبار
             </label>
             {formData.groupId ? (
               <div className="space-y-2">
                 <input
                   type="text"
                   value={examSearchTerm}
                   onChange={(e) => setExamSearchTerm(e.target.value)}
                   placeholder="ابحث عن الاختبار..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                 />
                                   {examSearchTerm && (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      {filteredExams.length > 0 ? (
                        filteredExams.map((exam) => (
                          <button
                            key={exam}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, quizName: exam});
                              setExamSearchTerm('');
                            }}
                            className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                          >
                            {exam}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                          <div>لا يوجد اختبار بهذا الاسم</div>
                          <div className="text-xs mt-1">البحث: "{examSearchTerm}"</div>
                          <div className="text-xs">الاختبارات المتاحة: {availableExams.join(', ')}</div>
                        </div>
                      )}
                    </div>
                  )}
                 {formData.quizName && (
                   <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                     <span className="text-sm text-green-700 dark:text-green-300">
                       الاختبار المختار: {formData.quizName}
                     </span>
                     <button
                       type="button"
                       onClick={() => setFormData({...formData, quizName: ''})}
                       className="mr-2 text-red-500 hover:text-red-700 text-xs"
                     >
                       إلغاء
                     </button>
                   </div>
                 )}
               </div>
             ) : (
               <div className="text-sm text-gray-500 dark:text-gray-400">
                 اختر مجموعة أولاً لاختيار الاختبار
               </div>
             )}
           </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الدرجة
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({...formData, score: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Grade Modal Component
const EditGradeModal = ({ grade, groups, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    studentName: grade.studentName || '',
    groupId: grade.groupId || '',
    quizName: grade.quizName || '',
    score: grade.score || '',
    notes: grade.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.groupId || !formData.quizName || !formData.score) {
      return;
    }
    onSubmit(formData);
  };

     return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" dir="rtl">
         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تعديل الدرجة</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <FaTimes className="text-xl" />
           </button>
         </div>
         <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الطالب
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المجموعة
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({...formData, groupId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">اختر مجموعة...</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.students?.length || 0} طالب)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الاختبار
            </label>
            <input
              type="text"
              value={formData.quizName}
              onChange={(e) => setFormData({...formData, quizName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الدرجة
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({...formData, score: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              تحديث
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflineGradesDashboard;
