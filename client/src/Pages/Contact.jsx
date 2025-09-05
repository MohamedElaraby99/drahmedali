import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../Helpers/axiosInstance";
import { isEmail } from "../Helpers/regexMatcher";
import InputBox from "../Components/InputBox/InputBox";
import TextArea from "../Components/InputBox/TextArea";
import Layout from "../Layout/Layout";
import { 
  FaPhone, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube,
  FaWhatsapp,
  FaGlobe,
  FaUser,
  FaComments
} from "react-icons/fa";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    if (!userInput.email || !userInput.name || !userInput.message) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }

    if (!isEmail(userInput.email)) {
      toast.error("بريد إلكتروني غير صحيح");
      return;
    }

    setIsLoading(true);
    const loadingMessage = toast.loading("جاري إرسال الرسالة...");
    try {
      const res = await axiosInstance.post("/contact", userInput);
      toast.success(res?.data?.message, { id: loadingMessage });
      setUserInput({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error("فشل إرسال الرسالة! حاول مرة أخرى", { id: loadingMessage });
    } finally {
      setIsLoading(false);
    }
  }

  const contactInfo = {
    phone: "01125800332",
    whatsapp: "01125800332",
    vodafoneCash: "01125800332",
    email: "softwarefikra@gmail.com",
    support: "softwarefikra@gmail.com",
    address: "Mansoura, 18 Street Torel, Egypt",
    website: "https://fikra.solutions/",
    workingHours: "Monday - Friday: 9:00 AM - 6:00 PM"
  };

  const socialMedia = [
    { name: "Facebook", icon: FaFacebook, url: "https://www.facebook.com/people/MrMahmoud-Abdel-Aziz/100070094625467/?mibextid=ZbWKwL", color: "hover:text-blue-600" },
    { name: "YouTube", icon: FaYoutube, url: "https://www.youtube.com/@mahmoudAbdel_Aziz", color: "hover:text-blue-600" },
    { name: "WhatsApp", icon: FaWhatsapp, url: `https://wa.me/${contactInfo.whatsapp.replace('+', '')}`, color: "hover:text-green-500" }
  ];

  return (
    <Layout>
      <section className="min-h-screen py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              تواصل معنا
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              لديك أسئلة؟ نحب أن نسمع منك. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  معلومات الاتصال
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  تواصل معنا من خلال أي من هذه القنوات. نحن هنا لمساعدتك!
                </p>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaPhone className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الهاتف</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">واتساب</h3>
                    <a href={`https://wa.me/${contactInfo.whatsapp}`} className="text-green-600 dark:text-green-400 hover:underline">
                      {contactInfo.whatsapp}
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
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${social.color} hover:scale-105`}
                      title={social.name}
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                        <social.icon className="text-2xl" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {social.name}
                      </span>
                </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                لماذا تختار منصتنا؟
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">دعم متخصص</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    دعم العملاء على مدار الساعة لمساعدتك في أي أسئلة
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaGlobe className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">مجتمع عالمي</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    تواصل مع المتعلمين من جميع أنحاء العالم
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-2xl text-blue-600 dark:text-blue-400" />
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
      </section>
    </Layout>
  );
}
