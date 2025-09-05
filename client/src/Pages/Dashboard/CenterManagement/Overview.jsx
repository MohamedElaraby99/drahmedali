import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChartLine, FaUsers, FaQrcode, FaBook, FaCog, FaClock, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import Layout from '../../../Layout/Layout';
import CenterManagementHeader from '../../../Components/CenterManagementHeader';
import MonthlyDataManager from '../../../Components/MonthlyDataManager';
import WeeklySchedule from '../../../Components/WeeklySchedule';
import { getFinancialStats } from '../../../Redux/Slices/FinancialSlice';
import { getAttendanceDashboard } from '../../../Redux/Slices/AttendanceSlice';
import { getGroupsStats } from '../../../Redux/Slices/GroupsSlice';
import { getStatsData } from '../../../Redux/Slices/StatSlice';
import { getCairoMonthRange } from '../../../utils/timezone';
import toast from 'react-hot-toast';

export default function Overview() {
  const dispatch = useDispatch();
  const { data: userData, role } = useSelector((state) => state.auth);
  
  // Get data from Redux state
  const { stats: financialStats } = useSelector((state) => state.financial);
  const { dashboard: attendanceDashboard } = useSelector((state) => state.attendance);
  const { stats: groupsStats } = useSelector((state) => state.groups);
  const {
    allUsersCount,
    subscribedCount,
    totalCourses,
    totalLectures,
    totalPayments,
    totalRevenue
  } = useSelector((state) => state.stat);
  
  const [loading, setLoading] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  // Derive stats from Redux using memoization to avoid unnecessary re-renders
  const centerStats = useMemo(() => {
    return {
      totalStudents: allUsersCount || 0,
      activeInstructors: subscribedCount || 0,
      totalGroups: groupsStats?.data?.totalGroups || 0,
      monthlyRevenue: financialStats?.data?.totalIncome || 0,
      attendanceRate:
        attendanceDashboard?.data?.overallStats?.presentCount &&
        attendanceDashboard?.data?.overallStats?.totalRecords
          ? Math.round(
              (attendanceDashboard.data.overallStats.presentCount /
                attendanceDashboard.data.overallStats.totalRecords) *
                100 *
                10
            ) / 10
          : 0,
      activeCourses: totalCourses || 0,
    };
  }, [
    allUsersCount,
    subscribedCount,
    groupsStats?.data?.totalGroups,
    financialStats?.data?.totalIncome,
    attendanceDashboard?.data?.overallStats?.presentCount,
    attendanceDashboard?.data?.overallStats?.totalRecords,
    totalCourses,
  ]);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch data only when a month is selected
    if (!selectedMonthData) return;
    fetchCenterDataForMonth(selectedMonthData);
  }, [selectedMonthData]);

  // Removed local state syncing effect to prevent redundant renders

  const handleMonthChange = (monthData) => {
    if (selectedMonthData?.key === monthData?.key) return;
    setSelectedMonthData(monthData);
  };

  const fetchCenterDataForMonth = async (monthData) => {
    setLoading(true);
    try {
      const startDateStr = monthData.startDate;
      const endDateStr = monthData.endDate;

      // Fetch all required data in parallel for the selected month
      await Promise.allSettled([
        dispatch(getFinancialStats({ startDate: startDateStr, endDate: endDateStr })),
        dispatch(getAttendanceDashboard({ startDate: startDateStr, endDate: endDateStr })),
        dispatch(getGroupsStats())
      ]);
      
      // Update recent activities based on month
      updateRecentActivitiesForMonth(monthData);
      
    } catch (error) {
      console.error('Error fetching center data for month:', error);
      toast.error(`حدث خطأ في تحميل بيانات ${monthData.label}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenterData = async () => {
    setLoading(true);
    try {
      // Get current month date range in Cairo timezone
      const { start: startDate, end: endDate } = getCairoMonthRange();
      const startDateStr = startDate.split('T')[0];
      const endDateStr = endDate.split('T')[0];

      // Fetch all required data in parallel
      await Promise.allSettled([
        dispatch(getFinancialStats({ startDate: startDateStr, endDate: endDateStr })),
        dispatch(getAttendanceDashboard({ startDate: startDateStr, endDate: endDateStr })),
        dispatch(getGroupsStats())
      ]);
      
    } catch (error) {
      console.error('Error fetching center data:', error);
      toast.error('حدث خطأ في تحميل بيانات المركز');
    } finally {
      setLoading(false);
    }
  };

  const updateRecentActivitiesForMonth = useCallback((monthData) => {
    // Set activities based on whether it's current month or historical
    if (monthData.isCurrent) {
      setRecentActivities([
        {
          id: 1,
          type: 'student_registration',
          message: 'طالب جديد انضم إلى مجموعة الرياضيات',
          time: 'منذ 5 دقائق',
          icon: FaUsers
        },
        {
          id: 2,
          type: 'attendance',
          message: 'تم تسجيل حضور 25 طالب في درس الفيزياء',
          time: 'منذ 15 دقيقة',
          icon: FaQrcode
        },
        {
          id: 3,
          type: 'payment',
          message: 'تم استلام رسوم مجموعة الكيمياء',
          time: 'منذ ساعة',
          icon: FaBook
        },
        {
          id: 4,
          type: 'course_update',
          message: 'تم تحديث محتوى دورة اللغة الإنجليزية',
          time: 'منذ ساعتين',
          icon: FaGraduationCap
        }
      ]);
    } else {
      // Historical activities for past months
      setRecentActivities([
        {
          id: 1,
          type: 'month_summary',
          message: `ملخص ${monthData.label}: تم تسجيل إجمالي 450 طالب`,
          time: 'بيانات مؤرشفة',
          icon: FaUsers
        },
        {
          id: 2,
          type: 'attendance_summary',
          message: `معدل الحضور في ${monthData.label}: 85%`,
          time: 'بيانات مؤرشفة',
          icon: FaQrcode
        },
        {
          id: 3,
          type: 'revenue_summary',
          message: `إجمالي الإيرادات في ${monthData.label}: 125,000 جنيه`,
          time: 'بيانات مؤرشفة',
          icon: FaChartLine
        },
        {
          id: 4,
          type: 'groups_summary',
          message: `عدد المجموعات النشطة في ${monthData.label}: 12 مجموعة`,
          time: 'بيانات مؤرشفة',
          icon: FaBook
        }
      ]);
    }
  }, []);

  // Removed: centerStats local state updater (now using useMemo)

  const statsCards = [
    {
      title: 'إجمالي الطلاب',
      value: centerStats.totalStudents.toLocaleString(),
      icon: FaUsers,
      color: 'bg-blue-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+12%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    },
    {
      title: 'المدرسين النشطين',
      value: centerStats.activeInstructors,
      icon: FaGraduationCap,
      color: 'bg-green-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+3' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    },
    {
      title: 'إجمالي المجموعات',
      value: centerStats.totalGroups,
      icon: FaBook,
      color: 'bg-purple-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+2' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    },
    {
      title: selectedMonthData?.isCurrent ? 'الإيرادات الشهرية' : `إيرادات ${selectedMonthData?.label || 'الشهر'}`,
      value: `${centerStats.monthlyRevenue.toLocaleString()} ج.م`,
      icon: FaChartLine,
      color: 'bg-yellow-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+8%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    },
    {
      title: 'معدل الحضور',
      value: `${centerStats.attendanceRate}%`,
      icon: FaQrcode,
      color: 'bg-indigo-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+2.5%' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    },
    {
      title: 'الدورات النشطة',
      value: centerStats.activeCourses,
      icon: FaCalendarAlt,
      color: 'bg-pink-500',
      change: loading ? '...' : selectedMonthData?.isCurrent ? '+1' : 'بيانات مؤرشفة',
      changeType: selectedMonthData?.isCurrent ? 'positive' : 'archived'
    }
  ];

  // Keep page mounted; show a non-blocking loading overlay instead of remounting children

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Center Management Header */}
          <CenterManagementHeader />

          {/* Monthly Data Manager */}
          <MonthlyDataManager 
            onMonthChange={handleMonthChange}
            showStartNewMonth={true}
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
            {statsCards.map((stat, index) => (
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
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stat.change}
                      </span>
                      {stat.changeType !== 'archived' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                          من الشهر الماضي
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

          {/* Weekly Schedule */}
          <WeeklySchedule />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              الإجراءات السريعة
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/center-management/attendance"
                className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <FaQrcode className="text-blue-600 dark:text-blue-400 text-xl ml-3" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">إدارة الحضور</span>
              </a>
              
              <a
                href="/admin/center-management/groups"
                className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <FaBook className="text-green-600 dark:text-green-400 text-xl ml-3" />
                <span className="text-green-800 dark:text-green-200 font-medium">إدارة المجموعات</span>
              </a>
              
              <a
                href="/admin/center-management/students"
                className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <FaUsers className="text-purple-600 dark:text-purple-400 text-xl ml-3" />
                <span className="text-purple-800 dark:text-purple-200 font-medium">إدارة الطلاب</span>
              </a>
              
              <a
                href="/admin/center-management/settings"
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FaCog className="text-gray-600 dark:text-gray-400 text-xl ml-3" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">الإعدادات</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
