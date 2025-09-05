import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaFilePdf, FaVideo, FaClipboardList, FaDumbbell, FaPlay, FaEye, FaSpinner, FaCheckCircle, FaTrophy, FaClock } from 'react-icons/fa';
import CustomVideoPlayer from './CustomVideoPlayer';
import PDFViewer from './PDFViewer';
import ExamModal from './Exam/ExamModal';
import EssayExamModal from './EssayExamModal';
import useLessonData from '../Helpers/useLessonData';
import { generateFileUrl } from "../utils/fileUtils";
import RemainingDaysLabel from './RemainingDaysLabel';

const OptimizedLessonContentModal = ({ isOpen, onClose, courseId, lessonId, unitId = null, lessonTitle = "درس", courseAccessState = null }) => {
  const { data: userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { lesson, courseInfo, loading, error, refetch } = useLessonData(courseId, lessonId, unitId);
  
  // Check if access has expired
  const isAccessExpired = courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && 
    new Date(courseAccessState.accessEndAt) <= new Date();
  
  const [selectedTab, setSelectedTab] = useState('video');
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentExamType, setCurrentExamType] = useState('exam');
  const [essayExamModalOpen, setEssayExamModalOpen] = useState(false);
  const [selectedEssayExam, setSelectedEssayExam] = useState(null);
  
  // CustomVideoPlayer state
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // PDFViewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);

  // Reset tab when lesson changes
  useEffect(() => {
    if (lesson) {
      // Auto-select first available content type
      if (lesson.videos?.length > 0) setSelectedTab('video');
      else if (lesson.pdfs?.length > 0) setSelectedTab('pdf');
      else if (lesson.exams?.length > 0) setSelectedTab('exam');
      else if (lesson.essayExams?.length > 0) setSelectedTab('essayExam');
      else if (lesson.trainings?.length > 0) setSelectedTab('training');
    }
  }, [lesson]);

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo className="text-blue-500" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'exam': return <FaClipboardList className="text-blue-500" />;
      case 'essayExam': return <FaClipboardList className="text-purple-500" />;
      case 'training': return <FaDumbbell className="text-green-500" />;
      default: return null;
    }
  };

  const getContentTypeText = (type) => {
    switch (type) {
      case 'video': return 'الفيديوهات';
      case 'pdf': return 'الملفات';
      case 'exam': return 'الامتحانات';
      case 'essayExam': return 'الامتحانات المقالية';
      case 'training': return 'التدريبات';
      default: return '';
    }
  };

  const handleStartExam = (examOrTraining, type = 'exam') => {
    setSelectedExam(examOrTraining);
    setCurrentExamType(type);
    setExamModalOpen(true);
  };

  const handleCloseExam = () => {
    setExamModalOpen(false);
    setSelectedExam(null);
    // Refetch lesson data to get updated exam results
    refetch();
  };

  const handleClearExamAttempt = async (examId) => {
    try {
      const response = await fetch(`/api/v1/exams/clear/${courseId}/${lessonId}/${examId}${unitId ? `?unitId=${unitId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refetch lesson data to update the UI
        refetch();
        alert('تم مسح محاولة الامتحان بنجاح');
      } else {
        const errorData = await response.json();
        alert(`فشل في مسح محاولة الامتحان: ${errorData.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error clearing exam attempt:', error);
      alert('حدث خطأ أثناء مسح محاولة الامتحان');
    }
  };

  const handleClearTrainingAttempt = async (trainingId) => {
    try {
      const response = await fetch(`/api/v1/exams/clear/${courseId}/${lessonId}/${trainingId}${unitId ? `?unitId=${unitId}` : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refetch lesson data to update the UI
        refetch();
        alert('تم مسح محاولة التدريب بنجاح');
      } else {
        const errorData = await response.json();
        alert(`فشل في مسح محاولة التدريب: ${errorData.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error clearing training attempt:', error);
      alert('حدث خطأ أثناء مسح محاولة التدريب');
    }
  };

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+).*&si=/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)\?si=/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const match = url.match(patterns[i]);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const convertUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a local file path, generate the proper API URL
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      return generateFileUrl(url);
    }
    
    // If it's just a filename, assume it's in the pdfs folder
    return generateFileUrl(url, 'pdfs');
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setInputUrl(url);
    
    // Convert the URL immediately
    const convertedUrl = convertUrl(url);
    setConvertedUrl(convertedUrl);
    
    console.log('URL Conversion:', {
      input: url,
      converted: convertedUrl
    });
  };

  const renderVideoContent = () => (
    <div className="space-y-4">
      {lesson.videos?.map((video, index) => (
        <div key={video._id} className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-gray-700">
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{video.description}</div>
          {video.publishDate && (
            <div className="mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
              <FaClock />
              <span>تاريخ النشر: {new Date(video.publishDate).toLocaleDateString('ar')} {new Date(video.publishDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {video.url ? (
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg aspect-video cursor-pointer group">
              {/* YouTube Thumbnail Background */}
              {(() => {
                const videoId = extractYouTubeVideoId(video.url);
                const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
                return thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Thumbnail failed to load, using fallback');
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(to bottom right, #1f2937, #111827)';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                );
              })()}
              
              {/* Play Button Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all duration-200"
                                 onClick={() => {
                   // Check if access has expired before opening video
                   if (isAccessExpired) {
                     return;
                   }
                   setCurrentVideo(video);
                   setVideoPlayerOpen(true);
                 }}
              >
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 group-hover:bg-white/30 transition-all duration-200 transform group-hover:scale-110">
                    <FaPlay className="text-white text-4xl ml-2" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-300 text-sm">انقر لمشاهدة الفيديو</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center">
              <FaPlay className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">لا يوجد رابط للفيديو</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPdfContent = () => (
    <div className="space-y-4">
      {lesson.pdfs?.map((pdf, index) => (
        <div key={pdf._id} className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-red-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FaFilePdf className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{pdf.title || pdf.fileName}</div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">ملف PDF</div>
              {pdf.publishDate && (
                <div className="mt-1 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs">
                  <FaClock />
                  <span>تاريخ النشر: {new Date(pdf.publishDate).toLocaleDateString('ar')} {new Date(pdf.publishDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaFilePdf className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base break-words">{pdf.title || pdf.fileName}</div>
                  <div className="text-xs sm:text-sm text-gray-500">مستند PDF قابل للعرض</div>
                </div>
              </div>
                             <button
                 onClick={() => {
                   // Check if access has expired before opening PDF
                   if (isAccessExpired) {
                     return;
                   }
                   setCurrentPdf(pdf);
                   setPdfViewerOpen(true);
                 }}
                 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                 disabled={isAccessExpired}
               >
                 <FaEye />
                 عرض المستند
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExamContent = () => (
    <div className="space-y-4">
      {lesson.exams?.map((exam, index) => (
        <div key={exam._id} className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FaClipboardList className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{exam.title}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">امتحان </div>
            </div>
            {exam.userResult?.hasTaken && (
              <div className="text-right">
                <div className="text-sm text-gray-500">النتيجة السابقة</div>
                <div className="text-lg font-bold text-green-600">{exam.userResult.percentage}%</div>
              </div>
            )}
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{exam.description}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                <div className="text-lg font-semibold">{exam.questionsCount}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                <div className="text-lg font-semibold">{exam.timeLimit} دقيقة</div>
              </div>
            </div>
            
            {/* Date Information */}
            {(exam.openDate || exam.closeDate) && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">معلومات التواريخ:</div>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                  {exam.openDate && (
                    <div>يفتح في: {new Date(exam.openDate).toLocaleDateString('ar')} {new Date(exam.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                  {exam.closeDate && (
                    <div>يغلق في: {new Date(exam.closeDate).toLocaleDateString('ar')} {new Date(exam.closeDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center">
              {exam.userResult?.hasTaken ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FaCheckCircle />
                    <span>تم إنجاز الامتحان</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    النتيجة: {exam.userResult.score}/{exam.userResult.totalQuestions} ({exam.userResult.percentage}%)
                  </div>
                  <div className="text-xs text-gray-500">
                    تاريخ الامتحان: {new Date(exam.userResult.takenAt).toLocaleDateString('ar')}
                  </div>
                </div>
              ) : exam.examStatus === 'not_open' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <FaClock />
                    <span>الامتحان غير متاح بعد</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exam.statusMessage}
                  </div>
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                  >
                    الامتحان غير متاح
                  </button>
                </div>
              ) : exam.examStatus === 'closed' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <FaTimes />
                    <span>الامتحان مغلق</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exam.statusMessage}
                  </div>
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                  >
                    الامتحان مغلق
                  </button>
                </div>
              ) : (
                                 <button 
                   onClick={() => {
                     // Check if access has expired before starting exam
                     if (isAccessExpired) {
                       return;
                     }
                     handleStartExam(exam, 'exam');
                   }}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                   disabled={isAccessExpired}
                 >
                   بدء الامتحان
                 </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTrainingContent = () => (
    <div className="space-y-4">
      {lesson.trainings?.map((training, index) => (
        <div key={training._id} className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FaDumbbell className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{training.title}</div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">تدريب </div>
            </div>
            {training.attemptCount > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500">عدد المحاولات</div>
                <div className="text-lg font-bold text-green-600">{training.attemptCount}</div>
              </div>
            )}
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{training.description}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                <div className="text-lg font-semibold">{training.questionsCount}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                <div className="text-lg font-semibold">{training.timeLimit} دقيقة</div>
              </div>
            </div>
            
            {/* Date Information */}
            {(training.openDate || training.closeDate) && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">معلومات التواريخ:</div>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                  {training.openDate && (
                    <div>يفتح في: {new Date(training.openDate).toLocaleDateString('ar')} {new Date(training.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                </div>
              </div>
            )}
            
            {training.userResults.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">أفضل نتيجة:</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.max(...training.userResults.map(r => r.percentage))}%
                </div>
                <button 
                  onClick={() => {
                    // Check if access has expired before clearing training attempt
                    if (isAccessExpired) {
                      return;
                    }
                    handleClearTrainingAttempt(training._id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors mt-2"
                  title="مسح محاولات التدريب"
                  disabled={isAccessExpired}
                >
                  مسح المحاولات
                </button>
              </div>
            )}
            
            <div className="text-center">
              {training.trainingStatus === 'not_open' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <FaClock />
                    <span>التدريب غير متاح بعد</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {training.statusMessage}
                  </div>
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed"
                  >
                    التدريب غير متاح
                  </button>
                </div>
              ) : (
                                 <button 
                   onClick={() => {
                     // Check if access has expired before starting training
                     if (isAccessExpired) {
                       return;
                     }
                     handleStartExam(training, 'training');
                   }}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                   disabled={isAccessExpired}
                 >
                   {training.attemptCount > 0 ? 'إعادة التدريب' : 'بدء التدريب'}
                 </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEssayExamContent = () => (
    <div className="space-y-4">
      {lesson.essayExams?.map((exam, index) => (
        <div key={exam._id} className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FaClipboardList className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{exam.title}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">امتحان مقالي</div>
            </div>
            {(() => {
              const userId = userData?._id?.toString();
              const userSubs = (exam.submissions || []).filter(s => (s.user?._id || s.user)?.toString() === userId);
              const hasSubmitted = userSubs.length > 0;
              const totalQuestions = exam.questions?.length || 0;
              const gradedCount = userSubs.filter(s => s.grade != null || s.status === 'graded').length;
              const fullyGraded = hasSubmitted && totalQuestions > 0 && gradedCount >= totalQuestions;
              if (!hasSubmitted) return null;
              return (
                <div className="text-right">
                  <div className={`text-sm ${fullyGraded ? 'text-green-600' : 'text-gray-500'}`}>{fullyGraded ? 'تم التصحيح' : 'تم التقديم'}</div>
                  <div className="text-lg font-bold text-green-600">✓</div>
                </div>
              );
            })()}
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{exam.description}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                <div className="text-lg font-semibold">{exam.questions?.length || 0}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                <div className="text-lg font-semibold">{exam.timeLimit || 60} دقيقة</div>
              </div>
            </div>
            
            {/* Date Information */}
            {(exam.openDate || exam.closeDate) && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">معلومات التواريخ:</div>
                <div className="space-y-1 text-xs text-purple-700 dark:text-purple-400">
                  {exam.openDate && (
                    <div>يفتح في: {new Date(exam.openDate).toLocaleDateString('ar')} {new Date(exam.openDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                  {exam.closeDate && (
                    <div>يغلق في: {new Date(exam.closeDate).toLocaleDateString('ar')} {new Date(exam.closeDate).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center">
              {(() => {
                const userId = userData?._id?.toString();
                const userSubs = (exam.submissions || []).filter(s => (s.user?._id || s.user)?.toString() === userId);
                const hasSubmitted = userSubs.length > 0;
                const totalQuestions = exam.questions?.length || 0;
                const gradedCount = userSubs.filter(s => s.grade != null || s.status === 'graded').length;
                const fullyGraded = hasSubmitted && totalQuestions > 0 && gradedCount >= totalQuestions;

                if (hasSubmitted) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FaCheckCircle />
                        <span>{fullyGraded ? 'تم تصحيح الامتحان' : 'تم تقديم الامتحان'}</span>
                      </div>
                      {fullyGraded ? (
                        (() => {
                          const totalGrade = userSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0);
                          const maxTotalGrade = (exam.questions || []).reduce((sum, q) => sum + (q.maxGrade || 0), 0);
                          const feedbackItems = userSubs
                            .map((s) => {
                              const question = (exam.questions || [])[s.questionIndex] || {};
                              return {
                                idx: s.questionIndex,
                                text: s.feedback || '',
                                grade: s.grade ?? null,
                                max: question.maxGrade || 0
                              };
                            })
                            .filter(f => f.text || f.grade != null);
                          return (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                درجتك: {totalGrade} / {maxTotalGrade}
                              </div>
                              {feedbackItems.length > 0 && (
                                <div className="text-right bg-purple-50 dark:bg-gray-700/40 rounded-md p-3">
                                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">ملاحظات المدرس:</div>
                                  <ul className="space-y-1">
                                    {feedbackItems.sort((a,b)=>a.idx-b.idx).map((f) => (
                                      <li key={f.idx} className="text-sm text-gray-700 dark:text-gray-200">
                                        <span className="font-medium">السؤال {f.idx + 1}:</span>
                                        {f.text ? <span> {f.text}</span> : null}
                                        {f.grade != null && (
                                          <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">({f.grade} / {f.max})</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-sm text-gray-600">انتظر تقييم المدرس</div>
                      )}
                    </div>
                  );
                }

                if (exam.openDate && new Date(exam.openDate) > new Date()) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <FaClock />
                        <span>الامتحان غير متاح بعد</span>
                      </div>
                      <button disabled className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed">
                        الامتحان غير متاح
                      </button>
                    </div>
                  );
                }

                if (exam.closeDate && new Date(exam.closeDate) < new Date()) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <FaTimes />
                        <span>الامتحان مغلق</span>
                      </div>
                      <button disabled className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto cursor-not-allowed">
                        الامتحان مغلق
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      if (isAccessExpired) return;
                      setSelectedEssayExam(exam);
                      setEssayExamModalOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                    disabled={isAccessExpired}
                  >
                    بدء الامتحان المقالي
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  // Block access if code-based access has expired
  if (isAccessExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">انتهت صلاحية الوصول</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            انتهت صلاحية الوصول عبر الكود. يرجى إعادة تفعيل كود جديد أو شراء المحتوى.
          </p>
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">جاري تحميل محتوى الدرس...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    // Debug: Log the error to see what we're getting
    console.log('Error received:', error);
    
    // Check if it's an authentication error - be more comprehensive
    const isAuthError = error.includes('تسجيل الدخول') || 
                       error.includes('لازم تسجل دخول') ||
                       error.includes('Unauthorized') || 
                       error.includes('401') ||
                       error.includes('Authentication') ||
                       error.includes('Token') ||
                       error.includes('Login required') ||
                       error.toLowerCase().includes('unauthorized');
    
    console.log('Is Auth Error:', isAuthError);
    
    const handleRetry = () => {
      if (isAuthError) {
        onClose(); // Close the modal first
        navigate('/login'); // Navigate to login page
      } else {
        refetch(); // Normal retry
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">مشكلة في التحميل</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={handleRetry} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">
                {isAuthError ? 'تسجيل الدخول' : 'إعادة المحاولة'}
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg">إغلاق</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight break-words">{lesson.title}</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base leading-relaxed break-words">{lesson.description}</p>
              {courseInfo && (
                <p className="text-blue-200 mt-1 text-xs sm:text-sm">{courseInfo.title}</p>
              )}
              
                             {/* Show remaining days if user has code-based access */}
               {courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
                 <div className="mt-3">
                   <RemainingDaysLabel 
                     accessEndAt={courseAccessState.accessEndAt}
                     className="bg-white/20 text-white border-white/30"
                     showExpiredMessage={!courseAccessState?.hasAccess}
                   />
                 </div>
               )}
            </div>
            <button
              className="text-white hover:text-red-200 text-xl sm:text-2xl transition-colors duration-200 flex-shrink-0 p-1"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 overflow-x-auto">
            {[
              { key: 'video', label: 'الفيديوهات', icon: <FaVideo className="text-blue-500" />, count: lesson.videos?.length || 0 },
              { key: 'pdf', label: 'الملفات', icon: <FaFilePdf className="text-red-500" />, count: lesson.pdfs?.length || 0 },
              { key: 'exam', label: 'الامتحانات', icon: <FaClipboardList className="text-blue-500" />, count: lesson.exams?.length || 0 },
              { key: 'essayExam', label: 'الامتحانات المقالية', icon: <FaClipboardList className="text-purple-500" />, count: lesson.essayExams?.length || 0 },
              { key: 'training', label: 'التدريبات', icon: <FaDumbbell className="text-green-500" />, count: lesson.trainings?.length || 0 }
            ].filter(tab => tab.count > 0).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 mx-1 flex-shrink-0 ${
                  selectedTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 sm:px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content Display */}
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedTab === 'video' && renderVideoContent()}
            {selectedTab === 'pdf' && renderPdfContent()}
            {selectedTab === 'exam' && renderExamContent()}
            {selectedTab === 'essayExam' && renderEssayExamContent()}
            {selectedTab === 'training' && renderTrainingContent()}
          </div>

          {/* Empty State */}
          {(!lesson.videos?.length && !lesson.pdfs?.length && !lesson.exams?.length && !lesson.essayExams?.length && !lesson.trainings?.length) && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📚</div>
              <div className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                لا يوجد محتوى متاح
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                لم يتم إضافة أي محتوى لهذا الدرس بعد
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Video Player */}
      {videoPlayerOpen && currentVideo && (() => {
        const userName = userData?.fullName || userData?.name || "User";
        return (
          <CustomVideoPlayer
            video={currentVideo}
            isOpen={videoPlayerOpen}
            onClose={() => {
              setVideoPlayerOpen(false);
              setCurrentVideo(null);
            }}
            onNext={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex < lesson.videos.length - 1) {
                setCurrentVideo(lesson.videos[currentIndex + 1]);
              }
            }}
            onPrevious={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex > 0) {
                setCurrentVideo(lesson.videos[currentIndex - 1]);
              }
            }}
            hasNext={lesson.videos.findIndex(v => v._id === currentVideo._id) < lesson.videos.length - 1}
            hasPrevious={lesson.videos.findIndex(v => v._id === currentVideo._id) > 0}
            courseTitle={lesson?.title || "Course Video"}
            userName={userName}
            courseId={courseId}
            showProgress={true}
            savedProgress={null}
          />
        );
      })()}

      {/* PDF Viewer */}
      {pdfViewerOpen && currentPdf && (() => {
        const pdfUrl = convertUrl(currentPdf.url);
        console.log('🔍 PDF Debug Info:');
        console.log('Current PDF data:', currentPdf);
        console.log('Original URL:', currentPdf.url);
        console.log('Processed URL:', pdfUrl);
        return (
          <PDFViewer
            pdfUrl={pdfUrl}
            title={currentPdf.title || currentPdf.fileName || "PDF Document"}
            isOpen={pdfViewerOpen}
            onClose={() => {
              setPdfViewerOpen(false);
              setCurrentPdf(null);
            }}
          />
        );
      })()}

      {/* Exam Modal */}
      {examModalOpen && selectedExam && (
        <ExamModal
          isOpen={examModalOpen}
          onClose={handleCloseExam}
          exam={selectedExam}
          courseId={courseId}
          lessonId={lessonId}
          unitId={unitId}
          examType={currentExamType}
        />
      )}

      {/* Essay Exam Modal */}
      {essayExamModalOpen && selectedEssayExam && (
        <EssayExamModal
          examId={selectedEssayExam._id}
          onClose={() => {
            setEssayExamModalOpen(false);
            setSelectedEssayExam(null);
            refetch(); // Refresh lesson data to show updated submission status
          }}
          onSuccess={() => {
            setEssayExamModalOpen(false);
            setSelectedEssayExam(null);
            refetch(); // Refresh lesson data to show updated submission status
          }}
        />
      )}
    </div>
  );
};

export default OptimizedLessonContentModal;
