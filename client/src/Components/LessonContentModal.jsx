import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes, FaFilePdf, FaVideo, FaClipboardList, FaDumbbell, FaChevronLeft, FaChevronRight, FaPlay, FaEye, FaDownload } from 'react-icons/fa';
import CustomVideoPlayer from './CustomVideoPlayer';
import PDFViewer from './PDFViewer';
import ExamModal from './Exam/ExamModal';
import useLessonData from '../Helpers/useLessonData';

const LessonContentModal = ({ isOpen, onClose, lesson }) => {
  const { data: userData } = useSelector((state) => state.auth);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [allContent, setAllContent] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  
  // CustomVideoPlayer state
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // PDFViewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  
  // Separate content arrays for each type
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [exams, setExams] = useState([]);
  const [trainings, setTrainings] = useState([]);
  
  // Current indices for each content type
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [currentTrainingIndex, setCurrentTrainingIndex] = useState(0);

  // Separate content items by type
  useEffect(() => {
    if (lesson) {
      const videoContent = [];
      const pdfContent = [];
      const examContent = [];
      const trainingContent = [];
      
      // Add videos
      if (lesson.videos && lesson.videos.length > 0) {
        lesson.videos.forEach((video, idx) => {
          videoContent.push({
            type: 'video',
            data: video,
            originalIndex: idx,
            section: 'videos'
          });
        });
      }
      
      // Add PDFs
      if (lesson.pdfs && lesson.pdfs.length > 0) {
        lesson.pdfs.forEach((pdf, idx) => {
          pdfContent.push({
            type: 'pdf',
            data: pdf,
            originalIndex: idx,
            section: 'pdfs'
          });
        });
      }
      
      // Add exams
      if (lesson.exams && lesson.exams.length > 0) {
        lesson.exams.forEach((exam, idx) => {
          examContent.push({
            type: 'exam',
            data: exam,
            originalIndex: idx,
            section: 'exams'
          });
        });
      }
      
      // Add trainings
      if (lesson.trainings && lesson.trainings.length > 0) {
        lesson.trainings.forEach((training, idx) => {
          trainingContent.push({
            type: 'training',
            data: training,
            originalIndex: idx,
            section: 'trainings'
          });
        });
      }
      
      setVideos(videoContent);
      setPdfs(pdfContent);
      setExams(examContent);
      setTrainings(trainingContent);
      
      // Combine all content for the "all" tab
      const allContent = [...videoContent, ...pdfContent, ...examContent, ...trainingContent];
      setAllContent(allContent);
      
      // Reset all indices
      setCurrentContentIndex(0);
      setCurrentVideoIndex(0);
      setCurrentPdfIndex(0);
      setCurrentExamIndex(0);
      setCurrentTrainingIndex(0);
    }
  }, [lesson]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentContentIndex(prev => 
      prev === 0 ? allContent.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentContentIndex(prev => 
      prev === allContent.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Navigation functions for each content type
  const handleVideoNavigation = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentVideoIndex(prev => prev === videos.length - 1 ? 0 : prev + 1);
    } else {
      setCurrentVideoIndex(prev => prev === 0 ? videos.length - 1 : prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePdfNavigation = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentPdfIndex(prev => prev === pdfs.length - 1 ? 0 : prev + 1);
    } else {
      setCurrentPdfIndex(prev => prev === 0 ? pdfs.length - 1 : prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleExamNavigation = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentExamIndex(prev => prev === exams.length - 1 ? 0 : prev + 1);
    } else {
      setCurrentExamIndex(prev => prev === 0 ? exams.length - 1 : prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTrainingNavigation = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (direction === 'next') {
      setCurrentTrainingIndex(prev => prev === trainings.length - 1 ? 0 : prev + 1);
    } else {
      setCurrentTrainingIndex(prev => prev === 0 ? trainings.length - 1 : prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo className="text-[#9b172a]" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'exam': return <FaClipboardList className="text-[#9b172a]" />;
      case 'training': return <FaDumbbell className="text-green-500" />;
      default: return null;
    }
  };

  const getContentTypeText = (type) => {
    switch (type) {
      case 'video': return 'فيديو';
      case 'pdf': return 'ملف PDF';
      case 'exam': return 'امتحان';
      case 'training': return 'تدريب';
      default: return '';
    }
  };

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setExamModalOpen(true);
  };

  const handleCloseExam = () => {
    setExamModalOpen(false);
    setSelectedExam(null);
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

  // Convert PDF URL to backend URL
  const getPdfUrl = (url) => {
    if (!url) return '';
    
    console.log('Original PDF URL:', url);
    
    // Get the base backend URL from axiosInstance configuration
    const backendBaseUrl = axiosInstance.defaults.baseURL.replace('/api/v1', '');
    
    // If it's already a full URL pointing to frontend, convert it to backend
    if (url.includes('localhost:5173')) {
      const convertedUrl = url.replace('http://localhost:5173', backendBaseUrl);
      console.log('Frontend URL detected, converting to backend:', convertedUrl);
      return convertedUrl;
    }
    
    // If it's already a full URL pointing to backend, return as is
    if (url.startsWith(backendBaseUrl) || url.startsWith('https://api.fikra.solutions')) {
      console.log('Backend URL detected, returning as is:', url);
      return url;
    }
    
    // If it's a relative path, convert to backend URL
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const cleanPath = url.startsWith('/') ? url.substring(1) : url;
      const fullBackendUrl = `${backendBaseUrl}/${cleanPath}`;
      console.log('Converted to backend URL:', fullBackendUrl);
      return fullBackendUrl;
    }
    
    // If it's just a filename, assume it's in uploads/pdfs/
    const fullBackendUrl = `${backendBaseUrl}/uploads/pdfs/${url}`;
    console.log('Assumed PDF path, converted to:', fullBackendUrl);
    return fullBackendUrl;
  };

  // Test PDF URL function
  const testPdfUrl = (url) => {
    const testUrl = getPdfUrl(url);
    console.log('Testing PDF URL:', testUrl);
    
    // Create a test iframe to check if the URL works
    const testIframe = document.createElement('iframe');
    testIframe.style.display = 'none';
    testIframe.src = testUrl;
    testIframe.onload = () => {
      console.log('✅ PDF URL is working!');
      document.body.removeChild(testIframe);
    };
    testIframe.onerror = () => {
      console.log('❌ PDF URL failed to load');
      document.body.removeChild(testIframe);
    };
    document.body.appendChild(testIframe);
  };

  const getCurrentContent = () => {
    switch (selectedTab) {
      case 'video':
        return videos[currentVideoIndex];
      case 'pdf':
        return pdfs[currentPdfIndex];
      case 'exam':
        return exams[currentExamIndex];
      case 'training':
        return trainings[currentTrainingIndex];
      case 'all':
        return allContent[currentContentIndex];
      default:
        return null;
    }
  };

  const getCurrentIndex = () => {
    switch (selectedTab) {
      case 'video':
        return currentVideoIndex;
      case 'pdf':
        return currentPdfIndex;
      case 'exam':
        return currentExamIndex;
      case 'training':
        return currentTrainingIndex;
      case 'all':
        return currentContentIndex;
      default:
        return 0;
    }
  };

  const getTotalCount = () => {
    switch (selectedTab) {
      case 'video':
        return videos.length;
      case 'pdf':
        return pdfs.length;
      case 'exam':
        return exams.length;
      case 'training':
        return trainings.length;
      case 'all':
        return allContent.length;
      default:
        return 0;
    }
  };

  const getTabCount = (type) => {
    switch (type) {
      case 'video':
        return videos.length;
      case 'pdf':
        return pdfs.length;
      case 'exam':
        return exams.length;
      case 'training':
        return trainings.length;
      case 'all':
        return allContent.length;
      default:
        return 0;
    }
  };

  const renderContentItem = (contentItem) => {
    const { type, data } = contentItem;
    
    switch (type) {
      case 'video':
        return (
          <div className="bg-gradient-to-br from-[#9b172a]-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-[#9b172a]-200 dark:border-gray-700">
            <div className="mb-3 sm:mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">{data.description}</div>
            {data.url ? (
              <div className="relative bg-black rounded-md sm:rounded-lg overflow-hidden shadow-lg aspect-video cursor-pointer group">
                {/* YouTube Thumbnail Background */}
                {(() => {
                  const videoId = extractYouTubeVideoId(data.url);
                  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
                  return thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={data.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Thumbnail failed to load, using fallback');
                        e.target.style.display = 'none';
                        // Add fallback background when thumbnail fails
                        e.target.parentElement.style.background = 'linear-gradient(to bottom right, #1f2937, #111827)';
                      }}
                    />
                  ) : (
                    // Fallback background when no thumbnail URL
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  );
                })()}
                
                {/* Play Button Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all duration-200"
                  onClick={() => {
                    // Admin bypass - admins can access any video
                    const userRole = userData?.role;
                    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
                      setCurrentVideo(data);
                      setVideoPlayerOpen(true);
                      return;
                    }
                    
                    setCurrentVideo(data);
                    setVideoPlayerOpen(true);
                  }}
                >
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 sm:p-6 mb-3 sm:mb-4 group-hover:bg-white/30 transition-all duration-200 transform group-hover:scale-110">
                      <FaPlay className="text-white text-2xl sm:text-3xl md:text-4xl ml-1 sm:ml-2" />
                    </div>
                    <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 px-2">{data.title}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">انقر لمشاهدة الفيديو</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-md sm:rounded-lg p-6 sm:p-8 text-center">
                <FaPlay className="text-2xl sm:text-3xl md:text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm sm:text-base">لا يوجد رابط للفيديو</p>
              </div>
            )}
          </div>
        );
        
             case 'pdf':
         return (
           <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-red-200 dark:border-gray-700">
             <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
               <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900 rounded-md sm:rounded-lg">
                 <FaFilePdf className="text-red-600 dark:text-red-400 text-sm sm:text-lg md:text-xl" />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 break-words">{data.title || data.fileName}</div>
                 <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">ملف PDF</div>
               </div>
             </div>
             
             <div className="mb-3 sm:mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
               {data.description || "مستند PDF قابل للعرض والتحميل"}
             </div>
             
             <div className="bg-white dark:bg-gray-800 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-600">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                   <FaFilePdf className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="font-medium text-sm sm:text-base break-words">{data.title || data.fileName}</div>
                     <div className="text-xs sm:text-sm text-gray-500">مستند PDF قابل للعرض</div>
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     setCurrentPdf(data);
                     setPdfViewerOpen(true);
                   }}
                   className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                 >
                   <FaEye />
                   عرض المستند
                 </button>
               </div>
             </div>
           </div>
         );
        
      case 'exam':
        return (
          <div className="bg-gradient-to-br from-[#9b172a]-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-[#9b172a]-200 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-[#9b172a]-100 dark:bg-[#9b172a]-900 rounded-md sm:rounded-lg">
                <FaClipboardList className="text-[#9b172a] dark:text-[#9b172a]-400 text-sm sm:text-lg md:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 break-words">{data.title}</div>
                <div className="text-xs sm:text-sm text-[#9b172a] dark:text-[#9b172a]-400 font-medium">امتحان تفاعلي</div>
              </div>
            </div>
            <div className="mb-3 sm:mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">{data.description}</div>
            <div className="bg-white dark:bg-gray-800 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2">جاهز لبدء الامتحان؟</div>
                  <div className="text-xs sm:text-sm text-gray-500">تأكد من أنك مستعد قبل البدء</div>
                </div>
                <button 
                  onClick={() => handleStartExam(data)}
                  className="bg-[#9b172a] hover:bg-[#9b172a]-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-xs sm:text-sm md:text-base w-full sm:w-auto"
                >
                  بدء الامتحان
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'training':
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-green-200 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900 rounded-md sm:rounded-lg">
                <FaDumbbell className="text-green-600 dark:text-green-400 text-sm sm:text-lg md:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 break-words">{data.title}</div>
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">تدريب</div>
              </div>
            </div>
            <div className="mb-3 sm:mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">{data.description}</div>
            <div className="bg-white dark:bg-gray-800 rounded-md sm:rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2">جاهز للتدريب؟</div>
                  <div className="text-xs sm:text-sm text-gray-500">تدرب على المفاهيم التي تعلمتها</div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-xs sm:text-sm md:text-base w-full sm:w-auto">
                  بدء التدريب
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-1 sm:p-2 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9b172a] to-[#9b172a] text-white p-3 sm:p-4 md:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight break-words">{lesson.title}</h2>
              <p className="text-[#9b172a]-100 mt-1 text-xs sm:text-sm md:text-base leading-relaxed break-words line-clamp-2">{lesson.description}</p>
            </div>
            <button
              className="text-white hover:text-red-200 text-lg sm:text-xl md:text-2xl transition-colors duration-200 flex-shrink-0 p-1"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {allContent.length > 0 ? (
          <div className="p-2 sm:p-3 md:p-6 flex flex-wrap justify-wrap">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-wrap space-y-3 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4" style={{display: 'flex', flexDirection: 'wrap'}}>
              {[
                { key: 'video', label: 'الفيديوهات', icon: <FaVideo style={{fontSize: '24px'}} className="text-[#9b172a]" /> },
                { key: 'pdf', label: 'الملفات', icon: <FaFilePdf style={{fontSize: '24px'}} className="text-red-500" /> },
                { key: 'exam', label: 'الامتحانات', icon: <FaClipboardList style={{fontSize: '24px'}} className="text-[#9b172a]" /> },
                { key: 'training', label: 'التدريبات', icon: <FaDumbbell style={{fontSize: '24px'}} className="text-green-500" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedTab(tab.key);
                  }}
                  className={`flex items-center justify-between px-4 py-4 rounded-lg transition-all duration-200 w-full text-left min-h-[60px] ${
                    selectedTab === tab.key
                      ? 'bg-white dark:bg-gray-700 text-[#9b172a] dark:text-[#9b172a]-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {tab.icon}
                    </div>
                    <span className="font-medium text-base truncate">{tab.label}</span>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full flex-shrink-0">
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {getCurrentContent() && renderContentItem(getCurrentContent())}
            </div>

            {/* Content Preview Dots */}
            {getTotalCount() > 1 && (
              <div className="flex justify-center mt-3 sm:mt-4 gap-1 sm:gap-2">
                {Array.from({ length: getTotalCount() }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsTransitioning(true);
                      if (selectedTab === 'video') setCurrentVideoIndex(index);
                      else if (selectedTab === 'pdf') setCurrentPdfIndex(index);
                      else if (selectedTab === 'exam') setCurrentExamIndex(index);
                      else if (selectedTab === 'training') setCurrentTrainingIndex(index);
                      else setCurrentContentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                      index === getCurrentIndex()
                        ? 'bg-[#9b172a] scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {getTotalCount() === 0 && (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <div className="text-gray-400 text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4">
                  {selectedTab === 'video' && '🎥'}
                  {selectedTab === 'pdf' && '📄'}
                  {selectedTab === 'exam' && '📝'}
                  {selectedTab === 'training' && '💪'}
                  {selectedTab === 'all' && '📚'}
                </div>
                <div className="text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                  لا يوجد {getContentTypeText(selectedTab)} متاح
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 px-4">
                  لم يتم إضافة أي {getContentTypeText(selectedTab)} لهذا الدرس بعد
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-12 text-center">
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
            // Handle next video if available
            const currentIndex = videos.findIndex(v => v.data._id === currentVideo._id);
            if (currentIndex < videos.length - 1) {
              setCurrentVideo(videos[currentIndex + 1].data);
            }
          }}
          onPrevious={() => {
            // Handle previous video if available
            const currentIndex = videos.findIndex(v => v.data._id === currentVideo._id);
            if (currentIndex > 0) {
              setCurrentVideo(videos[currentIndex - 1].data);
            }
          }}
          hasNext={videos.findIndex(v => v.data._id === currentVideo._id) < videos.length - 1}
          hasPrevious={videos.findIndex(v => v.data._id === currentVideo._id) > 0}
          courseTitle={lesson?.title || "Course Video"}
          userName={userName}
          courseId={lesson?.courseId}
          showProgress={true}
          savedProgress={null}
        />
        );
      })()}

             {/* PDF Viewer */}
       {pdfViewerOpen && currentPdf && (() => {
         const pdfUrl = getPdfUrl(currentPdf.url);
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
          courseId={lesson?.courseId}
          lessonId={lesson?._id}
          unitId={lesson?.unitId}
          examType="training"
        />
      )}
    </div>
  );
};

export default LessonContentModal;
