import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import CaptchaComponent from "../Components/CaptchaComponent";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGraduationCap, FaCamera, FaUpload, FaPhone, FaMapMarkerAlt, FaBook, FaExclamationTriangle, FaTimes, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { axiosInstance } from "../Helpers/axiosInstance";
import { useEffect } from "react";
import { egyptianCities } from "../utils/governorateMapping";
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo from "../assets/logo.png";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stages, setStages] = useState([]);
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    fatherPhoneNumber: "",
    governorate: "",
    stage: "",
    age: "",
    avatar: "",
    adminCode: "",
  });

  // Check if this is an admin registration
  const isAdminRegistration = signupData.adminCode === 'ADMIN123';

  // Fetch stages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stages
        const stagesResponse = await axiosInstance.get('/stages');
        if (stagesResponse.data.success) {
          setStages(stagesResponse.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    // Remove spaces from specific fields for easier signup/signin
    const fieldsToCleanSpaces = ['email', 'password', 'phoneNumber', 'fatherPhoneNumber', 'adminCode'];
    const cleanValue = fieldsToCleanSpaces.includes(name) ? value.replace(/\s+/g, '') : value;
    
    setSignupData({
      ...signupData,
      [name]: cleanValue,
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      });
    }
  }

  function getImage(event) {
    event.preventDefault();
    // getting the image
    const uploadedImage = event.target.files[0];

    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  }

  // CAPTCHA handlers
  function handleCaptchaVerified(sessionId) {
    console.log('CAPTCHA verified with session ID:', sessionId);
    console.log('Setting captchaSessionId to:', sessionId);
    console.log('Setting isCaptchaVerified to true');
    setCaptchaSessionId(sessionId);
    setIsCaptchaVerified(true);
    
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      console.log('State update delay completed');
      console.log('Current captchaSessionId:', sessionId);
      console.log('Current isCaptchaVerified:', true);
    }, 100);
  }

  function handleCaptchaError(error) {
    console.log('CAPTCHA error:', error);
    console.log('Setting isCaptchaVerified to false');
    console.log('Clearing captchaSessionId');
    setIsCaptchaVerified(false);
    setCaptchaSessionId("");
  }

  // Enhanced error handler function
  function validateForm() {
    const errors = [];
    const newFieldErrors = {};
    
    // Check CAPTCHA verification
    if (!isCaptchaVerified || !captchaSessionId) {
      errors.push("🔒 يرجى التحقق من رمز الأمان أولاً");
    }
    
    if (!termsAccepted) {
      errors.push("📋 لازم توافق على الشروط والأحكام الأول");
    }
    
    // Basic required fields for all users
    if (!signupData.fullName || signupData.fullName.trim() === "") {
      errors.push("👤 اكتب اسمك كامل - لازم يكون اسمك الثلاثي أو الرباعي");
      newFieldErrors.fullName = "اكتب اسمك كامل";
    } else if (signupData.fullName.length < 3) {
      errors.push("👤 الاسم ده قصير أوي - لازم يكون 3 حروف على الأقل");
      newFieldErrors.fullName = "الاسم قصير أوي";
    }
    
    if (!signupData.password || signupData.password.trim() === "") {
      errors.push("🔑 اختار كلمة سر قوية عشان تحمي حسابك");
      newFieldErrors.password = "اختار كلمة سر";
    } else if (signupData.password.length < 6) {
      errors.push("🔑 كلمة السر دي ضعيفة - لازم تكون 6 حروف على الأقل");
      newFieldErrors.password = "كلمة السر ضعيفة";
    }
    
    // Role-specific validation
    if (isAdminRegistration) {
      // For admin users: email is required
      if (!signupData.email || signupData.email.trim() === "") {
        errors.push("📧 اكتب الإيميل بتاعك - ده مطلوب للمشرفين");
        newFieldErrors.email = "اكتب الإيميل بتاعك";
      } else if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        errors.push("📧 الإيميل ده مش صح - اكتبه صح كده (مثال: ahmed@gmail.com)");
        newFieldErrors.email = "الإيميل مش صح";
      }
    } else {
      // For regular users: phone number is required, email is optional
      if (!signupData.phoneNumber || signupData.phoneNumber.trim() === "") {
        errors.push("📱 اكتب رقم التليفون بتاعك - ده هيبقى اسم المستخدم بتاعك");
        newFieldErrors.phoneNumber = "اكتب رقم التليفون";
      } else if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        errors.push("📱 رقم التليفون ده مش صح - اكتب رقم مصري صح (مثال: 01234567890)");
        newFieldErrors.phoneNumber = "رقم التليفون مش صح";
      }
      
      if (!signupData.governorate || signupData.governorate.trim() === "") {
        errors.push("🏙️ اختار المدينة اللي انت ساكن فيها");
        newFieldErrors.governorate = "اختار مدينتك";
      }
      
      if (!signupData.stage || signupData.stage.trim() === "") {
        errors.push("🎓 اختار السنة الدراسية بتاعتك");
        newFieldErrors.stage = "اختار سنتك الدراسية";
      }
      
      if (!signupData.age || signupData.age.trim() === "") {
        errors.push("🎂 اكتب عمرك الحقيقي");
        newFieldErrors.age = "اكتب عمرك";
      } else {
        const age = parseInt(signupData.age);
        if (isNaN(age) || age < 5 || age > 100) {
          errors.push("🎂 العمر ده مش معقول - لازم يكون ما بين 5 و 100 سنة");
          newFieldErrors.age = "عمر مش معقول";
        }
      }
      
      // Validate email if provided (optional for regular users)
      if (signupData.email && signupData.email.trim() !== "" && !signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        errors.push("📧 الإيميل ده مش صح - اكتبه صح كده (مثال: ahmed@gmail.com)");
        newFieldErrors.email = "الإيميل مش صح";
      }
      
      // father phone optional - validate only if provided
      if (signupData.fatherPhoneNumber && signupData.fatherPhoneNumber.trim() !== "" && !signupData.fatherPhoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        errors.push("📞 رقم تليفون ولي الأمر مش صح - اكتب رقم مصري صح (مثال: 01012345678)");
        newFieldErrors.fatherPhoneNumber = "رقم ولي الأمر مش صح";
      }
    }
    
    // Update field errors state
    setFieldErrors(newFieldErrors);
    
    return errors;
  }

  async function createNewAccount(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    // Check CAPTCHA verification first
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form submission - CAPTCHA verified:', isCaptchaVerified);
    console.log('Form submission - CAPTCHA session ID:', captchaSessionId);
    console.log('Form submission - CAPTCHA session ID type:', typeof captchaSessionId);
    console.log('Form submission - CAPTCHA session ID length:', captchaSessionId ? captchaSessionId.length : 0);
    console.log('Form submission - Terms accepted:', termsAccepted);
    console.log('Form submission - Form data:', signupData);
    console.log('=== END DEBUG ===');
    
    // Validate form and get all errors
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      // Show first error
      toast.error(validationErrors[0]);
      
      // If there are multiple errors, show a summary after a delay
      if (validationErrors.length > 1) {
        setTimeout(() => {
          const remainingErrors = validationErrors.slice(1);
          const errorSummary = `📝 فيه ${remainingErrors.length} مشكلة تانية:\n\n${remainingErrors.join('\n\n')}`;
          toast.error(errorSummary, { 
            duration: 8000,
            style: {
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '14px',
              lineHeight: '1.5',
              textAlign: 'right',
              direction: 'rtl'
            }
          });
        }, 2500);
      }
      
      // If terms not accepted, show modal
      if (!termsAccepted) {
        setShowTermsModal(true);
      }
      
      // Reset CAPTCHA verification ONLY if CAPTCHA was the issue
      if (!isCaptchaVerified || !captchaSessionId) {
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
      }
      
      setIsLoading(false);
      return;
    }

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

    // Create request data with device info as JSON object
    const requestData = {
      fullName: signupData.fullName,
      password: signupData.password,
      adminCode: signupData.adminCode,
      captchaSessionId: captchaSessionId,
      deviceInfo: deviceInfo
    };
    
    // Add role-specific fields
    if (isAdminRegistration) {
      // For admin users: email is required
      requestData.email = signupData.email;
    } else {
      // For regular users: phone number is required, email is optional
      requestData.phoneNumber = signupData.phoneNumber;
      if (signupData.email) {
        requestData.email = signupData.email; // Include email if provided
      }
      if (signupData.fatherPhoneNumber) {
        requestData.fatherPhoneNumber = signupData.fatherPhoneNumber;
      }
      requestData.governorate = signupData.governorate;
      requestData.stage = signupData.stage;
      requestData.age = signupData.age;
    }

    // Handle avatar file separately if present
    if (signupData.avatar) {
      const formData = new FormData();
      formData.append("avatar", signupData.avatar);
      
      // Add captchaSessionId at the top level for middleware access
      formData.append("captchaSessionId", captchaSessionId);
      
      // Add device info as separate fields for device fingerprint middleware
      formData.append("deviceInfo[platform]", deviceInfo.platform);
      formData.append("deviceInfo[screenResolution]", deviceInfo.screenResolution);
      formData.append("deviceInfo[timezone]", deviceInfo.timezone);
      formData.append("deviceInfo[additionalInfo][browser]", deviceInfo.additionalInfo.browser);
      formData.append("deviceInfo[additionalInfo][browserVersion]", deviceInfo.additionalInfo.browserVersion);
      formData.append("deviceInfo[additionalInfo][os]", deviceInfo.additionalInfo.os);
      formData.append("deviceInfo[additionalInfo][language]", deviceInfo.additionalInfo.language);
      formData.append("deviceInfo[additionalInfo][colorDepth]", deviceInfo.additionalInfo.colorDepth);
      formData.append("deviceInfo[additionalInfo][touchSupport]", deviceInfo.additionalInfo.touchSupport);
      
      // Add all other data as JSON string
      formData.append("data", JSON.stringify(requestData));
      
      // Debug: Log what's being sent
      console.log('=== SENDING FORMDATA REQUEST ===');
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('captchaSessionId from state:', captchaSessionId);
      console.log('=== END DEBUG ===');
      
      // dispatch create account action with FormData
      try {
        const response = await dispatch(createAccount(formData));
        if (response?.payload?.success) {
          setSignupData({
            fullName: "",
            email: "",
            password: "",
            phoneNumber: "",
            fatherPhoneNumber: "",
            governorate: "",
            stage: "",
            age: "",
            avatar: "",
            adminCode: "",
          });

          setPreviewImage("");
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);

          navigate("/");
        } else {
          // If signup failed, reset CAPTCHA for security
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Signup error:', error);
        // Reset CAPTCHA on error
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
        setIsLoading(false);
      }
    } else {
      // No avatar file, send as JSON
      console.log('=== SENDING JSON REQUEST ===');
      console.log('Request data:', requestData);
      console.log('captchaSessionId from state:', captchaSessionId);
      console.log('=== END DEBUG ===');
      
      try {
        const response = await dispatch(createAccount(requestData));
        if (response?.payload?.success) {
          setSignupData({
            fullName: "",
            email: "",
            password: "",
            phoneNumber: "",
            fatherPhoneNumber: "",
            governorate: "",
            stage: "",
            age: "",
            avatar: "",
            adminCode: "",
          });

          setPreviewImage("");
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);

          navigate("/");
        } else {
          // If signup failed, reset CAPTCHA for security
          setIsCaptchaVerified(false);
          setCaptchaSessionId("");
          setCaptchaReset(true);
          setTimeout(() => setCaptchaReset(false), 100);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Signup error:', error);
        // Reset CAPTCHA on error
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");
        setCaptchaReset(true);
        setTimeout(() => setCaptchaReset(false), 100);
        setIsLoading(false);
      }
    }
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b172a]-400 via-[#9b172a] to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl border-4 border-[#9b172a]-200 dark:border-[#9b172a]-700 transform hover:scale-110 transition-all duration-500">
                  <img 
                    src={logo} 
                    alt="منصة  drahmedali Logo" 
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#9b172a]-400 rounded-full animate-bounce z-10 shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse z-10 shadow-lg"></div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-[#9b172a] to-[#9b172a] bg-clip-text text-transparent">
              انضم إلى منصتنا التعليمية
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              أنشئ حسابك وابدأ رحلة التعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#9b172a]-200/50 dark:border-[#9b172a]-700/50 transform hover:scale-[1.02] transition-all duration-500">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                      fieldErrors.fullName 
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                    }`}
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={handleUserInput}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>
              </div>

               {/* Phone Number Field - Only for regular users */}
               {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                        fieldErrors.phoneNumber 
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                      }`}
                      placeholder="اكتب رقم تليفونك"
                      value={signupData.phoneNumber}
                      onChange={handleUserInput}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    الرقم ده هيبقى اسم المستخدم بتاعك عشان تدخل بيه
                  </p>
                </div>
              )}


              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  البريد الإلكتروني {!isAdminRegistration && "(اختياري)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required={isAdminRegistration}
                    className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                      fieldErrors.email 
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                    }`}
                    placeholder={isAdminRegistration ? "أدخل بريدك الإلكتروني" : "أدخل بريدك الإلكتروني (اختياري)"}
                    value={signupData.email}
                    onChange={handleUserInput}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                {!isAdminRegistration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    ممكن تسيب الخانة دي فاضية لو مش عايز تستعمل إيميل
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  كلمة المرور
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
                    className={`block w-full pr-12 pl-12 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                      fieldErrors.password 
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                    }`}
                    placeholder="أنشئ كلمة مرور قوية"
                    value={signupData.password}
                    onChange={handleUserInput}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {fieldErrors.password}
                    </p>
                  )}
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

              {/* Father's Phone Number Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="fatherPhoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    رقم هاتف ولي الامر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                    </div>
                    <input
                      id="fatherPhoneNumber"
                      name="fatherPhoneNumber"
                      type="tel"
                      required={false}
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                        fieldErrors.fatherPhoneNumber 
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                      }`}
                      placeholder="اكتب رقم تليفون ولي أمرك"
                      value={signupData.fatherPhoneNumber}
                      onChange={handleUserInput}
                    />
                    {fieldErrors.fatherPhoneNumber && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.fatherPhoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Governorate Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="governorate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    المدينة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                    </div>
                    <select
                      id="governorate"
                      name="governorate"
                      required
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                        fieldErrors.governorate 
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                      }`}
                      value={signupData.governorate}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المدينة</option>
                      {egyptianCities.map((gov) => (
                        <option key={gov.value} value={gov.value}>
                          {gov.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.governorate && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.governorate}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Stage Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="stage" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    المرحلة الدراسية
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaBook className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                    </div>
                    <select
                      id="stage"
                      name="stage"
                      required
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                        fieldErrors.stage 
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                      }`}
                      value={signupData.stage}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المرحلة الدراسية</option>
                      {stages.map((stage) => (
                        <option key={stage._id} value={stage._id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.stage && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.stage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Age Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    العمر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-[#9b172a] group-focus-within:text-[#9b172a] transition-colors duration-200" />
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="5"
                      max="100"
                      required
                      className={`block w-full pr-12 pl-4 py-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                        fieldErrors.age 
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-600 focus:ring-[#9b172a]/20 focus:border-[#9b172a]'
                      }`}
                      placeholder="أدخل عمرك"
                      value={signupData.age}
                      onChange={handleUserInput}
                    />
                    {fieldErrors.age && (
                      <p className="text-red-500 text-xs mt-1 text-right flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {fieldErrors.age}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Avatar Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  الصورة الشخصية (اختياري)
                </label>
                <div className="flex items-center space-x-reverse space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#9b172a]-100 to-[#9b172a]-100 dark:from-[#9b172a]-900/20 dark:to-[#9b172a]-900/20 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BsPersonCircle className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {previewImage && (
                      <div className="absolute -top-1 -left-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <FaCamera className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="image_uploads" className="cursor-pointer">
                      <div className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#9b172a]-400 dark:hover:border-[#9b172a]-400 transition-all duration-300 hover:shadow-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <FaUpload className="w-5 h-5 text-[#9b172a] ml-2" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {previewImage ? "تغيير الصورة" : "رفع صورة"}
                        </span>
                      </div>
                    </label>
                    <input
                      id="image_uploads"
                      onChange={getImage}
                      type="file"
                      accept=".jpg, .jpeg, .png, image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* CAPTCHA Component */}
              <CaptchaComponent
                onVerified={handleCaptchaVerified}
                onError={handleCaptchaError}
                reset={captchaReset}
              />

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isCaptchaVerified}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-indigo-600 hover:from-[#9b172a]-700 hover:via-[#9b172a]-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-[#9b172a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg overflow-hidden"
              >
                {/* Button Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#9b172a] via-[#9b172a] to-[#9b172a] rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      إنشاء الحساب
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
                    عندك حساب خلاص؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-[#9b172a] dark:text-[#9b172a]-400 hover:text-[#9b172a]-700 dark:hover:text-[#9b172a]-300 transition-all duration-200 hover:scale-105"
              >
                <span>ادخل على حسابك</span>
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
                بإنشاء حساب، فإنك توافق على{" "}
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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaInfoCircle className="text-gray-600 dark:text-gray-400 text-xl" />
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">شروط وأحكام الاستخدام</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">يرجى قراءة هذه الشروط بعناية قبل إنشاء حسابك</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (termsAccepted) {
                      setShowTermsModal(false);
                    } else {
                      toast.error("يجب الموافقة على الشروط والأحكام للمتابعة");
                    }
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500 dark:text-gray-400 text-lg" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* Important Notice */}
                <div className="bg-[#9b172a]-50 dark:bg-[#9b172a]-900/20 border border-[#9b172a]-200 dark:border-[#9b172a]-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-[#9b172a] text-lg flex-shrink-0 mt-0.5" />
                    <p className="text-[#9b172a]-800 dark:text-[#9b172a]-300 text-sm leading-relaxed text-right">
                      <strong>ملاحظة هامة:</strong> يرجى قراءة هذه الشروط بعناية. الموافقة عليها تعني التزامك الكامل بها.
                    </p>
                  </div>
                </div>

                {/* Terms List */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>دقة البيانات:</strong> وأنت بتعمل حساب لازم تكون بياناتك صحيحة (اسمك رباعي - رقم الواتساب بتاعك - رقم ولي أمرك).
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>حد الجهاز:</strong> <span className="text-red-600 dark:text-red-400 font-bold">مش هتقدر تفتح الحساب إلا على  اول جهازين بس.</span> اختار الجهاز اللي هتستخدمه بعناية عشان لو غيرت الجهاز مش هتعرف تخش أو تفتح الحساب إلا منه.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>حفظ كلمة المرور:</strong> لازم تحفظ الباسورد بتاعك وتحافظ عليه في مكان آمن.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>الالتزام:</strong> يجب الالتزام بمشاهدة الفيديوهات وحل الواجب والامتحانات في المواعيد المحددة.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">5</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>تقارير ولي الأمر:</strong> يتم إرسال تقرير دوري بالمستوى لولي الأمر لمتابعة مستواك الدراسي.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">6</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>عدم الالتزام:</strong> أي طالب غير ملتزم مش هيكمل معانا وسيتم إنهاء اشتراكه فوراً.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">7</span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-right">
                      <strong>فترة الاشتراك:</strong> الاشتراك لحد امتحانات الدور الأول وليس هناك استرجاع لسعر الكورس .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="space-y-4">
                {/* Acceptance Checkbox */}
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#9b172a] bg-gray-100 border-gray-300 rounded focus:ring-[#9b172a] dark:focus:ring-[#9b172a] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer text-right">
                    أوافق على جميع الشروط والأحكام المذكورة أعلاه وأتعهد بالالتزام بها كاملة.
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (termsAccepted) {
                        setShowTermsModal(false);
                        toast.success("تم قبول الشروط والأحكام بنجاح");
                      } else {
                        toast.error("يجب الموافقة على الشروط والأحكام أولاً");
                      }
                    }}
                    disabled={!termsAccepted}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      termsAccepted
                        ? 'bg-gradient-to-r from-[#9b172a] to-[#9b172a] hover:from-[#9b172a] hover:to-[#9b172a] text-white shadow-sm hover:shadow-md'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FaCheckCircle className="text-base" />
                    موافق والمتابعة
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowTermsModal(false);
                      setTermsAccepted(false);
                      navigate('/');
                    }}
                    className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-sm"
                  >
                    <FaTimes className="text-base" />
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
