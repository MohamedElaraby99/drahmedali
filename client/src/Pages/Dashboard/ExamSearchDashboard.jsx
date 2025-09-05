import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaClipboardList, FaEye, FaUser, FaBook, FaTrophy, FaTimes, FaCalendar, FaClock } from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';

const ExamSearchDashboard = () => {
  const { data: userData } = useSelector((state) => state.auth);
  
  // State for data
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamDetails, setShowExamDetails] = useState(false);

  // Fetch all exams with student results
  useEffect(() => {
    fetchAllExams();
  }, []);

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/exam-results/search?page=1&limit=100');
      
      if (response.data.success) {
        setExams(response.data.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  // View exam details
  const viewExamDetails = (exam) => {
    setSelectedExam(exam);
    setShowExamDetails(true);
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-blue-600';
    return 'text-red-600';
  };

  // Get status badge
  const getStatusBadge = (passed) => {
    return passed ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaTrophy className="w-3 h-3 mr-1" />
        ناجح
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimes className="w-3 h-3 mr-1" />
        راسب
      </span>
    );
  };

  // Group exams by course and lesson
  const groupedExams = exams.reduce((acc, exam) => {
    const key = `${exam.course?.title}-${exam.lesson?.title}`;
    if (!acc[key]) {
      acc[key] = {
        course: exam.course,
        lesson: exam.lesson,
        unit: exam.unit,
        exam: exam.exam,
        examType: exam.examType,
        students: []
      };
    }
    
    if (exam.isCompleted || exam.type === 'completed') {
      acc[key].students.push(exam);
    }
    
    return acc;
  }, {});

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-right">
              <FaClipboardList className="inline-block mr-3 text-blue-600" />
              جميع الامتحانات والنتائج
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-right">
              عرض جميع الامتحانات والطلاب الذين تقدموا لها مع نتائجهم
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">جاري تحميل الامتحانات...</p>
            </div>
          ) : (
            /* Exams List */
            <div className="space-y-6">
              {Object.entries(groupedExams).map(([key, examData]) => (
                <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  {/* Exam Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FaBook className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {examData.exam?.title || 'امتحان بدون عنوان'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {examData.exam?.description || 'لا يوجد وصف'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaBook className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الدورة:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.course?.title || 'غير محدد'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaClipboardList className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الدرس:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.lesson?.title || 'غير محدد'}
                            </span>
                          </div>
                          
                          {examData.unit && (
                            <div className="flex items-center gap-2">
                              <FaBook className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">الوحدة:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {examData.unit.title}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الوقت المحدد:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.exam?.timeLimit || 0} دقيقة
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaClipboardList className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">عدد الأسئلة:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.exam?.questionsCount || 0}
                            </span>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            examData.examType === 'training' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {examData.examType === 'training' ? 'تدريب' : 'امتحان نهائي'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => viewExamDetails(examData)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaEye />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>

                  {/* Students Results */}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-right">
                      نتائج الطلاب ({examData.students.length} طالب)
                    </h4>
                    
                    {examData.students.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">📝</div>
                        <p className="text-gray-600 dark:text-gray-400">لم يتقدم أي طالب لهذا الامتحان بعد</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                الطالب
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                النتيجة
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                الحالة
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                التاريخ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {examData.students.map((student, index) => (
                              <tr key={student._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <FaUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    </div>
                                    <div className="mr-3 text-right">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {student.user?.fullName || student.user?.username || 'غير محدد'}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {student.user?.email || 'غير محدد'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    <span className={`font-semibold ${getScoreColor(student.percentage)}`}>
                                      {student.percentage}%
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {student.correctAnswers}/{student.totalQuestions} سؤال صحيح
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {getStatusBadge(student.passed)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400" />
                                    {new Date(student.completedAt).toLocaleDateString('ar-EG')}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && exams.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد امتحانات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                لم يتم إنشاء أي امتحانات بعد
              </p>
            </div>
          )}
        </div>

        {/* Exam Details Modal */}
        {showExamDetails && selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    تفاصيل الامتحان
                  </h3>
                  <button
                    onClick={() => setShowExamDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Exam Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">معلومات الامتحان</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">العنوان:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.title || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الوصف:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.description || 'لا يوجد وصف'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الوقت المحدد:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.timeLimit || 0} دقيقة
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">عدد الأسئلة:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.questionsCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">معلومات الدورة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">اسم الدورة:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.course?.title || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الدرس:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.lesson?.title || 'غير محدد'}
                        </span>
                      </div>
                      {selectedExam.unit && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">الوحدة:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {selectedExam.unit.title}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">نوع الامتحان:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.examType === 'training' ? 'تدريب' : 'امتحان نهائي'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {selectedExam.students.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">إحصائيات الامتحان</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedExam.students.length}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">إجمالي الطلاب</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedExam.students.filter(s => s.passed).length}
                        </div>
                        <div className="text-green-700 dark:text-green-300">ناجحون</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedExam.students.filter(s => !s.passed).length}
                        </div>
                        <div className="text-red-700 dark:text-red-300">راسبون</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(selectedExam.students.reduce((sum, s) => sum + s.percentage, 0) / selectedExam.students.length)}%
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">متوسط النتيجة</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowExamDetails(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamSearchDashboard;
