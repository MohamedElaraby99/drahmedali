import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaAward, FaUsers, FaChartLine, FaCalendarAlt, FaUser, FaSync, FaFilter, FaTimes, FaPhone, FaEnvelope, FaGraduationCap, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance } from '../../Helpers/axiosInstance';
import CenterManagementHeader from '../../Components/CenterManagementHeader';
import Layout from '../../Layout/Layout';
import { getAttendanceDashboard } from '../../Redux/Slices/AttendanceSlice';
import { getStatsData } from '../../Redux/Slices/StatSlice';
import { formatCairoDate } from '../../utils/timezone';
import toast from 'react-hot-toast';

const Achievements = () => {
  const dispatch = useDispatch();
  const { dashboard: attendanceDashboard } = useSelector((state) => state.attendance);
  const {
    allUsersCount,
    subscribedCount,
    totalCourses,
    totalLectures,
    totalPayments,
    totalRevenue
  } = useSelector((state) => state.stat);

  const [students, setStudents] = useState([]);
  const [stages, setStages] = useState([]);
  const [achievementApiStats, setAchievementApiStats] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStage, setFilterStage] = useState('all');
  const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, [dispatch]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple data sources in parallel
      await Promise.allSettled([
        fetchStudents(),
        fetchAchievementStats(),
        fetchExamStats(),
        dispatch(getAttendanceDashboard()),
        dispatch(getStatsData())
      ]);
      
    } catch (error) {
      console.error('Error fetching achievement data:', error);
      showMessage('حدث خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch users with role USER (students) - now includes stage information
      const usersResponse = await axiosInstance.get('/users?role=USER&limit=100');
      console.log('Users API response:', usersResponse.data);
      
      if (usersResponse.data && usersResponse.data.success) {
        const usersData = usersResponse.data.data.docs || [];
        console.log('Users data:', usersData);
        
        // Extract unique stages from users data
        const uniqueStages = [];
        const stageMap = new Map();
        
        usersData.forEach(user => {
          console.log(`User ${user.fullName} stage:`, user.stage);
          if (user.stage && user.stage._id) {
            if (!stageMap.has(user.stage._id)) {
              stageMap.set(user.stage._id, user.stage);
              uniqueStages.push(user.stage);
            }
          }
        });
        
        console.log('Found stages from users:', uniqueStages);
        setStages(uniqueStages);
        
        // Calculate achievement levels and points for each student with real data
        const studentsWithAchievements = await Promise.all(
          usersData.map(async (student) => {
            const realData = await calculateRealAchievementData(student);
            return {
              ...student,
              ...realData,
              lastUpdate: formatCairoDate(new Date(), { day: 'numeric', month: 'numeric', year: 'numeric' })
            };
          })
        );
        
        // Sort by total points (descending)
        studentsWithAchievements.sort((a, b) => b.totalPoints - a.totalPoints);
        setStudents(studentsWithAchievements);
        
      } else {
        setStudents([]);
        setStages([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setStages([]);
      showMessage('حدث خطأ في جلب بيانات الطلاب', 'error');
    }
  };

  const fetchAchievementStats = async () => {
    try {
      const response = await axiosInstance.get('/achievements/stats');
      if (response.data && response.data.success) {
        setAchievementApiStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      // Continue without achievement stats
    }
  };

  const fetchExamStats = async () => {
    try {
      const response = await axiosInstance.get('/exam-results/stats');
      if (response.data && response.data.success) {
        setExamStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      // Continue without exam stats
    }
  };

  const calculateRealAchievementData = async (student) => {
    try {
      // Get real attendance data for the student
      let attendanceData = null;
      let examData = null;
      let gradeData = null;
      
      try {
        const attendanceResponse = await axiosInstance.get(`/attendance/user/${student._id}/stats`);
        attendanceData = attendanceResponse.data?.data;
      } catch (error) {
        console.warn(`Could not fetch attendance for user ${student._id}:`, error.message);
      }
      
      try {
        const examResponse = await axiosInstance.get(`/exam-results?userId=${student._id}&limit=100`);
        examData = examResponse.data?.data;
      } catch (error) {
        console.warn(`Could not fetch exam results for user ${student._id}:`, error.message);
      }
      
      try {
        const gradeResponse = await axiosInstance.get(`/offline-grades?search=${student.fullName}&limit=100`);
        gradeData = gradeResponse.data?.data?.data;
      } catch (error) {
        console.warn(`Could not fetch grades for user ${student._id}:`, error.message);
      }
      
      // Calculate real points based on actual data
      const attendancePoints = calculateAttendancePoints(attendanceData);
      const examPoints = calculateExamPoints(examData);
      const gradePoints = calculateGradePoints(gradeData);
      const totalPoints = attendancePoints + examPoints + gradePoints;
      
      // Determine achievement level based on total points
      const achievementLevel = calculateAchievementLevel({ totalPoints });
      
      return {
        achievementLevel,
        totalPoints,
        attendancePoints,
        gradesPoints: gradePoints,
        examPoints,
        additionalPoints: 0 // Can be extended for additional achievements
      };
    } catch (error) {
      console.error(`Error calculating achievement data for ${student.fullName}:`, error);
      // Return default values if calculation fails
      return {
        achievementLevel: 'مبتدئ',
        totalPoints: 0,
        attendancePoints: 0,
        gradesPoints: 0,
        examPoints: 0,
        additionalPoints: 0
      };
    }
  };

  const calculateAttendancePoints = (attendanceData) => {
    if (!attendanceData) return 0;
    
    const { attendanceRate = 0, totalAttendance = 0 } = attendanceData;
    
    // Award points based on attendance rate and total attendance
    let points = 0;
    
    if (attendanceRate >= 95) points += 30;
    else if (attendanceRate >= 85) points += 25;
    else if (attendanceRate >= 75) points += 20;
    else if (attendanceRate >= 65) points += 15;
    else if (attendanceRate >= 50) points += 10;
    
    // Bonus points for high total attendance
    if (totalAttendance >= 30) points += 10;
    else if (totalAttendance >= 20) points += 5;
    
    return Math.min(points, 40); // Cap at 40 points
  };

  const calculateExamPoints = (examData) => {
    if (!examData || !Array.isArray(examData) || examData.length === 0) return 0;
    
    const totalExams = examData.length;
    const passedExams = examData.filter(exam => exam.passed).length;
    const averageScore = examData.reduce((sum, exam) => sum + (exam.score || 0), 0) / totalExams;
    
    let points = 0;
    
    // Points for pass rate
    const passRate = (passedExams / totalExams) * 100;
    if (passRate >= 90) points += 25;
    else if (passRate >= 80) points += 20;
    else if (passRate >= 70) points += 15;
    else if (passRate >= 60) points += 10;
    
    // Points for average score
    if (averageScore >= 90) points += 15;
    else if (averageScore >= 80) points += 12;
    else if (averageScore >= 70) points += 8;
    else if (averageScore >= 60) points += 5;
    
    return Math.min(points, 40); // Cap at 40 points
  };

  const calculateGradePoints = (gradeData) => {
    if (!gradeData || !Array.isArray(gradeData) || gradeData.length === 0) return 0;
    
    const totalGrades = gradeData.length;
    const averagePercentage = gradeData.reduce((sum, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100;
      return sum + percentage;
    }, 0) / totalGrades;
    
    let points = 0;
    
    // Points based on average grade percentage
    if (averagePercentage >= 95) points += 20;
    else if (averagePercentage >= 85) points += 15;
    else if (averagePercentage >= 75) points += 12;
    else if (averagePercentage >= 65) points += 8;
    else if (averagePercentage >= 50) points += 5;
    
    return Math.min(points, 20); // Cap at 20 points
  };

  const calculateAchievementLevel = (data) => {
    const totalPoints = data.totalPoints || 0;
    
    if (totalPoints >= 80) return 'نجم';      // Star (80+ points)
    if (totalPoints >= 60) return 'متفوق';    // Excellent (60-79 points)
    if (totalPoints >= 40) return 'متقدم';    // Advanced (40-59 points)
    return 'مبتدئ';                          // Beginner (0-39 points)
  };

  // Filter students based on selected stage
  const getFilteredStudents = () => {
    let filtered = students;

    // Filter by stage
    if (filterStage !== 'all') {
      filtered = filtered.filter(student => 
        student.stage?._id === filterStage || student.stage?.id === filterStage
      );
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const getAchievementLevelStats = () => {
    const stats = {
      نجم: 0,
      متفوق: 0,
      متقدم: 0,
      مبتدئ: 0
    };
    
    filteredStudents.forEach(student => {
      stats[student.achievementLevel]++;
    });
    
    return stats;
  };

  const getOverallStats = () => {
    if (filteredStudents.length === 0) {
      return { 
        total: allUsersCount || 0, 
        avgPoints: 0, 
        avgAttendance: 0, 
        avgGrades: 0,
        avgExams: 0
      };
    }
    
    const totalStudents = filteredStudents.length;
    const totalPoints = filteredStudents.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
    const totalAttendancePoints = filteredStudents.reduce((sum, student) => sum + (student.attendancePoints || 0), 0);
    const totalGradesPoints = filteredStudents.reduce((sum, student) => sum + (student.gradesPoints || 0), 0);
    const totalExamPoints = filteredStudents.reduce((sum, student) => sum + (student.examPoints || 0), 0);
    
    return {
      total: totalStudents,
      avgPoints: totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : '0.0',
      avgAttendance: totalStudents > 0 ? (totalAttendancePoints / totalStudents).toFixed(1) : '0.0',
      avgGrades: totalStudents > 0 ? (totalGradesPoints / totalStudents).toFixed(1) : '0.0',
      avgExams: totalStudents > 0 ? (totalExamPoints / totalStudents).toFixed(1) : '0.0'
    };
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 text-xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-xl" />;
    if (rank === 3) return <FaMedal className="text-orange-500 text-xl" />;
    return <span className="text-gray-600 font-semibold">{rank}</span>;
  };

  const getAchievementLevelBadge = (level) => {
    const levelColors = {
      'نجم': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'متفوق': 'bg-green-100 text-green-800 border-green-200',
      'متقدم': 'bg-teal-100 text-teal-800 border-teal-200',
      'مبتدئ': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${levelColors[level] || levelColors['مبتدئ']}`}>
        <FaTrophy className="ml-2 text-white" />
        {level}
      </span>
    );
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ show: true, text, type });
    setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 5000);
    
    // Also show toast notification
    if (type === 'success') {
      toast.success(text);
    } else if (type === 'error') {
      toast.error(text);
    } else {
      toast(text);
    }
  };

  const handleViewUserInfo = (student) => {
    setSelectedUser(student);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const overallStats = getOverallStats();
  const achievementLevelStats = getAchievementLevelStats();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Center Management Header */}
          <CenterManagementHeader />

          {/* Main Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">
              الإنجازات والترتيب العام
            </h1>
            <p className="text-purple-100">
              تتبع أداء الطلاب وإنجازاتهم
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaUsers className="text-2xl text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FaChartLine className="text-2xl text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">متوسط النقاط</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.avgPoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <FaCalendarAlt className="text-2xl text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">متوسط نقاط الحضور</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.avgAttendance}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FaAward className="text-2xl text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">متوسط نقاط الامتحانات</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.avgExams}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Level Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              توزيع مستويات الإنجاز
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <FaStar className="text-3xl text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{achievementLevelStats.نجم}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">نجم</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FaTrophy className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{achievementLevelStats.متفوق}</p>
                <p className="text-sm text-green-700 dark:text-green-300">متفوق</p>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <FaMedal className="text-3xl text-teal-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-teal-600">{achievementLevelStats.متقدم}</p>
                <p className="text-sm text-teal-700 dark:text-teal-300">متقدم</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FaAward className="text-3xl text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{achievementLevelStats.مبتدئ}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">مبتدئ</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    فلترة حسب المرحلة الدراسية
                  </label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-right"
                    dir="rtl"
                  >
                    <option value="all">جميع المراحل</option>
                    {stages.map((stage) => (
                      <option key={stage._id} value={stage._id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  إجراءات إدارية
                </h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 space-x-reverse">
                  <FaFilter className="text-lg" />
                  <span>ترتيب الطلاب حسب الإنجازات</span>
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredStudents.length} طالب
                </p>
              </div>
            </div>
          </div>

          {/* Student Ranking Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ترتيب الطلاب حسب الإنجازات
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا يوجد طلاب لعرضهم</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الترتيب</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الطالب</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">المرحلة الدراسية</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">مستوى الإنجاز</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">إجمالي النقاط</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">نقاط الحضور</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">نقاط الدرجات</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">نقاط الامتحانات</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">آخر تحديث</th>
                      <th className="px-4 py-3 font-medium text-gray-900 dark:text-white">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredStudents.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-center">
                          {getRankIcon(index + 1)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {student.fullName || 'غير محدد'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student.phoneNumber || 'لا يوجد رقم'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {student.stage?.name || 'غير محدد'}
                        </td>
                        <td className="px-4 py-3">
                          {getAchievementLevelBadge(student.achievementLevel)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                            {(student.totalPoints || 0).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {(student.attendancePoints || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {(student.gradesPoints || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {(student.examPoints || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {student.lastUpdate}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button 
                              onClick={() => handleViewUserInfo(student)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="عرض معلومات الطالب"
                            >
                              <FaUser />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors">
                              <FaStar />
                            </button>
                            <button className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors">
                              <FaSync />
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

        {/* User Info Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      معلومات الطالب
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      تفاصيل شاملة عن الطالب وإنجازاته
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseUserModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaUser className="ml-2 text-blue-600" />
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaUser className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الاسم الكامل</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.fullName || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">رقم الهاتف</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.phoneNumber || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaEnvelope className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaGraduationCap className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">المرحلة الدراسية</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.stage?.name || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaBirthdayCake className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">العمر</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.age || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">العنوان</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.address || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievement Information */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaTrophy className="ml-2 text-purple-600" />
                    معلومات الإنجازات
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <FaStar className="text-3xl text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.totalPoints?.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي النقاط</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <FaTrophy className="text-3xl text-purple-500 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.achievementLevel || 'مبتدئ'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">مستوى الإنجاز</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Points Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaChartLine className="ml-2 text-green-600" />
                    تفصيل النقاط
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <FaCalendarAlt className="text-2xl text-green-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.attendancePoints?.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">نقاط الحضور</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <FaAward className="text-2xl text-blue-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.gradesPoints?.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">نقاط الدرجات</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <FaMedal className="text-2xl text-purple-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.examPoints?.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">نقاط الامتحانات</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaSync className="ml-2 text-gray-600" />
                    معلومات إضافية
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">آخر تحديث:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedUser.lastUpdate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">تاريخ التسجيل:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedUser.createdAt ? formatCairoDate(new Date(selectedUser.createdAt), { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">الحالة:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleCloseUserModal}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Achievements;
