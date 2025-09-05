import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward, FaRocket, FaGlobe, FaFlask, FaAtom, FaMicroscope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import mr from '../assets/mr.png';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector((state) => state.auth.data);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: FaUsers, number: "5K+", label: "طلاب مسجلين", color: "text-blue-600" },
    { icon: FaFlask, number: "200+", label: "تجربة كيميائية", color: "text-green-600" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-blue-600" },
    { icon: FaAward, number: "15+", label: "سنوات خبرة", color: "text-purple-600" }
  ];

  const handleExploreCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large Blue Shape - Main Background Element */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        {/* Secondary Blue Shapes */}
        <div className="absolute top-20 right-20 w-48 h-48 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-40 w-40 h-40 md:w-80 md:h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        
        {/* Floating Geometric Elements */}
        <div className="absolute top-1/4 right-1/4 animate-float">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full opacity-40"></div>
        </div>
        <div className="absolute top-1/3 left-1/4 animate-float animation-delay-2000">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-cyan-500 rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float animation-delay-4000">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-teal-400 rounded-full opacity-40"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Right Side - Content (RTL) */}
          <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-4 md:space-y-6 text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-medium font-sans">
                🧪
                <span>تعلم الكيمياء بطريقة علمية وممتعة!</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight font-sans">
                <span className="text-blue-600">تعلم مع مستر</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                   محمود عبدالعزيز الكيمياء
                </span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-700 dark:text-gray-300">
                  مدرس في الكيمياء والعلوم المتكاملة!
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                استكشف عالم الكيمياء بطريقة واضحة ومنظمة، حيث تتحول التفاعلات المعقدة إلى تجارب بسيطة ومفهومة!
              </p>

              {/* Additional Description */}
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                سواء كنت تريد فهم أساسيات الكيمياء أو التخصص في العلوم المتكاملة، هنا ستتعلم بطريقة عملية وممتعة.
              </p>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                هل أنت مستعد لبدء رحلة الاكتشاف العلمي؟
              </p>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                ابدأ الآن وتعلم بطريقة تجعلك تفهم وتحب الكيمياء أكثر من أي وقت مضى!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 justify-end">
              {user?.fullName ? (
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  ابدأ التعلم
                </a>
              ) : (
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  سجل الآن
                </a>
              )}
              
              </div>
            </div>
          </div>

          {/* Left Side - Image with Blue Shape Effect (RTL) */}
          <div className={`order-1 lg:order-2 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Blue Shape Container */}
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
              {/* Large Blue Circle Frame - Ring shape with transparent center */}
              <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] border-8 border-blue-600 rounded-full shadow-2xl animate-pulse z-20 bg-transparent"></div>

              {/* Image Container - Positioned in the center */}
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[460px] lg:h-[460px] rounded-full border-4 border-blue-600 shadow-2xl overflow-hidden">
                  <img
                    src={mr} 
                    alt="مستر محمود عبدالعزيز - مدرس في الكيمياء" 
                    className="w-full h-full rounded-full p-2 object-cover drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 "
                  />
                </div>
                
                {/* Floating Elements Around Image */}
                <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-4 h-4 md:w-6 md:h-6 bg-cyan-400 rounded-full animate-bounce z-30"></div>
                <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-3 h-3 md:w-4 md:h-4 bg-blue-400 rounded-full animate-pulse z-30"></div>
                <div className="absolute top-1/2 -left-4 md:-left-8 w-2 h-2 md:w-3 md:h-3 bg-teal-400 rounded-full animate-float z-30"></div>
                <div className="absolute top-1/2 -right-4 md:-right-8 w-2 h-2 md:w-3 md:h-3 bg-indigo-400 rounded-full animate-float animation-delay-2000 z-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute bottom-10 right-10 animate-float">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full opacity-30"></div>
      </div>
      <div className="absolute top-10 left-10 animate-float animation-delay-4000">
        <div className="w-4 h-4 md:w-6 md:h-6 bg-cyan-500 rounded-full opacity-30"></div>
      </div>
    </section>
  );
};

export default AnimatedHero; 