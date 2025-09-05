import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEssayExamSubmissions, gradeEssaySubmission } from '../../Redux/Slices/EssayExamSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAdminCourses } from '../../Redux/Slices/CourseSlice';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import { FaEye, FaCheck, FaTimes, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import { generateImageUrl } from '../../utils/fileUtils';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';

const EssayExamDashboard = () => {
  const dispatch = useDispatch();
  const { submissions, loading } = useSelector(state => state.essayExam);
  const { userData } = useSelector(state => state.auth);
  const { stages } = useSelector(state => state.stage);
  const { courses } = useSelector(state => state.course);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [examIdInput, setExamIdInput] = useState('');
  const [courseIdInput, setCourseIdInput] = useState('');
  const [lessonIdInput, setLessonIdInput] = useState('');
  const [unitIdInput, setUnitIdInput] = useState('');
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingModal, setGradingModal] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const location = useLocation();
  const navigate = useNavigate();

  // Load exam by query param ?examId=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const examId = params.get('examId');
    if (examId) {
      setExamIdInput(examId);
      handleLoadExamById(examId);
    }
    // Preload stages and courses for filters
    dispatch(getAllStages());
    dispatch(getAdminCourses());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedExam) {
      dispatch(getEssayExamSubmissions({
        examId: selectedExam._id,
        status: statusFilter,
        sortBy,
        sortOrder
      }));
    }
  }, [selectedExam, statusFilter, sortBy, sortOrder, dispatch]);

  const handleLoadExamById = async (manualId) => {
    const id = manualId || examIdInput?.trim();
    if (!id) {
      toast.error('يرجى إدخال معرف الامتحان');
      return;
    }
    try {
      const res = await axiosInstance.get(`/essay-exams/${id}`);
      const exam = res.data?.data?.exam || res.data?.data; // handle both shapes
      if (exam?._id) {
        setSelectedExam(exam);
        // reflect in URL for easy sharing
        const params = new URLSearchParams(location.search);
        params.set('examId', exam._id);
        navigate({ search: params.toString() }, { replace: true });
        toast.success('تم تحميل الامتحان');
      } else {
        toast.error('تعذر تحميل بيانات الامتحان');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل في تحميل الامتحان');
    }
  };

  const handleFetchExamsByLesson = async () => {
    const courseId = (selectedCourseId || courseIdInput).trim();
    const lessonId = (selectedLessonId || lessonIdInput).trim();
    const unitId = unitIdInput.trim();
    if (!courseId) {
      toast.error('يرجى اختيار الدورة');
      return;
    }
    try {
      let exams = [];
      // If a lesson is selected, fetch only that lesson's exams
      if (lessonId) {
        const url = `/essay-exams/course/${courseId}/lesson/${lessonId}`;
        const res = await axiosInstance.get(unitId ? `${url}?unitId=${encodeURIComponent(unitId)}` : url);
        exams = res.data?.data || [];
      } else {
        // Otherwise fetch all lessons' exams for this course (both directLessons and units)
        const course = courses.find(c => c._id === courseId);
        if (!course) {
          toast.error('تعذر العثور على بيانات الدورة');
          return;
        }
        const lessonEntries = [];
        // Direct lessons
        (course.directLessons || []).forEach(lesson => {
          lessonEntries.push({ lessonId: lesson._id, unitId: null });
        });
        // Unit lessons
        (course.units || []).forEach(unit => {
          (unit.lessons || []).forEach(lesson => {
            lessonEntries.push({ lessonId: lesson._id, unitId: unit._id });
          });
        });
        // Fetch in sequence to keep things simple
        const results = [];
        for (const entry of lessonEntries) {
          const url = `/essay-exams/course/${courseId}/lesson/${entry.lessonId}`;
          const res = await axiosInstance.get(entry.unitId ? `${url}?unitId=${encodeURIComponent(entry.unitId)}` : url);
          const data = res.data?.data || [];
          // Annotate with lesson reference
          data.forEach(ex => results.push({ ...ex }));
        }
        exams = results;
      }
      setAvailableExams(exams);
      if (exams.length === 0) {
        toast('لا توجد امتحانات مقالية');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل في جلب الامتحانات');
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !selectedExam) return;

    try {
      await dispatch(gradeEssaySubmission({
        examId: selectedExam._id,
        userId: selectedSubmission.user._id,
        questionIndex: currentQuestionIndex,
        grade: currentGrade,
        feedback: currentFeedback
      })).unwrap();

      toast.success('تم تصحيح التقديم بنجاح');
      setGradingModal(false);
      
      // Refresh submissions
      dispatch(getEssayExamSubmissions({
        examId: selectedExam._id,
        status: statusFilter,
        sortBy,
        sortOrder
      }));
    } catch (error) {
      toast.error(error || 'فشل في تصحيح التقديم');
    }
  };

  const openGradingModal = (submission, questionIndex) => {
    setSelectedSubmission(submission);
    setCurrentQuestionIndex(questionIndex);
    setCurrentGrade(0);
    setCurrentFeedback('');
    setGradingModal(true);
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submissionList = Array.isArray(submissions) ? submissions : (submissions?.submissions || []);
  // helper to resolve an answer for a given displayed submission and question index
  const resolveUserAnswer = (submission, qIndex) => {
    // Case 1: grouped shape { user, submissions: [...] }
    if (Array.isArray(submission.submissions)) {
      return submission.submissions.find(s => s.questionIndex === qIndex) || null;
    }
    // Case 2: flat shape each entry already represents one question answer
    if (typeof submission.questionIndex === 'number') {
      return submission.questionIndex === qIndex ? submission : null;
    }
    // Case 3: fallback: search among all entries for this user
    const uid = submission.user?._id || submission.user?.id || submission.user;
    if (!uid) return null;
    const match = submissionList.find(s => (s.user?._id || s.user?.id || s.user) === uid && s.questionIndex === qIndex);
    return match || null;
  };
  const filteredSubmissions = submissionList.filter(submission => {
    const matchesSearch = submission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'late': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'تم التقديم';
      case 'graded': return 'تم التصحيح';
      case 'late': return 'متأخر';
      default: return 'غير معروف';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-right">
            لوحة تحكم الامتحانات المقالية
          </h1>

          {/* Exam Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-right">
              اختر الامتحان للمراجعة والتصحيح
            </h2>

            {/* Filters: Stage -> Course -> Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <select
                value={selectedStageId}
                onChange={(e) => {
                  setSelectedStageId(e.target.value);
                  setSelectedCourseId('');
                  setSelectedLessonId('');
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-right"
              >
                <option value="">كل المراحل</option>
                {stages?.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedLessonId('');
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-right"
              >
                <option value="">كل الدورات</option>
                {courses
                  ?.filter(c => !selectedStageId || c.stage?._id === selectedStageId)
                  .map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
              </select>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-right"
              >
                <option value="">كل الدروس</option>
                {selectedCourseId && (() => {
                  const course = courses.find(c => c._id === selectedCourseId);
                  const options = [];
                  (course?.directLessons || []).forEach(l => options.push({ id: l._id, title: l.title }));
                  (course?.units || []).forEach(u => (u.lessons || []).forEach(l => options.push({ id: l._id, title: `${u.title} - ${l.title}` })));
                  return options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                  ));
                })()}
              </select>
              <button
                onClick={handleFetchExamsByLesson}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                جلب الامتحانات
              </button>
            </div>
            {availableExams.length > 0 && (
              <div className="mt-4">
                <div className="text-right text-sm font-medium mb-2">الامتحانات المتاحة ({availableExams.length}):</div>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">العنوان</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">عدد الأسئلة</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">الفتح</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">الإغلاق</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {availableExams.map(exam => (
                        <tr key={exam._id} className={selectedExam?._id === exam._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{exam.title}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{exam.questions?.length || 0}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{exam.openDate ? new Date(exam.openDate).toLocaleString('ar-EG') : '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{exam.closeDate ? new Date(exam.closeDate).toLocaleString('ar-EG') : '-'}</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                              اختيار
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {selectedExam && (
            <>
              {/* Filters and Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم أو البريد الإلكتروني..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">كل الحالات</option>
                    <option value="submitted">تم التقديم</option>
                    <option value="graded">تم التصحيح</option>
                    <option value="late">متأخر</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="submittedAt">تاريخ التقديم</option>
                    <option value="user.fullName">اسم الطالب</option>
                    <option value="status">الحالة</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="desc">تنازلي</option>
                    <option value="asc">تصاعدي</option>
                  </select>
                </div>
              </div>

              {/* Submissions List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-right">
                  التقديمات ({filteredSubmissions.length})
                </h2>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">لا توجد تقديمات</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission, index) => (
                      <div key={submission._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-right">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {submission.user?.fullName || 'غير معروف'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {submission.user?.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              تاريخ التقديم: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                              {getStatusText(submission.status)}
                            </span>
                          </div>
                        </div>

                        {/* Questions and Answers */}
                        <div className="space-y-4">
                          {selectedExam.questions.map((question, qIndex) => {
                            const userSubmission = resolveUserAnswer(submission, qIndex);
                            return (
                              <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-right mb-2">
                                    السؤال {qIndex + 1}: {question.question}
                                  </h4>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                                    الدرجة القصوى: {question.maxGrade}
                                  </div>
                                </div>

                                {userSubmission && (
                                  <div className="space-y-3">
                                    {/* Text Answer */}
                                    {userSubmission.textAnswer && (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1">
                                          الإجابة النصية:
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-right">
                                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                            {userSubmission.textAnswer}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* File Answer */}
                                    {userSubmission.fileAnswer && (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1">
                                          الملف المرفوع:
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => downloadFile(userSubmission.fileAnswer.url, userSubmission.fileAnswer.fileName)}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                          >
                                            <FaDownload />
                                            تحميل {userSubmission.fileAnswer.fileName}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Grade and Feedback */}
                                    <div className="flex items-center justify-between">
                                      <div className="text-right">
                                        {userSubmission.grade != null ? (
                                          <div>
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                              الدرجة: {userSubmission.grade}/{question.maxGrade}
                                            </span>
                                            {userSubmission.feedback && (
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                الملاحظات: {userSubmission.feedback}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-orange-600 dark:text-orange-400">
                                            لم يتم التصحيح بعد
                                          </span>
                                        )}
                                      </div>
                                      
                                      {userSubmission.grade == null && (
                                        <button
                                          onClick={() => openGradingModal(submission, qIndex)}
                                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                          <FaCheck />
                                          تصحيح
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Grading Modal */}
        {gradingModal && selectedSubmission && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" dir="rtl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right">
                  تصحيح السؤال {currentQuestionIndex + 1}
                </h2>
                <button
                  onClick={() => setGradingModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-2">
                    الدرجة (0 - {selectedExam.questions[currentQuestionIndex].maxGrade}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedExam.questions[currentQuestionIndex].maxGrade}
                    value={currentGrade}
                    onChange={(e) => setCurrentGrade(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-2">
                    الملاحظات (اختياري):
                  </label>
                  <textarea
                    value={currentFeedback}
                    onChange={(e) => setCurrentFeedback(e.target.value)}
                    rows="4"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                    placeholder="اكتب ملاحظاتك هنا..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setGradingModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleGradeSubmission}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    حفظ التصحيح
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

export default EssayExamDashboard;
