import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaQrcode, FaUsers, FaCalendarAlt, FaClock, FaSearch, FaFilter, FaDownload, FaUserCheck, FaUserTimes, FaUserClock, FaCheck, FaTimes, FaPhone, FaIdCard } from 'react-icons/fa';
import Layout from '../../../Layout/Layout';
import CenterManagementHeader from '../../../Components/CenterManagementHeader';
import MonthlyDataManager from '../../../Components/MonthlyDataManager';
import { getAttendanceDashboard, scanQRAttendance, updateAttendance, takeAttendanceByPhone, getAllAttendance } from '../../../Redux/Slices/AttendanceSlice';
import { getAllGroups, getGroupById } from '../../../Redux/Slices/GroupsSlice';
import { getAllUsers } from '../../../Redux/Slices/UsersSlice';
import QRCodeScanner from '../../../Components/QRCodeScanner';
import PhoneAttendanceForm from '../../../Components/PhoneAttendanceForm';
import UserNumberAttendanceForm from '../../../Components/UserNumberAttendanceForm';
import { formatCairoDate } from '../../../utils/timezone';
import toast from 'react-hot-toast';

export default function Attendance() {
  const dispatch = useDispatch();
  const { data: userData, role } = useSelector((state) => state.auth);
  const { allAttendance, loading: attendanceLoading, scanResult } = useSelector((state) => state.attendance);
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  
  const [loading, setLoading] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showUserNumberForm, setShowUserNumberForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    group: '',
    status: ''
  });

  useEffect(() => {
    if (['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(role)) {
      if (selectedMonthData) {
        // Load data for selected month
        loadAttendanceDataForMonth(selectedMonthData);
      } else {
        // Load current data
        loadCurrentAttendanceData();
      }
    }
  }, [dispatch, role, selectedMonthData]);

  const handleMonthChange = (monthData) => {
    setSelectedMonthData(monthData);
    // Update filters to match selected month
    if (monthData.isCurrent) {
      setFilters(prev => ({ ...prev, date: '' })); // Clear date filter for current month
    } else {
      setFilters(prev => ({ ...prev, date: monthData.startDate })); // Set to start of month for historical data
    }
  };

  const loadAttendanceDataForMonth = (monthData) => {
    const startDate = monthData.startDate;
    const endDate = monthData.endDate;
    
    dispatch(getAttendanceDashboard({ startDate, endDate }));
    dispatch(getAllGroups());
    dispatch(getAllUsers({ role: 'USER' }));
    loadAttendanceData();
  };

  const loadCurrentAttendanceData = () => {
    // Get today's date for dashboard stats
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    dispatch(getAttendanceDashboard({ startDate, endDate }));
    dispatch(getAllGroups());
    dispatch(getAllUsers({ role: 'USER' }));
    loadAttendanceData();
  };

  useEffect(() => {
    if (selectedGroup) {
      loadGroupStudents();
    }
  }, [selectedGroup, users]);

  // Load attendance data when filters change
  useEffect(() => {
    loadAttendanceData();
    // Refresh dashboard stats for today
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    dispatch(getAttendanceDashboard({ startDate, endDate }));
  }, [filters.group, filters.date, filters.status]);

  const loadAttendanceData = async () => {
    const params = {
      page: 1,
      limit: 50,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    try {
      await dispatch(getAllAttendance(params));
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('حدث خطأ في تحميل بيانات الحضور');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadAttendanceData();
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      group: '',
      status: ''
    });
  };

  // Update filters when group is selected from the group cards
  const handleGroupSelectionFromCard = (groupId) => {
    setSelectedGroup(groupId);
    handleFilterChange('group', groupId);
    setGroupStudents([]);
  };

  const loadGroupStudents = () => {
    if (!selectedGroup || !users) return;
    
    const group = groups.find(g => g._id === selectedGroup);
    if (!group || !group.students) return;
    
    const students = users.filter(user => 
      group.students.some(studentId => studentId === user._id)
    );
    
    setGroupStudents(students);
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    handleFilterChange('group', groupId);
    setGroupStudents([]);
  };

  const handleManualAttendance = async (studentId, status) => {
    if (!selectedGroup || !selectedDate) {
      toast.error('يرجى اختيار المجموعة والتاريخ');
      return;
    }

    try {
      const attendanceData = {
        userId: studentId,
        status,
        scanLocation: 'حضور يدوي من قائمة الطلاب',
        notes: `تم تسجيل الحضور يدوياً في ${selectedDate}`
      };

      const result = await dispatch(takeAttendanceByPhone(attendanceData));
      
      if (result.type === 'attendance/takeByPhone/fulfilled') {
        toast.success(`تم تسجيل ${status === 'present' ? 'الحضور' : status === 'absent' ? 'الغياب' : 'التأخير'} بنجاح`);
        loadAttendanceData();
        // Refresh dashboard stats
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        dispatch(getAttendanceDashboard({ startDate, endDate }));
      } else {
        toast.error(result.payload || 'حدث خطأ في تسجيل الحضور');
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleQRScan = async (qrData) => {
    if (!selectedGroup || !selectedDate) {
      toast.error('يرجى اختيار المجموعة والتاريخ');
      return;
    }

    try {
      const scanData = {
        qrData,
        groupId: selectedGroup,
        date: selectedDate
      };

      await dispatch(scanQRAttendance(scanData));
      
      if (scanResult?.data) {
        toast.success('تم تسجيل الحضور بنجاح');
        loadAttendanceData();
        // Refresh dashboard stats
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        dispatch(getAttendanceDashboard({ startDate, endDate }));
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      toast.error('حدث خطأ في مسح رمز الاستجابة السريعة');
    }
  };

  const handlePhoneAttendanceSuccess = (result) => {
    toast.success('تم تسجيل الحضور بنجاح برقم الهاتف');
    // Force refresh attendance data
    setTimeout(() => {
      loadAttendanceData();
      // Refresh dashboard stats
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      dispatch(getAttendanceDashboard({ startDate, endDate }));
    }, 500);
    setShowPhoneForm(false);
  };

  const handleUserNumberAttendanceSuccess = (result) => {
    toast.success('تم تسجيل الحضور بنجاح برقم المستخدم');
    // Force refresh attendance data
    setTimeout(() => {
      loadAttendanceData();
      // Refresh dashboard stats
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      dispatch(getAttendanceDashboard({ startDate, endDate }));
    }, 500);
    setShowUserNumberForm(false);
  };

  const getStudentAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(record => 
      record.student._id === studentId && 
      record.date === selectedDate
    );
    return record ? record.status : null;
  };

  const filteredStudents = groupStudents.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get groups that have scheduled time slots for today
  const getActiveGroupsForToday = () => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[today.getDay()];
    
    return groups.filter(group => {
      const daySchedule = group.weeklySchedule?.[todayDayName];
      return daySchedule && daySchedule.timeSlots && daySchedule.timeSlots.length > 0;
    });
  };

  const activeGroupsToday = getActiveGroupsForToday();

  // Format time for display
  const formatTime = (hour, minute, period) => {
    let displayHour = hour;
    let displayPeriod = period;
    
    if (hour === 0) {
      displayHour = 12;
      displayPeriod = 'AM';
    } else if (hour > 12) {
      displayHour = hour - 12;
      displayPeriod = 'PM';
    } else if (hour === 12) {
      displayPeriod = 'PM';
    }
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${displayPeriod}`;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startHour, startMinute, duration) => {
    let endHour = startHour;
    let endMinute = startMinute + duration;
    
    // Handle minute overflow
    while (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
    
    // Handle hour overflow (24-hour format)
    if (endHour >= 24) {
      endHour -= 24;
    }
    
    // Convert to 12-hour format
    let displayHour = endHour;
    let displayPeriod = 'AM';
    
    if (endHour === 0) {
      displayHour = 12;
      displayPeriod = 'AM';
    } else if (endHour > 12) {
      displayHour = endHour - 12;
      displayPeriod = 'PM';
    } else if (endHour === 12) {
      displayPeriod = 'PM';
    }
    
    return `${displayHour}:${endMinute.toString().padStart(2, '0')} ${displayPeriod}`;
  };

  // Get attendance stats from Redux state
  const { dashboard: attendanceDashboard } = useSelector((state) => state.attendance);
  
  // Calculate real attendance stats
  const attendanceStats = [
    {
      title: selectedMonthData?.isCurrent ? 'إجمالي الحضور اليوم' : `حضور ${selectedMonthData?.label || 'الشهر'}`,
      value: attendanceDashboard?.data?.overallStats?.presentCount?.toString() || '0',
      icon: FaUsers,
      color: 'bg-green-500',
      change: selectedMonthData?.isCurrent ? '+0' : 'بيانات مؤرشفة'
    },
    {
      title: selectedMonthData?.isCurrent ? 'الغياب اليوم' : `غياب ${selectedMonthData?.label || 'الشهر'}`,
      value: attendanceDashboard?.data?.overallStats?.absentCount?.toString() || '0',
      icon: FaCalendarAlt,
      color: 'bg-red-500',
      change: selectedMonthData?.isCurrent ? '-0' : 'بيانات مؤرشفة'
    },
    {
      title: 'معدل الحضور',
      value: attendanceDashboard?.data?.overallStats?.totalRecords > 0 
        ? `${Math.round((attendanceDashboard.data.overallStats.presentCount / attendanceDashboard.data.overallStats.totalRecords) * 100)}%` 
        : '0%',
      icon: FaQrcode,
      color: 'bg-blue-500',
      change: selectedMonthData?.isCurrent ? '+0%' : 'بيانات مؤرشفة'
    },
    {
      title: selectedMonthData?.isCurrent ? 'المجموعات النشطة' : `مجموعات ${selectedMonthData?.label || 'الشهر'}`,
      value: activeGroupsToday.length.toString(),
      icon: FaClock,
      color: 'bg-purple-500',
      change: selectedMonthData?.isCurrent ? '+0' : 'بيانات مؤرشفة'
    }
  ];

  if (loading || attendanceLoading) {
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

          {/* Monthly Data Manager */}
          <MonthlyDataManager 
            onMonthChange={handleMonthChange}
            showStartNewMonth={false}
            className="mb-6"
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {attendanceStats.map((stat, index) => (
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
                      <span className={`text-xs font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 
                        stat.change.startsWith('-') ? 'text-red-600' : 
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stat.change}
                      </span>
                      {!stat.change.includes('بيانات') && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                          من الأمس
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Groups Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  المجموعات النشطة
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  المجموعات التي لديها حصص اليوم ({new Date().toLocaleDateString('ar-EG', { weekday: 'long' })})
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                المجموعات النشطة اليوم: {activeGroupsToday.length}
              </div>
            </div>

            {groupsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">جاري تحميل المجموعات...</p>
              </div>
            ) : activeGroupsToday.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGroupsToday.map((group) => {
                  const today = new Date();
                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const todayDayName = dayNames[today.getDay()];
                  const todaySchedule = group.weeklySchedule?.[todayDayName];
                  const todayTimeSlots = todaySchedule?.timeSlots || [];
                  
                  return (
                    <div key={group._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.instructor?.name || 'غير محدد'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          نشط
                        </span>
                      </div>
                    </div>

                    {/* Group Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">الطلاب:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {group.currentStudents || 0}/{group.maxStudents}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {group.price} جنيه
                        </span>
                      </div>

                      {group.monthlyPayment && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">الدفع الشهري:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {group.monthlyPayment.price} جنيه
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Today's Schedule */}
                    {todayTimeSlots.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          حصص اليوم:
                        </h4>
                        <div className="space-y-1">
                          {todayTimeSlots.map((timeSlot, index) => {
                            const startTime = formatTime(timeSlot.hour, timeSlot.minute, timeSlot.period);
                            const endTime = calculateEndTime(timeSlot.hour, timeSlot.minute, timeSlot.duration || 60);
                            
                            return (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                  {startTime} - {endTime}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {timeSlot.duration || 60} دقيقة
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleGroupSelectionFromCard(group._id)}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedGroup === group._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`}
                    >
                      {selectedGroup === group._id ? 'محدد' : 'اختيار المجموعة'}
                    </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUsers className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد مجموعات نشطة اليوم
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  لا توجد مجموعات لديها حصص مجدولة لهذا اليوم
                </p>
              </div>
            )}
          </div>

          {/* Group Selection and Attendance Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  إدارة الحضور
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  اختر المجموعة والتاريخ لتسجيل الحضور
                </p>
              </div>
            </div>

            {/* Group and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اختر المجموعة
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">اختر المجموعة</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} - {group.instructor?.name || 'غير محدد'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* QR Scanner Section */}
            {selectedGroup && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ماسح رمز الاستجابة السريعة
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      امسح رمز الاستجابة السريعة للطالب لتسجيل الحضور
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQRScanner(!showQRScanner)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                    >
                      <FaQrcode />
                      <span>{showQRScanner ? 'إخفاء الماسح' : 'فتح الماسح'}</span>
                    </button>
                    <button
                      onClick={() => setShowPhoneForm(!showPhoneForm)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                    >
                      <FaPhone />
                      <span>{showPhoneForm ? 'إخفاء النموذج' : 'حضور بالهاتف'}</span>
                    </button>
                   
                  </div>
                </div>

                {showQRScanner && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-4">
                    <QRCodeScanner onScan={handleQRScan} isModal={false} />
                  </div>
                )}
                
                {showPhoneForm && (
                  <div className="mb-4">
                    <PhoneAttendanceForm
                      courseId={null}
                      liveMeetingId={null}
                      onSuccess={handlePhoneAttendanceSuccess}
                      onClose={() => setShowPhoneForm(false)}
                    />
                  </div>
                )}
                
                {showUserNumberForm && (
                  <div className="mb-4">
                    <UserNumberAttendanceForm
                      selectedGroup={selectedGroup}
                      selectedDate={selectedDate}
                      onSuccess={handleUserNumberAttendanceSuccess}
                      onClose={() => setShowUserNumberForm(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Students List and Manual Attendance */}
            {selectedGroup && groupStudents.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    قائمة الطلاب ({groupStudents.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleFilterChange('group', selectedGroup);
                        // Scroll to attendance records section
                        document.getElementById('attendance-records-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                    >
                      <FaCalendarAlt />
                      <span>عرض سجلات الحضور</span>
                    </button>
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="البحث عن طالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">الطالب</th>
                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">البريد الإلكتروني</th>
                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">حالة الحضور</th>
                        <th className="px-4 py-3 font-medium text-gray-900 dark:text-white text-right">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {filteredStudents.map((student) => {
                        const attendanceStatus = getStudentAttendanceStatus(student._id);
                        return (
                          <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                    {student.fullName?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {student.fullName || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-600 dark:text-gray-400">
                                {student.email || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                attendanceStatus === 'present' 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : attendanceStatus === 'late'
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  : attendanceStatus === 'absent'
                                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {attendanceStatus === 'present' ? 'حاضر' : 
                                 attendanceStatus === 'late' ? 'متأخر' : 
                                 attendanceStatus === 'absent' ? 'غائب' : 'لم يتم التسجيل'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => handleManualAttendance(student._id, 'present')}
                                  className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                  title="تسجيل حضور"
                                >
                                  <FaUserCheck className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleManualAttendance(student._id, 'late')}
                                  className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                  title="تسجيل تأخير"
                                >
                                  <FaUserClock className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleManualAttendance(student._id, 'absent')}
                                  className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                  title="تسجيل غياب"
                                >
                                  <FaUserTimes className="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedGroup && groupStudents.length === 0 && (
              <div className="text-center py-8">
                <FaUsers className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  لا توجد طلاب في هذه المجموعة
                </p>
              </div>
            )}
          </div>

          {/* Filters */}
          <div id="attendance-records-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  سجلات الحضور
                </h2>
                {filters.group && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    عرض سجلات: {groups.find(g => g._id === filters.group)?.name || 'مجموعة محددة'}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 space-x-reverse">
                  <FaDownload />
                  <span>تصدير</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
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
                    <option key={group._id} value={group._id}>
                      {group.name} - {group.instructor?.name || 'غير محدد'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  حالة الحضور
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">جميع الحالات</option>
                  <option value="present">حاضر</option>
                  <option value="absent">غائب</option>
                  <option value="late">متأخر</option>
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

            {/* Attendance Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الطالب</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden sm:table-cell">المجموعة</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">التاريخ</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden md:table-cell">الوقت</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الحالة</th>
                    <th className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden lg:table-cell">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {allAttendance.data && allAttendance.data.length > 0 ? (
                    allAttendance.data.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                {(record.user?.fullName || record.student?.fullName)?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {record.user?.fullName || record.student?.fullName || 'غير محدد'}
                              </p>
                              {/* Debug info - remove in production */}
                              {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-gray-500">
                                  Debug: {record.user ? 'user' : record.student ? 'student' : 'none'}
                                </div>
                              )}
                              <p className="text-gray-500 dark:text-gray-400 text-xs sm:hidden">
                                {record.group?.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {record.group?.name || 'غير محدد'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900 dark:text-white">
                            {formatCairoDate(record.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatCairoDate(record.checkInTime, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.status === 'present' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : record.status === 'late'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {record.status === 'present' ? 'حاضر' : 
                             record.status === 'late' ? 'متأخر' : 'غائب'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-gray-500 dark:text-gray-400">
                            {record.notes || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد سجلات حضور
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {allAttendance.data && allAttendance.data.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  عرض {allAttendance.data.length} من {allAttendance.total || 0} سجل
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    السابق
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</span>
                  <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
