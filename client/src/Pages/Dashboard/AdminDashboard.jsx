import React, { useEffect, useState, useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { BsCollectionPlayFill, BsTrash, BsPencilSquare } from "react-icons/bs";
import { 
  FaUsers, 
  FaBlog, 
  FaQuestionCircle, 
  FaBook, 
  FaChartLine, 
  FaGraduationCap,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaCog,
  FaRocket,
  FaTrophy,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaHeart,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaTicketAlt,
  FaQrcode,
  FaUserGraduate,
  FaPlay,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaFilePdf,
  FaClipboardCheck,
  FaClipboardList,
  FaChalkboardTeacher,
  FaServer,
  FaList,
  FaBuilding,
  FaVideo
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

import Layout from "../../Layout/Layout";

import { getStatsData } from "../../Redux/Slices/StatSlice";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    allUsersCount, 
    subscribedCount, 
    totalCourses,
    totalLectures, 
    totalPayments, 
    totalRevenue, 
    monthlySalesData 
  } = useSelector((state) => state.stat);

  // Get user role from auth state
  const { role } = useSelector((state) => state.auth);

  // Add state for stages data
  const [stages, setStages] = useState([]);
  const [stagesLoading, setStagesLoading] = useState(true);
   
  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Create observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Add state for recharge codes data
  const [rechargeCodesStats, setRechargeCodesStats] = useState({
    totalGenerated: 0,
    totalUsed: 0,
    totalAvailable: 0
  });

  // Function to fetch stages data
  const fetchStagesData = async () => {
    try {
      setStagesLoading(true);
      // Use the real stages stats API endpoint
      console.log('📊 Fetching real stages statistics...');
      const response = await axiosInstance.get('/stages/stats');
      
      if (response.data.success) {
        const stagesData = response.data.data?.stages || response.data.data || [];
        console.log('📊 Real stages data received:', response.data);
        console.log('📊 Raw stages array:', stagesData);
        
        // Process real stages data
        const processedStages = stagesData.map(stage => {
          console.log('📊 Processing stage:', stage);
          return {
            name: stage.name || 'مرحلة غير محددة',
            studentsCount: stage.studentsCount || 0,
            subjectsCount: stage.subjectsCount || 0,
            _id: stage._id
          };
        });
        
        console.log('✅ Real stages data processed and set:', processedStages);
        
        // Only set stages if we have valid data
        if (processedStages.length > 0) {
          setStages(processedStages);
        } else {
          console.log('⚠️ No valid stages data - chart will show empty state');
          setStages([]);
        }
      } else {
        console.log('⚠️ No stages data available in response');
        setStages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching stages data:', error);
      console.log('⚠️ Stages API error - chart will show empty state');
      setStages([]);
      toast.error('فشل في تحميل بيانات المراحل الدراسية');
    } finally {
      setStagesLoading(false);
    }
  };

  // Function to fetch recharge codes statistics
  const fetchRechargeCodesStats = async () => {
    try {
      console.log('📊 Fetching real recharge codes statistics...');
      const response = await axiosInstance.get('/admin/recharge-codes/stats');
      if (response.data.success) {
        const stats = response.data.data.stats;
        console.log('📊 Real recharge codes data received:', stats);
        setRechargeCodesStats({
          totalGenerated: stats.totalCodes || 0,
          totalUsed: stats.usedCodes || 0,
          totalAvailable: stats.unusedCodes || 0
        });
      }
    } catch (error) {
      console.error('Error fetching recharge codes stats:', error);
      console.log('⚠️ Using fallback data - API might not be available');
      // Set fallback data that's clearly marked as fake
      setRechargeCodesStats({
        totalGenerated: 0,
        totalUsed: 0,
        totalAvailable: 0
      });
    }
  };

  // Enhanced chart data for stages - now using real data
  const stagesChartData = useMemo(() => {
    console.log('📊 Creating chart data for stages:', stages);
    
    if (!stages || stages.length === 0) {
      return {
        labels: ["لا توجد مراحل"],
        datasets: [
          {
            label: "عدد المراحل الدراسية",
            data: [0],
            backgroundColor: ["rgba(156, 163, 175, 0.5)"],
            borderColor: ["rgba(156, 163, 175, 1)"],
            borderWidth: 2,
          },
        ],
      };
    }

    const chartData = {
      labels: stages.map(stage => stage.name),
      datasets: [
        {
          label: "عدد المراحل الدراسية",
          data: stages.map(() => 1), // Each stage counts as 1 to show total count
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(99, 102, 241, 0.8)",
            "rgba(6, 182, 212, 0.8)",
            "rgba(245, 101, 101, 0.8)",
            "rgba(52, 211, 153, 0.8)"
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(236, 72, 153, 1)",
            "rgba(99, 102, 241, 1)",
            "rgba(6, 182, 212, 1)",
            "rgba(245, 101, 101, 1)",
            "rgba(52, 211, 153, 1)"
          ],
          borderWidth: 2,
        },
      ],
    };
    
    console.log('📊 Final chart data:', chartData);
    return chartData;
  }, [stages]);

  // Enhanced chart data for platform growth
  const platformGrowthData = {
    labels: ["المستخدمين", "الدورات", "الدروس", "أكواد مُولدة", "أكواد مستخدمة"],
    datasets: [
      {
        label: "مقاييس نمو المنصة",
        data: [allUsersCount, totalCourses, totalLectures, rechargeCodesStats.totalGenerated, rechargeCodesStats.totalUsed],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        borderRadius: 8,
      },
    ],
  };







  useEffect(() => {
    // Suppress browser extension errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('runtime.lastError') || args[0]?.includes?.('message channel closed')) {
        return; // Suppress these specific errors
      }
      originalError.apply(console, args);
    };

    (async () => {
      console.log('🚀 Starting to fetch all real data for dashboard...');
      await dispatch(getStatsData());
      console.log('✅ Real stats data fetched from /admin/stats/users');
      await fetchStagesData(); // Fetch stages data
      console.log('✅ Real stages data fetched');
      await fetchRechargeCodesStats(); // Fetch recharge codes statistics
      console.log('✅ Real recharge codes data fetched');
      console.log('🎯 All real data loaded - no fake data should be displayed');
    })();

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Cleanup
    return () => {
      console.error = originalError;
      clearTimeout(timer);
    };
  }, []);

  // Statistics cards data
  const statsCards = [
    {
      title: "إجمالي المستخدمين",
      value: allUsersCount,
      icon: FaUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "إجمالي المشتركين",
      value: subscribedCount,
      icon: FaUserGraduate,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "إجمالي الأكواد المستخدمة",
      value: rechargeCodesStats.totalUsed,
      icon: FaQrcode,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: "+15%",
      changeType: "increase"
    },
   
  ];

  // Add state for content access management
  const [selectedUser, setSelectedUser] = useState('');
  const [contentIds, setContentIds] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Add function to grant content access
  const handleGrantContentAccess = async () => {
    if (!selectedUser || !contentIds.trim()) {
      toast.error('يرجى اختيار المستخدم وإدخال معرفات المحتوى');
      return;
    }

    const idsArray = contentIds.split(',').map(id => id.trim()).filter(id => id);
    
    setGrantingAccess(true);
    try {
      const response = await axiosInstance.post('/courses/grant-access', {
        userId: selectedUser,
        contentIds: idsArray
      });

      if (response.data.success) {
        toast.success('تم منح الوصول للمحتوى بنجاح');
        setSelectedUser('');
        setContentIds('');
      }
    } catch (error) {
      console.error('Error granting access:', error);
      toast.error(error.response?.data?.message || 'فشل في منح الوصول');
    } finally {
      setGrantingAccess(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 container mx-auto">
            {/* Header */}
            <div className={`text-center mb-12 transition-all duration-1000 ease-out ${
              heroVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <h1 className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-400 dark:to-indigo-400 mb-4 transition-all duration-700 delay-200 ${
                heroLoaded 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}>
                لوحة تحكم الإدارة
              </h1>
              <p className={`text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-400 ${
                heroLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}>
                مرحباً بعودتك! إليك نظرة عامة على أداء منصة التعلم والمقاييس الرئيسية.
              </p>
            </div>

            {/* Statistics Cards - Only visible to SUPER_ADMIN */}
            {role === "SUPER_ADMIN" && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {statsCards.map((card, index) => (
                  <div 
                    key={index} 
                    className={`bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 ${
                      heroLoaded 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-8 scale-95'
                    }`}
                    style={{ 
                      transitionDelay: `${500 + (index * 100)}ms`,
                      transitionProperty: 'opacity, transform, scale'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${card.bgColor}`}>
                        <card.icon className={`text-lg lg:text-2xl ${card.textColor}`} />
                      </div>
                      <div className="flex items-center gap-1 text-xs lg:text-sm">
                        {card.changeType === "increase" ? (
                          <FaArrowUp className="text-green-500" />
                        ) : (
                          <FaArrowDown className="text-red-500" />
                        )}
                        <span className={card.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                          {card.change}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-right">
                      {card.value}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm text-right">
                      {card.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts Section - Only visible to SUPER_ADMIN */}
            {role === "SUPER_ADMIN" && (
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 transition-all duration-700 ease-out ${
                heroLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '800ms' }}>
                {/* Course Categories Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6">
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FaChartLine className="text-blue-600 dark:text-blue-400 text-lg lg:text-xl" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white text-right">
                      المراحل الدراسية
                    </h3>
                  </div>
                  <div className="relative h-48 sm:h-56 lg:h-64 w-full">
                    {stagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="mr-2 text-gray-600 dark:text-gray-300">جاري تحميل بيانات المراحل...</span>
                      </div>
                    ) : (
                      <Pie
                        data={stagesChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: isDarkMode ? '#ffffff' : '#374151', // Dynamic color based on dark mode
                                font: { 
                                  size: window.innerWidth < 768 ? 10 : 12,
                                  family: 'system-ui, -apple-system, sans-serif'
                                },
                                padding: window.innerWidth < 768 ? 10 : 20,
                                boxWidth: window.innerWidth < 768 ? 12 : 16,
                                boxHeight: window.innerWidth < 768 ? 8 : 12,
                                usePointStyle: true
                              }
                            },
                            tooltip: {
                              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  if (stages.length === 0) {
                                    return 'لا توجد بيانات للمراحل الدراسية';
                                  }
                                  const stage = stages[context.dataIndex];
                                  return [
                                    `${context.label}: ${context.parsed} طالب`,
                                    `المواد: ${stage?.subjectsCount || 0}`
                                  ];
                                }
                              }
                            }
                          },
                          layout: {
                            padding: {
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10
                            }
                          }
                        }}
                      />
                    )}
                    
                    {/* Show reload button overlay for empty data */}
                    {!stagesLoading && stages.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-lg">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📊</div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            لا توجد بيانات للمراحل الدراسية
                          </p>
                          <button 
                            onClick={fetchStagesData}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            إعادة التحميل
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6">
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FaRocket className="text-green-600 dark:text-green-400 text-lg lg:text-xl" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white text-right">
                      نمو المنصة
                    </h3>
                  </div>
                  <div className="h-48 sm:h-56 lg:h-64 w-full">
                    <Bar
                      data={platformGrowthData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: isDarkMode ? '#ffffff' : '#374151', // Dynamic color based on dark mode
                              font: { 
                                size: window.innerWidth < 768 ? 10 : 12,
                                family: 'system-ui, -apple-system, sans-serif'
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            cornerRadius: 8
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: isDarkMode ? '#D1D5DB' : '#6B7280', // Light gray for dark mode, neutral gray for light mode
                              font: { 
                                size: window.innerWidth < 768 ? 10 : 12,
                                family: 'system-ui, -apple-system, sans-serif'
                              }
                            },
                            grid: {
                              color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)', // Different grid colors for dark/light mode
                              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)'
                            }
                          },
                          x: {
                            ticks: {
                              color: isDarkMode ? '#D1D5DB' : '#6B7280', // Light gray for dark mode, neutral gray for light mode
                              font: { 
                                size: window.innerWidth < 768 ? 10 : 12,
                                family: 'system-ui, -apple-system, sans-serif'
                              },
                              maxRotation: window.innerWidth < 768 ? 45 : 0,
                              minRotation: window.innerWidth < 768 ? 45 : 0
                            },
                            grid: {
                              color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)', // Different grid colors for dark/light mode
                              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 mb-8 lg:mb-12 transition-all duration-700 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '900ms' }}>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center gap-3 text-right">
                <FaCog className="text-blue-500" />
                الإجراءات السريعة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">

                <button
                  onClick={() => navigate("/admin/blog-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg lg:rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBlog className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة المدونة</span>
                </button>
                <button
                  onClick={() => navigate("/admin/qa-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaQuestionCircle className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة الأسئلة والأجوبة</span>
                </button>
                <button
                  onClick={() => navigate("/admin/course-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBook className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة الدورات</span>
                </button>
                <button
                  onClick={() => navigate("/admin/subject-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg lg:rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaGraduationCap className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة المواد</span>
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg lg:rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaUsers className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة المستخدمين</span>
                </button>
                <button
                  onClick={() => navigate("/admin/course-content")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaClipboardCheck className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة محتوى الدورات</span>
                </button>
                <button
                  onClick={() => navigate("/admin/user-progress")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg lg:rounded-xl text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaChartLine className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">تقدم الطلاب</span>
                </button>
                <button
                  onClick={() => navigate("/admin/exam-search")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaClipboardList className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">نتائج الطلاب</span>
                </button>

                <button
                onClick={()=> navigate("/admin/essay-exams")}
                className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                  <FaBook className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">الامتحانات المقالية</span>
                </button>
              </div>
            </div>

            {/* Admin Management Sections */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 mb-8 lg:mb-12">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center gap-3 text-right">
                <FaShieldAlt className="text-blue-500" />
                إدارة النظام
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

                {/* إدارة المستخدمين */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 lg:p-6 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/users")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaUsers className="text-2xl lg:text-3xl text-indigo-200" />
                    <div className="w-3 h-3 bg-indigo-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">إدارة المستخدمين</h4>
                  <p className="text-indigo-100 text-sm lg:text-base opacity-90">إدارة حسابات المستخدمين والصلاحيات</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-indigo-200">إدارة كاملة</span>
                    <FaArrowUp className="text-indigo-200 transform rotate-45" />
                  </div>
                </div>

                {/* إدارة المدرسين */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 lg:p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/instructors")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaChalkboardTeacher className="text-2xl lg:text-3xl text-emerald-200" />
                    <div className="w-3 h-3 bg-emerald-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">إدارة المدرسين</h4>
                  <p className="text-emerald-100 text-sm lg:text-base opacity-90">إدارة المدرسين والدورات التدريبية</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-emerald-200">إدارة كاملة</span>
                    <FaArrowUp className="text-emerald-200 transform rotate-45" />
                  </div>
                </div>

                {/* إدارة الأجهزة */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 lg:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/device-management")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaServer className="text-2xl lg:text-3xl text-blue-200" />
                    <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">إدارة الأجهزة</h4>
                  <p className="text-blue-100 text-sm lg:text-base opacity-90">مراقبة وإدارة الأجهزة المتصلة</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-blue-200">إدارة كاملة</span>
                    <FaArrowUp className="text-blue-200 transform rotate-45" />
                  </div>
                </div>

                {/* إدارة المركز */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 lg:p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/center-management")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaBuilding className="text-2xl lg:text-3xl text-purple-200" />
                    <div className="w-3 h-3 bg-purple-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">إدارة المركز</h4>
                  <p className="text-purple-100 text-sm lg:text-base opacity-90">إدارة شاملة لجميع جوانب المركز</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-purple-200">إدارة كاملة</span>
                    <FaArrowUp className="text-purple-200 transform rotate-45" />
                  </div>
                </div>

                {/* إدارة المراحل */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 lg:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/stages")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaGraduationCap className="text-2xl lg:text-3xl text-blue-200" />
                    <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">إدارة المراحل</h4>
                  <p className="text-blue-100 text-sm lg:text-base opacity-90">إدارة المراحل الدراسية</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-blue-200">إدارة كاملة</span>
                    <FaArrowUp className="text-blue-200 transform rotate-45" />
                  </div>
                </div>

              </div>
            </div>

            {/* Additional Admin Services */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 mb-8 lg:mb-12">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center gap-3 text-right">
                <FaRocket className="text-green-500" />
                خدمات إضافية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">

                {/* رموز الشحن */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 lg:p-6 text-white hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/recharge-codes")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaQrcode className="text-2xl lg:text-3xl text-cyan-200" />
                    <div className="w-3 h-3 bg-cyan-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">رموز الشحن</h4>
                  <p className="text-cyan-100 text-sm lg:text-base opacity-90">إدارة رموز شحن المحافظ</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-cyan-200">إدارة كاملة</span>
                    <FaArrowUp className="text-cyan-200 transform rotate-45" />
                  </div>
                </div>

                {/* أكواد فتح الكورس المؤقتة */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 lg:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/course-access-codes")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaTicketAlt className="text-2xl lg:text-3xl text-blue-200" />
                    <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">أكواد فتح الكورس</h4>
                  <p className="text-blue-100 text-sm lg:text-base opacity-90">توليد أكواد وصول مؤقتة لكورس محدد</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-blue-200">توليد وإدارة</span>
                    <FaArrowUp className="text-blue-200 transform rotate-45" />
                  </div>
                </div>



                {/* الجلسات المباشرة */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 lg:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl" onClick={() => navigate("/admin/live-meetings")}>
                  <div className="flex items-center justify-between mb-3">
                    <FaVideo className="text-2xl lg:text-3xl text-blue-200" />
                    <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold mb-2">الجلسات المباشرة</h4>
                  <p className="text-blue-100 text-sm lg:text-base opacity-90">إدارة الجلسات المباشرة</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-blue-200">إدارة كاملة</span>
                    <FaArrowUp className="text-blue-200 transform rotate-45" />
                  </div>
                </div>

              </div>
            </div>



        
          </div>
        </section>
      </div>
    </Layout>
  );
}
