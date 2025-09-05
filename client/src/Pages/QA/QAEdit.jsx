import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getQAById, updateQA } from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { 
  FaArrowLeft, 
  FaQuestionCircle, 
  FaTag, 
  FaUser,
  FaSave,
  FaTimes
} from "react-icons/fa";

export default function QAEdit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentQA, loading, categories } = useSelector((state) => state.qa);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    author: "",
    tags: "",
    status: "answered"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getQAById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentQA) {
      setFormData({
        question: currentQA.question || "",
        answer: currentQA.answer || "",
        category: currentQA.category || "",
        author: currentQA.author || "",
        tags: currentQA.tags ? currentQA.tags.join(', ') : "",
        status: currentQA.status || "answered"
      });
    }
  }, [currentQA]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    } else if (formData.question.length < 10) {
      newErrors.question = "Question must be at least 10 characters";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
    } else if (formData.answer.length < 10) {
      newErrors.answer = "Answer must be at least 10 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author name is required";
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
      await dispatch(updateQA({ id, qaData: formData }));
      navigate(`/qa/${id}`);
    } catch (error) {
      console.error('Update QA error:', error);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Q&A...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentQA) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Q&A not found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The Q&A you're trying to edit doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/qa")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft />
              Back to Q&As
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/qa/${id}`)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
            >
              <FaArrowLeft />
              Back to Q&A
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <FaQuestionCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Edit Q&A
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Update your question and answer
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
                  Question *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.question ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="4"
                  placeholder="What would you like to ask? Be specific and clear..."
                />
                {errors.question && (
                  <p className="text-red-500 text-sm mt-1">{errors.question}</p>
                )}
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer *
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.answer ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="6"
                  placeholder="Provide a detailed answer to your question..."
                />
                {errors.answer && (
                  <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
                )}
              </div>

              {/* Category and Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select a category</option>
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
                    Author Name *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter author name"
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
                  Tags (optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter tags separated by commas (e.g., javascript, react, tutorial)"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tags help others find your question more easily
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="answered">Answered</option>
                  <option value="pending">Pending</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate(`/qa/${id}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaSave />
                  Update Q&A
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
} 