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
    { icon: FaUsers, number: "5K+", label: "طلاب مسجلين", color: "text-[#9b172a]" },
    { icon: FaFlask, number: "200+", label: "تجربة كيميائية", color: "text-[#9b172a]" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-[#9b172a]" },
    { icon: FaAward, number: "15+", label: "سنوات خبرة", color: "text-[#9b172a]" }
  ];

  const handleExploreCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large Custom Color Shape - Main Background Element */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{background: 'linear-gradient(to bottom right, #9b172a, #dc2626, #b91c1c)'}}></div>
        
        {/* Secondary Custom Color Shapes */}
        <div className="absolute top-20 right-20 w-48 h-48 md:w-96 md:h-96 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" style={{backgroundColor: '#9b172a'}}></div>
        <div className="absolute bottom-20 left-40 w-40 h-40 md:w-80 md:h-80 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" style={{backgroundColor: '#dc2626'}}></div>
        
        {/* Floating Geometric Elements */}
        <div className="absolute top-1/4 right-1/4 animate-float">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full opacity-40" style={{backgroundColor: '#9b172a'}}></div>
        </div>
        <div className="absolute top-1/3 left-1/4 animate-float animation-delay-2000">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full opacity-40" style={{backgroundColor: '#dc2626'}}></div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-float animation-delay-4000">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full opacity-40" style={{backgroundColor: '#b91c1c'}}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Right Side - Content (RTL) */}
          <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-4 md:space-y-6 text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium font-sans" style={{backgroundColor: 'rgba(155, 23, 42, 0.1)', color: '#9b172a'}}>
                🧪
                <span>تعلم الفيزياء بطريقة علمية وممتعة!</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight font-sans">
                <span style={{color: '#9b172a'}}>تعلم مع </span>
                <br />
                <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(to right, #9b172a, #dc2626, #b91c1c)', WebkitBackgroundClip: 'text'}}>
                   دكتور أحمد علي
                </span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-700 dark:text-gray-300">
                  دكتور الفيزياء والعلوم المتكاملة!
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                استكشف عالم الفيزياء بطريقة واضحة ومنظمة، حيث تتحول التفاعلات المعقدة إلى تجارب بسيطة ومفهومة!
              </p>

              {/* Additional Description */}
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                سواء كنت تريد فهم أساسيات الفيزياء أو التخصص في العلوم المتكاملة، هنا ستتعلم بطريقة عملية وممتعة.
              </p>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                هل أنت مستعد لبدء رحلة الاكتشاف العلمي؟
              </p>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-sans">
                ابدأ الآن وتعلم بطريقة تجعلك تفهم وتحب الفيزياء أكثر من أي وقت مضى!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 justify-end">
              {user?.fullName ? (
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{background: 'linear-gradient(to right, #9b172a, #dc2626)'}}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to right, #7f1d1d, #b91c1c)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to right, #9b172a, #dc2626)'}
                >
                  ابدأ التعلم
                </a>
              ) : (
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{background: 'linear-gradient(to right, #9b172a, #dc2626)'}}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to right, #7f1d1d, #b91c1c)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to right, #9b172a, #dc2626)'}
                >
                  سجل الآن
                </a>
              )}
              
              </div>
            </div>
          </div>

          {/* Left Side - Image with [#9b172a] Shape Effect (RTL) */}
          <div className={`order-1 lg:order-2 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Custom Color Shape Container */}
   
                  <img
                    src={mr} 
                    alt=" دكتور أحمد علي - دكتور في الفيزياء" 
                    className="w-full h-full p-2 object-cover drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 "
                  />
           
          </div>
        </div>
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute bottom-10 right-10 animate-float">
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full opacity-30" style={{backgroundColor: '#9b172a'}}></div>
      </div>
      <div className="absolute top-10 left-10 animate-float animation-delay-4000">
        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full opacity-30" style={{backgroundColor: '#dc2626'}}></div>
      </div>
    </section>
  );
};

export default AnimatedHero; 