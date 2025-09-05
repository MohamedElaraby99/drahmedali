import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  toggleFeatured
} from "../../Redux/Slices/SubjectSlice";
import { getAllInstructors } from "../../Redux/Slices/InstructorSlice";
import Layout from "../../Layout/Layout";
import SubjectCard from "../../Components/SubjectCard";
import { generateImageUrl } from "../../utils/fileUtils";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaSearch,
  FaFilter,
  FaTimes,
  FaSave
} from "react-icons/fa";

export default function SubjectDashboard() {
  const dispatch = useDispatch();
  const { subjects, loading } = useSelector((state) => state.subject);
  const { instructors } = useSelector((state) => state.instructor);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch] = useState("");
  const handleToggleFeatured = async (subjectId) => {
    try {
      await dispatch(toggleFeatured(subjectId));
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    image: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getAllSubjects({ page: 1, limit: 100 }));
    dispatch(getAllInstructors({ page: 1, limit: 100 }));
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "العنوان مطلوب";
    }

    if (!formData.description.trim()) {
      newErrors.description = "الوصف مطلوب";
    }

    if (!formData.instructor) {
      newErrors.instructor = "المدرس مطلوب";
    }

    // Only require image for new subjects, not for editing
    if (!showEditModal && !formData.image) {
      newErrors.image = "الصورة مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const subjectData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          if (formData[key]) {
            subjectData.append('image', formData[key]);
          }
        } else if (key === 'tags') {
          subjectData.append(key, formData[key]);
        } else {
          subjectData.append(key, formData[key]);
        }
      });

      await dispatch(createSubject(subjectData));
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create subject error:', error);
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const subjectData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          subjectData.append(key, formData[key]);
        } else if (key === 'instructor') {
          const value = formData[key];
          // Ensure we send an ObjectId string, not an object
          if (value && typeof value === 'object') {
            subjectData.append(key, value._id || '');
          } else {
            subjectData.append(key, value || '');
          }
        } else {
          subjectData.append(key, formData[key]);
        }
      });

      await dispatch(updateSubject({ id: selectedSubject._id, subjectData }));
      setShowEditModal(false);
      setSelectedSubject(null);
      resetForm();
    } catch (error) {
      console.error('Update subject error:', error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة الدراسية؟')) {
      try {
        await dispatch(deleteSubject(subjectId));
      } catch (error) {
        console.error('Delete subject error:', error);
      }
    }
  };

  

  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      title: subject.title,
      description: subject.description,
      instructor: subject.instructor?._id || subject.instructor || "",
      image: null
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: "",
      image: null
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.title.toLowerCase().includes(search.toLowerCase()) ||
                         subject.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                إدارة المواد الدراسية
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إدارة الكورسات  والمواد الدراسية لمنصتك
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaPlus />
                              إضافة مادة دراسية
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المواد الدراسية..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                {filteredSubjects.length} مادة دراسية تم العثور عليها
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل المواد الدراسية...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  showActions={true}
                  onEdit={openEditModal}
                  onDelete={handleDeleteSubject}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  إضافة مادة دراسية جديدة
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

              <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right ${
                        errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="عنوان المادة الدراسية"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="وصف المادة الدراسية"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدرس *
                    </label>
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.instructor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">اختر المدرس</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
                      ))}
                    </select>
                    {errors.instructor && (
                      <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
                    )}
                  </div>
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صورة المادة الدراسية *
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                  )}
                  {formData.image && (
                    <p className="text-green-600 text-sm mt-1">تم اختيار الملف: {formData.image.name}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    مميز
                  </label>
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
                    الغاء
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaSave />
                    إنشاء مادة دراسية
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  تعديل المادة الدراسية
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSubject(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubject} className="space-y-4">
                {/* Same form fields as create modal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right ${
                        errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="عنوان المادة الدراسية"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="وصف المادة الدراسية"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدرس *
                    </label>
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.instructor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">اختر المدرس</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
                      ))}
                    </select>
                    {errors.instructor && (
                      <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
                    )}
                  </div>

                  
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صورة المادة الدراسية
                  </label>
                  
                  {/* Current Image Preview */}
                  {selectedSubject?.image?.secure_url && !formData.image && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الصورة الحالية:</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <img
                          src={generateImageUrl(selectedSubject.image.secure_url)}
                          alt="Current subject image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">صورة</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Image Preview */}
                  {formData.image && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الصورة الجديدة:</p>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="New subject image"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Input */}
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                  )}
                  {formData.image && (
                    <p className="text-green-600 text-sm mt-1">تم اختيار الملف: {formData.image.name}</p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    اترك الحقل فارغاً للاحتفاظ بالصورة الحالية
                  </p>
                </div>

                

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSubject(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaSave />
                    تحديث المادة الدراسية
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
} 