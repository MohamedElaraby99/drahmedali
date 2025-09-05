import React, { useState } from 'react';
import { FaEnvelope, FaArrowRight, FaRocket, FaGift } from 'react-icons/fa';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative">
          {/* Floating elements */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-10 right-0 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float animation-delay-4000"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <FaRocket className="text-white" />
              <span className="text-white font-semibold">ابق على اطلاع</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              لا تفوت فرصة التعلم أبدًا
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              احصل على تحديثات أسبوعية حول الدورات التدريبية الجديدة والمحتوى الحصري ونصائح التعلم التي يتم إرسالها مباشرة إلى صندوق الوارد الخاص بك.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <FaEnvelope className="text-white" />
                <span className="text-white text-sm">لا رسائل مزعجة، يمكنك إلغاء الاشتراك في أي وقت</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل عنوان بريدك الإلكتروني"
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    اشتراك
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </form>

            {isSubscribed && (
              <div className="mt-6 p-4 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
                <p className="text-green-100 font-semibold">
                  🎉 شكراً لك على الاشتراك! تحقق من بريدك الإلكتروني للتأكيد.
                </p>
              </div>
            )}

            <p className="text-blue-200 text-sm mt-6">
              انضم إلى أكثر من 50,000 متعلم يحصلون على أفضل محتوى تعليمي
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection; 