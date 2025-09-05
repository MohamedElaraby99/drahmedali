import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch, 
  FaFilter,
  FaSave,
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaSpinner,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';

const CentersDashboard = () => {
  const { data: user } = useSelector((state) => state.auth);
  
  // State management
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    capacity: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedCenters, setSelectedCenters] = useState([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalCenters: 0,
    activeCenters: 0,
    inactiveCenters: 0,
    totalCapacity: 0
  });

  // Fetch centers
  const fetchCenters = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      
      if (filter !== 'all') {
        params.isActive = filter === 'active';
      }
      
      const response = await axiosInstance.get('/centers', { params });
      
      if (response.data.success) {
        setCenters(response.data.data.centers);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      toast.error('فشل في تحميل المراكز');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/centers/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCenters();
    fetchStats();
  }, [currentPage, searchTerm, filter, sortBy, sortOrder]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'اسم المركز مطلوب';
    }
    
    if (formData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 0)) {
      errors.capacity = 'السعة يجب أن تكون رقم صحيح غير سالب';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create/edit submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0
      };
      
      let response;
      if (modalMode === 'create') {
        response = await axiosInstance.post('/centers', submitData);
        toast.success('تم إضافة المركز بنجاح');
      } else {
        response = await axiosInstance.put(`/centers/${selectedCenter._id}`, submitData);
        toast.success('تم تحديث المركز بنجاح');
      }
      
      if (response.data.success) {
        closeModal();
        fetchCenters();
        fetchStats();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (centerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المركز؟')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/centers/${centerId}`);
      if (response.data.success) {
        toast.success('تم حذف المركز بنجاح');
        fetchCenters();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting center:', error);
      toast.error(error.response?.data?.message || 'فشل في حذف المركز');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCenters.length === 0) {
      toast.error('يرجى اختيار مراكز للحذف');
      return;
    }
    
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedCenters.length} مركز؟`)) {
      return;
    }
    
    try {
      const response = await axiosInstance.post('/centers/bulk-delete', {
        ids: selectedCenters
      });
      
      if (response.data.success) {
        toast.success(`تم حذف ${response.data.data.deletedCount} مركز بنجاح`);
        setSelectedCenters([]);
        fetchCenters();
        fetchStats();
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('فشل في حذف المراكز');
    }
  };

  // Toggle center status
  const handleToggleStatus = async (centerId) => {
    try {
      const response = await axiosInstance.patch(`/centers/${centerId}/toggle-status`);
      if (response.data.success) {
        toast.success('تم تغيير حالة المركز بنجاح');
        fetchCenters();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('فشل في تغيير حالة المركز');
    }
  };

  // Open modal
  const openModal = (mode, center = null) => {
    setModalMode(mode);
    setSelectedCenter(center);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        capacity: ''
      });
    } else if (center) {
      setFormData({
        name: center.name || '',
        description: center.description || '',
        location: center.location || '',
        phone: center.phone || '',
        email: center.email || '',
        capacity: center.capacity ? center.capacity.toString() : ''
      });
    }
    
    setFormErrors({});
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCenter(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      phone: '',
      email: '',
      capacity: ''
    });
    setFormErrors({});
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle checkbox selection
  const handleSelectCenter = (centerId) => {
    setSelectedCenters(prev => 
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCenters.length === centers.length) {
      setSelectedCenters([]);
    } else {
      setSelectedCenters(centers.map(center => center._id));
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  if (loading && centers.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المراكز...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBuilding className="text-blue-500" />
                  إدارة المراكز
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  إدارة المراكز التعليمية المتاحة للطلاب
                </p>
              </div>
              <button
                onClick={() => openModal('create')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                إضافة مركز جديد
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">إجمالي المراكز</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCenters}</p>
                </div>
                <FaBuilding className="text-blue-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">المراكز النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeCenters}</p>
                </div>
                <FaToggleOn className="text-green-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">المراكز المعطلة</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveCenters}</p>
                </div>
                <FaToggleOff className="text-red-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">إجمالي السعة</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCapacity}</p>
                </div>
                <FaUsers className="text-purple-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المراكز..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">جميع المراكز</option>
                <option value="active">المراكز النشطة</option>
                <option value="inactive">المراكز المعطلة</option>
              </select>
              
              {/* Bulk Actions */}
              {selectedCenters.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaTrashAlt />
                  حذف المحدد ({selectedCenters.length})
                </button>
              )}
            </div>
          </div>

          {/* Centers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-right">
                      <input
                        type="checkbox"
                        checked={selectedCenters.length === centers.length && centers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center justify-between">
                        اسم المركز
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الموقع
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      معلومات الاتصال
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('capacity')}
                    >
                      <div className="flex items-center justify-between">
                        السعة
                        {getSortIcon('capacity')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center justify-between">
                        الحالة
                        {getSortIcon('isActive')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center justify-between">
                        تاريخ الإنشاء
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {centers.map((center) => (
                    <tr key={center._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCenters.includes(center._id)}
                          onChange={() => handleSelectCenter(center._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <FaBuilding className="text-blue-500 ml-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {center.name}
                            </div>
                            {center.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {center.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {center.location ? (
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <FaMapMarkerAlt className="text-red-500 ml-1" />
                            {center.location}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">غير محدد</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {center.phone && (
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <FaPhone className="text-green-500 ml-1" />
                              {center.phone}
                            </div>
                          )}
                          {center.email && (
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <FaEnvelope className="text-blue-500 ml-1" />
                              {center.email}
                            </div>
                          )}
                          {!center.phone && !center.email && (
                            <span className="text-gray-500 dark:text-gray-400">غير محدد</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FaUsers className="text-purple-500 ml-1" />
                          {center.capacity || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleStatus(center._id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            center.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {center.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {center.isActive ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(center.createdAt).toLocaleDateString('ar')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('view', center)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="عرض"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => openModal('edit', center)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(center._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="حذف"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {centers.length === 0 && !loading && (
              <div className="text-center py-12">
                <FaBuilding className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد مراكز
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  ابدأ بإضافة أول مركز تعليمي
                </p>
                <button
                  onClick={() => openModal('create')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  <FaPlus />
                  إضافة مركز جديد
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        الصفحة {currentPage} من {totalPages}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          السابق
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          التالي
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {modalMode === 'create' && 'إضافة مركز جديد'}
                  {modalMode === 'edit' && 'تعديل المركز'}
                  {modalMode === 'view' && 'عرض تفاصيل المركز'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      اسم المركز *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        formErrors.name
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                      placeholder="أدخل اسم المركز"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الوصف
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${
                        modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''
                      }`}
                      placeholder="أدخل وصف المركز"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الموقع
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${
                        modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''
                      }`}
                      placeholder="أدخل موقع المركز"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${
                        modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''
                      }`}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        formErrors.email
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                      placeholder="أدخل البريد الإلكتروني"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      السعة القصوى
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        formErrors.capacity
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${modalMode === 'view' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                      placeholder="أدخل السعة القصوى"
                    />
                    {formErrors.capacity && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.capacity}</p>
                    )}
                  </div>

                  {/* Show additional info in view mode */}
                  {modalMode === 'view' && selectedCenter && (
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">الحالة:</span>
                        <span className={`text-sm font-medium ${
                          selectedCenter.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedCenter.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedCenter.createdAt).toLocaleDateString('ar')}
                        </span>
                      </div>
                      {selectedCenter.createdBy && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">أنشئ بواسطة:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {selectedCenter.createdBy.name || selectedCenter.createdBy.email}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    إلغاء
                  </button>
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          {modalMode === 'create' ? 'إضافة' : 'تحديث'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CentersDashboard;
