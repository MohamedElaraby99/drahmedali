import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../Layout/Layout';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import { 
  purchaseContent, 
  checkPurchaseStatus, 
  getWalletBalance 
} from '../../Redux/Slices/PaymentSlice';
import { PaymentSuccessAlert, PaymentErrorAlert } from '../../Components/ModernAlert';
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
import RemainingDaysLabel from '../../Components/RemainingDaysLabel';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading } = useSelector((state) => state.course);
  const { walletBalance, purchaseStatus, loading: paymentLoading } = useSelector((state) => state.payment);
  const { data: user, isLoggedIn } = useSelector((state) => state.auth);
  const hasAnyPurchase = (() => {
    if (!currentCourse || !purchaseStatus) return false;
    const prefix = `${currentCourse._id}-`;
    return Object.keys(purchaseStatus).some(k => k.startsWith(prefix) && purchaseStatus[k]);
  })();

  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
    }
  }, [dispatch, id]);


  // Fetch wallet balance only when user is logged in
  useEffect(() => {
    if (user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      dispatch(getWalletBalance());
    }
  }, [dispatch, user, isLoggedIn]);

  // Check purchase status for all items when course loads
  useEffect(() => {
    if (currentCourse && user && isLoggedIn) {
      // Check درس
      currentCourse.directLessons?.forEach(lesson => {
        if (lesson.price > 0) {
          dispatch(checkPurchaseStatus({
            courseId: currentCourse._id,
            purchaseType: 'lesson',
            itemId: lesson._id
          }));
        }
      });

      // Check units and their lessons
      currentCourse.units?.forEach(unit => {
        if (unit.price > 0) {
          dispatch(checkPurchaseStatus({
            courseId: currentCourse._id,
            purchaseType: 'unit',
            itemId: unit._id
          }));
        }
        unit.lessons?.forEach(lesson => {
          if (lesson.price > 0) {
            dispatch(checkPurchaseStatus({
              courseId: currentCourse._id,
              purchaseType: 'lesson',
              itemId: lesson._id
            }));
          }
        });
      });
    }
  }, [currentCourse, user, isLoggedIn, dispatch]);

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

  const getTotalLessons = (course) => {
    if (!course) return 0;
    let total = 0;
    if (course.directLessons) {
      total += course.directLessons.length;
    }
    if (course.units) {
      course.units.forEach(unit => {
        if (unit.lessons) {
          total += unit.lessons.length;
        }
      });
    }
    return total;
  };

  const getTotalPrice = (course) => {
    if (!course) return 0;
    let total = 0;
    if (course.directLessons) {
      course.directLessons.forEach(lesson => {
        total += lesson.price || 0;
      });
    }
    if (course.units) {
      course.units.forEach(unit => {
        total += unit.price || 0;
        if (unit.lessons) {
          unit.lessons.forEach(lesson => {
            total += lesson.price || 0;
          });
        }
      });
    }
    return total;
  };

  const getTotalDuration = (course) => {
    return getTotalLessons(course) * 45; // Assuming 45 minutes per lesson
  };



  const isItemPurchased = (purchaseType, itemId) => {
    // Admin users have access to all content
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return true;
    }
    
    const key = `${currentCourse._id}-${purchaseType}-${itemId}`;
    return purchaseStatus[key] || false;
  };

  const handlePurchaseClick = (item, purchaseType) => {
    if (!user || !isLoggedIn) {
      setAlertMessage('يرجى تسجيل الدخول أولاً للوصول إلى هذا المحتوى');
      setShowErrorAlert(true);
      setTimeout(() => {
        navigate('/login', { state: { from: `/courses/${id}` } });
      }, 2000);
      return;
    }
    
    // Admin users have access to all content, no need to purchase
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      setAlertMessage('أنت مدير النظام - لديك صلاحية الوصول لجميع المحتوى');
      setShowSuccessAlert(true);
      return;
    }
    
    if (item.price <= 0) {
      setAlertMessage('هذا المحتوى مجاني');
      setShowSuccessAlert(true);
      return;
    }


    setSelectedItem({ ...item, purchaseType });
    setShowPurchaseModal(true);
  };


  const handlePreviewClick = (item, purchaseType) => {
    // Allow preview for all users (logged in or not)
    console.log('Preview item data:', item);
    console.log('Content counts:', {
      videos: item.videosCount,
      pdfs: item.pdfsCount,
      exams: item.examsCount,
      trainings: item.trainingsCount
    });
    setPreviewItem({ ...item, purchaseType });
    setShowPreviewModal(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedItem) return;

    try {
      await dispatch(purchaseContent({
        courseId: currentCourse._id,
        purchaseType: selectedItem.purchaseType,
        itemId: selectedItem._id
      })).unwrap();
      
      setShowPurchaseModal(false);
      setSelectedItem(null);
      setAlertMessage('تم الشراء بنجاح!');
      setShowSuccessAlert(true);
    } catch (error) {
      setAlertMessage(error.message || 'حدث خطأ أثناء الشراء');
      setShowErrorAlert(true);
    }
  };



  const handleWatchClick = async (item, purchaseType, unitId = null) => {
    // Store lesson info including unit context for the optimized modal
    const lessonInfo = {
      lessonId: item._id,
      courseId: currentCourse._id,
      unitId: unitId, // Will be null for درس
      title: item.title
    };
    setSelectedLesson(lessonInfo);
    setShowLessonModal(true);
  };

  const renderPurchaseButton = (item, purchaseType, showButton = true, unitId = null) => {
    
    // Admin users have access to all content
    if (user?.role === 'ADMIN') {
      return (
        <WatchButton
          item={item}
          purchaseType={purchaseType}
          onWatch={(item, purchaseType) => handleWatchClick(item, purchaseType, unitId)}
          variant="primary"
          showButton={showButton}
        />
      );
    }

    if (item.price <= 0) {
      return (
        <WatchButton
          item={item}
          purchaseType={purchaseType}
          onWatch={(item, purchaseType) => handleWatchClick(item, purchaseType, unitId)}
          variant="primary"
          showButton={showButton}
        />
      );
    }

    if (isItemPurchased(purchaseType, item._id)) {
      return (
        <WatchButton
          item={item}
          purchaseType={purchaseType}
          onWatch={(item, purchaseType) => handleWatchClick(item, purchaseType, unitId)}
          variant="primary"
          showButton={showButton}
        />
      );
    }

    // Don't show purchase buttons if showButton is false
    if (!showButton) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handlePreviewClick(item, purchaseType)}
          className="text-[#9b172a] hover:text-[#7d1324] flex items-center gap-1"
        >
          <FaEye />
          <span>معاينة</span>
        </button>
        <button 
          onClick={() => handlePurchaseClick(item, purchaseType)}
          className="text-[#9b172a] hover:text-[#7d1324] flex items-center gap-1"
          disabled={paymentLoading}
        >
          <FaLock />
          <span>شراء</span>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b172a] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل تفاصيل الدرس...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentCourse) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              الدرس غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              عذراً، الدرس التي تبحث عنها غير موجودة
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9b172a] hover:bg-[#7d1324] text-white rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>العودة للكورسات </span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-[#9b172a] hover:text-[#7d1324] transition-colors text-sm sm:text-base"
          >
            <FaArrowLeft className="text-sm sm:text-base" />
            <span>العودة للكورسات</span>
          </Link>
        </div>

        {/* Course Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Course Hero Section */}
            <div className="relative h-48 sm:h-64 overflow-hidden">
              {currentCourse.image?.secure_url ? (
                <>
                  <img
                    src={generateImageUrl(currentCourse.image?.secure_url)}
                    alt={currentCourse.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = placeholderImages.course;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </>
              ) : (
                <>
                  <div className="w-full h-full bg-gradient-to-br from-[#9b172a] to-[#9b172a]"></div>
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaBookOpen className="text-6xl sm:text-8xl text-white opacity-80" />
                  </div>
                </>
              )}
              
              {/* Fallback gradient for broken images */}
              <div className="hidden w-full h-full bg-gradient-to-br from-[#9b172a] to-[#9b172a]">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBookOpen className="text-8xl text-white opacity-80" />
                </div>
              </div>
              
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white bg-opacity-90 text-gray-800 text-xs sm:text-sm font-medium rounded-full">
                  {currentCourse.stage?.name || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentCourse.title}
                  </h1>
                  
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {currentCourse.description}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-[#9b172a] mb-1">
                        {getTotalLessons(currentCourse)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">درس</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-[#9b172a] mb-1">
                        {currentCourse.units?.length || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">وحدة</div>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#9b172a] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-white text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {currentCourse.instructor?.name || 'غير محدد'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">المدرس</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 lg:sticky lg:top-6">
                                                               {/* Wallet Balance */}
                      {user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                        <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <FaWallet className="text-green-600 text-sm sm:text-base" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">رصيد المحفظة</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {walletBalance} جنيه
                          </div>
                        </div>
                      )}


                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaBookOpen className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">المادة: {currentCourse.subject?.title || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaGraduationCap className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">المرحلة: {currentCourse.stage?.name || 'غير محدد'}</span>
                      </div>
                    </div>

                                         {/* Video Access Information */}
                     {user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                       <div className="space-y-3">
                         <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                               <FaPlay className="text-blue-600 dark:text-blue-400" />
                             </div>
                             <div>
                               <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">أكواد الفيديوهات</h4>
                               <p className="text-xs text-blue-700 dark:text-blue-300">وصول مخصص للفيديوهات</p>
                             </div>
                           </div>
                           <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                             بعض الفيديوهات في هذا الكورس تتطلب أكواد وصول خاصة. عند النقر على فيديو محمي، ستظهر نافذة لإدخال الكود المطلوب.
                           </p>
                           <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800/50 rounded border-l-4 border-blue-400">
                             <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
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
            </div>
                     </div>
         </div>

 
         {/* هيكل الدورة */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaList className="text-lg sm:text-xl" />
                <span>هيكل الدرس</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {/* درس */}
              {currentCourse.directLessons && currentCourse.directLessons.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    المقدمة
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.directLessons.map((lesson, index) => (
                      <div
                        key={lesson._id || index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3 sm:gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-[#9b172a] rounded-full flex items-center justify-center flex-shrink-0">
                            <FaPlay className="text-white text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                          {lesson.price > 0 && (
                            <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                              {lesson.price} جنيه
                            </span>
                          )}
                          <div className="flex-shrink-0">
                            {renderPurchaseButton(lesson, 'lesson')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Units */}
              {currentCourse.units && currentCourse.units.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    الوحدات التعليمية
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {currentCourse.units.map((unit, unitIndex) => (
                      <div
                        key={unit._id || unitIndex}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                      >
                        {/* Unit Header */}
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-3 sm:gap-4"
                          onClick={() => toggleUnit(unit._id || unitIndex)}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-[#9b172a] rounded-full flex items-center justify-center flex-shrink-0">
                              <FaBookOpen className="text-white text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {unit.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-1">
                                {unit.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                            {unit.price > 0 && (
                              <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                                {unit.price} جنيه
                              </span>
                            )}
                            <div className="flex-shrink-0">
                              {expandedUnits.has(unit._id || unitIndex) ? (
                                <FaChevronUp className="text-gray-400" />
                              ) : (
                                <FaChevronDown className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Unit Lessons */}
                        {expandedUnits.has(unit._id || unitIndex) && unit.lessons && (
                          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800">
                            <div className="space-y-3">
                              {unit.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson._id || lessonIndex}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3 sm:gap-4"
                                >
                                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                    <div className="w-6 h-6 bg-[#9b172a] rounded-full flex items-center justify-center flex-shrink-0">
                                      <FaPlay className="text-white text-xs" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {lesson.title}
                                      </h5>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                                    {lesson.price > 0 && (
                                      <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                                        {lesson.price} جنيه
                                      </span>
                                    )}
                                    <div className="flex-shrink-0">
                                      {renderPurchaseButton(lesson, 'lesson', true, unit._id)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!currentCourse.directLessons || currentCourse.directLessons.length === 0) &&
               (!currentCourse.units || currentCourse.units.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    لا توجد محتويات متاحة
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    سيتم إضافة المحتويات قريباً
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  تأكيد الشراء
                </h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {selectedItem.purchaseType === 'lesson' ? 'درس:' : 'وحدة:'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedItem.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {selectedItem.description}
                </p>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">السعر:</span>
                  <span className="font-semibold text-green-600">{selectedItem.price} جنيه</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2">
                  <span className="text-gray-600 dark:text-gray-300">رصيد المحفظة:</span>
                  <span className="font-semibold text-[#9b172a]">{walletBalance} جنيه</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handlePurchaseConfirm}
                  disabled={paymentLoading || walletBalance < selectedItem.price}
                  className="flex-1 px-4 py-2 bg-[#9b172a] text-white rounded-lg hover:bg-[#7d1324] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'جاري الشراء...' : 'تأكيد الشراء'}
                </button>
              </div>
              
              {walletBalance < selectedItem.price && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  رصيد المحفظة غير كافي
                </p>
              )}
            </div>
          </div>
                 )}

         {/* Preview Modal */}
         {showPreviewModal && previewItem && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                   معاينة الدرس
                 </h3>
                 <button
                   onClick={() => setShowPreviewModal(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <FaTimes />
                 </button>
               </div>
               
                               <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {previewItem.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {previewItem.description}
                  </p>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <span className="text-gray-600 dark:text-gray-300">السعر:</span>
                    <span className="font-semibold text-green-600">{previewItem.price} جنيه</span>
                  </div>

                </div>

               {/* Preview Content */}
               <div className="mb-6">
                 <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                   محتوى الدرس
                 </h5>
                 
                 {/* Videos Preview */}
                 {previewItem.videos && previewItem.videos.length > 0 && (
                   <div className="mb-4">
                     <h6 className="font-medium text-gray-900 dark:text-white mb-2">الفيديوهات ({previewItem.videos.length})</h6>
                     <div className="space-y-2">
                       {previewItem.videos.slice(0, 2).map((video, index) => (
                         <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                           <div className="flex items-center gap-2">
                             <FaPlay className="text-[#9b172a]" />
                             <span className="text-sm text-gray-700 dark:text-gray-300">{video.title}</span>
                           </div>
                         </div>
                       ))}
                       {previewItem.videos.length > 2 && (
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           + {previewItem.videos.length - 2} فيديو آخر
                         </p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* PDFs Preview */}
                 {previewItem.pdfs && previewItem.pdfs.length > 0 && (
                   <div className="mb-4">
                     <h6 className="font-medium text-gray-900 dark:text-white mb-2">الملفات PDF ({previewItem.pdfs.length})</h6>
                     <div className="space-y-2">
                       {previewItem.pdfs.slice(0, 2).map((pdf, index) => (
                         <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                           <div className="flex items-center gap-2">
                             <FaBookOpen className="text-red-600" />
                             <span className="text-sm text-gray-700 dark:text-gray-300">{pdf.title}</span>
                           </div>
                         </div>
                       ))}
                       {previewItem.pdfs.length > 2 && (
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           + {previewItem.pdfs.length - 2} ملف آخر
                         </p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Exams Preview */}
                 {previewItem.exams && previewItem.exams.length > 0 && (
                   <div className="mb-4">
                     <h6 className="font-medium text-gray-900 dark:text-white mb-2">الاختبارات ({previewItem.exams.length})</h6>
                     <div className="space-y-2">
                       {previewItem.exams.slice(0, 2).map((exam, index) => (
                         <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                           <div className="flex items-center gap-2">
                             <FaGraduationCap className="text-[#9b172a]" />
                             <span className="text-sm text-gray-700 dark:text-gray-300">{exam.title}</span>
                           </div>
                         </div>
                       ))}
                       {previewItem.exams.length > 2 && (
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           + {previewItem.exams.length - 2} اختبار آخر
                         </p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Trainings Preview */}
                 {previewItem.trainings && previewItem.trainings.length > 0 && (
                   <div className="mb-4">
                     <h6 className="font-medium text-gray-900 dark:text-white mb-2">التدريبات ({previewItem.trainings.length})</h6>
                     <div className="space-y-2">
                       {previewItem.trainings.slice(0, 2).map((training, index) => (
                         <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                           <div className="flex items-center gap-2">
                             <FaStar className="text-green-600" />
                             <span className="text-sm text-gray-700 dark:text-gray-300">{training.title}</span>
                           </div>
                         </div>
                       ))}
                       {previewItem.trainings.length > 2 && (
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           + {previewItem.trainings.length - 2} تدريب آخر
                         </p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Show content summary instead of "Content will be added soon" */}
                 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                   <h6 className="font-medium text-red-900 dark:text-red-100 mb-3">ملخص المحتوى</h6>
                   <div className="grid grid-cols-2 gap-3 text-sm">
                     <div className="flex items-center gap-2">
                       <FaPlay className="text-[#9b172a]" />
                       <span className="text-red-700 dark:text-red-300">
                         {previewItem.videosCount || 0} فيديو
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <FaBookOpen className="text-red-600" />
                       <span className="text-red-700 dark:text-red-300">
                         {previewItem.pdfsCount || 0} ملف PDF
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <FaClipboardList className="text-[#9b172a]" />
                       <span className="text-red-700 dark:text-red-300">
                         {previewItem.examsCount || 0} اختبار
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <FaStar className="text-green-600" />
                       <span className="text-red-700 dark:text-red-300">
                         {previewItem.trainingsCount || 0} تدريب
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
               
                               <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    إغلاق
                  </button>
                  {user && isLoggedIn ? (
                    <button
                      onClick={() => {
                        setShowPreviewModal(false);
                        setSelectedItem({ ...previewItem, purchaseType: previewItem.purchaseType });
                        setShowPurchaseModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-[#9b172a] text-white rounded-lg hover:bg-[#7d1324]"
                    >
                      شراء الدرس
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowPreviewModal(false);
                        setAlertMessage('يرجى تسجيل الدخول أولاً للشراء');
                        setShowErrorAlert(true);
                        setTimeout(() => {
                          navigate('/login', { state: { from: `/courses/${id}` } });
                        }, 2000);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      تسجيل الدخول للشراء
                    </button>
                  )}
                </div>
             </div>
           </div>
         )}

                   {/* Lesson Content Modal */}
          {selectedLesson && (
            <OptimizedLessonContentModal
              isOpen={showLessonModal}
              onClose={() => {
                setShowLessonModal(false);
                setSelectedLesson(null);
              }}
              courseId={selectedLesson.courseId}
              lessonId={selectedLesson.lessonId}
              unitId={selectedLesson.unitId}
              lessonTitle={selectedLesson.title}
            />
          )}

         {/* Modern Alerts */}
         <PaymentSuccessAlert
           isVisible={showSuccessAlert}
           message={alertMessage}
           onClose={() => setShowSuccessAlert(false)}
         />
         
         <PaymentErrorAlert
           isVisible={showErrorAlert}
           message={alertMessage}
           onClose={() => setShowErrorAlert(false)}
         />
       </div>
     </Layout>
   );
 }
