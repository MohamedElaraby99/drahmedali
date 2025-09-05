import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingQuestions, answerQuestion } from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaClock, 
  FaUser, 
  FaTag, 
  FaCalendar,
  FaCheck,
  FaTimes,
  FaEdit
} from "react-icons/fa";

export default function QAPendingQuestions() {
  const dispatch = useDispatch();
  const { pendingQuestions, loading, categories } = useSelector((state) => state.qa);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  useEffect(() => {
    dispatch(getPendingQuestions());
  }, [dispatch]);

  const handleAnswerQuestion = async (questionId) => {
    if (!answer.trim()) {
      alert("يرجى تقديم إجابة");
      return;
    }

    try {
      await dispatch(answerQuestion({ id: questionId, answer }));
      setShowAnswerModal(false);
      setSelectedQuestion(null);
      setAnswer("");
      // Refresh pending questions
      dispatch(getPendingQuestions());
    } catch (error) {
      console.error('Answer question error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin/qa-dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
            >
              <FaArrowLeft />
              العودة إلى لوحة تحكم الأسئلة والأجوبة
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  الأسئلة المعلقة
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  راجع وأجب على الأسئلة من المجتمع
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pendingQuestions.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  الأسئلة المعلقة
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل الأسئلة المعلقة...</p>
            </div>
          ) : pendingQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  لا توجد أسئلة معلقة
                </h3>
                              <p className="text-gray-600 dark:text-gray-300">
                  تمت الإجابة على جميع الأسئلة! عمل رائع!
                </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQuestions.map((question) => (
                <div key={question._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <FaClock />
                          معلق
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        {question.question}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <FaUser />
                          {question.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendar />
                          {formatDate(question.createdAt)}
                        </span>
                      </div>
                      
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <FaTag className="text-gray-400" />
                          <div className="flex gap-2">
                            {question.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuestion(question);
                          setShowAnswerModal(true);
                        }}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <FaEdit />
                        إجابة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer Modal */}
        {showAnswerModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  الإجابة على السؤال
                </h3>
                <button
                  onClick={() => {
                    setShowAnswerModal(false);
                    setSelectedQuestion(null);
                    setAnswer("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">السؤال:</h4>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {selectedQuestion.question}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إجابتك *
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="6"
                  placeholder="قدم إجابة مفصلة ومفيدة..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAnswerModal(false);
                    setSelectedQuestion(null);
                    setAnswer("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleAnswerQuestion(selectedQuestion._id)}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <FaCheck />
                  إرسال الإجابة
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
} 