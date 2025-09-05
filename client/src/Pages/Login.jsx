import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { login } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaUserTie, FaSignInAlt } from "react-icons/fa";
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo from "../assets/logo.png";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('phone'); // 'phone' or 'email'
  const [loginData, setLoginData] = useState({
    phoneNumber: "",
    email: "",
    password: "",
  });

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    // Remove spaces from specific fields for easier login
    const fieldsToCleanSpaces = ['email', 'password', 'phoneNumber'];
    const cleanValue = fieldsToCleanSpaces.includes(name) ? value.replace(/\s+/g, '') : value;
    
    setLoginData({
      ...loginData,
      [name]: cleanValue,
    });
  }

  async function onLogin(event) {
    event.preventDefault();
    
    // Validate based on login type
    if (loginType === 'phone') {
      if (!loginData.phoneNumber || !loginData.password) {
        toast.error("املا كل البيانات المطلوبة");
        return;
      }
      // Validate Egyptian phone number format
      if (!loginData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("رقم التليفون ده مش صح - اكتب رقم مصري صح");
        return;
      }
    } else {
      if (!loginData.email || !loginData.password) {
        toast.error("املا كل البيانات المطلوبة");
        return;
      }
      // Validate email format
      if (!loginData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        toast.error("الإيميل ده مش صح - اكتبه صح");
        return;
      }
    }

    setIsLoading(true);
    
    // Generate device information for fingerprinting
    const deviceInfo = {
      platform: getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      additionalInfo: {
        browser: getBrowserInfo().browser,
        browserVersion: getBrowserInfo().version,
        os: getOperatingSystem(),
        language: navigator.language,
        colorDepth: screen.colorDepth,
        touchSupport: 'ontouchstart' in window,
      }
    };

    const Data = { 
      password: loginData.password,
      deviceInfo: deviceInfo
    };

    // Add identifier based on login type
    if (loginType === 'phone') {
      Data.phoneNumber = loginData.phoneNumber;
    } else {
      Data.email = loginData.email;
    }

    // dispatch login action
    const response = await dispatch(login(Data));
    if (response?.payload?.success) {
      setLoginData({
        phoneNumber: "",
        email: "",
        password: "",
      });
      navigate("/");
    }
    setIsLoading(false);
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#9b172a]-50 via-white to-[#9b172a]-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Logo */}
          <div className="text-center">
            {/* Modern Logo Container */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b172a]-400 via-[#9b172a] to-[#9b172a] rounded-full blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl border-4 border-[#9b172a]-200 dark:border-[#9b172a]-700 transform hover:scale-110 transition-all duration-500">
                  <img 
                    src={logo} 
                    alt="منصة  دكتور أحمد Logo" 
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#9b172a]-400 rounded-full animate-bounce z-10 shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#9b172a]-400 rounded-full animate-pulse z-10 shadow-lg"></div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-[#9b172a] to-[#9b172a] bg-clip-text text-transparent">
              أهلاً وسهلاً
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              ادخل على حسابك عشان تكمل تعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#9b172a]-200/50 dark:border-[#9b172a]-700/50 transform hover:scale-[1.02] transition-all duration-500">
            <form onSubmit={onLogin} className="space-y-6">
              {/* Login Type Toggle */}
              <div className="w-full">
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => setLoginType('phone')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm sm:text-base transition-all duration-200 ${loginType === 'phone' ? 'bg-white dark:bg-gray-800 text-[#9b172a] dark:text-[#9b172a]-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                      aria-pressed={loginType === 'phone'}
                    >
                      <FaPhone className="h-5 w-5" />
                      <span>رقم الهاتف</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginType('email')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm sm:text-base transition-all duration-200 ${loginType === 'email' ? 'bg-white dark:bg-gray-800 text-[#9b172a] dark:text-[#9b172a]-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                      aria-pressed={loginType === 'email'}
                    >
                      <FaEnvelope className="h-5 w-5" />
                      <span>الإيميل</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                  {loginType === 'phone' ? 'ادخل برقم تليفونك' : 'ادخل بالإيميل بتاعك'}
                </p>
              </div>

              {/* Email/Phone Field */}
              <div className="group">
                <label htmlFor={loginType === 'phone' ? 'phoneNumber' : 'email'} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  {loginType === 'phone' ? 'رقم التليفون' : 'الإيميل'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {loginType === 'phone' ? <FaPhone className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" /> : <FaEnvelope className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />}
                  </div>
                  <input
                    id={loginType === 'phone' ? 'phoneNumber' : 'email'}
                    name={loginType === 'phone' ? 'phoneNumber' : 'email'}
                    type={loginType === 'phone' ? 'tel' : 'email'}
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#9b172a]/20 focus:border-[#9b172a] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder={loginType === 'phone' ? 'أدخل رقم هاتفك' : 'أدخل بريدك الإلكتروني'}
                    value={loginType === 'phone' ? loginData.phoneNumber : loginData.email}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  كلمة السر
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pr-12 pl-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#9b172a]/20 focus:border-[#9b172a] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="اكتب كلمة السر"
                    value={loginData.password}
                    onChange={handleUserInput}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] hover:from-[#9b172a]-700 hover:via-[#9b172a] hover:to-[#9b172a]-700 focus:outline-none focus:ring-4 focus:ring-[#9b172a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg overflow-hidden"
              >
                {/* Button Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      بندخلك...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      دخول
                    </>
                  )}
                </span>
                
                {/* Creative Button Border Animation */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9b172a]-400 via-[#9b172a] to-[#9b172a]-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
            </form>

            {/* Enhanced Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    جديد في منصة  دكتور أحمد؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 font-semibold text-[#9b172a] dark:text-[#9b172a]-400 hover:text-[#9b172a]-700 dark:hover:text-[#9b172a]-300 transition-all duration-200 hover:scale-105"
              >
                <span>اعمل حساب</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <div className="w-2 h-2 bg-[#9b172a] rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                لما تدخل، إنت بتوافق على{" "}
                <Link to="/terms" className="text-[#9b172a] dark:text-[#9b172a]-400 hover:underline font-semibold">
                  شروط الخدمة
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-[#9b172a] dark:text-[#9b172a]-400 hover:underline font-semibold">
                  سياسة الخصوصية
                </Link>
              </p>
              <div className="w-2 h-2 bg-[#9b172a] rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
