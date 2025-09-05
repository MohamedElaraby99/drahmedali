import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { 
    generateRechargeCodes, 
    getAllRechargeCodes, 
    getRechargeCodeStats,
    deleteRechargeCode,
    clearAdminRechargeCodeError 
} from "../../Redux/Slices/AdminRechargeCodeSlice";
import { 
    FaCreditCard, 
    FaPlus, 
    FaCopy, 
    FaTrash, 
    FaEye, 
    FaEyeSlash,
    FaFilter,
    FaSearch,
    FaDownload,
    FaChartBar,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaUser,
    FaClipboardCheck
} from "react-icons/fa";

export default function AdminRechargeCodeDashboard() {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);
    const { 
        codes, 
        stats, 
        pagination, 
        loading, 
        error, 
        generateLoading, 
        generateError,
        deleteLoading 
    } = useSelector((state) => {
        console.log('=== Redux State Debug ===');
        console.log('adminRechargeCode state:', state.adminRechargeCode);
        return state.adminRechargeCode;
    });

    const [generateForm, setGenerateForm] = useState({
        amount: "",
        quantity: "1"
    });
    const [filters, setFilters] = useState({
        status: "",
        amount: ""
    });
    const [showGeneratedCodes, setShowGeneratedCodes] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState([]);
    const [activeTab, setActiveTab] = useState("generate");
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        console.log('=== AdminRechargeCodeDashboard useEffect ===');
        console.log('User:', user);
        console.log('User role:', user?.role);
        console.log('Is user admin?', user && user.role === "ADMIN");
        
        if (user && user.role === "ADMIN") {
            console.log('Dispatching API calls...');
            dispatch(getAllRechargeCodes({ page: 1, limit: 20 }));
            dispatch(getRechargeCodeStats());
        } else {
            console.log('User not admin or not logged in');
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminRechargeCodeError());
        }
        if (generateError) {
            toast.error(generateError);
            dispatch(clearAdminRechargeCodeError());
        }
    }, [error, generateError, dispatch]);

    const handleGenerateFormChange = (e) => {
        const { name, value } = e.target;
        setGenerateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateCodes = async (e) => {
        e.preventDefault();
        
        if (!generateForm.amount || !generateForm.quantity) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        const amount = parseFloat(generateForm.amount);
        const quantity = parseInt(generateForm.quantity);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (isNaN(quantity) || quantity < 1 || quantity > 100) {
            toast.error("Quantity must be between 1 and 100");
            return;
        }

        try {
            const result = await dispatch(generateRechargeCodes({ 
                amount, 
                quantity 
            })).unwrap();
            
            toast.success(`${quantity} code(s) generated successfully!`);
            setGeneratedCodes(result.data.codes);
            setShowGeneratedCodes(true);
            setGenerateForm({ amount: "", quantity: "1" });
            
            // Refresh the codes list
            dispatch(getAllRechargeCodes({ page: 1, limit: 20 }));
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
    };

    const handleCopyAllCodes = () => {
        const codesText = generatedCodes.map(c => `${c.code} - ${c.amount} EGP`).join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success("All codes copied to clipboard!");
    };

    const handleDeleteCode = async (codeId) => {
        if (window.confirm("Are you sure you want to delete this code?")) {
            try {
                await dispatch(deleteRechargeCode(codeId)).unwrap();
                toast.success("Code deleted successfully!");
                dispatch(getAllRechargeCodes({ page: 1, limit: 20 }));
            } catch (error) {
                // Error is handled in useEffect
            }
        }
    };

    const handleResetAllCodes = async () => {
        try {
            const response = await axiosInstance.post('/admin/users/reset-all-codes');
            
            if (response.data.success) {
                toast.success("تم حذف جميع رموز الشحن بنجاح!");
                setShowResetConfirm(false);
                // Refresh the codes list and stats
                dispatch(getAllRechargeCodes({ page: 1, limit: 20 }));
                dispatch(getRechargeCodeStats());
            } else {
                toast.error(response.data.message || "فشل في حذف رموز الشحن");
            }
        } catch (error) {
            console.error('Error resetting codes:', error);
            toast.error(error.response?.data?.message || "فشل في حذف رموز الشحن");
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        dispatch(getAllRechargeCodes({ 
            page: 1, 
            limit: 20, 
            ...filters 
        }));
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

    const getStatusColor = (isUsed) => {
        return isUsed 
            ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
            : 'text-green-600 bg-green-50 dark:bg-green-900/20';
    };

    const getStatusIcon = (isUsed) => {
        return isUsed ? <FaTimesCircle /> : <FaCheckCircle />;
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaCreditCard className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            إدارة رموز الشحن
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            إنشاء وإدارة رموز الشحن لمحافظ المستخدمين
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <FaCreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الرموز</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCodes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                    <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">القيمة الإجمالية</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAmount.toFixed(2)} EGP</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <FaCheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الرموز المستخدمة</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usedCodes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <FaExclamationTriangle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الرموز غير المستخدمة</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unusedCodes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs and Reset Button */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-reverse space-x-4">
                            <button
                                onClick={() => setActiveTab("generate")}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                    activeTab === "generate"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                                <FaPlus className="inline ml-2" />
                                إنشاء الرموز
                            </button>
                            <button
                                onClick={() => setActiveTab("manage")}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                    activeTab === "manage"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                                <FaCreditCard className="inline ml-2" />
                                إدارة الرموز
                            </button>
                        </div>
                        
                        {/* Reset All Codes Button */}
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <FaTrash />
                            حذف جميع الرموز
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        {activeTab === "generate" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    إنشاء رموز الشحن
                                </h3>
                                
                                <form onSubmit={handleGenerateCodes} className="space-y-6 max-w-md">
                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            المبلغ (جنيه مصري)
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={generateForm.amount}
                                            onChange={handleGenerateFormChange}
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="أدخل المبلغ بالجنيه المصري"
                                            min="1"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    {/* Quantity Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            الكمية
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={generateForm.quantity}
                                            onChange={handleGenerateFormChange}
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="عدد الرموز المراد إنشاؤها"
                                            min="1"
                                            max="100"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={generateLoading}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        {generateLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                جاري الإنشاء...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <FaPlus className="mr-2" />
                                                إنشاء الرموز
                                            </div>
                                        )}
                                    </button>
                                </form>

                                {/* Generated Codes Display */}
                                {showGeneratedCodes && generatedCodes.length > 0 && (
                                    <div className="mt-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                الرموز المنشأة
                                            </h4>
                                            <button
                                                onClick={handleCopyAllCodes}
                                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaCopy className="mr-2" />
                                                نسخ الكل
                                            </button>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            {generatedCodes.map((code, index) => (
                                                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                                                    <div>
                                                        <span className="font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                                            {code.code}
                                                        </span>
                                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                            - {code.amount} EGP
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopyCode(code.code)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="نسخ الرمز"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "manage" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    إدارة رموز الشحن
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="unused">غير مستخدم</option>
                                                <option value="used">مستخدم</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                المبلغ
                                            </label>
                                            <input
                                                type="number"
                                                name="amount"
                                                value={filters.amount}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="تصفية حسب المبلغ"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleApplyFilters}
                                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Codes List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : codes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لم يتم العثور على رموز شحن. أنشئ بعض الرموز للبدء!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {codes.map((code) => (
                                            <div
                                                key={code.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(code.isUsed)}`}>
                                                        {getStatusIcon(code.isUsed)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                                                {code.code}
                                                            </span>
                                                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {code.amount} EGP
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            <span className="flex items-center">
                                                                <FaCalendarAlt className="mr-1" />
                                                                تم الإنشاء: {formatDate(code.createdAt)}
                                                            </span>
                                                            {code.isUsed && code.usedBy && (
                                                                <span className="flex items-center mt-1">
                                                                    <FaUser className="mr-1" />
                                                                    استخدم بواسطة: {code.usedBy.fullName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleCopyCode(code.code)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="نسخ الرمز"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                    {!code.isUsed && (
                                                        <button
                                                            onClick={() => handleDeleteCode(code.id)}
                                                            disabled={deleteLoading}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                                            title="حذف الرمز"
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
                                                    onClick={() => dispatch(getAllRechargeCodes({ 
                                                        page: i + 1, 
                                                        limit: 20, 
                                                        ...filters 
                                                    }))}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        pagination.currentPage === i + 1
                                                            ? "bg-blue-600 text-white"
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
                    </div>

                    {/* Reset All Codes Confirmation Modal */}
                    {showResetConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <FaExclamationTriangle className="h-8 w-8 text-red-500" />
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
                                        onClick={() => setShowResetConfirm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleResetAllCodes}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        تأكيد
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
} 