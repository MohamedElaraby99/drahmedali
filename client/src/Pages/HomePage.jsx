import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import fikraLogo from "../assets/Asset 2@3x.png";
import logo from "../assets/logo.png";
// Lazy load components
const FAQAccordion = lazy(() => import("../Components/FAQAccordion"));
const SubjectCard = lazy(() => import("../Components/SubjectCard"));
const InstructorSection = lazy(() => import("../Components/InstructorSection"));
const NewsletterSection = lazy(() => import("../Components/NewsletterSection"));


import { 
  FaEye, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaArrowRight, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp,
  FaMobile,
  FaDownload,
  FaGooglePlay,
  FaAndroid,
  FaPhone,
  FaWhatsapp,
  FaFacebook,
  FaYoutube,
  FaComments,
  FaTiktok
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
// Using a public URL for now - replace with your actual image URL
const fikraCharacter = "/fikra_character-removebg-preview.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const { courses, featuredCourses, featuredLoading } = useSelector((state) => state.course);

  const { role } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading - fetch data in sequence for better performance
    const loadData = async () => {
      // First, fetch essential data (subjects and courses)
      await Promise.all([
        dispatch(getFeaturedSubjects()),
        dispatch(getFeaturedCourses())
      ]);
      
      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);
    };

    loadData();
    
    // Trigger animations
    setIsVisible(true);

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get Started Handler
  const onGetStarted = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

  // APK Download Handler
  const handleAPKDownload = () => {
    // Create a download link for the APK file
    const link = document.createElement('a');
    link.href = '/downloads/دكتور احمد علي.apk'; // Update this path to your APK file location
    link.download = 'دكتور احمد علي.apk';
    link.target = '_blank';
    
    // Fallback for mobile browsers
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      // For Android devices, open the download directly
      window.open('/downloads/دكتور احمد علي.apk', '_blank');
    } else {
      // For other devices, trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Show download started message
    if (window.toast) {
      window.toast.success('بدأ تحميل التطبيق...');
    }
  };

  // Google Play Store redirect (for future when app is published)
  const handlePlayStoreRedirect = () => {
    // Replace with your actual Google Play Store URL when published
    // Show a "Coming Soon" message instead of redirecting
    if (window.toast) {
      window.toast.info('قريباً على Google Play!');
    } else {
      alert('قريباً على Google Play!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-[#9b172a]" },
    { icon: FaGraduationCap, number: "100+", label: "مادة متاحة", color: "text-[#9b172a]" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-[#9b172a]" },
    { icon: FaAward, number: "50+", label: "مدرس مدرس", color: "text-[#9b172a]" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-[#9b172a]",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: FaLightbulb,
      title: "مواد بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-[#9b172a]",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-[#9b172a]",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-[#9b172a]",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-[#9b172a]" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-[#9b172a]" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-[#9b172a]" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-[#9b172a]" }
  ];

  return (
    <Layout>
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${
        heroVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>

      {/* Featured Courses Section */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '2200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '2400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              المواد المتاحة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من المواد التعليمية المميزة بقيادة خبراء الصناعة
            </p>
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b172a] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل المواد المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(() => {
                console.log('🎯 HomePage rendering featuredCourses from Redux state:', {
                  totalCourses: featuredCourses.length,
                  allCourses: featuredCourses.map(c => ({
                    id: c._id,
                    title: c.title,
                    stage: c.stage,
                    stageName: c.stage?.name,
                    hasStage: !!c.stage,
                    hasName: !!c.stage?.name
                  }))
                });
                return null;
              })()}
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 ease-out group h-80 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${2600 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0">
                    {course.image?.secure_url ? (
                      <img
                        src={generateImageUrl(course.image.secure_url)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback gradient for missing/broken images */}
                    <div className={`w-full h-full bg-gradient-to-br from-[#9b172a] via-[#dc2626] to-[#b91c1c] ${course.image?.secure_url ? 'hidden' : 'flex'} items-center justify-center`}>
                      <FaBookOpen className="text-8xl text-white opacity-40" />
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                  {/* Stage Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-lg border border-white/20">
                      {(() => {
                        const stageName = course.stage?.name;
                        const fallback = 'غير محدد';
                        const result = stageName || fallback;
                        
                        console.log('🏷️ HomePage Stage Debug for course:', course.title, {
                          stage: course.stage,
                          stageName: stageName,
                          stageType: typeof course.stage,
                          hasStage: !!course.stage,
                          hasName: !!stageName,
                          finalResult: result,
                          willShowFallback: result === fallback
                        });
                        
                        if (result === fallback && course.stage) {
                          console.error('🚨 ISSUE: Stage exists but name is missing!', {
                            courseTitle: course.title,
                            stage: course.stage,
                            stageKeys: Object.keys(course.stage || {}),
                            stageName: course.stage?.name,
                            stageNameType: typeof course.stage?.name
                          });
                        }
                        
                        return result;
                      })()}
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    {/* Course Meta Info */}
                    <div className="mb-3 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FaUser className="w-3 h-3" />
                          <span className="font-medium">{course.instructor?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaPlay className="w-3 h-3" />
                          <span className="font-medium">
                            {(course.directLessons?.length || 0) + 
                             (course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0)} درس
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>

                    {/* Subject */}
                    <p className="text-white/80 text-sm mb-4 font-semibold tracking-wide">
                      {course.subject?.title || 'غير محدد'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-center py-3.5 px-5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>شوف التفاصيل</span>
                      </Link>
                      <Link
                        to="/courses"
                        className="p-3.5 bg-[#9b172a]/90 backdrop-blur-md hover:bg-[#9b172a] text-white rounded-xl transition-all duration-300 flex items-center justify-center border border-[#9b172a]/50 hover:border-[#7d1324] hover:scale-105 shadow-lg"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Indicator */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <div className="w-3 h-3 bg-[#9b172a] rounded-full animate-pulse shadow-lg"></div>
                  </div>

                  {/* Bottom gradient for better text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-5"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد مواد متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                سيتم إضافة مواد جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] hover:from-[#7d1324] hover:via-[#7d1324] hover:to-[#7d1324] text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع المواد  </span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - What You'll Find on the Platform */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Red Strip */}
          <div className="w-full h-2 bg-[#9b172a] mb-8"></div>
          
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              إيه اللي هتلاقيه على المنصة؟
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Periodic Follow-up */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '800ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                متابعة دورية وتقييم مستمر
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                تقدمك بيتراجع أسبوعياً، وبنقدملك توصيات حسب احتياجك، ومتابعة أول بأول.
              </p>
            </div>

            {/* Feature 2 - Exam Models */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '900ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaAward className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                نماذج امتحانات بنفس النظام
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                امتحانات تفاعلية بنفس شكل امتحانات الثانوية العامة، عشان تعيش جو الامتحان على المنصة.
              </p>
            </div>

            {/* Feature 3 - Simplified Explanation */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1000ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                شرح مبسط ومركز
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                شرح النظريات والمفاهيم زي ما بتفهمها في حياتك اليومية، بعيد عن التعقيد الأكاديمي.
              </p>
            </div>

            {/* Feature 4 - Focused Review Videos */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1100ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                فيديوهات مراجعة مركزة ليالي الامتحان
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                فيديوهات مراجعة قصيرة مركزة على أهم النقاط اللي محتاج تذاكرها قبل ما تدخل قاعة الامتحان.
              </p>
            </div>

            {/* Feature 5 - Direct Interaction */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1200ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaComments className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تفاعل مباشر مع المدرسين
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                أي استفسار أو نقطة مش واضحة تسأل عنها وإحنا هنرد عليها بشكل فوري، وكده مش هتحس إنك لوحدك.
              </p>
            </div>

            {/* Feature 6 - Organized Study Plan */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1300ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#9b172a] rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                خطة مذاكرة منظمة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                المنصة بتديك جدول مذاكرة جاهز حسب وقتك ومستواك، عشان تذاكر بتركيز وراحة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subjects Section */}
      {/* <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '1400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '1600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              المواد الدراسية
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف موادنا الأكثر شعبية وأعلى تقييماً
            </p>
          </div>

          {featuredSubjects && featuredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSubjects.slice(0, 6).map((subject, index) => (
                <div 
                  key={subject._id} 
                  className={`transform hover:scale-105 transition-all duration-500 ease-out ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${1800 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <Suspense fallback={
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  }>
                    <SubjectCard subject={subject} />
                  </Suspense>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد مواد مميزة بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                عد قريباً لمواد رائعة!
              </p>
            </div>
          )}
        </div>
      </section> */}
      
      {/* Instructor Section */}
      {/* <Suspense fallback={
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <InstructorSection />
      </Suspense> */}
      {/* Latest Blogs Section */}
      <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '3000ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '3200ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              أحدث الأخبار من مدونتنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف الأفكار والنصائح والقصص من مجتمع التعلم لدينا
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog, index) => (
                <div 
                  key={blog._id} 
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${3400 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={generateImageUrl(blog.image?.secure_url)}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = placeholderImages.blog;
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-right">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-right">
                      {blog.excerpt || blog.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes || 0}
                        </span>
                      </div>
                      
                      <Link
                        to={`/blog/${blog._id}`}
                        className="text-[#9b172a] hover:text-[#7d1324] dark:text-[#9b172a] dark:hover:text-[#7d1324] font-medium flex items-center gap-1 group"
                      >
                        اقرأ المزيد
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد منشورات مدونة حتى الآن
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تابعونا قريبا للحصول على محتوى مذهل!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: '3600ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '3800ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                          هل أنت مستعد لبدء رحلة التعلم؟
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              انضم إلى آلاف المتعلمين الذين نجحوا بالفعل في تغيير حياتهم المهنية من خلال موادنا التدريبية التي يقدمها خبراؤنا.
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
          style={{ transitionDelay: '4000ms' }}>
            <Link to="/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] hover:from-[#7d1324] hover:via-[#7d1324] hover:to-[#7d1324] text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ابدأ مجاناً
              </button>
            </Link>
            
            <Link to="/qa">
              <button className="px-8 py-4 bg-[#9b172a] hover:bg-[#7d1324] text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5" />
                اطرح سؤالاً
              </button>
            </Link>
          </div>
        </div>
      </section>


      {/* Mobile App Download Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-[#9b172a]-50 to-[#9b172a]-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                  <FaMobile className="w-4 h-4 ml-2" />
                  <span>تطبيق الجوال متاح الآن</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  حمّل التطبيق
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-[#9b172a]">
                    وتعلم في أي مكان
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  احصل على أفضل تجربة تعليمية مع تطبيقنا المتطور. تعلم في أي وقت ومن أي مكان مع واجهة سهلة الاستخدام ومحتوى تفاعلي.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <FaDownload className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">اتصال بالانترنت  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#9b172a]-100 dark:bg-[#9b172a]-900/20 rounded-full flex items-center justify-center">
                    <FaPlay className="w-4 h-4 text-[#9b172a] dark:text-[#9b172a]-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">فيديوهات عالية الجودة</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#9b172a]-100 dark:bg-[#9b172a]-900/20 rounded-full flex items-center justify-center">
                    <FaBookOpen className="w-4 h-4 text-[#9b172a] dark:text-[#9b172a]-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">مكتبة شاملة</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#9b172a]-100 dark:bg-[#9b172a]-900/20 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-4 h-4 text-[#9b172a] dark:text-[#9b172a]-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">تتبع التقدم</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {/* Direct APK Download Button */}
                <button
                  onClick={handleAPKDownload}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaAndroid className="w-6 h-6 relative z-10 ml-3" />
                  <div className="text-right relative z-10">
                    <div className="text-sm opacity-90">حمّل مباشرة</div>
                    <div className="font-bold">APK ملف</div>
                  </div>
                  <FaDownload className="w-5 h-5 relative z-10 mr-3" />
                </button>

                {/* Google Play Store Button (Future) */}
                                  <button
                    onClick={handlePlayStoreRedirect}
                    className="group relative overflow-hidden bg-gradient-to-r from-[#9b172a] to-[#9b172a] hover:from-[#7d1324] hover:to-[#7d1324] text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7d1324] to-[#7d1324] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaGooglePlay className="w-6 h-6 relative z-10 ml-3" />
                    <div className="text-right relative z-10">
                      <div className="text-sm opacity-90">قريباً على</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </button>
              </div>

              {/* Download Stats */}
              <div className="flex items-center space-x-8 pt-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <FaStar className="w-4 h-4 text-[#9b172a] ml-1" />
                  <span>4.8 تقييم</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaDownload className="w-4 h-4 text-[#9b172a] ml-1" />
                  <span>+10k تحميل</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUsers className="w-4 h-4 text-[#9b172a] ml-1" />
                  <span>مجاني 100%</span>
                </div>
              </div>
            </div>

            {/* Phone Mockup Side */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="bg-gray-50 h-12 flex items-center justify-between px-6 text-sm">
                      <span className="font-medium">9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-1 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-6 h-2 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Content Preview */}
                    <div className="p-6 space-y-6">
                      {/* App Header */}
                      <div className="flex items-center space-x-4" dir="rtl">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#9b172a] to-[#9b172a] rounded-xl flex items-center justify-center">
                          <img src={logo} alt="logo" className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">تطبيق دكتور أحمد</h3>
                          <p className="text-sm text-gray-600">منصة التعلم الذكية</p>
                        </div>
                      </div>

                      {/* Course Cards Preview */}
                      <div className="space-y-4" dir="rtl" >
                        <div className="bg-gradient-to-r from-[#9b172a] to-[#9b172a] rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">الفيزياء</h4>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">جديد</span>
                          </div>
                          <p className="text-sm text-gray-900 mb-3"> الفيزياء </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#9b172a] font-medium">30% مكتمل</span>
                            <button className="bg-[#9b172a] text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-[#9b172a]-50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">علوم متكاملة </h4>
                            <span className="text-xs bg-[#9b172a]-100 text-[#9b172a]-800 px-2 py-1 rounded-full">شائع</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">  علوم متكاملة </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600 font-medium">75% مكتمل</span>
                            <button className="bg-[#9b172a] text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>
                      </div>

                      {/* Features Preview */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">مميزات التطبيق</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">دروس تفاعلية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">اختبارات ذكية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">شهادات معتمدة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#9b172a] to-[#9b172a] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <FaDownload className="text-white text-2xl" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-[#9b172a] to-[#9b172a] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <FaMobile className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static FAQ Section */}
      <section className="py-16 px-4 lg:px-20 bg-gradient-to-br from-gray-50 to-[#9b172a]-50 dark:from-gray-900 dark:to-gray-800" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-right">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-right">
              كل ما تحتاج معرفته عن منصتنا
            </p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mr-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mr-auto"></div>
                </div>
              ))}
            </div>
          }>
            <FAQAccordion />
          </Suspense>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                تواصل معنا
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                لديك أسئلة؟ نحب أن نسمع منك. تواصل معنا من خلال أي من هذه القنوات. نحن هنا لمساعدتك!
              </p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-[#9b172a]-100 dark:bg-[#9b172a]-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaPhone className="text-[#9b172a] dark:text-[#9b172a]-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">الهاتف</h3>
                  <a href="tel:01120920153" className="text-[#9b172a] dark:text-[#9b172a]-400 hover:underline">
                    01120920153
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">واتساب</h3>
                  <a href="https://wa.me/+201120920153" className="text-green-600 dark:text-green-400 hover:underline">
                  +201120920153
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                تابعنا
              </h3>
              <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
                <a
                  href="https://www.facebook.com/profile.php?id=100075431541020&mibextid=ZbWKwL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#9b172a] hover:scale-105"
                  title="Facebook"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaFacebook className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://youtube.com/@dr.ahmedali84?si=duv4lzCvpgCWnmVV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#9b172a] hover:scale-105"
                  title="YouTube"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaYoutube className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    YouTube
                  </span>
                </a>
                <a href="https://www.tiktok.com/@dr.ahmedali.physics?_r=1&_d=dg3efc6k3359b4&sec_uid=MS4wLjABAAAAf3HmNa9tmQXpzXufto73qWhFAuMb7QK1HKizPgYa984_EqTuq2HByBzEeQmp2JY3&share_author_id=6906572971282154501&sharer_language=ar&source=h5_m&u_code=dg3efalj7m1c2m&timestamp=1757077792&user_id=6906572971282154501&sec_user_id=MS4wLjABAAAAf3HmNa9tmQXpzXufto73qWhFAuMb7QK1HKizPgYa984_EqTuq2HByBzEeQmp2JY3&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7528408886655780624&share_link_id=3e1ac305-cc82-4b23-a0f5-c268be509b9c&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb4907&social_share_type=5&enable_checksum=1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#9b172a] hover:scale-105"
                  title="TikTok"
                  >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaTiktok className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    TikTok
                  </span>
                </a>
                <a
                  href="https://wa.me/01120920153"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-500 hover:scale-105"
                  title="WhatsApp"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaWhatsapp className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    WhatsApp
                  </span>
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  لماذا تختار منصتنا؟
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-2xl text-[#9b172a] dark:text-[#9b172a]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">دعم متخصص</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      دعم العملاء على مدار الساعة لمساعدتك في أي أسئلة
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaGlobe className="text-2xl text-[#9b172a] dark:text-[#9b172a]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">مجتمع عالمي</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      تواصل مع المتعلمين من جميع أنحاء العالم
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments className="text-2xl text-[#9b172a] dark:text-[#9b172a]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">استجابة سريعة</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      احصل على إجابات لأسئلتك خلال 24 ساعة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Partner Section */}
        <section className="py-16 bg-white dark:bg-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              شركاؤنا
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              شريكنا التقني: 
              <a
                href="https://fikra.solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#9b172a] hover:text-[#9b172a] dark:text-[#9b172a] dark:hover:text-[#7d1324]"
              >
                Fikra Software
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center">
              <a href="https://fikra.solutions/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              <img
                src={fikraLogo}
                alt="Fikra Software Logo"
                className="h-24 md:h-32 object-contain drop-shadow-lg hover:opacity-90 transition"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-[#9b172a] to-[#9b172a] hover:from-[#7d1324] hover:to-[#7d1324] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+201120920153"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-8 bottom-8 z-50 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group animate-bounce"
        aria-label="Contact us on WhatsApp"
        title="تواصل معنا على واتساب"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </Layout>
  );
}
