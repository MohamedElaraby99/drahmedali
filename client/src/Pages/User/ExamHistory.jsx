import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaHistory, 
  FaClipboardCheck, 
  FaGraduationCap, 
  FaClock, 
  FaStar, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaBook,
  FaUser
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import { getUserExamHistory } from '../../Redux/Slices/ExamSlice';

const ExamHistory = () => {
  const dispatch = useDispatch();
  const { data: user } = useSelector(state => state.auth);
  const { examHistory, examHistoryPagination, loading, error } = useSelector(state => state.exam);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(getUserExamHistory({ page: currentPage, limit: 10 }));
    }
  }, [dispatch, user, currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-blue-600';
    return 'text-red-600';
  };

  const getExamTypeIcon = (examType) => {
    return examType === 'training' ? (
      <FaClipboardCheck className="text-blue-500" />
    ) : (
      <FaGraduationCap className="text-red-500" />
    );
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Login</h1>
            <p className="text-gray-600 dark:text-gray-400">You need to be logged in to view your exam history.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <FaHistory className="text-blue-500" />
              Exam History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View all your exam results and performance
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <FaClipboardCheck className="text-lg sm:text-2xl text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Training Exams</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {examHistory.filter(r => r.examType === 'training').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <FaGraduationCap className="text-lg sm:text-2xl text-red-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Final Exams</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {examHistory.filter(r => r.examType === 'final').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <FaCheckCircle className="text-lg sm:text-2xl text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Passed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {examHistory.filter(r => r.passed).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <FaStar className="text-lg sm:text-2xl text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {examHistory.length > 0 
                      ? Math.round(examHistory.reduce((sum, r) => sum + r.score, 0) / examHistory.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Results List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Exam Results
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading exam history...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Results</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : examHistory.length === 0 ? (
              <div className="p-8 text-center">
                <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Exam Results</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't taken any exams yet. Start learning and take some exams!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {examHistory.map((result, index) => (
                  <div key={result._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {getExamTypeIcon(result.examType)}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {result.lessonTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {result.examType === 'training' ? 'Training Exam' : 'Final Exam'}
                            {result.unitTitle && ` • ${result.unitTitle}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <div className="text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaClock className="text-xs sm:text-sm" />
                        <span>{result.timeTaken} min</span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaCalendarAlt className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline">{formatDate(result.createdAt)}</span>
                        <span className="sm:hidden">{new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => handleViewResult(result)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                      >
                        <FaEye className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </div>
                  </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span>Correct: {result.correctAnswers}/{result.totalQuestions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-red-500" />
                        <span>Wrong: {result.wrongAnswers}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaStar className="text-blue-500" />
                        <span>Passing Score: {result.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        <span>Time Limit: {result.timeLimit} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {examHistoryPagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((examHistoryPagination.currentPage - 1) * examHistoryPagination.resultsPerPage) + 1} to{' '}
                    {Math.min(examHistoryPagination.currentPage * examHistoryPagination.resultsPerPage, examHistoryPagination.totalResults)} of{' '}
                    {examHistoryPagination.totalResults} results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(examHistoryPagination.currentPage - 1)}
                      disabled={examHistoryPagination.currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaArrowLeft />
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {examHistoryPagination.currentPage} of {examHistoryPagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(examHistoryPagination.currentPage + 1)}
                      disabled={examHistoryPagination.currentPage === examHistoryPagination.totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Detail Modal */}
        {showResultModal && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getExamTypeIcon(selectedResult.examType)}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedResult.lessonTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResult.examType === 'training' ? 'Training Exam' : 'Final Exam'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Result Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(selectedResult.score)}`}>
                      {selectedResult.score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.correctAnswers}/{selectedResult.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.timeTaken} min
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.passed ? 'PASSED' : 'FAILED'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Result</div>
                  </div>
                </div>

                {/* Question Review */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Question Review
                  </h4>
                  <div className="space-y-4">
                    {selectedResult.questions?.map((question, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                          {question.isCorrect ? (
                            <FaCheckCircle className="text-green-500 mt-1" />
                          ) : (
                            <FaTimesCircle className="text-red-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              Question {index + 1}: {question.question}
                            </p>
                            <div className="space-y-1">
                              {question.options.slice(0, question.numberOfOptions || 4).map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-2 rounded ${
                                    optionIndex === question.correctAnswer
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                      : optionIndex === question.userAnswer && !question.isCorrect
                                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                      : 'bg-gray-100 dark:bg-gray-700'
                                  }`}
                                >
                                  {option}
                                  {optionIndex === question.correctAnswer && (
                                    <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                                  )}
                                  {optionIndex === question.userAnswer && !question.isCorrect && (
                                    <span className="ml-2 text-red-600 dark:text-red-400">✗ Your Answer</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamHistory; 