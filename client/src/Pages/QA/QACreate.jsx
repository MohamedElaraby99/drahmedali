import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createQA } from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { 
  FaArrowLeft, 
  FaQuestionCircle, 
  FaTag, 
  FaUser,
  FaSave,
  FaTimes
} from "react-icons/fa";

export default function QACreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.qa);
  const { data } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    question: "",
    category: "",
    author: data?.name || "",
    tags: "",
    status: "pending"
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = "السؤال مطلوب";
    } else if (formData.question.length < 10) {
      newErrors.question = "يجب أن يكون السؤال 10 أحرف على الأقل";
    }

    if (!formData.category) {
      newErrors.category = "الفئة مطلوبة";
    }

    if (!formData.author.trim()) {
      newErrors.author = "اسم المؤلف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createQA(formData));
      navigate("/qa");
    } catch (error) {
      console.error('Create QA error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/qa")}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
            >
              <FaArrowLeft />
              العودة إلى الأسئلة والأجوبة
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <FaQuestionCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                اطرح سؤالاً
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                شارك سؤالك مع المجتمع. سيقوم مدراؤنا بمراجعة والإجابة على سؤالك.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaQuestionCircle className="inline mr-2" />
                  سؤالك *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.question ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="4"
                  placeholder="ماذا تريد أن تسأل؟ كن محدداً وواضحاً..."
                />
                {errors.question && (
                  <p className="text-red-500 text-sm mt-1">{errors.question}</p>
                )}
              </div>



              {/* Category and Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الفئة *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">اختر فئة</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaUser className="inline mr-2" />
                    اسمك *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="أدخل اسمك"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-1">{errors.author}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaTag className="inline mr-2" />
                  العلامات (اختياري)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل العلامات مفصولة بفواصل (مثل javascript, react, tutorial)"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  العلامات تساعد الآخرين في العثور على سؤالك بسهولة أكبر
                </p>
              </div>

              {/* Status */}
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
                  <option value="answered">تمت الإجابة</option>
                  <option value="pending">معلق</option>
                  <option value="featured">مميز</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/qa")}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimes />
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaSave />
                  إنشاء سؤال وجواب
                </button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              💡 نصائح لسؤال وجواب ممتاز
            </h3>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• كن محدداً وواضحاً في سؤالك</li>
              <li>• قدم السياق والتفاصيل ذات الصلة</li>
              <li>• استخدم العلامات المناسبة لمساعدة الآخرين في العثور على سؤالك</li>
              <li>• تحقق مما إذا كان سؤالك قد تمت الإجابة عليه بالفعل</li>
              <li>• كن محترماً وبناءً في تواصلك</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
} 