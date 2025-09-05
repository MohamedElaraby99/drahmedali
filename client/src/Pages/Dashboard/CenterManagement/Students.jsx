import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUsers, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaUserPlus, FaTimes, FaCalendarAlt, FaTrophy, FaGraduationCap, FaFilePdf, FaUpload } from 'react-icons/fa';
import Layout from '../../../Layout/Layout';
import CenterManagementHeader from '../../../Components/CenterManagementHeader';
import { getAllUsers } from '../../../Redux/Slices/UsersSlice';
import { getAllGroups, addStudentToGroup, removeStudentFromGroup } from '../../../Redux/Slices/GroupsSlice';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../../Helpers/axiosInstance';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

export default function Students() {
  const dispatch = useDispatch();
  const { data: userData, role } = useSelector((state) => state.auth);
  const { users: usersData, loading: usersLoading } = useSelector((state) => state.users);
  const { groups: groupsData, loading: groupsLoading } = useSelector((state) => state.groups);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    attendance: [],
    grades: [],
    achievements: [],
    offlineGrades: [],
    paymentStatus: null
  });
  const printRef = React.useRef();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all fetched users
  const [filters, setFilters] = useState({
    search: '',
    group: '',
    status: '',
    grade: ''
  });
  // Removed pagination state variables since we're fetching all users

  // Get students from users data and groups from groups data
  const groups = groupsData || [];
  // Use allUsers state instead of paginated usersData
  const students = allUsers.length > 0 ? allUsers : 
                  (Array.isArray(usersData) ? usersData : 
                  (usersData?.data?.users && Array.isArray(usersData.data.users)) ? usersData.data.users :
                  (usersData?.data?.docs && Array.isArray(usersData.data.docs)) ? usersData.data.docs : []);
  
  const totalDocs = students.length;
  
  // Debug logging
  console.log('Students component - usersData:', usersData);
  console.log('Students component - groupsData:', groupsData);
  console.log('Students component - students array:', students);
  console.log('Students component - groups array:', groups);

  useEffect(() => {
    fetchStudents();
  }, [dispatch]);

  const fetchAllUsers = async () => {
    let allUsers = [];
    let currentPage = 1;
    let hasMore = true;
    const limitPerPage = 100; // Reasonable batch size

    while (hasMore) {
      try {
        const response = await axiosInstance.get('/admin/users/users', {
          params: { role: 'USER', page: currentPage, limit: limitPerPage }
        });

        if (response.data.success && response.data.data.users) {
          const users = response.data.data.users;
          allUsers = [...allUsers, ...users];
          
          // Check if there are more pages
          const pagination = response.data.data.pagination;
          hasMore = pagination && currentPage < pagination.totalPages;
          currentPage++;
          
          console.log(`Fetched page ${currentPage - 1}, total users so far: ${allUsers.length}`);
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error fetching users page:', currentPage, error);
        hasMore = false;
      }
    }

    return allUsers;
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch ALL users and groups
      const [fetchedUsers, groupsResult] = await Promise.all([
        fetchAllUsers(),
        dispatch(getAllGroups())
      ]);
      
      // Store all users in component state
      setAllUsers(fetchedUsers || []);
      
      console.log('All users fetched:', fetchedUsers?.length || 0);
      console.log('Groups result:', groupsResult);
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      setAllUsers([]); // Reset on error
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    // TODO: Implement actual filtering logic
    console.log('Applying filters:', filters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      group: '',
      status: '',
      grade: ''
    });
  };

  // Fetch student details (attendance, grades, achievements)
  const fetchStudentDetails = async (studentId) => {
    try {
      setLoading(true);
      
      // Find the student data first
      const student = students.find(s => s._id === studentId);
      if (!student) {
        console.error('Student not found');
        return;
      }
      
      // Get current month date range for attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Try to fetch data, but handle missing endpoints gracefully
      const results = await Promise.allSettled([
        axiosInstance.get(`/attendance/user/${studentId}`, {
          params: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          }
        }),
        axiosInstance.get(`/exam-results/user/${studentId}/results`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get(`/achievements/user/${studentId}`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get(`/offline-grades/student/${student?.fullName || student?.username}`, {
          params: { 
            limit: 100
          }
        }).catch((error) => {
          console.error('Offline grades API error:', error);
          return { data: { data: { docs: [] } } };
        }),
        // Get student's group to fetch payment status
        // First try to find student's group from groups data
        (() => {
          console.log('Looking for student group for ID:', studentId);
          console.log('Available groups:', groups);
          
          const studentGroup = groups.find(group => 
            group.students?.some(student => student._id === studentId) ||
            group.members?.some(member => member._id === studentId)
          );
          
          console.log('Found student group:', studentGroup);
          
          if (studentGroup) {
            console.log('Making payment status request for group:', studentGroup._id);
            return axiosInstance.get(`/financial/group/${studentGroup._id}/payment-status`, {
              params: { 
                month: now.getMonth() + 1, 
                year: now.getFullYear() 
              }
            }).catch((error) => {
              console.error('Payment status API error:', error);
              return { data: { data: null } };
            });
          }
          
          console.log('No group found for student, skipping payment status');
          return Promise.resolve({ data: { data: null } });
        })()
      ]);

      console.log('API Results:', results);
      console.log('Offline grades result:', results[3]);
      console.log('Payment status result:', results[4]);

      // Get offline grades from the specific student endpoint
      const studentOfflineGrades = results[3].status === 'fulfilled' ? results[3].value.data?.data?.docs || [] : [];

      setStudentDetails({
        attendance: results[0].status === 'fulfilled' ? results[0].value.data?.data?.docs || [] : [],
        grades: results[1].status === 'fulfilled' ? results[1].value.data?.data || [] : [],
        achievements: results[2].status === 'fulfilled' ? results[2].value.data?.data || [] : [],
        offlineGrades: studentOfflineGrades,
        paymentStatus: results[4].status === 'fulfilled' ? 
          results[4].value.data?.data?.paymentStatus?.find(p => p.student._id === studentId) || null : null
      });
      
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('حدث خطأ في جلب بيانات الطالب');
    } finally {
      setLoading(false);
    }
  };

  // Handle view student details
  const handleViewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setShowStudentDetailsModal(true);
    await fetchStudentDetails(student._id);
  };

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير الطالب - ${selectedStudent?.fullName || 'غير محدد'}`,
  });

  // Export students to Excel
  const handleExportStudents = () => {
    try {
      // Prepare data for export
      const exportData = filteredStudents.map((student, index) => ({
        'الرقم': index + 1,
        'الاسم الكامل': student.fullName || '',
        'البريد الإلكتروني': student.email || '',
        'رقم الهاتف': student.phoneNumber || '',
        'رقم هاتف ولي الأمر': student.fatherPhoneNumber || '',
        'المرحلة': student.stage?.name || '',
        'المحافظة': student.governorate || '',
        'العمر': student.age || '',
        'التاريخ': new Date(student.createdAt).toLocaleDateString('ar-EG'),
        'المجموعات': student.groups?.map(group => group.name).join(', ') || '',
        'الحالة': student.isActive ? 'نشط' : 'غير نشط'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // الرقم
        { wch: 20 }, // الاسم الكامل
        { wch: 25 }, // البريد الإلكتروني
        { wch: 15 }, // رقم الهاتف
        { wch: 18 }, // رقم هاتف ولي الأمر
        { wch: 15 }, // المرحلة
        { wch: 12 }, // المحافظة
        { wch: 8 },  // العمر
        { wch: 12 }, // التاريخ
        { wch: 20 }, // المجموعات
        { wch: 10 }  // الحالة
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'قائمة الطلاب');

      // Generate filename with current date
      const now = new Date();
      const filename = `قائمة_الطلاب_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.success(`تم تصدير ${exportData.length} طالب بنجاح!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  // Handle import file selection
  const handleImportFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Import students from Excel
  const handleImportStudents = async () => {
    if (!importFile) {
      toast.error('يرجى اختيار ملف للاستيراد');
      return;
    }

    setImportLoading(true);
    try {
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('الملف فارغ أو غير صحيح');
        setImportLoading(false);
        return;
      }

      // Prepare student data for import
      const studentsToImport = jsonData.map(row => ({
        fullName: String(row['الاسم الكامل'] || row['fullName'] || '').trim(),
        email: row['البريد الإلكتروني'] || row['email'] || '',
        phoneNumber: String(row['رقم الهاتف'] || row['phoneNumber'] || '').trim(),
        fatherPhoneNumber: String(row['رقم هاتف ولي الأمر'] || row['fatherPhoneNumber'] || '').trim(),
        stage: String(row['المرحلة'] || row['stage'] || '').trim(),
        governorate: String(row['المحافظة'] || row['governorate'] || '').trim(),
        age: Number(row['العمر'] || row['age'] || 18),
        password: '123456' // Default password
      })).filter(student => student.fullName && student.phoneNumber); // Filter out incomplete records

      if (studentsToImport.length === 0) {
        toast.error('لم يتم العثور على بيانات صحيحة للاستيراد');
        setImportLoading(false);
        return;
      }

      // Send import request to backend
      const response = await axiosInstance.post('/admin/users/bulk-import', {
        students: studentsToImport
      });

      if (response.data.success) {
        toast.success(`تم استيراد ${response.data.data.imported} طالب بنجاح!`);
        if (response.data.data.failed > 0) {
          toast.error(`فشل في استيراد ${response.data.data.failed} طالب - تحقق من البيانات`);
        }
        setShowImportModal(false);
        setImportFile(null);
        fetchStudents(); // Refresh the list
      } else {
        toast.error(response.data.message || 'فشل في الاستيراد');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
    } finally {
      setImportLoading(false);
    }
  };

  const handleAddUserToGroup = async () => {
    if (!selectedGroup || selectedUsers.length === 0) {
      toast.error('يرجى اختيار مجموعة وطلاب');
      return;
    }

    try {
      // Add each selected user to the group
      for (const userId of selectedUsers) {
        await dispatch(addStudentToGroup({ 
          groupId: selectedGroup, 
          studentId: userId 
        })).unwrap();
      }
      
      toast.success(`تم إضافة ${selectedUsers.length} طالب للمجموعة بنجاح`);
      setShowAddUserModal(false);
      setSelectedGroup('');
      setSelectedUsers([]);
      
      // Refresh data
      await Promise.all([
        dispatch(getAllUsers({ role: 'USER' })),
        dispatch(getAllGroups())
      ]);
    } catch (error) {
      toast.error(error || 'حدث خطأ في إضافة الطلاب للمجموعة');
    }
  };

  const handleRemoveUserFromGroup = async (userId, groupId, userName) => {
    if (window.confirm(`هل أنت متأكد من إزالة ${userName} من المجموعة؟`)) {
      try {
        await dispatch(removeStudentFromGroup({ 
          groupId, 
          studentId: userId 
        })).unwrap();
        toast.success('تم إزالة الطالب من المجموعة بنجاح');
        
        // Refresh data
        await Promise.all([
          dispatch(getAllUsers({ role: 'USER' })),
          dispatch(getAllGroups())
        ]);
      } catch (error) {
        toast.error(error || 'حدث خطأ في إزالة الطالب من المجموعة');
      }
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !filters.search || 
      student.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Find which group the student belongs to
    const studentGroup = groups.find(group => 
      group.students && group.students.some(s => s._id === student._id)
    );
    
    const matchesGroup = !filters.group || studentGroup?.name === filters.group;
    const matchesStatus = !filters.status || (student.isActive ? 'active' : 'inactive') === filters.status;
    const matchesGrade = !filters.grade || student.grade === filters.grade;

    return matchesSearch && matchesGroup && matchesStatus && matchesGrade;
  });

  const studentStats = [
    {
      title: 'إجمالي الطلاب',
      value: totalDocs, // Use totalDocs from API
      icon: FaUsers,
      color: 'bg-blue-500',
      change: '+5'
    },
    {
      title: 'الطلاب النشطين',
      value: students.filter(s => s.isActive).length,
      icon: FaUsers,
      color: 'bg-green-500',
      change: '+3'
    },
    {
      title: 'الطلاب غير النشطين',
      value: students.filter(s => !s.isActive).length,
      icon: FaUsers,
      color: 'bg-red-500',
      change: '+1'
    },
    {
      title: 'معدل الحضور العام',
      value: '91.7%',
      icon: FaUsers,
      color: 'bg-purple-500',
      change: '+2.3%'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Center Management Header */}
          <CenterManagementHeader />

          {/* Add Students Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <FaUserPlus />
              <span>إضافة طلاب للمجموعات</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {studentStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium text-green-600">
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                        من الشهر الماضي
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                قائمة الطلاب
              </h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button 
                  onClick={handleExportStudents}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                  disabled={filteredStudents.length === 0}
                >
                  <FaDownload />
                  <span>تصدير Excel</span>
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <FaUpload />
                  <span>استيراد Excel</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="ابحث بالاسم أو البريد الإلكتروني"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المجموعة
                </label>
                <select
                  value={filters.group}
                  onChange={(e) => handleFilterChange('group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">جميع المجموعات</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
  
              
              <div className="flex items-end space-x-2 space-x-reverse">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <FaSearch />
                  <span>بحث</span>
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <FaFilter />
                  <span>مسح</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الطالب</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden sm:table-cell">المجموعة</th>
                  
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الحالة</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden lg:table-cell">معدل الحضور</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                {student.fullName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {student.fullName || 'غير محدد'}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {student.email || student.phoneNumber || 'غير محدد'}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs sm:hidden">
                                {(() => {
                                  const studentGroup = groups.find(group => 
                                    group.students && group.students.some(s => s._id === student._id)
                                  );
                                  return studentGroup?.name || 'غير محدد';
                                })()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {(() => {
                              const studentGroup = groups.find(group => 
                                group.students && group.students.some(s => s._id === student._id)
                              );
                              return studentGroup?.name || 'غير محدد';
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.isActive 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {student.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${student.attendanceRate || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {student.attendanceRate || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button 
                              onClick={() => handleViewStudentDetails(student)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="عرض التفاصيل"
                            >
                              <FaEye />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors">
                              <FaEdit />
                            </button>
                            {(() => {
                              const studentGroup = groups.find(group => 
                                group.students && group.students.some(s => s._id === student._id)
                              );
                              return studentGroup ? (
                                <button 
                                  onClick={() => handleRemoveUserFromGroup(student._id, studentGroup._id, student.fullName)}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                  title="إزالة من المجموعة"
                                >
                                  <FaTrash />
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد نتائج للبحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Count Display */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-center mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  إجمالي الطلاب: {filteredStudents.length} طالب
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User to Group Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  إضافة طلاب للمجموعات
                </h3>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedGroup('');
                    setSelectedUsers([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر المجموعة
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">اختر مجموعة</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.currentStudents || 0}/{group.maxStudents})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Users List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر الطلاب ({selectedUsers.length} محدد)
                  </label>
                  <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                    {students.length > 0 ? (
                      students.map((user) => {
                        const isInGroup = groups.some(group => 
                          group.students && group.students.some(s => s._id === user._id)
                        );
                        const isSelected = selectedUsers.includes(user._id);
                        
                        return (
                          <div
                            key={user._id}
                            className={`p-3 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''
                            } ${isInGroup ? 'opacity-50' : ''}`}
                            onClick={() => !isInGroup && toggleUserSelection(user._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => !isInGroup && toggleUserSelection(user._id)}
                                  disabled={isInGroup}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                    {user.fullName?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {user.fullName || 'غير محدد'}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email || user.phoneNumber || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {isInGroup && (
                                <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                                  مسجل في مجموعة
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد طلاب متاحين
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleAddUserToGroup}
                    disabled={!selectedGroup || selectedUsers.length === 0}
                    className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    إضافة {selectedUsers.length} طالب للمجموعة
                  </button>
                  <button
                    onClick={() => {
                      setShowAddUserModal(false);
                      setSelectedGroup('');
                      setSelectedUsers([]);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  تقرير الطالب - {selectedStudent.fullName}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaFilePdf />
                    طباعة التقرير
                  </button>
                  <button
                    onClick={() => {
                      setShowStudentDetailsModal(false);
                      setSelectedStudent(null);
                      setStudentDetails({ attendance: [], grades: [], achievements: [] });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              {/* Printable Content */}
              <div ref={printRef} className="print:p-8" dir="rtl">
                {/* Header for Print */}
                <div className="print:block hidden mb-8 text-center">
                  <h1 className="text-3xl font-bold mb-2">تقرير الطالب الشهري</h1>
                  <h2 className="text-xl text-gray-600">{selectedStudent.fullName}</h2>
                  <p className="text-gray-500">
                    {new Date().toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>

                {/* Student Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaUsers className="text-blue-600" />
                    معلومات الطالب
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">الاسم:</span>
                      <p className="font-medium">{selectedStudent.fullName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني:</span>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف:</span>
                      <p className="font-medium">{selectedStudent.phoneNumber || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Attendance Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-green-600" />
                        سجل الحضور - {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                      </h4>
                      
                      {studentDetails.attendance.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-right py-2">التاريخ</th>
                                <th className="text-right py-2">الحالة</th>
                                <th className="text-right py-2">وقت الدخول</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentDetails.attendance.map((record, index) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                  <td className="py-2">
                                    {new Date(record.attendanceDate).toLocaleDateString('ar-EG')}
                                  </td>
                                  <td className="py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      record.status === 'present' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : record.status === 'absent'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}>
                                      {record.status === 'present' ? 'حاضر' : 
                                       record.status === 'absent' ? 'غائب' : 'متأخر'}
                                    </span>
                                  </td>
                                  <td className="py-2">
                                    {record.attendanceDate ? new Date(record.attendanceDate).toLocaleTimeString('ar-EG') : '-'}
                                  </td>
                                  
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {/* Attendance Summary */}
                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {studentDetails.attendance.filter(a => a.status === 'present').length}
                              </div>
                              <div className="text-sm text-green-700 dark:text-green-300">أيام حضور</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {studentDetails.attendance.filter(a => a.status === 'absent').length}
                              </div>
                              <div className="text-sm text-red-700 dark:text-red-300">أيام غياب</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {Math.round((studentDetails.attendance.filter(a => a.status === 'present').length / studentDetails.attendance.length) * 100) || 0}%
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">نسبة الحضور</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          لا توجد سجلات حضور لهذا الشهر
                        </p>
                      )}
                    </div>

                    {/* Grades Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaGraduationCap className="text-purple-600" />
                        الدرجات والامتحانات
                      </h4>
                      
                      {studentDetails.grades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-right py-2">اسم الامتحان</th>
                                <th className="text-right py-2">المادة</th>
                                <th className="text-right py-2">الدرجة</th>
                                <th className="text-right py-2">النهاية العظمى</th>
                                <th className="text-right py-2">النسبة المئوية</th>
                                <th className="text-right py-2">التاريخ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentDetails.grades.map((grade, index) => {
                                const percentage = Math.round((grade.score / grade.totalMarks) * 100);
                                return (
                                  <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                    <td className="py-2 font-medium">{grade.examName}</td>
                                    <td className="py-2">{grade.subject}</td>
                                    <td className="py-2 font-bold">{grade.score}</td>
                                    <td className="py-2">{grade.totalMarks}</td>
                                    <td className="py-2">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        percentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        percentage >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        percentage >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        percentage >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                        {percentage}%
                                      </span>
                                    </td>
                                    <td className="py-2">
                                      {new Date(grade.date).toLocaleDateString('ar-EG')}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          
                          {/* Grades Summary */}
                          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {Math.round(studentDetails.grades.reduce((sum, grade) => sum + (grade.score / grade.totalMarks * 100), 0) / studentDetails.grades.length) || 0}%
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">المتوسط العام</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {studentDetails.grades.length}
                              </div>
                              <div className="text-sm text-purple-700 dark:text-purple-300">عدد الامتحانات</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          لا توجد درجات مسجلة
                        </p>
                      )}
                    </div>

                    {/* Offline Grades Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaFilePdf className="text-red-600" />
                        درجات  (الكويزات)
                      </h4>
                      
                      {studentDetails.offlineGrades.length > 0 ? (
                        <div className="space-y-4">
                          {studentDetails.offlineGrades.map((grade, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {grade.quizName}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    المجموعة: {grade.groupName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {grade.score}/{grade.maxScore}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {grade.percentage}%
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  grade.percentage >= 85 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  grade.percentage >= 50 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {grade.gradeLevel}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {new Date(grade.gradeDate).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                              
                              {grade.notes && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm">
                                  <strong>ملاحظات:</strong> {grade.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          لا توجد درجات مسجلة
                        </p>
                      )}
                    </div>

                    {/* Payment Status Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-green-600" />
                        حالة الدفع الشهري
                      </h4>
                      
                      {studentDetails.paymentStatus ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                  معلومات الدفع
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">الشهر:</span>
                                    <span className="font-medium">{studentDetails.paymentStatus.month}/{studentDetails.paymentStatus.year}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">المبلغ المدفوع:</span>
                                    <span className="font-medium text-green-600">{studentDetails.paymentStatus.totalPaid} جنيه</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">المبلغ المتبقي:</span>
                                    <span className="font-medium text-red-600">{studentDetails.paymentStatus.remainingAmount} جنيه</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">عدد الدفعات:</span>
                                    <span className="font-medium">{studentDetails.paymentStatus.paymentCount}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                  الحالة
                                </h5>
                                <div className="space-y-2">
                                  <div className={`px-3 py-2 rounded-lg text-center font-medium ${
                                    studentDetails.paymentStatus.hasPaid 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {studentDetails.paymentStatus.hasPaid ? 'مدفوع' : 'غير مدفوع'}
                                  </div>
                                  
                                  <div className={`px-3 py-1 rounded text-xs text-center ${
                                    studentDetails.paymentStatus.status === 'fully_paid' 
                                      ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                                      : studentDetails.paymentStatus.status === 'partially_paid'
                                      ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {studentDetails.paymentStatus.status === 'fully_paid' ? 'مدفوع بالكامل' :
                                     studentDetails.paymentStatus.status === 'partially_paid' ? 'مدفوع جزئياً' : 'غير مدفوع'}
                                  </div>
                                  
                                  {studentDetails.paymentStatus.paymentDate && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                      تاريخ الدفع: {new Date(studentDetails.paymentStatus.paymentDate).toLocaleDateString('ar-EG')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          لا توجد معلومات دفع متاحة
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Print Footer */}
                <div className="print:block hidden mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
                  <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>نظام إدارة المركز التعليمي</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">استيراد الطلاب من Excel</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر ملف Excel
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {importFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      تم اختيار الملف: {importFile.name}
                    </p>
                  )}
                </div>

                {/* Template Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    تنسيق الملف المطلوب:
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• الاسم الكامل (مطلوب)</li>
                    <li>• رقم الهاتف (مطلوب)</li>
                    <li>• المحافظة (مطلوب - افتراضي: غير محدد)</li>
                    <li>• العمر (مطلوب - افتراضي: 18)</li>
                    <li>• المرحلة (مطلوب - سيتم تعيين أول مرحلة إذا لم تُحدد)</li>
                    <li>• البريد الإلكتروني (اختياري)</li>
                    <li>• رقم هاتف ولي الأمر (اختياري)</li>
                  </ul>
                </div>

                {/* Download Template Button */}
                <button
                  onClick={() => {
                    // Create sample Excel template
                    const templateData = [
                      {
                        'الاسم الكامل': 'أحمد محمد',
                        'البريد الإلكتروني': 'ahmed@example.com',
                        'رقم الهاتف': '01234567890',
                        'رقم هاتف ولي الأمر': '01234567891',
                        'المرحلة': 'الثانوية العامة',
                        'المحافظة': 'القاهرة',
                        'العمر': 18
                      }
                    ];
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(templateData);
                    
                    // Set column widths
                    const colWidths = [
                      { wch: 15 }, // الاسم الكامل
                      { wch: 20 }, // البريد الإلكتروني
                      { wch: 12 }, // رقم الهاتف
                      { wch: 15 }, // رقم هاتف ولي الأمر
                      { wch: 15 }, // المرحلة
                      { wch: 12 }, // المحافظة
                      { wch: 8 }   // العمر
                    ];
                    ws['!cols'] = colWidths;
                    
                    XLSX.utils.book_append_sheet(wb, ws, 'نموذج الطلاب');
                    XLSX.writeFile(wb, 'نموذج_استيراد_الطلاب.xlsx');
                  }}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <FaDownload />
                  <span>تحميل نموذج Excel</span>
                </button>

                {/* Action Buttons */}
                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleImportStudents}
                    disabled={!importFile || importLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    {importLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>جارٍ الاستيراد...</span>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>استيراد</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
