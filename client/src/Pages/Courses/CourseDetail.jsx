import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../Layout/Layout';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import { getWalletBalance } from '../../Redux/Slices/WalletSlice';
import WatchButton from '../../Components/WatchButton';
import OptimizedLessonContentModal from '../../Components/OptimizedLessonContentModal';
import { 
  FaBookOpen, 
  FaUser, 
  FaStar, 
  FaPlay, 
  FaClock, 
  FaUsers, 
  FaArrowRight, 
  FaArrowLeft,
  FaGraduationCap,
  FaCheckCircle,
  FaEye,
  FaShoppingCart,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaUnlock,
  FaWallet,
  FaTimes,
  FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';
import { generateImageUrl } from '../../utils/fileUtils';
import { placeholderImages } from '../../utils/placeholderImages';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading } = useSelector((state) => state.course);
  const { balance: walletBalance } = useSelector((state) => state.wallet);
  const { data: user, isLoggedIn } = useSelector((state) => state.auth);

  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [modalState, setModalState] = useState({
    isOpen: false,
    courseId: null,
    lessonId: null,
    unitId: null,
    lessonTitle: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getWalletBalance());
    }
  }, [dispatch, isLoggedIn]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const handleWatchClick = (lesson, unitId = null) => {
    setModalState({
      isOpen: true,
      courseId: id,
      lessonId: lesson._id,
      unitId,
      lessonTitle: lesson.title
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      courseId: null,
      lessonId: null,
      unitId: null,
      lessonTitle: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9b172a]"></div>
        </div>
      </Layout>
    );
  }

  if (!currentCourse) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">الكورس غير موجود</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">لم يتم العثور على الكورس المطلوب</p>
            <Link
              to="/courses"
              className="bg-[#9b172a] text-white px-6 py-2 rounded-lg hover:bg-[#8a1324] transition-colors"
            >
              العودة للكورسات
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const courseImageUrl = generateImageUrl(currentCourse.image?.secure_url || currentCourse.thumbnail?.secure_url, 'course');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8" dir="rtl">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Back to Courses Button */}
          <div className="mb-6">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#9b172a] dark:hover:text-[#9b172a] transition-colors"
            >
              <FaArrowRight className="text-xs" />
              العودة للكورسات
            </Link>
          </div>
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row-reverse">
              <div className="w-full lg:w-1/3">
                <img
                  src={courseImageUrl}
                    alt={currentCourse.title}
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-full object-cover"
                    onError={(e) => {
                      e.target.src = placeholderImages.course;
                    }}
                  />
              </div>
              <div className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between mb-4 gap-3">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white leading-tight text-right">
                    {currentCourse.title}
                  </h1>
                  {isLoggedIn && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full self-start sm:self-auto">
                      <span>{walletBalance || 0} جنيه</span>
                      <FaWallet />
                    </div>
                  )}
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-right">
                    {currentCourse.description}
                  </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaUser className="text-[#9b172a] text-lg sm:text-xl mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">المدرب</div>
                    <div className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white truncate">
                      {currentCourse.instructor?.name || currentCourse.instructor?.fullName || 'غير محدد'}
                    </div>
                      </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaGraduationCap className="text-[#9b172a] text-lg sm:text-xl mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">المرحلة</div>
                    <div className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white truncate">
                      {currentCourse.stage?.name || 'جميع المراحل'}
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaBookOpen className="text-[#9b172a] text-lg sm:text-xl mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">الوحدات</div>
                    <div className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">
                      {currentCourse.units?.length || 0}
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaPlay className="text-[#9b172a] text-lg sm:text-xl mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">الدروس</div>
                    <div className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">
                      {currentCourse.directLessons?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Video Access Code Info - Only for regular users */}
                {user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                  <div className="space-y-3">
                    <div className="p-3 sm:p-4 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-800 rounded-lg flex-shrink-0">
                          <FaPlay className="text-blue-600 dark:text-blue-400 text-sm sm:text-base" />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100">أكواد الفيديوهات</h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">وصول مخصص للفيديوهات</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed mb-3 text-right">
                        بعض الفيديوهات في هذا الكورس تتطلب أكواد وصول خاصة. عند النقر على فيديو محمي، ستظهر نافذة لإدخال الكود المطلوب.
                      </p>
                      <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-800/50 rounded border-r-4 border-blue-400">
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 text-right">
                          <li>• انقر على الفيديو المطلوب</li>
                          <li>• أدخل الكود عند ظهور النافذة</li>
                          <li>• استمتع بمشاهدة الفيديو</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Direct Lessons */}
            {currentCourse.directLessons && currentCourse.directLessons.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 text-right">
                    المقدمة
                    <FaList className="text-[#9b172a] text-lg sm:text-xl" />
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {currentCourse.directLessons.map((lesson, index) => (
                      <div
                        key={lesson._id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="min-w-0 flex-1 text-right">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">{lesson.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {lesson.description || 'لا يوجد وصف متاح'}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <WatchButton
                            lesson={lesson}
                            onWatchClick={() => handleWatchClick(lesson)}
                            userRole={user?.role}
                            isLoggedIn={isLoggedIn}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Course Units */}
            {currentCourse.units && currentCourse.units.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                {currentCourse.units.map((unit, unitIndex) => (
                  <div key={unit._id} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
                    <div 
                      className="p-4 sm:p-6 bg-gradient-to-l from-[#9b172a] to-[#8a1324] text-white cursor-pointer hover:from-[#8a1324] hover:to-[#7a1022] transition-all duration-200"
                      onClick={() => toggleUnit(unit._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full text-base sm:text-lg font-bold flex-shrink-0">
                            {unitIndex + 1}
                          </div>
                          <div className="min-w-0 flex-1 text-right">
                            <h2 className="text-lg sm:text-xl font-bold truncate">{unit.title}</h2>
                            <p className="text-white text-opacity-90 text-xs sm:text-sm">
                              {unit.lessons?.length || 0} درس
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          {expandedUnits.has(unit._id) ? <FaChevronUp className="text-lg sm:text-xl" /> : <FaChevronDown className="text-lg sm:text-xl" />}
                        </div>
                      </div>
                    </div>

                    {expandedUnits.has(unit._id) && unit.lessons && (
                      <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          {unit.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson._id} 
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-3 sm:gap-4"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                                  {lessonIndex + 1}
                                </div>
                                <div className="min-w-0 flex-1 text-right">
                                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">{lesson.title}</h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {lesson.description || 'لا يوجد وصف متاح'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <WatchButton
                                  lesson={lesson}
                                  onWatchClick={() => handleWatchClick(lesson, unit._id)}
                                  userRole={user?.role}
                                  isLoggedIn={isLoggedIn}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lesson Modal */}
        <OptimizedLessonContentModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          courseId={modalState.courseId}
          lessonId={modalState.lessonId}
          unitId={modalState.unitId}
          lessonTitle={modalState.lessonTitle}
        />
      </div>
    </Layout>
  );
}