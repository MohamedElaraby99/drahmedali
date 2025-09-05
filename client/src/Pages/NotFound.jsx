import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import NotFoundImg from "../assets/images/not-found.png";
import { FaHome, FaArrowLeft, FaSearch, FaExclamationTriangle, FaGraduationCap, FaBlog, FaQuestionCircle } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-bounce"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-center min-h-[80vh] gap-12">
            
            {/* Left Side - Content */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              {/* Error Badge */}
              <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                <FaExclamationTriangle className="w-4 h-4" />
                <span>الصفحة غير موجودة</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-400 dark:to-indigo-400 mb-6 leading-none">
            404
          </h1>

              {/* Subtitle */}
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                عذراً! الصفحة ضاعت في الفضاء الرقمي
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                يبدو أن الصفحة التي تبحث عنها قد ضاعت في الكون الرقمي. 
                لا تقلق، سنساعدك في العودة إلى الأراضي المألوفة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Go Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  العودة للخلف
                </button>

                {/* Home Button */}
                <button
                  onClick={() => navigate("/")}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <FaHome className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  العودة للرئيسية
                </button>
              </div>

              {/* Search Suggestion */}
              <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaSearch className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    جرب البحث عما تبحث عنه، أو استكشف{" "}
                    <button 
                      onClick={() => navigate("/subjects")}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      المواد الدراسية
                    </button>{" "}
                    و{" "}
                    <button 
                      onClick={() => navigate("/subjects")}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      المواد الدراسية
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Image Container with Glow Effect */}
                <div className="relative p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-400/20 rounded-3xl blur-3xl animate-pulse"></div>
                  <img 
                    src={NotFoundImg} 
                    alt="رسم توضيحي للصفحة غير الموجودة" 
                    className="relative z-10 w-80 h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl animate-float"
                  />
                </div>
                
                {/* Floating Numbers */}
                <div className="absolute top-10 right-10 text-6xl font-black text-blue-200 dark:text-blue-800 animate-bounce">
                  4
                </div>
                <div className="absolute bottom-10 left-10 text-6xl font-black text-blue-200 dark:text-blue-800 animate-bounce" style={{animationDelay: '0.5s'}}>
                  0
                </div>
                <div className="absolute top-1/2 right-5 text-6xl font-black text-indigo-200 dark:text-indigo-800 animate-bounce" style={{animationDelay: '1s'}}>
                  4
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="w-full h-20 text-white dark:text-gray-900"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              fill="currentColor"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              fill="currentColor"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Additional Help Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              هل تحتاج مساعدة في العثور على شيء ما؟
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              منصة التعلم لدينا تحتوي على الكثير من الموارد للاستكشاف. إليك بعض الوجهات الشائعة:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Quick Links */}
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaGraduationCap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  تصفح المواد الدراسية
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {role === "USER" 
                    ? "استكشف دوراتك الشخصية" 
                    : "استكشف كتالوج الكورسات الشامل"
                  }
                </p>
                <button 
                  onClick={() => navigate("/courses")}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                >
                  {role === "USER" ? "عرض كورساتي →" : "عرض جميع الكورسات →"}
                </button>
              </div>
            </div>

            <div className="group p-6 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaBlog className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">اقرأ المدونة</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  اكتشف الرؤى والنصائح التعليمية
                </p>
                <button 
                  onClick={() => navigate("/blogs")}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                >
                  اقرأ المقالات →
                </button>
              </div>
            </div>

            <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">احصل على المساعدة</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  اطرح الأسئلة واحصل على إجابات الخبراء
                </p>
                <button 
                  onClick={() => navigate("/qa")}
                  className="text-green-600 dark:text-green-400 hover:underline font-medium text-sm"
                >
                  اطرح الأسئلة →
          </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default NotFound;
