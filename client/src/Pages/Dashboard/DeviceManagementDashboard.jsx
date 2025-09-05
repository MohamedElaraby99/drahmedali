import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import {
    getAllUsersDevices,
    getUserDevices,
    resetUserDevices,
    removeDevice,
    getDeviceStats,
    getDeviceLimit,
    updateDeviceLimit,
    clearDeviceError
} from "../../Redux/Slices/DeviceManagementSlice";
import {
    FaDesktop,
    FaMobile,
    FaTabletAlt,
    FaUsers,
    FaServer,
    FaExclamationTriangle,
    FaEye,
    FaTrashAlt,
    FaRedo,
    FaSearch,
    FaFilter,
    FaChartBar,
    FaTimesCircle,
    FaCheckCircle,
    FaClock,
    FaMapMarkerAlt,
    FaGlobe,
    FaChrome,
    FaFirefoxBrowser,
    FaEdge,
    FaSafari,
    FaEdit,
    FaSave,
    FaTimes
} from "react-icons/fa";

export default function DeviceManagementDashboard() {
    const dispatch = useDispatch();
    const { data: user, role } = useSelector((state) => state.auth);
    const {
        usersDevices,
        devices,
        deviceStats,
        loading,
        actionLoading,
        error,
        actionError,
        pagination
    } = useSelector((state) => state.deviceManagement);

    const [activeTab, setActiveTab] = useState("overview");
    const [filters, setFilters] = useState({
        search: "",
        deviceStatus: "all", // all, overLimit, underLimit
        page: 1
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDevices, setShowUserDevices] = useState(false);
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [newDeviceLimit, setNewDeviceLimit] = useState(2);

    // Fetch initial data
    useEffect(() => {
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            dispatch(getDeviceStats());
            dispatch(getDeviceLimit());
            dispatch(getAllUsersDevices(filters));
        }
    }, [dispatch, role]);

    // Update newDeviceLimit when deviceStats changes
    useEffect(() => {
        if (deviceStats.maxDevicesPerUser) {
            setNewDeviceLimit(deviceStats.maxDevicesPerUser);
        }
    }, [deviceStats.maxDevicesPerUser]);

    // Handle filter changes
    useEffect(() => {
        if ((role === "ADMIN" || role === "SUPER_ADMIN") && activeTab === "users") {
            dispatch(getAllUsersDevices(filters));
        }
    }, [dispatch, filters, activeTab, role]);

    // Clear errors
    useEffect(() => {
        if (error || actionError) {
            const timer = setTimeout(() => {
                dispatch(clearDeviceError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, actionError, dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page when filters change
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleViewUserDevices = async (user) => {
        setSelectedUser(user);
        setShowUserDevices(true);
        await dispatch(getUserDevices({ userId: user._id }));
    };

    const handleResetUserDevices = async (userId, userName) => {
        if (window.confirm(`هل أنت متأكد من إعادة تعيين أجهزة المستخدم ${userName}؟`)) {
            await dispatch(resetUserDevices(userId));
            // Refresh the users list
            dispatch(getAllUsersDevices(filters));
        }
    };

    const handleRemoveDevice = async (deviceId, deviceName) => {
        if (window.confirm(`هل أنت متأكد من إلغاء تفعيل الجهاز ${deviceName}؟`)) {
            await dispatch(removeDevice(deviceId));
            // Refresh the device list for the selected user
            if (selectedUser) {
                dispatch(getUserDevices({ userId: selectedUser._id }));
            }
        }
    };

    const getDeviceIcon = (platform, deviceType) => {
        if (platform === "Mobile" || deviceType === "Mobile") {
            return <FaMobile className="text-blue-500" />;
        } else if (platform === "Tablet" || deviceType === "Tablet") {
            return <FaTabletAlt className="text-green-500" />;
        } else {
            return <FaDesktop className="text-gray-500" />;
        }
    };

    const getBrowserIcon = (browser) => {
        switch (browser?.toLowerCase()) {
            case "chrome":
                return <FaChrome className="text-blue-500" />;
            case "firefox":
                return <FaFirefoxBrowser className="text-blue-500" />;
            case "edge":
                return <FaEdge className="text-blue-600" />;
            case "safari":
                return <FaSafari className="text-blue-400" />;
            default:
                return <FaGlobe className="text-gray-500" />;
        }
    };

    const formatLastActivity = (date) => {
        if (!date) return "غير محدد";
        const now = new Date();
        const activity = new Date(date);
        const diffInMinutes = Math.floor((now - activity) / (1000 * 60));
        
        if (diffInMinutes < 1) return "الآن";
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
        return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    };

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            غير مصرح
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            ليس لديك صلاحية للوصول لهذه الصفحة
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            إدارة الأجهزة
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            إدارة ومراقبة الأجهزة المسموح لها بالوصول للمنصة
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-8 space-x-reverse">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === "overview"
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <FaChartBar className="inline-block ml-2" />
                                    نظرة عامة
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === "users"
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <FaUsers className="inline-block ml-2" />
                                    المستخدمون والأجهزة
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                                                         {/* Debug Information */}
                             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                 <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                                     معلومات التصحيح
                                 </h3>
                                 <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                     <p>• إجمالي المستخدمين: {usersDevices.length}</p>
                                     <p>• إجمالي الأجهزة: {deviceStats.totalDevices}</p>
                                     <p>• الأجهزة النشطة: {deviceStats.activeDevices}</p>
                                     <p>• الحد الحالي: {deviceStats.maxDevicesPerUser} أجهزة</p>
                                     <p>• حالة التحميل: {loading ? 'جاري التحميل' : 'مكتمل'}</p>
                                     {deviceStats.totalDevices === 0 && (
                                         <p className="font-medium text-red-600 dark:text-red-400">
                                             ملاحظة: لا توجد أجهزة مسجلة. الأجهزة تُسجل تلقائياً عند تسجيل دخول المستخدمين.
                                         </p>
                                     )}
                                 </div>
                             </div>

                             {/* Device Limit Change History */}
                             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                 <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                                     معلومات تحديث الحد
                                 </h3>
                                 <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                     <p>• الحد الحالي: {deviceStats.maxDevicesPerUser} أجهزة لكل مستخدم</p>
                                     <p>• عند تقليل الحد: سيتم إعادة تعيين أجهزة المستخدمين الذين يتجاوزون الحد الجديد</p>
                                     <p>• عند زيادة الحد: لن يتم إعادة تعيين أي أجهزة</p>
                                     {deviceStats.lastLimitChange && (
                                         <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                             <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                                 آخر تحديث للحد:
                                             </p>
                                             <p>• من {deviceStats.lastLimitChange.previousLimit} إلى {deviceStats.lastLimitChange.newLimit} أجهزة</p>
                                             <p>• التاريخ: {new Date(deviceStats.lastLimitChange.timestamp).toLocaleDateString('ar-EG')}</p>
                                             {deviceStats.lastLimitChange.resetInfo && deviceStats.lastLimitChange.resetInfo.resetUsersCount > 0 && (
                                                 <p>• تم إعادة تعيين أجهزة {deviceStats.lastLimitChange.resetInfo.resetUsersCount} مستخدم</p>
                                             )}
                                         </div>
                                     )}
                                     <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                         💡 نصيحة: استخدم هذه الميزة بحذر عند تقليل الحد لتجنب إزعاج المستخدمين
                                     </p>
                                     <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                         <p className="text-xs text-purple-800 dark:text-purple-200">
                                             🔒 ملاحظة: المستخدمون ذوو دور SUPER_ADMIN لديهم أجهزة غير محدودة ولا يخضعون لقيود الحد
                                         </p>
                                     </div>
                                 </div>
                             </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                إجمالي الأجهزة
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {deviceStats.totalDevices}
                                            </p>
                                        </div>
                                        <FaServer className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                الأجهزة النشطة
                                            </p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {deviceStats.activeDevices}
                                            </p>
                                        </div>
                                        <FaCheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                الأجهزة غير النشطة
                                            </p>
                                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                                {deviceStats.inactiveDevices}
                                            </p>
                                        </div>
                                        <FaTimesCircle className="h-8 w-8 text-gray-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                مستخدمون تجاوزوا الحد
                                            </p>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {deviceStats.usersOverLimit}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                الحد الحالي: {deviceStats.maxDevicesPerUser} أجهزة
                                            </p>
                                        </div>
                                        <FaExclamationTriangle className="h-8 w-8 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Platform and Browser Statistics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Platform Statistics */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        إحصائيات المنصات
                                    </h3>
                                    <div className="space-y-3">
                                        {deviceStats.platformStats?.map((platform, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {getDeviceIcon(platform._id)}
                                                    <span className="mr-3 text-gray-900 dark:text-white">
                                                        {platform._id || "غير محدد"}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                    {platform.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Browser Statistics */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        إحصائيات المتصفحات
                                    </h3>
                                    <div className="space-y-3">
                                        {deviceStats.browserStats?.map((browser, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {getBrowserIcon(browser._id)}
                                                    <span className="mr-3 text-gray-900 dark:text-white">
                                                        {browser._id || "غير محدد"}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                    {browser.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Device Limit Editor */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FaEdit className="mr-2 text-blue-500" />
                                    حد الأجهزة لكل مستخدم
                                </h3>
                                
                                {isEditingLimit ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="number"
                                                value={newDeviceLimit}
                                                onChange={(e) => setNewDeviceLimit(parseInt(e.target.value) || 1)}
                                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                min="1"
                                                max="10"
                                            />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                جهاز لكل مستخدم
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                                                                         <button
                                                 onClick={async () => {
                                                     // If reducing the limit, show confirmation dialog
                                                     if (newDeviceLimit < deviceStats.maxDevicesPerUser) {
                                                         const confirmed = window.confirm(
                                                             `هل أنت متأكد من تقليل الحد من ${deviceStats.maxDevicesPerUser} إلى ${newDeviceLimit} أجهزة؟\n\nسيتم إعادة تعيين جميع أجهزة المستخدمين الذين لديهم أكثر من ${newDeviceLimit} أجهزة نشطة.`
                                                         );
                                                         
                                                         if (!confirmed) {
                                                             return;
                                                         }
                                                     }
                                                     
                                                     try {
                                                         const result = await dispatch(updateDeviceLimit(newDeviceLimit)).unwrap();
                                                         setIsEditingLimit(false);
                                                         
                                                         // Show success message with reset info
                                                         if (result.data.resetUsersCount > 0) {
                                                             toast.success(`تم تحديث الحد إلى ${newDeviceLimit} أجهزة وتم إعادة تعيين أجهزة ${result.data.resetUsersCount} مستخدم`);
                                                         } else {
                                                             toast.success(`تم تحديث الحد إلى ${newDeviceLimit} أجهزة`);
                                                         }
                                                         
                                                         // Refresh stats to get updated data
                                                         dispatch(getDeviceStats());
                                                         dispatch(getAllUsersDevices(filters));
                                                     } catch (error) {
                                                         // Error is handled in the slice
                                                     }
                                                 }}
                                                 disabled={actionLoading}
                                                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                             >
                                                 <FaSave className="w-4 h-4" />
                                                 <span>حفظ</span>
                                             </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingLimit(false);
                                                    setNewDeviceLimit(deviceStats.maxDevicesPerUser);
                                                }}
                                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center space-x-2"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                                <span>إلغاء</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {deviceStats.maxDevicesPerUser}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                جهاز لكل مستخدم
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingLimit(true)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                            <span>تعديل الحد</span>
                                        </button>
                                    </div>
                                )}
                                
                                                                 <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 space-y-2">
                                     <p>يمكنك تغيير عدد الأجهزة المسموح بها لكل مستخدم. الحد الأقصى هو 10 أجهزة.</p>
                                     {newDeviceLimit < deviceStats.maxDevicesPerUser && (
                                         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                             <p className="text-blue-800 dark:text-blue-200 font-medium">
                                                 ⚠️ تحذير: عند تقليل الحد من {deviceStats.maxDevicesPerUser} إلى {newDeviceLimit}، سيتم إعادة تعيين جميع أجهزة المستخدمين الذين لديهم أكثر من {newDeviceLimit} أجهزة نشطة.
                                             </p>
                                         </div>
                                     )}
                                 </div>
                            </div>

                            {/* Test Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FaServer className="mr-2 text-green-500" />
                                    اختبار النظام
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        استخدم هذه الأزرار لاختبار نظام إدارة الأجهزة:
                                    </p>
                                    <div className="flex items-center space-x-4 space-x-reverse">
                                        <button
                                            onClick={() => {
                                                dispatch(getDeviceStats());
                                                dispatch(getAllUsersDevices(filters));
                                            }}
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            <FaRedo className="w-4 h-4" />
                                            <span>تحديث البيانات</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log('Device Stats:', deviceStats);
                                                console.log('Users Devices:', usersDevices);
                                                toast.success('تم طباعة البيانات في وحدة التحكم');
                                            }}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center space-x-2"
                                        >
                                            <FaEye className="w-4 h-4" />
                                            <span>عرض البيانات في وحدة التحكم</span>
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <p>• الأجهزة تُسجل تلقائياً عند تسجيل دخول المستخدمين</p>
                                        <p>• تأكد من أن المستخدمين قد سجلوا دخولهم مرة واحدة على الأقل</p>
                                        <p>• يمكنك تغيير حد الأجهزة من القسم أعلاه</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            البحث
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute right-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            حالة الأجهزة
                                        </label>
                                        <div className="relative">
                                            <FaFilter className="absolute right-3 top-3 text-gray-400" />
                                            <select
                                                name="deviceStatus"
                                                value={filters.deviceStatus}
                                                onChange={handleFilterChange}
                                                className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">جميع المستخدمين</option>
                                                <option value="overLimit">تجاوز الحد المسموح</option>
                                                <option value="underLimit">ضمن الحد المسموح</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            onClick={() => dispatch(getAllUsersDevices(filters))}
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "جاري التحديث..." : "تحديث النتائج"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        قائمة المستخدمين والأجهزة
                                    </h3>
                                </div>

                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                                    </div>
                                ) : usersDevices.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        لا توجد بيانات للعرض
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        المستخدم
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        إجمالي الأجهزة
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        الأجهزة النشطة
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        آخر نشاط
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        الحالة
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        الإجراءات
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {usersDevices.map((user) => (
                                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {user.fullName}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {user.totalDevices}
                                                        </td>
                                                                                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                             <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                                 user.isUnlimited 
                                                                     ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                                     : user.activeDevices > deviceStats.maxDevicesPerUser
                                                                         ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                         : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                             }`}>
                                                                 {user.activeDevices}
                                                                 {user.isUnlimited && <span className="ml-1">∞</span>}
                                                             </span>
                                                         </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center">
                                                                <FaClock className="ml-1" />
                                                                {formatLastActivity(user.lastDeviceActivity)}
                                                            </div>
                                                        </td>
                                                                                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                             {user.isUnlimited ? (
                                                                 <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                     غير محدود
                                                                 </span>
                                                             ) : user.activeDevices > deviceStats.maxDevicesPerUser ? (
                                                                 <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                     تجاوز الحد
                                                                 </span>
                                                             ) : (
                                                                 <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                     طبيعي
                                                                 </span>
                                                             )}
                                                         </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                                <button
                                                                    onClick={() => handleViewUserDevices(user)}
                                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    title="عرض الأجهزة"
                                                                >
                                                                    <FaEye />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResetUserDevices(user._id, user.fullName)}
                                                                    disabled={actionLoading}
                                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                                                                    title="إعادة تعيين الأجهزة"
                                                                >
                                                                    <FaRedo />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                عرض {((pagination.currentPage - 1) * pagination.limit) + 1} إلى{" "}
                                                {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} من{" "}
                                                {pagination.totalUsers} نتيجة
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                    disabled={pagination.currentPage === 1}
                                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    السابق
                                                </button>
                                                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                                    صفحة {pagination.currentPage} من {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                    disabled={pagination.currentPage === pagination.totalPages}
                                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    التالي
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User Devices Modal */}
                    {showUserDevices && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            أجهزة المستخدم: {selectedUser.fullName}
                                        </h3>
                                        <button
                                            onClick={() => setShowUserDevices(false)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <FaTimesCircle size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {devices.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            لا توجد أجهزة مسجلة لهذا المستخدم
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {devices.map((device) => (
                                                <div
                                                    key={device._id}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            {getDeviceIcon(device.deviceInfo.platform)}
                                                            <span className="mr-2 font-medium text-gray-900 dark:text-white">
                                                                {device.deviceName}
                                                            </span>
                                                        </div>
                                                                                                                 <span className={`px-2 py-1 text-xs rounded-full ${
                                                             device.isActive
                                                                 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                 : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                         }`}>
                                                             {device.isActive ? "نشط" : "غير نشط"}
                                                         </span>
                                                         {!device.isActive && device.deactivationReason && (
                                                             <span className="text-xs text-blue-600 dark:text-blue-400 mr-2">
                                                                 ({device.deactivationReason})
                                                             </span>
                                                         )}
                                                    </div>

                                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <div className="flex items-center">
                                                            {getBrowserIcon(device.deviceInfo.browser)}
                                                            <span className="mr-2">
                                                                {device.deviceInfo.browser} - {device.deviceInfo.os}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FaMapMarkerAlt className="ml-1" />
                                                            IP: {device.deviceInfo.ip}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FaClock className="ml-1" />
                                                            آخر نشاط: {formatLastActivity(device.lastActivity)}
                                                        </div>
                                                        <div>
                                                            عدد مرات الدخول: {device.loginCount}
                                                        </div>
                                                        <div>
                                                            تاريخ التسجيل: {new Date(device.firstLogin).toLocaleDateString('ar-EG')}
                                                        </div>
                                                    </div>

                                                    {device.isActive && (
                                                        <div className="mt-3 flex justify-end">
                                                            <button
                                                                onClick={() => handleRemoveDevice(device._id, device.deviceName)}
                                                                disabled={actionLoading}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                                title="إلغاء تفعيل الجهاز"
                                                            >
                                                                <FaTrashAlt />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
