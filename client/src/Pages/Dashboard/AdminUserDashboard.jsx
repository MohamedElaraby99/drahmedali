import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { 
    getAllUsers, 
    createUser,
    getUserDetails, 
    toggleUserStatus, 
    deleteUser, 
    updateUserRole,
    updateUser,
    updateUserPassword,
    resetAllUserWallets,
    resetUserWallet,
    resetAllRechargeCodes,
    getUserActivities,
    getUserStats,
    clearAdminUserError 
} from "../../Redux/Slices/AdminUserSlice";
import { 
    FaUsers, 
    FaUser, 
    FaUserCheck, 
    FaUserTimes, 
    FaUserCog, 
    FaTrash, 
    FaEdit, 
    FaEye, 
    FaSearch, 
    FaFilter,
    FaChartBar,
    FaWallet,
    FaCreditCard,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaGraduationCap,
    FaBirthdayCake,
    FaToggleOn,
    FaToggleOff,
    FaCrown,
    FaUserSecret,
    FaHistory,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaPlus,
    FaSave,
    FaTimes,
    FaIdCard
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { egyptianCities } from "../../utils/governorateMapping";
import CodeSearch from "../../Components/CodeSearch";

export default function AdminUserDashboard() {
    const dispatch = useDispatch();
    const { data: user, isLoggedIn, role } = useSelector((state) => state.auth);
    const { 
        users, 
        selectedUser, 
        userActivities, 
        userStats, 
        stats, 
        pagination, 
        loading, 
        error, 
        actionLoading, 
        actionError 
    } = useSelector((state) => state.adminUser);

    const [filters, setFilters] = useState({
        role: "",
        status: "",
        stage: "",
        search: ""
    });
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToDeleteInfo, setUserToDeleteInfo] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        code: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showResetWalletsConfirm, setShowResetWalletsConfirm] = useState(false);
    const [showResetCodesConfirm, setShowResetCodesConfirm] = useState(false);
    const [createUserForm, setCreateUserForm] = useState({
        email: '',
        password: '',
        role: 'USER',
        phoneNumber: '',
        fatherPhoneNumber: '',
        governorate: '',
        stage: '',
        age: ''
    });
    const [activeTab, setActiveTab] = useState("users");
    const [stages, setStages] = useState([]);

    // Check if current user can create admin users
    const canCreateAdmin = user && (user.role === 'SUPER_ADMIN');
    const canDeleteAdmin = user && (user.role === 'SUPER_ADMIN');
    const canChangeRoleToAdmin = user && (user.role === 'SUPER_ADMIN');

    // Fetch stages on component mount
    useEffect(() => {
        const fetchStages = async () => {
            try {
                const response = await axiosInstance.get('/stages');
                if (response.data.success) {
                    setStages(response.data.data.stages);
                }
            } catch (error) {
                console.error('Error fetching stages:', error);
            }
        };

        fetchStages();
    }, []);

    // Monitor filter changes
    useEffect(() => {
        console.log('Filters changed:', filters);
    }, [filters]);

    useEffect(() => {
        console.log('=== AUTH DEBUG ===');
        console.log('Current user:', user);
        console.log('Is logged in:', isLoggedIn);
        console.log('User role:', role);
        console.log('User object:', user);
        console.log('LocalStorage data:', localStorage.getItem('data'));
        console.log('LocalStorage role:', localStorage.getItem('role'));
        console.log('LocalStorage isLoggedIn:', localStorage.getItem('isLoggedIn'));
        
        if (isLoggedIn && (role === "ADMIN" || role === "SUPER_ADMIN")) {
            console.log('Dispatching getAllUsers...');
            let roleFilter = "";
            if (activeTab === "users") {
                roleFilter = "USER";
            } else if (activeTab === "admins") {
                roleFilter = "ADMIN";
            }
            
            console.log('Initial role filter:', roleFilter);
            console.log('Initial filters:', filters);
            
            dispatch(getAllUsers({ 
                page: 1, 
                limit: 20, 
                role: roleFilter,
                status: filters.status,
                stage: filters.stage,
                search: filters.search,
                codeSearch: filters.codeSearch
            }));
        } else {
            console.log('User not admin or not logged in');
            console.log('isLoggedIn:', isLoggedIn);
            console.log('role:', role);
        }
    }, [dispatch, user, isLoggedIn, role, activeTab]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminUserError());
        }
        if (actionError) {
            toast.error(actionError);
            dispatch(clearAdminUserError());
        }
    }, [error, actionError, dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('Filter change:', name, value);
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        console.log('Applying filters:', filters);
        console.log('Active tab:', activeTab);
        
        let roleFilter = "";
        if (activeTab === "users") {
            roleFilter = "USER";
        } else if (activeTab === "admins") {
            roleFilter = "ADMIN";
        } else {
            roleFilter = filters.role;
        }
        
        console.log('Role filter:', roleFilter);
        console.log('Final filter params:', { 
            page: 1, 
            limit: 20, 
            role: roleFilter,
            status: filters.status,
            stage: filters.stage,
            search: filters.search,
            codeSearch: filters.codeSearch
        });
        
        dispatch(getAllUsers({ 
            page: 1, 
            limit: 20, 
            role: roleFilter,
            status: filters.status,
            stage: filters.stage,
            search: filters.search,
            codeSearch: filters.codeSearch 
        }));
    };

    const handleCodeSearchUserSelect = (user) => {
        // When a user is selected from code search, show their details
        setSelectedUserId(user.id);
        setShowUserDetails(true);
        setIsEditing(false);
        
        // Load user details
        dispatch(getUserDetails(user.id));
        dispatch(getUserStats(user.id));
        dispatch(getUserActivities({ userId: user.id, page: 1, limit: 20 }));
    };

    const handleViewUser = async (userId) => {
        setSelectedUserId(userId);
        setShowUserDetails(true);
        setIsEditing(false);
        setEditForm({});
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
        setShowResetWalletsConfirm(false);
        setShowResetCodesConfirm(false);
        
        try {
            await dispatch(getUserDetails(userId)).unwrap();
            await dispatch(getUserStats(userId)).unwrap();
            await dispatch(getUserActivities({ userId, page: 1, limit: 20 })).unwrap();
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await dispatch(toggleUserStatus({ 
                userId, 
                isActive: !currentStatus 
            })).unwrap();
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await dispatch(updateUserRole({ 
                userId, 
                role: newRole 
            })).unwrap();
            toast.success(`User role updated to ${newRole}!`);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await dispatch(deleteUser(userToDelete)).unwrap();
            toast.success("تم حذف المستخدم بنجاح!");
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            setUserToDeleteInfo(null);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleEditUser = async () => {
        try {
            // Prepare the data, ensuring stage is properly handled
            const userData = {
                ...editForm,
                stage: editForm.stage || null, // Convert empty string to null for stage
                age: editForm.age ? parseInt(editForm.age) : undefined // Convert age to number
            };

            // Remove empty string values and undefined values that could cause validation issues
            // But preserve required fields (email)
            Object.keys(userData).forEach(key => {
                if (userData[key] === '' || userData[key] === undefined) {
                    // Don't delete required fields, just skip them
                    if (key !== 'email') {
                        delete userData[key];
                    }
                }
            });

            // Ensure required fields are present
            if (!userData.email) {
                toast.error("البريد الإلكتروني مطلوب");
                return;
            }

            await dispatch(updateUser({ 
                userId: selectedUserId, 
                userData: userData
            })).unwrap();
            toast.success("تم تحديث معلومات المستخدم بنجاح!");
            setIsEditing(false);
            setEditForm({
                code: ''
            });
            
            // Refresh user details to show updated information
            await dispatch(getUserDetails(selectedUserId)).unwrap();
        } catch (error) {
            console.error('Update user error:', error);
            toast.error("فشل في تحديث معلومات المستخدم");
        }
    };

    const handleStartEdit = (user) => {
        setEditForm({
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            fatherPhoneNumber: user.fatherPhoneNumber || '',
            governorate: user.governorate || '',
            stage: user.stage?._id || null,
            age: user.age || '',
            role: user.role || 'USER',
            code: user.code || '',
            isActive: user.isActive
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            code: ''
        });
    };

        const handlePasswordChange = async () => {
        // Validate password length
        if (passwordForm.newPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        // Validate password confirmation
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        // Additional password validation
        if (passwordForm.newPassword.trim() === '') {
            toast.error("كلمة المرور لا يمكن أن تكون فارغة");
            return;
        }

        try {
            await dispatch(updateUserPassword({ 
                userId: selectedUserId, 
                password: passwordForm.newPassword 
            })).unwrap();
            
            toast.success("تم تغيير كلمة المرور بنجاح!");
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setShowPasswordChange(false);
        } catch (error) {
            console.error('Password change error:', error);
            toast.error("فشل في تغيير كلمة المرور");
        }
    };

    const handleResetAllWallets = async () => {
        try {
            await dispatch(resetAllUserWallets()).unwrap();
            toast.success("تم إعادة تعيين جميع محافظ المستخدمين بنجاح!");
            setShowResetWalletsConfirm(false);
        } catch (error) {
            toast.error("فشل في إعادة تعيين المحافظ");
        }
    };

    const handleResetUserWallet = async (userId, userName) => {
        try {
            await dispatch(resetUserWallet(userId)).unwrap();
            toast.success(`تم إعادة تعيين محفظة المستخدم ${userName} بنجاح!`);
        } catch (error) {
            toast.error("فشل في إعادة تعيين محفظة المستخدم");
        }
    };

    const handleResetAllCodes = async () => {
        try {
            await dispatch(resetAllRechargeCodes()).unwrap();
            toast.success("تم حذف جميع رموز الشحن بنجاح!");
            setShowResetCodesConfirm(false);
        } catch (error) {
            toast.error("فشل في حذف رموز الشحن");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (isActive) => {
        return isActive 
            ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
            : 'text-red-600 bg-red-50 dark:bg-red-900/20';
    };

    const getRoleColor = (role) => {
        if (role === 'SUPER_ADMIN') {
            return 'text-red-600 bg-red-50 dark:bg-red-900/20';
        } else if (role === 'ADMIN') {
            return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        } else {
            return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'recharge':
                return <FaArrowUp className="text-green-500" />;
            case 'purchase':
                return <FaArrowDown className="text-red-500" />;
            case 'refund':
                return <FaArrowUp className="text-blue-500" />;
            default:
                return <FaMoneyBillWave className="text-gray-500" />;
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 'weak', color: 'text-gray-400', text: 'أدخل كلمة المرور' };
        if (password.length < 6) return { strength: 'weak', color: 'text-red-500', text: 'ضعيفة جداً' };
        if (password.length < 8) return { strength: 'medium', color: 'text-blue-500', text: 'متوسطة' };
        if (password.length < 10) return { strength: 'good', color: 'text-blue-500', text: 'جيدة' };
        return { strength: 'strong', color: 'text-green-500', text: 'قوية' };
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaUsers className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            إدارة المستخدمين
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            إدارة المستخدمين وعرض الأنشطة والتحكم في الوصول
                        </p>
                    </div>

                    {/* Statistics Cards - Only visible to SUPER_ADMIN */}
                    {role === "SUPER_ADMIN" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <FaUsers className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                        <FaUserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                        <FaUserTimes className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون غير النشطين</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactiveUsers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                        <FaCrown className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المديرون</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.adminUsers}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                        <FaUserSecret className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المديرون المميزون</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.superAdminUsers || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                                        <FaUser className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="mr-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الطلاب</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regularUsers}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-4 space-x-reverse mb-6">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "users"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaUsers className="inline mr-2" />
                            الطلاب
                        </button>
                        <button
                            onClick={() => setActiveTab("admins")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "admins"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaCrown className="inline mr-2" />
                            المديرون
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "all"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaUser className="inline mr-2" />
                            جميع المستخدمين
                        </button>
                    </div>

                    {/* Create User Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex space-x-3 space-x-reverse">
                            <button
                                onClick={() => setShowResetWalletsConfirm(true)}
                                disabled={actionLoading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                title="إعادة تعيين جميع محافظ المستخدمين"
                            >
                                <FaWallet />
                                إعادة تعيين المحافظ
                            </button>
                            <button
                                onClick={() => setShowResetCodesConfirm(true)}
                                disabled={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                title="حذف جميع رموز الشحن"
                            >
                                <FaTrash />
                                حذف جميع الرموز
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            إنشاء مستخدم جديد
                        </button>
                    </div>

                    {/* Quick Code Search */}
                    <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h3 className="text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2 sm:mb-3 flex items-center">
                            <FaSearch className="mr-2 text-sm sm:text-base" />
                            البحث السريع بالرمز التعريفي
                        </h3>
                        <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 mb-3 sm:mb-4">
                            ابحث عن مستخدم بسرعة باستخدام الرمز التعريفي الخاص به
                        </p>
                        <CodeSearch 
                            onUserSelect={handleCodeSearchUserSelect}
                            className="w-full max-w-md"
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        {activeTab === "users" && (
                            <div className="p-3 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                                    جميع المستخدمين
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث بالرمز
                                            </label>
                                            <CodeSearch 
                                                onUserSelect={handleCodeSearchUserSelect}
                                                className="w-full"
                                            />
                                        </div>
                                        {activeTab === "all" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    الدور
                                                </label>
                                                <select
                                                    name="role"
                                                    value={filters.role}
                                                    onChange={handleFilterChange}
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">جميع الأدوار</option>
                                                    <option value="USER">مستخدم</option>
                                                    <option value="ADMIN">مدير</option>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        {activeTab === "users" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المرحلة الدراسية
                                                </label>
                                                <select
                                                    name="stage"
                                                    value={filters.stage}
                                                    onChange={handleFilterChange}
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">جميع المراحل</option>
                                                    {stages.map(stage => (
                                                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Users List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لم يتم العثور على مستخدمين يطابقون معاييرك.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role === 'SUPER_ADMIN' ? 'مدير مميز' : user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {user.role !== 'SUPER_ADMIN' && (
                                                                <>
                                                                    المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                                    {user.stage && user.stage.name && (
                                                                        <span className="ml-2">• المرحلة: {user.stage.name}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                            {user.role === 'SUPER_ADMIN' && user.stage && user.stage.name && (
                                                                <span>المرحلة: {user.stage.name}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    {canChangeRoleToAdmin && (
                                                        <button
                                                            onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="تغيير الدور"
                                                        >
                                                            <FaUserCog />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleResetUserWallet(user.id, user.fullName)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="إعادة تعيين المحفظة"
                                                    >
                                                        <FaWallet />
                                                    </button>
                                                    {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' || canDeleteAdmin) && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(user.id);
                                                                setUserToDeleteInfo(user);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="حذف المستخدم"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex space-x-2">
                                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => dispatch(getAllUsers({ 
                                                        page: i + 1, 
                                                        limit: 20, 
                                                        ...filters 
                                                    }))}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        pagination.currentPage === i + 1
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "admins" && (
                            <div className="p-3 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                                    المديرون
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث بالرمز
                                            </label>
                                            <CodeSearch 
                                                onUserSelect={handleCodeSearchUserSelect}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked (admins)!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Admins List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaCrown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لا يوجد مديرون حالياً
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role === 'SUPER_ADMIN' ? 'مدير مميز' : user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {user.role !== 'SUPER_ADMIN' && (
                                                                <>
                                                                    المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                                    {user.stage && user.stage.name && (
                                                                        <span className="ml-2">• المرحلة: {user.stage.name}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                            {user.role === 'SUPER_ADMIN' && user.stage && user.stage.name && (
                                                                <span>المرحلة: {user.stage.name}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    {canChangeRoleToAdmin && (
                                                        <button
                                                            onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="تغيير الدور"
                                                        >
                                                            <FaUserCog />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleResetUserWallet(user.id, user.fullName)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="إعادة تعيين المحفظة"
                                                    >
                                                        <FaWallet />
                                                    </button>
                                                    {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' || canDeleteAdmin) && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(user.id);
                                                                setUserToDeleteInfo(user);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="حذف المستخدم"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "all" && (
                            <div className="p-3 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                                    جميع المستخدمين
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث بالرمز
                                            </label>
                                            <CodeSearch 
                                                onUserSelect={handleCodeSearchUserSelect}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الدور
                                            </label>
                                            <select
                                                name="role"
                                                value={filters.role}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الأدوار</option>
                                                <option value="USER">مستخدم</option>
                                                <option value="ADMIN">مدير</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                المرحلة الدراسية
                                            </label>
                                            <select
                                                name="stage"
                                                value={filters.stage}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع المراحل</option>
                                                {stages.map(stage => (
                                                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked (all)!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* All Users List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لا يوجد مستخدمون حالياً
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role === 'SUPER_ADMIN' ? 'مدير مميز' : user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {user.role !== 'SUPER_ADMIN' && (
                                                                <>
                                                                    المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                                    {user.stage && user.stage.name && (
                                                                        <span className="ml-2">• المرحلة: {user.stage.name}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                            {user.role === 'SUPER_ADMIN' && user.stage && user.stage.name && (
                                                                <span>المرحلة: {user.stage.name}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    {canChangeRoleToAdmin && (
                                                        <button
                                                            onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="تغيير الدور"
                                                        >
                                                            <FaUserCog />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleResetUserWallet(user.id, user.fullName)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="إعادة تعيين المحفظة"
                                                    >
                                                        <FaWallet />
                                                    </button>
                                                    {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' || canDeleteAdmin) && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(user.id);
                                                                setUserToDeleteInfo(user);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="حذف المستخدم"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        إنشاء مستخدم جديد
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await dispatch(createUser(createUserForm)).unwrap();
                                        setShowCreateModal(false);
                                        setCreateUserForm({
                                            email: '',
                                            password: '',
                                            role: 'USER',
                                            phoneNumber: '',
                                            fatherPhoneNumber: '',
                                            governorate: '',
                                            stage: '',
                                            age: ''
                                        });
                                        toast.success('تم إنشاء المستخدم بنجاح');
                                    } catch (error) {
                                        toast.error(error || 'فشل في إنشاء المستخدم');
                                    }
                                }}
                                className="p-6 space-y-4"
                            >
                                {/* Role Selection */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        نوع الحساب *
                                    </label>
                                    <div className="flex space-x-4 space-x-reverse">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="USER"
                                                checked={createUserForm.role === 'USER'}
                                                onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                                                className="ml-2"
                                            />
                                                طالب
                                        </label>
                                        {canCreateAdmin && (
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value="ADMIN"
                                                    checked={createUserForm.role === 'ADMIN'}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                                                    className="ml-2"
                                                />
                                                    مدير
                                            </label>
                                        )}
                                    </div>
                               
                                </div>

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            البريد الإلكتروني *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={createUserForm.email}
                                            onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل البريد الإلكتروني"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            كلمة المرور *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={createUserForm.password}
                                            onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل كلمة المرور"
                                        />
                                    </div>
                                </div>

                                {/* User-specific fields */}
                                {createUserForm.role === 'USER' && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">معلومات إضافية للطلاب</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    رقم الهاتف *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={createUserForm.phoneNumber}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, phoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل رقم الهاتف"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    رقم هاتف ولي الأمر *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={createUserForm.fatherPhoneNumber}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, fatherPhoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل رقم هاتف ولي الأمر"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المدينة *
                                                </label>
                                                <select
                                                    required
                                                    value={createUserForm.governorate}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, governorate: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المدينة</option>
                                                    {egyptianCities.map((gov) => (
                                                        <option key={gov.value} value={gov.value}>
                                                            {gov.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المرحلة الدراسية *
                                                </label>
                                                <select
                                                    required
                                                    value={createUserForm.stage}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, stage: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المرحلة الدراسية</option>
                                                    {stages.map((stage) => (
                                                        <option key={stage._id} value={stage._id}>
                                                            {stage.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    العمر *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="10"
                                                    max="25"
                                                    value={createUserForm.age}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, age: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل العمر"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                إنشاء المستخدم
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    حذف المستخدم
                                </h3>
                            </div>
                            <div className="mb-6">
                                {userToDeleteInfo && (
                                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {userToDeleteInfo.fullName}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {userToDeleteInfo.email}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            الدور: {userToDeleteInfo.role === 'SUPER_ADMIN' ? 'مدير مميز' : userToDeleteInfo.role === 'ADMIN' ? 'مدير' : 'طالب'}
                                        </p>
                                    </div>
                                )}
                                <p className="text-gray-600 dark:text-gray-300">
                                    {userToDeleteInfo?.role === 'SUPER_ADMIN' 
                                        ? 'هل أنت متأكد من حذف هذا المدير المميز؟ هذا الإجراء لا يمكن التراجع عنه.'
                                        : userToDeleteInfo?.role === 'ADMIN' 
                                        ? 'هل أنت متأكد من حذف هذا المدير؟ هذا الإجراء لا يمكن التراجع عنه.'
                                        : 'هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.'
                                    }
                                </p>
                                {userToDeleteInfo?.role === 'ADMIN' && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                        ⚠️ تحذير: حذف مدير قد يؤثر على إدارة النظام
                                    </p>
                                )}
                                {userToDeleteInfo?.role === 'SUPER_ADMIN' && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        🚨 تحذير خطير: حذف مدير مميز قد يؤثر بشكل كبير على إدارة النظام
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setUserToDeleteInfo(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Details Modal */}
                {showUserDetails && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">
                                                {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedUser.fullName}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {selectedUser.email}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                                                    {selectedUser.role === 'SUPER_ADMIN' ? 'مدير مميز' : selectedUser.role === 'ADMIN' ? 'مدير' : 'طالب'}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.isActive)}`}>
                                                    {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => handleStartEdit(selectedUser)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <FaEdit />
                                                تعديل
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleEditUser}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <FaSave />
                                                    حفظ
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <FaTimes />
                                                    إلغاء
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowUserDetails(false);
                                                setIsEditing(false);
                                                setEditForm({});
                                                setPasswordForm({ newPassword: '', confirmPassword: '' });
                                                setShowPasswordChange(false);
                                                setShowResetWalletsConfirm(false);
                                                setShowResetCodesConfirm(false);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* User Statistics */}
                                {userStats && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-3">
                                                <FaWallet className="text-blue-600 text-xl" />
                                                <div>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400">رصيد المحفظة</p>
                                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                        {userStats.walletBalance || 0} جنيه مصري
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                            <div className="flex items-center space-x-3">
                                                <FaCreditCard className="text-green-600 text-xl" />
                                                <div>
                                                    <p className="text-sm text-green-600 dark:text-green-400">إجمالي المعاملات</p>
                                                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                                        {userStats.totalTransactions || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-3">
                                                <FaGraduationCap className="text-blue-600 text-xl" />
                                                <div>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400">الكورسات المشتراة</p>
                                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                        {userStats.purchasedCourses || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-3">
                                                <FaCalendarAlt className="text-blue-600 text-xl" />
                                                <div>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400">تاريخ التسجيل</p>
                                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                        {formatDate(selectedUser.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Personal Information */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                        <FaUser className="text-blue-600" />
                                        <span>المعلومات الشخصية</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">البريد الإلكتروني</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">رقم الهاتف</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={editForm.phoneNumber}
                                                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.phoneNumber || 'غير محدد'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">رقم هاتف ولي الأمر</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={editForm.fatherPhoneNumber}
                                                    onChange={(e) => setEditForm({...editForm, fatherPhoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.fatherPhoneNumber || 'غير محدد'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">المدينة</label>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.governorate}
                                                    onChange={(e) => setEditForm({...editForm, governorate: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المدينة</option>
                                                    {egyptianCities.map((gov) => (
                                                        <option key={gov.value} value={gov.value}>
                                                            {gov.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedUser.governorate || 'غير محدد'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">المرحلة الدراسية</label>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.stage || ""}
                                                    onChange={(e) => setEditForm({...editForm, stage: e.target.value || null})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المرحلة الدراسية</option>
                                                    {stages.map((stage) => (
                                                        <option key={stage._id} value={stage._id}>
                                                            {stage.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {selectedUser.stage && selectedUser.stage.name ? selectedUser.stage.name : 'غير محدد'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">العمر</label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="25"
                                                    value={editForm.age || ""}
                                                    onChange={(e) => setEditForm({...editForm, age: e.target.value || null})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {selectedUser.age && selectedUser.age > 0 ? `${selectedUser.age} سنة` : 'غير محدد'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">الرمز التعريفي</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.code || ""}
                                                    onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل الرمز التعريفي"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {selectedUser.code || 'غير محدد'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                        <FaIdCard className="text-blue-600" />
                                        <span>معلومات الحساب</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">نوع الحساب</label>
                                            {isEditing ? (
                                                canChangeRoleToAdmin ? (
                                                    <select
                                                        value={editForm.role}
                                                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="USER">طالب</option>
                                                        <option value="ADMIN">مدير</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                                                        {selectedUser.role === 'SUPER_ADMIN' ? 'مدير مميز' : selectedUser.role === 'ADMIN' ? 'مدير' : 'طالب'}
                                                    </span>
                                                )
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                                                    {selectedUser.role === 'SUPER_ADMIN' ? 'مدير مميز' : selectedUser.role === 'ADMIN' ? 'مدير' : 'طالب'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">حالة الحساب</label>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.isActive ? 'active' : 'inactive'}
                                                    onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="active">نشط</option>
                                                    <option value="inactive">غير نشط</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedUser.isActive)}`}>
                                                    {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">تاريخ التسجيل</label>
                                            <p className="text-gray-900 dark:text-white font-medium">{formatDate(selectedUser.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change Section */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                        <FaUserSecret className="text-red-600" />
                                        <span>تغيير كلمة المرور</span>
                                    </h4>
                                    <div className="space-y-4">
                                        {!showPasswordChange ? (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => setShowPasswordChange(true)}
                                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    تغيير كلمة المرور
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            كلمة المرور الجديدة
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={passwordForm.newPassword}
                                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                            placeholder="أدخل كلمة المرور الجديدة"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                            minLength="6"
                                                        />
                                                        <div className="mt-1 flex items-center space-x-2 space-x-reverse">
                                                            <span className={`text-xs ${getPasswordStrength(passwordForm.newPassword).color}`}>
                                                                {getPasswordStrength(passwordForm.newPassword).text}
                                                            </span>
                                                            {passwordForm.newPassword.length >= 6 && (
                                                                <span className="text-xs text-green-500">✓</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            تأكيد كلمة المرور
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={passwordForm.confirmPassword}
                                                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                            placeholder="أكد كلمة المرور الجديدة"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                            minLength="6"
                                                        />
                                                        <div className="mt-1 flex items-center space-x-2 space-x-reverse">
                                                            {passwordForm.confirmPassword && (
                                                                <>
                                                                    {passwordForm.newPassword === passwordForm.confirmPassword ? (
                                                                        <span className="text-xs text-green-500">✓ كلمات المرور متطابقة</span>
                                                                    ) : (
                                                                        <span className="text-xs text-red-500">✗ كلمات المرور غير متطابقة</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end space-x-3 space-x-reverse">
                                                    <button
                                                        onClick={() => {
                                                            setShowPasswordChange(false);
                                                            setPasswordForm({ newPassword: '', confirmPassword: '' });
                                                        }}
                                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        إلغاء
                                                    </button>
                                                    <button
                                                        onClick={handlePasswordChange}
                                                        disabled={!passwordForm.newPassword || 
                                                                 passwordForm.newPassword.length < 6 || 
                                                                 passwordForm.newPassword !== passwordForm.confirmPassword}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        تغيير كلمة المرور
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Reset Wallet Section */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                        <FaWallet className="text-blue-600" />
                                        <span>إعادة تعيين المحفظة</span>
                                    </h4>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            إعادة تعيين رصيد المحفظة إلى صفر وحذف جميع المعاملات
                                        </p>
                                        <button
                                            onClick={() => handleResetUserWallet(selectedUser.id, selectedUser.fullName)}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            إعادة تعيين المحفظة
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activities */}
                                {userActivities && userActivities.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                            <FaHistory className="text-green-600" />
                                            <span>الأنشطة الأخيرة</span>
                                        </h4>
                                        <div className="space-y-3">
                                            {userActivities.slice(0, 5).map((activity, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                        {getTransactionIcon(activity.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {activity.description || 'نشاط غير محدد'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(activity.createdAt)}
                                                        </p>
                                                    </div>
                                                    {activity.amount && (
                                                        <span className={`text-sm font-medium ${
                                                            activity.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {activity.type === 'recharge' ? '+' : '-'}{activity.amount} جنيه مصري
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => handleToggleStatus(selectedUser.id, selectedUser.isActive)}
                                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                            selectedUser.isActive
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        {selectedUser.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                                    </button>
                                    {canChangeRoleToAdmin && (
                                        <button
                                            onClick={() => handleUpdateRole(selectedUser.id, selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            تغيير الدور
                                        </button>
                                    )}
                                    {(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' || canDeleteAdmin) && (
                                        <button
                                            onClick={() => {
                                                setUserToDelete(selectedUser.id);
                                                setUserToDeleteInfo(selectedUser);
                                                setShowDeleteConfirm(true);
                                                setShowUserDetails(false);
                                            }}
                                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            حذف المستخدم
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset All Wallets Confirmation Modal */}
                {showResetWalletsConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    إعادة تعيين جميع المحافظ
                                </h3>
                            </div>
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-300">
                                    هل أنت متأكد من إعادة تعيين جميع محافظ المستخدمين؟ هذا الإجراء سيقوم بـ:
                                </p>
                                <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• إعادة تعيين رصيد جميع المستخدمين إلى 0</li>
                                    <li>• حذف جميع المعاملات</li>
                                    <li>• هذا الإجراء لا يمكن التراجع عنه!</li>
                                </ul>
                            </div>
                            <div className="flex space-x-3 space-x-reverse">
                                <button
                                    onClick={() => setShowResetWalletsConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleResetAllWallets}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'جاري التنفيذ...' : 'تأكيد'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset All Codes Confirmation Modal */}
                {showResetCodesConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <FaExclamationTriangle className="h-8 w-8 text-blue-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    حذف جميع رموز الشحن
                                </h3>
                            </div>
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-300">
                                    هل أنت متأكد من حذف جميع رموز الشحن؟ هذا الإجراء سيقوم بـ:
                                </p>
                                <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• حذف جميع رموز الشحن من النظام</li>
                                    <li>• عدم إمكانية استخدام أي رمز شحن</li>
                                    <li>• هذا الإجراء لا يمكن التراجع عنه!</li>
                                </ul>
                            </div>
                            <div className="flex space-x-3 space-x-reverse">
                                <button
                                    onClick={() => setShowResetCodesConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleResetAllCodes}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'جاري التنفيذ...' : 'تأكيد'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
} 