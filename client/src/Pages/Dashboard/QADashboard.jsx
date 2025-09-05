import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  getAllQAs, 
  createQA, 
  updateQA, 
  deleteQA 
} from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaThumbsUp, 
  FaThumbsDown,
  FaTag,
  FaCalendar,
  FaUser,
  FaSearch,
  FaFilter,
  FaClock
} from "react-icons/fa";

export default function QADashboard() {
  const dispatch = useDispatch();
  const { qas, loading, categories } = useSelector((state) => state.qa);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    author: "",
    tags: "",
    status: "answered"
  });

  useEffect(() => {
    dispatch(getAllQAs({ page: 1, limit: 100 }));
  }, []);

  const handleCreateQA = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createQA(formData));
      setShowCreateModal(false);
      setFormData({
        question: "",
        answer: "",
        category: "",
        author: "",
        tags: "",
        status: "answered"
      });
    } catch (error) {
      console.error('خطأ في إنشاء السؤال والجواب:', error);
    }
  };

  const handleEditQA = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateQA({ id: selectedQA._id, qaData: formData }));
      setShowEditModal(false);
      setSelectedQA(null);
      setFormData({
        question: "",
        answer: "",
        category: "",
        author: "",
        tags: "",
        status: "answered"
      });
    } catch (error) {
      console.error('خطأ في تحديث السؤال والجواب:', error);
    }
  };

  const handleDeleteQA = async (qaId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال والجواب؟')) {
      try {
        await dispatch(deleteQA(qaId));
      } catch (error) {
        console.error('خطأ في حذف السؤال والجواب:', error);
      }
    }
  };

  const openEditModal = (qa) => {
    setSelectedQA(qa);
    setFormData({
      question: qa.question,
      answer: qa.answer,
      category: qa.category,
      author: qa.author,
      tags: qa.tags ? qa.tags.join(', ') : "",
      status: qa.status
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'featured': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'answered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Technical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Course Related': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Payment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Account': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  const filteredQAs = qas.filter(qa => {
    const matchesSearch = qa.question.toLowerCase().includes(search.toLowerCase()) ||
                         qa.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || qa.category === category;
    const matchesStatus = !status || qa.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                إدارة الأسئلة والأجوبة
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إدارة الأسئلة والأجوبة لمجتمعك
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <FaPlus />
                إنشاء سؤال وجواب جديد
              </button>
              <Link
                to="/admin/qa-pending"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                <FaClock />
                الأسئلة المعلقة
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الأسئلة والأجوبة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الفئات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع الحالات</option>
                <option value="answered">تم الرد</option>
                <option value="pending">في الانتظار</option>
                <option value="featured">مميز</option>
              </select>

              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                {filteredQAs.length} سؤال وجواب تم العثور عليه
              </div>
            </div>
          </div>

          {/* Q&A List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل الأسئلة والأجوبة...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        السؤال
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الفئة
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المؤلف
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        التصويت
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المشاهدات
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredQAs.map((qa) => (
                      <tr key={qa._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {qa.question}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {qa.answer ? qa.answer.substring(0, 100) + '...' : 'لا توجد إجابة بعد'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(qa.category)}`}>
                            {qa.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(qa.status)}`}>
                            {qa.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {qa.author}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600 flex items-center gap-1">
                              <FaThumbsUp />
                              {qa.upvotes}
                            </span>
                            <span className="text-red-600 flex items-center gap-1">
                              <FaThumbsDown />
                              {qa.downvotes}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1">
                            <FaEye />
                            {qa.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(qa.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/qa/edit/${qa._id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDeleteQA(qa._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">إنشاء سؤال وجواب جديد</h2>
              <form onSubmit={handleCreateQA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السؤال
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="3"
                    placeholder="أدخل السؤال هنا..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الإجابة
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows="5"
                    placeholder="أدخل الإجابة هنا..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الفئة
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="answered">تم الرد</option>
                      <option value="pending">في الانتظار</option>
                      <option value="featured">مميز</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المؤلف 
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العلامات (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="علامة1، علامة2، علامة3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إنشاء سؤال وجواب
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedQA && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">تعديل السؤال والجواب</h2>
              <form onSubmit={handleEditQA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السؤال
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    required
                    placeholder="أدخل السؤال هنا..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الإجابة
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الفئة
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required

                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="answered">تم الرد</option>
                      <option value="pending">في الانتظار</option>
                      <option value="featured">مميز</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المؤلف
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العلامات (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="علامة1، علامة2، علامة3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                      إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تحديث السؤال والجواب
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