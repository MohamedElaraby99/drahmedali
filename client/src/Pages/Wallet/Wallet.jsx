import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { 
    getWalletBalance, 
    getWalletTransactions,
    clearWalletError 
} from "../../Redux/Slices/WalletSlice";
import { formatCairoDate } from "../../utils/timezone";
import { 
    FaWallet, 
    FaHistory, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaEye,
    FaEyeSlash,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaClock
} from "react-icons/fa";

export default function Wallet() {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);
    const { 
        balance, 
        transactions, 
        loading, 
        error
    } = useSelector((state) => state.wallet);

    const [showAmount, setShowAmount] = useState(false);
    const [activeTab, setActiveTab] = useState("balance");

    useEffect(() => {
        if (user) {
            dispatch(getWalletBalance());
            dispatch(getWalletTransactions());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearWalletError());
        }
    }, [error, dispatch]);

    const formatDate = (dateString) => {
        return formatCairoDate(dateString, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'credit':
            case 'recharge':
                return <FaArrowUp className="text-green-500" />;
            case 'debit':
            case 'purchase':
                return <FaArrowDown className="text-red-500" />;
            default:
                return <FaMoneyBillWave className="text-blue-500" />;
        }
    };

    const getTransactionTypeText = (type) => {
        switch (type) {
            case 'credit':
            case 'recharge':
                return 'إضافة رصيد';
            case 'debit':
            case 'purchase':
                return 'خصم رصيد';
            default:
                return 'معاملة';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <FaCheckCircle className="w-3 h-3 ml-1" />
                        مكتملة
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <FaClock className="w-3 h-3 ml-1" />
                        قيد الانتظار
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <FaTimesCircle className="w-3 h-3 ml-1" />
                        فاشلة
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        غير محدد
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9b172a]"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            محفظتي
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            إدارة رصيدك ومعاملاتك المالية
                        </p>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-r from-[#9b172a] to-purple-600 rounded-2xl p-8 text-white shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center mb-4">
                                    <FaWallet className="text-3xl mr-3" />
                                    <h2 className="text-2xl font-bold">الرصيد الحالي</h2>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-4xl font-bold mr-2">
                                        {showAmount ? balance || 0 : '****'}
                                    </span>
                                    <span className="text-xl">جنيه</span>
                                    <button
                                        onClick={() => setShowAmount(!showAmount)}
                                        className="mr-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                                    >
                                        {showAmount ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <FaMoneyBillWave className="text-6xl opacity-30" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab("balance")}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                        activeTab === "balance"
                                            ? "border-[#9b172a] text-[#9b172a]"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <FaWallet className="inline ml-2" />
                                    الرصيد
                                </button>
                                <button
                                    onClick={() => setActiveTab("history")}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                        activeTab === "history"
                                            ? "border-[#9b172a] text-[#9b172a]"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <FaHistory className="inline ml-2" />
                                    سجل المعاملات
                                </button>
                            </nav>
                        </div>

                        {activeTab === "balance" && (
                            <div className="p-8">
                                <div className="text-center">
                                    <FaWallet className="text-6xl text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        رصيد المحفظة
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        يمكنك استخدام أكواد الوصول للحصول على محتوى مخصص في الكورسات
                                    </p>
                                    <div className="text-4xl font-bold text-[#9b172a] mb-2">
                                        {balance || 0} جنيه
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    سجل المعاملات
                                </h3>
                                
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b172a]"></div>
                                    </div>
                                ) : transactions && transactions.length > 0 ? (
                                    <div className="space-y-4">
                                        {transactions.map((transaction, index) => (
                                            <div 
                                                key={transaction._id || index}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4 space-x-reverse">
                                                    <div className="flex-shrink-0">
                                                        {getTransactionIcon(transaction.type)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {transaction.description || getTransactionTypeText(transaction.type)}
                                                        </p>
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            <FaCalendarAlt className="w-3 h-3 ml-1" />
                                                            {formatDate(transaction.date)}
                                                        </div>
                                                        {transaction.code && (
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                كود: {transaction.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center">
                                                        <span className={`text-lg font-bold ${
                                                            transaction.type === 'credit' || transaction.type === 'recharge'
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {transaction.type === 'credit' || transaction.type === 'recharge' ? '+' : '-'}
                                                            {transaction.amount}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
                                                            جنيه
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        {getStatusBadge(transaction.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            لا توجد معاملات
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            لم تقم بأي معاملات مالية حتى الآن
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}