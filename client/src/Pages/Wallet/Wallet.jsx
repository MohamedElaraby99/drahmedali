import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { 
    getWalletBalance, 
    rechargeWallet, 
    getTransactionHistory,
    validateRechargeCode,
    clearWalletError 
} from "../../Redux/Slices/WalletSlice";
import { getPaymentServices } from "../../Redux/Slices/WhatsAppServiceSlice";
import { formatCairoDate } from "../../utils/timezone";
import { 
    FaWallet, 
    FaCreditCard, 
    FaHistory, 
    FaPlus, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaWhatsapp,
    FaClock
} from "react-icons/fa";

export default function Wallet() {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);
    const { 
        balance, 
        transactions, 
        loading, 
        error, 
        rechargeLoading, 
        rechargeError,
        codeValidation 
    } = useSelector((state) => state.wallet);
    const { services: whatsappServices } = useSelector((state) => state.whatsappService);

    const [rechargeForm, setRechargeForm] = useState({
        code: "",
        amount: ""
    });
    const [showAmount, setShowAmount] = useState(false);
    const [activeTab, setActiveTab] = useState("balance");

    useEffect(() => {
        if (user) {
            dispatch(getWalletBalance());
            dispatch(getTransactionHistory());
            dispatch(getPaymentServices());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearWalletError());
        }
        if (rechargeError) {
            toast.error(rechargeError);
            dispatch(clearWalletError());
        }
    }, [error, rechargeError, dispatch]);

    const handleRechargeFormChange = (e) => {
        const { name, value } = e.target;
        setRechargeForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCodeValidation = async (code) => {
        if (code.length >= 6) {
            await dispatch(validateRechargeCode({ code }));
        }
    };

    const handleRecharge = async (e) => {
        e.preventDefault();
        
        if (!rechargeForm.code || !rechargeForm.amount) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        const amount = parseFloat(rechargeForm.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح");
            return;
        }

        try {
            await dispatch(rechargeWallet({ 
                code: rechargeForm.code, 
                amount: amount 
            })).unwrap();
            
            toast.success("تم شحن المحفظة بنجاح!");
            setRechargeForm({ code: "", amount: "" });
            dispatch(getWalletBalance());
        } catch (error) {
            // Error is handled in useEffect
        }
    };

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

    const getTransactionColor = (type) => {
        switch (type) {
            case 'recharge':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'purchase':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'refund':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
        }
    };

    const getTransactionTypeText = (type) => {
        switch (type) {
            case 'recharge':
                return 'شحن';
            case 'purchase':
                return 'شراء';
            case 'refund':
                return 'استرداد';
            default:
                return 'معاملة';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'مكتمل';
            case 'pending':
                return 'قيد الانتظار';
            case 'failed':
                return 'فشل';
            default:
                return status;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaWallet className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            محفظتي
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            إدارة رصيدك وعرض سجل المعاملات
                        </p>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    الرصيد الحالي
                                </h2>
                                <div className="flex items-center space-x-reverse space-x-2">
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        {showAmount ? `${balance.toFixed(2)} جنيه` : "**** جنيه"}
                                    </span>
                                    <button
                                        onClick={() => setShowAmount(!showAmount)}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {showAmount ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    إجمالي المعاملات
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {transactions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-reverse space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab("balance")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "balance"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaCreditCard className="inline ml-2" />
                            شحن المحفظة
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "history"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaHistory className="inline ml-2" />
                            سجل المعاملات
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        {activeTab === "balance" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    شحن محفظتك
                                </h3>
                                
                                {/* How to recharge instructions */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                        كيفية الشحن:
                                    </h4>
                                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            تواصل معنا على واتساب: <strong> 01125800332</strong> للحصول على كود شحن
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            أو ادفع عبر فودافون كاش: <strong>01125800332</strong>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            اشتر كود شحن من البائعين المعتمدين
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            أدخل الكود والمبلغ في النموذج أعلاه
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            سيتم إضافة المبلغ إلى محفظتك فوراً
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-600 dark:text-blue-400 ml-2">•</span>
                                            استخدم رصيدك لشراء الكورسات والخدمات التي ستتواصل معنا بشأنها على واتساب
                                        </li>
                                    </ul>
                                    
                                    {/* Contact Methods */}
                                    <div className="mt-4 space-y-3">
                                        {/* WhatsApp Contact */}
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                            <h5 className="text-md font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                                <FaWhatsapp className="text-green-600 dark:text-green-400" />
                                                للحصول على كود شحن - تواصل معنا على واتساب
                                            </h5>
                                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-600">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        رقم الواتساب
                                                    </div>
                                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        01125800332
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        متاح على مدار 24/7
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const message = `مرحباً! أنا مهتم بشراء كود شحن للمحفظة. هل يمكنك تقديم المزيد من المعلومات؟`;
                                                        window.open(`https://wa.me/201125800332?text=${encodeURIComponent(message)}`, '_blank');
                                                    }}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <FaWhatsapp />
                                                    تواصل الآن
                                                </button>
                                            </div>
                                        </div>

                                        {/* Vodafone Cash Contact */}
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                            <h5 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                                <FaCreditCard className="text-blue-600 dark:text-blue-400" />
                                                الدفع عبر فودافون كاش
                                            </h5>
                                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-600">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        رقم فودافون كاش
                                                    </div>
                                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        01125800332
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        ادفع المبلغ وسيصلك الكود فوراً
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        ادفع المبلغ المطلوب
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ثم تواصل على الواتساب
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* WhatsApp Contact Information */}
                                    {whatsappServices && whatsappServices.length > 0 && (
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                            <h5 className="text-md font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                                <FaWhatsapp className="text-green-600 dark:text-green-400" />
                                                تحتاج مساعدة؟ تواصل معنا على واتساب
                                            </h5>
                                            <div className="space-y-3">
                                                {whatsappServices.map((service) => (
                                                    <div key={service._id} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{service.icon}</span>
                                                            <h6 className="font-medium text-green-900 dark:text-green-100">
                                                                {service.name}
                                                            </h6>
                                                        </div>
                                                        <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                                                            {service.description}
                                                        </p>
                                                        {service.whatsappNumbers.map((number, index) => (
                                                            <div key={number._id || index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-600">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                        {number.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {number.number}
                                                                    </div>
                                                                    {number.workingHours && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                            <FaClock />
                                                                            {number.workingHours}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const message = `مرحباً! أنا مهتم بخدمة ${service.name}. ${service.instructions || 'هل يمكنك تقديم المزيد من المعلومات؟'}`;
                                                                        window.open(`https://wa.me/${number.number}?text=${encodeURIComponent(message)}`, '_blank');
                                                                    }}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                                >
                                                                    <FaWhatsapp />
                                                                    تواصل
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                                    <strong>ساعات العمل:</strong> الدعم متاح على مدار 24/7
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <form onSubmit={handleRecharge} className="space-y-6">
                                    {/* Code Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            كود الشحن
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="code"
                                                value={rechargeForm.code}
                                                onChange={(e) => {
                                                    handleRechargeFormChange(e);
                                                    handleCodeValidation(e.target.value);
                                                }}
                                                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="أدخل كود الشحن الخاص بك"
                                                required
                                            />
                                            {rechargeForm.code && (
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                    {codeValidation.isValid ? (
                                                        <FaCheckCircle className="text-green-500 w-5 h-5" />
                                                    ) : codeValidation.error ? (
                                                        <FaTimesCircle className="text-red-500 w-5 h-5" />
                                                    ) : codeValidation.loading ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                    ) : (
                                                        <FaExclamationTriangle className="text-blue-500 w-5 h-5" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {codeValidation.error && (
                                            <p className="text-red-500 text-sm mt-1">{codeValidation.error}</p>
                                        )}
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            المبلغ (جنيه)
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={rechargeForm.amount}
                                            onChange={handleRechargeFormChange}
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="أدخل المبلغ بالجنيه"
                                            min="1"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={rechargeLoading || !codeValidation.isValid}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        {rechargeLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                                                جاري المعالجة...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <FaPlus className="ml-2" />
                                                شحن المحفظة
                                            </div>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    سجل المعاملات
                                </h3>
                                
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لم يتم العثور على معاملات. ابدأ بشحن محفظتك!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((transaction, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-reverse space-x-4">
                                                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                                                        {getTransactionIcon(transaction.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            الكود: {transaction.code}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                                            <FaCalendarAlt className="ml-1" />
                                                            {formatDate(transaction.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${
                                                        transaction.type === 'recharge' || transaction.type === 'refund'
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {transaction.type === 'recharge' || transaction.type === 'refund' ? '+' : '-'}
                                                        {Math.abs(transaction.amount).toFixed(2)} جنيه
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        transaction.status === 'completed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : transaction.status === 'pending'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                        {getStatusText(transaction.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
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