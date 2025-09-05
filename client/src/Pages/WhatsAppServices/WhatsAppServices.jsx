import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { getNonPaymentServices, clearWhatsAppServiceError } from "../../Redux/Slices/WhatsAppServiceSlice";
import {
    FaWhatsapp,
    FaPhone,
    FaClock,
    FaSearch,
    FaFilter,
    FaMoneyBillWave,
    FaInfoCircle,
    FaExternalLinkAlt,
    FaStar,
    FaUsers,
    FaBook,
    FaHeadset,
    FaCog
} from "react-icons/fa";

export default function WhatsAppServices() {
    const dispatch = useDispatch();
    const { services, loading, error } = useSelector((state) => state.whatsappService);
    const { data: user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    useEffect(() => {
        dispatch(getNonPaymentServices());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearWhatsAppServiceError());
        }
    }, [error, dispatch]);

    const handleWhatsAppClick = (number, serviceName) => {
        const message = `مرحباً! أنا مهتم بخدمة ${serviceName}. هل يمكنك تقديم المزيد من المعلومات؟`;
        const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'course':
                return <FaBook className="text-blue-500" />;
            case 'tutoring':
                return <FaUsers className="text-green-500" />;
            case 'consultation':
                return <FaHeadset className="text-blue-500" />;
            case 'support':
                return <FaCog className="text-blue-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'course':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'tutoring':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'consultation':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'support':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const sortedServices = [...filteredServices].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "price":
                return a.price - b.price;
            case "category":
                return a.category.localeCompare(b.category);
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const categories = ["course", "tutoring", "consultation", "support", "payment", "other"];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaWhatsapp className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            خدمات واتساب
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            تواصل مع فريقنا المتخصص عبر واتساب للحصول على خدمات مخصصة، 
                            مساعدة في الكورسات ، التدريس، والاستشارات المهنية.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FaBook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الخدمات</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <FaUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الخدمات النشطة</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {services.filter(s => s.isActive).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FaHeadset className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الفئات</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {new Set(services.map(s => s.category)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FaPhone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">أرقام الاتصال</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {services.reduce((total, service) => total + service.whatsappNumbers.length, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="البحث في الخدمات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">جميع الفئات</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="name">الاسم أ-ي</option>
                                <option value="price">السعر منخفض-عالي</option>
                                <option value="category">الفئة</option>
                            </select>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                                {sortedServices.length} خدمة تم العثور عليها
                            </div>
                        </div>
                    </div>

                    {/* Services Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedServices.map((service) => (
                                <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{service.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {service.name}
                                                    </h3>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(service.category)}`}>
                                                        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaStar className="text-blue-400 text-sm" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">4.8</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                            {service.description}
                                        </p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {service.price} {service.currency}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <FaClock />
                                                    <span>{service.estimatedResponseTime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {service.instructions && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    {service.instructions}
                                                </p>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    أرقام الاتصال ({service.whatsappNumbers.length})
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {service.whatsappNumbers.map((number, index) => (
                                                    <div key={number._id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                                <FaWhatsapp className="text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {number.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {number.number}
                                                                </div>
                                                                {number.workingHours && (
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                                        <FaClock />
                                                                        {number.workingHours}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleWhatsAppClick(number.number, service.name)}
                                                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            <FaWhatsapp />
                                                            <span className="hidden sm:inline">تواصل</span>
                                                            <FaExternalLinkAlt className="text-xs" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sortedServices.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لم يتم العثور على خدمات</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                حاول تعديل معايير البحث أو المرشحات.
                            </p>
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">تحتاج مساعدة؟</h2>
                        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                            لا تجد ما تبحث عنه؟ فريق الدعم لدينا متاح على مدار الساعة لمساعدتك في أي أسئلة أو طلبات خاصة.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handleWhatsAppClick("1234567890", "General Support")}
                                className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaWhatsapp />
                                تواصل مع الدعم
                            </button>
                            <a
                                href="/contact"
                                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaPhone />
                                طرق الاتصال الأخرى
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 