import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllStagesAdmin, 
  createStage, 
  updateStage, 
  deleteStage,
  toggleStageStatus,
  getAllStagesWithStats
} from '../../Redux/Slices/StageSlice';
import Layout from '../../Layout/Layout';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUsers, 
  FaBook,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaChartBar
} from 'react-icons/fa';

export default function StageDashboard() {
  const dispatch = useDispatch();
  const { adminStages, adminLoading, stagesWithStats } = useSelector((state) => state.stage);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "national",
    status: "active"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getAllStagesAdmin({ page: 1, limit: 100 }));
    dispatch(getAllStagesWithStats());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المرحلة مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStage = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(createStage(formData)).unwrap();
      setShowCreateModal(false);
      resetForm();
      // Refresh the stages list to show the newly created stage
      dispatch(getAllStagesAdmin({ page: 1, limit: 100 }));
      dispatch(getAllStagesWithStats());
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  const handleEditStage = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(updateStage({ 
        id: selectedStage._id, 
        stageData: formData 
      })).unwrap();
      setShowEditModal(false);
      setSelectedStage(null);
      resetForm();
      // Refresh the stages list to show the updated stage
      dispatch(getAllStagesAdmin({ page: 1, limit: 100 }));
      dispatch(getAllStagesWithStats());
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المرحلة؟')) {
      try {
        await dispatch(deleteStage(stageId)).unwrap();
        // Refresh the stages list after deletion
        dispatch(getAllStagesAdmin({ page: 1, limit: 100 }));
        dispatch(getAllStagesWithStats());
      } catch (error) {
        console.error('Error deleting stage:', error);
      }
    }
  };

  const handleToggleStatus = async (stageId) => {
    try {
      await dispatch(toggleStageStatus(stageId)).unwrap();
      // Refresh the stages list after status toggle
      dispatch(getAllStagesAdmin({ page: 1, limit: 100 }));
      dispatch(getAllStagesWithStats());
    } catch (error) {
      console.error('Error toggling stage status:', error);
    }
  };

  const openEditModal = (stage) => {
    setSelectedStage(stage);
    setFormData({
      name: stage.name,
      status: stage.status
    });
    setErrors({});
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      status: "active"
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const filteredStages = adminStages.filter(stage => {
    const matchesSearch = stage.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || stage.status === status;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBgColor = (status) => {
    return status === 'active' ? 'bg-green-100' : 'bg-red-100';
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                إدارة المراحل الدراسية
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إدارة المراحل الدراسية والمراحل التعليمية
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaPlus />
              إضافة مرحلة جديدة
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المراحل</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminStages.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FaChartBar className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المراحل النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{adminStages.filter(s => s.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <FaToggleOn className="text-green-600 dark:text-green-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المواد</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stagesWithStats.reduce((sum, stage) => sum + (stage.subjectsCount || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FaBook className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stagesWithStats.reduce((sum, stage) => sum + (stage.studentsCount || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FaUsers className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المراحل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          {/* Stages List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      اسم المرحلة
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adminLoading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="mr-3 text-gray-500 dark:text-gray-400">جاري التحميل...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStages.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد مراحل
                      </td>
                    </tr>
                  ) : (
                    filteredStages.map((stage) => (
                      <tr key={stage._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {stage.name}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <FaBook className="mr-1 text-blue-500" />
                              {stagesWithStats.find(s => s._id === stage._id)?.subjectsCount || 0}
                            </div>
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <FaUsers className="mr-1 text-blue-500" />
                              {stagesWithStats.find(s => s._id === stage._id)?.studentsCount || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBgColor(stage.status)} ${getStatusColor(stage.status)}`}>
                            {stage.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleToggleStatus(stage._id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title={stage.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                            >
                              {stage.status === 'active' ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                            </button>
                            <button
                              onClick={() => openEditModal(stage)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="تعديل"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(stage._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="حذف"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    إضافة مرحلة جديدة
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateStage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم المرحلة *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="اسم المرحلة"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحالة
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <FaSave />
                      إنشاء مرحلة
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedStage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    تعديل المرحلة
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStage(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleEditStage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم المرحلة *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="اسم المرحلة"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحالة
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedStage(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <FaSave />
                      تحديث المرحلة
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 