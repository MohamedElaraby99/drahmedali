import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitEssayExam, getEssayExamById } from '../Redux/Slices/EssayExamSlice';
import { toast } from 'react-hot-toast';
import { FaTimes, FaClock, FaFileUpload, FaSave } from 'react-icons/fa';
import { generateImageUrl } from '../utils/fileUtils';
import { axiosInstance } from '../Helpers/axiosInstance';

const EssayExamModal = ({ examId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentExam, loading, error } = useSelector(state => state.essayExam);
  const { userData } = useSelector(state => state.auth);
  
  const [answers, setAnswers] = useState([]);
  const [fileUploads, setFileUploads] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (examId) {
      dispatch(getEssayExamById(examId));
    }
  }, [examId, dispatch]);

  useEffect(() => {
    if (currentExam?.questions) {
      // Initialize answers array
      const initialAnswers = currentExam.questions.map((_, index) => ({
        questionIndex: index,
        textAnswer: '',
        fileAnswer: null
      }));
      setAnswers(initialAnswers);
      
      // Set time limit
      setTimeLeft((currentExam?.timeLimit || 60) * 60); // Convert to seconds
    }
  }, [currentExam]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto submit when time runs out
            if (currentExam?.questions && currentExam.questions.length > 0) {
              handleSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, currentExam]);

  const startExam = () => {
    if (currentExam?.questions && currentExam.questions.length > 0) {
      setExamStarted(true);
    }
  };

  const handleTextAnswerChange = (questionIndex, value) => {
    if (!currentExam?.questions) return;
    
    setAnswers(prev => prev.map((answer, index) => 
      index === questionIndex ? { ...answer, textAnswer: value } : answer
    ));
  };

  const handleFileUpload = async (questionIndex, file) => {
    if (!file || !currentExam?.questions) return;

    const question = currentExam.questions[questionIndex];
    if (!question) return;
    
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!question.allowedFileTypes?.includes(fileExtension)) {
      toast.error(`نوع الملف غير مسموح. الأنواع المسموحة: ${question.allowedFileTypes?.join(', ') || 'غير محدد'}`);
      return;
    }

    // Validate file size (convert MB to bytes)
    const maxSizeBytes = (question.maxFileSize || 10) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`حجم الملف كبير جداً. الحد الأقصى: ${question.maxFileSize || 10} ميجابايت`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      const data = response.data;
      if (data?.success) {
        setAnswers(prev => prev.map((answer, index) => 
          index === questionIndex ? { 
            ...answer, 
            fileAnswer: {
              url: data.url,
              fileName: data.fileName || file.name,
              fileType: data.mimeType || fileExtension
            }
          } : answer
        ));
        toast.success('تم رفع الملف بنجاح');
      } else {
        toast.error(data?.message || 'فشل في رفع الملف');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في رفع الملف');
    }
  };

  const handleSubmit = async () => {
    if (!examStarted || !currentExam?.questions) return;

    // Validate that all required questions are answered
    const unansweredQuestions = answers.filter(answer => 
      !answer?.textAnswer?.trim() && !answer?.fileAnswer
    );

    if (unansweredQuestions.length > 0) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitEssayExam({ examId, answers })).unwrap();
      toast.success('تم تسليم الامتحان بنجاح');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'فشل في تسليم الامتحان');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!currentExam) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-right">
            {currentExam?.title || 'امتحان مقالي'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">
            <FaTimes />
          </button>
        </div>

        {currentExam?.description && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-right">{currentExam.description}</p>
          </div>
        )}

        {!examStarted ? (
          <div className="text-center space-y-4">
            <div className="text-lg text-gray-700 dark:text-gray-300">
              <p>مدة الامتحان: {currentExam?.timeLimit || 60} دقيقة</p>
              <p>عدد الأسئلة: {currentExam?.questions?.length || 0}</p>
              {currentExam?.allowLateSubmission && (
                <p className="text-orange-600">السماح بالتسليم المتأخر مع خصم {currentExam?.lateSubmissionPenalty || 10}%</p>
              )}
            </div>
            {currentExam?.questions && currentExam.questions.length > 0 ? (
              <button
                onClick={startExam}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                بدء الامتحان
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-500">لا يمكن بدء الامتحان - لا توجد أسئلة متاحة</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Timer */}
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                <FaClock />
                <span className="font-bold text-lg">
                  الوقت المتبقي: {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Questions */}
            {currentExam?.questions && currentExam.questions.length > 0 ? (
              <div className="space-y-8">
                {currentExam.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-right mb-2">
                        السؤال {index + 1}: {question.question}
                      </h3>
                      {question.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-right mb-2">
                          {question.description}
                        </p>
                      )}
                      {question.image && (
                        <img 
                          src={generateImageUrl(question.image)} 
                          alt="Question" 
                          className="max-w-full h-auto rounded-lg mb-4"
                        />
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                        الدرجة القصوى: {question.maxGrade || 100}
                      </div>
                    </div>

                    {/* Text Answer */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-2">
                        إجابتك النصية:
                      </label>
                                          <textarea
                      value={answers[index]?.textAnswer || ''}
                      onChange={(e) => handleTextAnswerChange(index, e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right resize-vertical"
                      rows="6"
                      placeholder="اكتب إجابتك هنا..."
                      disabled={!currentExam?.questions}
                    />
                    </div>

                    {/* File Upload */}
                    {question.allowFileUpload && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-2">
                          رفع ملف (اختياري):
                        </label>
                        <div className="flex items-center gap-2">
                                                  <input
                          type="file"
                          accept={question.allowedFileTypes?.map(type => `.${type}`).join(',') || ''}
                          onChange={(e) => handleFileUpload(index, e.target.files[0])}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right"
                          disabled={!currentExam?.questions}
                        />
                          <FaFileUpload className="text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                          الأنواع المسموحة: {question.allowedFileTypes?.join(', ') || 'غير محدد'} | 
                          الحد الأقصى: {question.maxFileSize || 10} ميجابايت
                        </div>
                                              {answers[index]?.fileAnswer && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                          <p className="text-sm text-green-700 dark:text-green-300 text-right">
                            تم رفع الملف: {answers[index]?.fileAnswer?.fileName || 'ملف'}
                          </p>
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">لا توجد أسئلة متاحة لهذا الامتحان</p>
              </div>
            )}

            {/* Submit Button */}
            {currentExam?.questions && currentExam.questions.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || timeLeft === 0}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaSave />
                  {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EssayExamModal;
