import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateUserData } from "../../Redux/Slices/AuthSlice";
import InputBox from "../../Components/InputBox/InputBox";
import { FaUserCircle, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaCalendarAlt, FaEnvelope, FaUser, FaIdCard, FaEdit, FaSave, FaTimes, FaBook } from "react-icons/fa";
import { IoIosLock, IoIosRefresh } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";

import { egyptianCities, getArabicCity } from "../../utils/governorateMapping";
import UserQRCode from "../../Components/UserQRCode";


export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({
    name: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    fatherPhoneNumber: userData?.fatherPhoneNumber || "",
    governorate: userData?.governorate || "",
    age: userData?.age || "",
    avatar: null,
    previewImage: null,
    userId: null,
  });
  const avatarInputRef = useRef(null);
  const [isChanged, setIschanged] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          avatar: uploadImage,
        });
      });
    }
  }

  async function onFormSubmit(e) {
    setIsUpdating(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", userInput.name);
    formData.append("phoneNumber", userInput.phoneNumber);
    
    // Only append user-specific fields for regular users
    if (userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN') {
      formData.append("fatherPhoneNumber", userInput.fatherPhoneNumber);
      formData.append("governorate", userInput.governorate);
      formData.append("age", userInput.age);
    }
    
    if (userInput.avatar) {
      formData.append("avatar", userInput.avatar);
    }
    const data = { formData, id: userInput.userId };
    const response = await dispatch(updateUserData(data));
    if (response?.payload?.success) {
      await dispatch(getUserData());
      setIschanged(false);
      setIsEditing(false); // Exit edit mode after successful save
    }
    setIsUpdating(false);
  }

  async function handleCancelSubscription() {
    const res = await dispatch(cancelCourseBundle());
    if (res?.payload?.success) {
      await dispatch(getUserData());
    }
  }

  function handleEditClick() {
    setIsEditing(true);
    // Reset form to current user data
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      age: userData?.age || "",
      avatar: null,
      previewImage: null,
      userId: userData?._id,
    });
    console.log('Edit mode - userInput set to:', {
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      age: userData?.age || "",
    });
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setIschanged(false);
    // Reset to original values
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      age: userData?.age || "",
      avatar: null,
      previewImage: null,
      userId: userData?._id,
    });
  }

  useEffect(() => {
    if (isEditing) {
      let hasChanges = 
        userInput.name !== userData?.fullName || 
        userInput.phoneNumber !== userData?.phoneNumber ||
        userInput.avatar;
      
      // Only check user-specific fields for regular users
      if (userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN') {
        hasChanges = hasChanges ||
          userInput.fatherPhoneNumber !== userData?.fatherPhoneNumber ||
          userInput.governorate !== userData?.governorate ||
          userInput.age !== userData?.age;
      }
      
      console.log('Change detection:', {
        nameChanged: userInput.name !== userData?.fullName,
        phoneChanged: userInput.phoneNumber !== userData?.phoneNumber,
        fatherPhoneChanged: userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN' ? userInput.fatherPhoneNumber !== userData?.fatherPhoneNumber : false,
        governorateChanged: userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN' ? userInput.governorate !== userData?.governorate : false,

        ageChanged: userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN' ? userInput.age !== userData?.age : false,
        avatarChanged: !!userInput.avatar,
        userRole: userData?.role,
        hasChanges
      });
      
      setIschanged(hasChanges);
    } else {
      setIschanged(false);
    }
  }, [userInput, userData, isEditing]);

  useEffect(() => {
    async function fetchUser() {
      console.log('Fetching user data...');
      const result = await dispatch(getUserData());
      console.log('User data fetch result:', result);
    }
    if (Object.keys(userData).length < 1) fetchUser();
  }, []);

  // Debug: Log user data to see what's being received
  useEffect(() => {
    console.log('Current userData:', userData);
  }, [userData]);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
    setUserInput({
      ...userInput,
        name: userData?.fullName || "",
        phoneNumber: userData?.phoneNumber || "",
        fatherPhoneNumber: userData?.fatherPhoneNumber || "",
        governorate: userData?.governorate || "",
        age: userData?.age || "",
      userId: userData?._id,
    });
    }
  }, [userData]);



  return (
    <Layout hideFooter={true}>
      <section className="flex flex-col gap-6 items-center py-8 px-3 min-h-[100vh]" dir="rtl">
        <form
          autoComplete="off"
          noValidate
          onSubmit={onFormSubmit}
          className="flex flex-col dark:bg-base-100 relative gap-7 rounded-lg md:py-10 py-7 md:px-7 px-3 md:w-[750px] w-full shadow-custom dark:shadow-xl"
          dir="rtl"
        >
          <div className="flex justify-center items-center">
            <h1 className="text-center absolute right-6 md:top-auto top-5 text-violet-500 dark:text-blue-500 md:text-4xl text-3xl font-bold font-inter after:content-[' ']  after:absolute after:-bottom-3.5 after:right-0 after:h-1.5 after:w-[60%] after:rounded-full after:bg-blue-400 dark:after:bg-blue-600">
              الملف الشخصي
            </h1>
            {/* avatar */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden self-center cursor-pointer"
              onClick={() => avatarInputRef.current.click()}
            >
              {userData?.avatar?.secure_url || userInput.previewImage ? (
                <img
                  src={
                    userInput.previewImage
                      ? userInput.previewImage
                      : userData?.avatar?.secure_url
                  }
                  alt="avatar"
                  className="h-full w-full"
                />
              ) : (
                <FaUserCircle className="h-full w-full" />
              )}
              <input
                type="file"
                accept=".png, .jpeg, .jpg"
                className="hidden"
                ref={avatarInputRef}
                onChange={handleImageUpload}
              />
            </div>
            {/* more options */}
            <div className="absolute left-3 top-3">
              <button
                type="button"
                className="absolute left-0 text-gray-500 dark:text-slate-50 font-inter font-[600]"
                onClick={() => setIsDialogOpen((prev) => !prev)}
              >
                <FiMoreVertical size={20} />
              </button>

              <dialog
                open={isDialogOpen}
                className="bg-white dark:bg-base-300 transition-all duration-500 border-[1px] border-gray-200 dark:border-gray-500 rounded-e-xl rounded-ss-xl py-5 shadow-lg w-fit relative left-0 top-7"
              >
                <div className="w-full flex flex-col gap-2 items-start">
                  <button
                    className="text-gray-700 w-full flex items-center gap-2 dark:text-white px-3 pb-2 border-b-[1px] border-gray-300"
                    onClick={() => navigate("change-password")}
                  >
                    <IoIosLock /> تغيير كلمة المرور
                  </button>
                  <button
                    className="text-[#ff1414] dark:text-red-300 px-3 w-full flex items-center gap-2"
                    onClick={() => navigate("reset-password")}
                  >
                    <IoIosRefresh /> إعادة تعيين كلمة المرور
                  </button>
                </div>
              </dialog>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                المعلومات الشخصية
              </h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <FaEdit size={14} />
                  تعديل الملف الشخصي
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaUser className="text-blue-500" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={isEditing ? userInput.name : (userData?.fullName || "")}
                  onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="أدخل اسمك الكامل"
                  dir="rtl"
                />
              </div>


              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaEnvelope className="text-green-500" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed text-left"
                  dir="ltr"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaPhone className="text-green-500" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={isEditing ? userInput.phoneNumber : (userData?.phoneNumber || "")}
                  onChange={(e) => setUserInput({ ...userInput, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="أدخل رقم هاتفك"
                  dir="ltr"
                />
              </div>

              {/* User-specific fields - only show for regular users */}
              {userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN' && (
                <>
                  {/* Father's Phone Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FaPhone className="text-blue-500" />
                      رقم هاتف الأب
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? userInput.fatherPhoneNumber : (userData?.fatherPhoneNumber || "")}
                      onChange={(e) => setUserInput({ ...userInput, fatherPhoneNumber: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                        !isEditing 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      placeholder="أدخل رقم هاتف الأب"
                      dir="ltr"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FaCalendarAlt className="text-blue-500" />
                      العمر
                    </label>
                    <input
                      type="number"
                      value={isEditing ? userInput.age : (userData?.age || "")}
                      onChange={(e) => setUserInput({ ...userInput, age: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                        !isEditing 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      placeholder="أدخل عمرك"
                      min="5"
                      max="100"
                      dir="rtl"
                    />
                  </div>

                  {/* Stage */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FaBook className="text-blue-500" />
                      المرحلة الدراسية
                    </label>
                    
                    <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-right" dir="rtl">
                      {userData?.stage?.name || userData?.stage || "غير محدد"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      المرحلة الدراسية لا يمكن تعديلها
                    </div>
                  </div>

                  {/* Governorate */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FaMapMarkerAlt className="text-red-500" />
                      المدينة
                    </label>
                    <select
                      value={isEditing ? userInput.governorate : (userData?.governorate || "")}
                      onChange={(e) => setUserInput({ ...userInput, governorate: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                        !isEditing 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      dir="rtl"
                    >
                      <option value="">اختر المدينة</option>
                      {egyptianCities.map((gov) => (
                        <option key={gov.value} value={gov.value}>
                          {gov.label}
                        </option>
                      ))}
                      <option value="Other">أخرى</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Account Information Section */}
          <div className="w-full space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              معلومات الحساب
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaIdCard className="text-blue-500" />
                  دور الحساب
                </label>
                <input
                  type="text"
                  value={userData?.role || "USER"}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed text-right"
                  dir="rtl"
                />
              </div>

              {/* User Number/ID */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaIdCard className="text-green-500" />
                  رقم المستخدم
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-mono text-sm text-left" dir="ltr">
                  {userData?._id || "غير متوفر"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  يمكن للمدربين استخدام هذا الرقم لتسجيل الحضور يدوياً
                </div>
              </div>


            </div>
          </div>

          {/* QR Code Section */}
          <UserQRCode userData={userData} />
          {/* submit button */}
          <div className="w-full flex md:flex-row flex-col md:justify-between justify-center md:gap-0 gap-3" dir="rtl">
            {isEditing ? (
              <>
            <button
              type="submit"
                  className={`py-3.5 rounded-md mt-3 text-white font-inter md:w-[48%] w-full flex items-center justify-center gap-2 ${
                    !isChanged || isUpdating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
              disabled={!isChanged || isUpdating}
              onClick={() => {
                console.log('Save button clicked. isChanged:', isChanged, 'isUpdating:', isUpdating);
              }}
            >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري حفظ التغييرات...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      حفظ التغييرات
                    </>
                  )}
            </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-3.5 rounded-md bg-gray-500 hover:bg-gray-600 mt-3 text-white font-inter md:w-[48%] w-full flex items-center justify-center gap-2"
                  disabled={isUpdating}
                >
                  <FaTimes size={14} />
                  إلغاء
                </button>
              </>
            ) : (
              /* show cancel subscription btn if Active */
              userData?.subscription?.status === "active" && (
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="py-3.5 rounded-md bg-[#f32e2e] mt-3 text-white font-inter md:w-[48%] w-full"
              >
                إلغاء الاشتراك
              </button>
              )
            )}
          </div>
        </form>
      </section>
    </Layout>
  );
}
