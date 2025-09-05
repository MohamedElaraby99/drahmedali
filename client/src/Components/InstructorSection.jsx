import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedInstructors } from '../Redux/Slices/InstructorSlice';
import { FaGraduationCap, FaStar, FaUsers, FaBook, FaClock, FaLinkedin, FaTwitter, FaFacebook, FaWhatsapp, FaTimes, FaAward, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { generateImageUrl } from "../utils/fileUtils";
import { placeholderImages } from "../utils/placeholderImages";

const InstructorSection = () => {
  const dispatch = useDispatch();
  const { featuredInstructors, loading } = useSelector((state) => state.instructor);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getFeaturedInstructors({ limit: 6 }));
  }, [dispatch]);

  const handleInstructorClick = (instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInstructor(null);
  };

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderImages.avatar;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-sm ${i <= rating ? 'text-blue-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            تعلم من أفضل الخبراء للتعلم
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              تعلم من أفضل الخبراء  
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>

          {/* Instructors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredInstructors.map((instructor, index) => (
              <div
                key={instructor._id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => handleInstructorClick(instructor)}
              >
                {/* Large Instructor Photo - modern and fully visible */}
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  {instructor.profileImage?.secure_url ? (
                    <img
                      src={generateImageUrl(instructor.profileImage.secure_url)}
                      alt={instructor.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaGraduationCap className="text-gray-400 dark:text-gray-500 text-6xl" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Instructor Name */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {instructor.name}
                  </h3>
                  
                  {/* Role/Specialization */}
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                    {instructor.specialization}
                  </p>
                  
                  {/* Brief Description */}
                  <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    {instructor.bio || `${instructor.name} هو مدرس محترف مع خبرة واسعة في مجال ${instructor.specialization}. لديه نهج تعليمي متميز ويساعد الطلاب على تحقيق أهدافهم التعليمية.`}
                  </p>

                  {/* Clickable Arrow Icon */}
                  <div className="flex justify-end">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 group-hover:scale-110">
                      <FaArrowRight className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Instructors Button */}
          <div className="text-center mt-16">
            <Link
              to="/instructors"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              عرض جميع المدرسين
              <FaGraduationCap className="mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instructor Profile Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الملف الشخصي للمدرس</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Instructor Header */}
              <div className="text-center mb-8">
                {selectedInstructor.profileImage?.secure_url ? (
                  <div className="w-28 h-28 rounded-xl bg-gray-100 dark:bg-gray-700 mx-auto mb-4 overflow-hidden flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600">
                    <img
                      src={generateImageUrl(selectedInstructor.profileImage.secure_url)}
                      alt={selectedInstructor.name}
                      className="max-w-full max-h-full object-contain"
                      onError={handleImgError}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600 shadow-lg">
                    <FaGraduationCap className="text-gray-400 dark:text-gray-500 text-4xl" />
                  </div>
                )}
                
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedInstructor.name}
                </h3>
                
                <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-semibold mb-4">
                  <FaGraduationCap className="ml-2" />
                  {selectedInstructor.specialization}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {renderStars( 5)}
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    ({ 5})
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedInstructor.bio && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">نبذة عن المدرس</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    {selectedInstructor.bio}
                  </p>
                </div>
              )}

              {/* Education */}
              {selectedInstructor.education && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">المؤهل العلمي</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-right">
                    {selectedInstructor.education}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(() => {
                                 const hasSocialLinks = (
                   (selectedInstructor.socialLinks?.linkedin && selectedInstructor.socialLinks.linkedin.trim() !== '') ||
                   (selectedInstructor.socialLinks?.twitter && selectedInstructor.socialLinks.twitter.trim() !== '') ||
                   (selectedInstructor.socialLinks?.facebook && selectedInstructor.socialLinks.facebook.trim() !== '') ||
                   (selectedInstructor.socialLinks?.whatsapp && selectedInstructor.socialLinks.whatsapp.trim() !== '')
                 );
                
                if (!hasSocialLinks) return null;
                
                return (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">روابط التواصل</h4>
                    <div className="flex items-center justify-center gap-4">
                      {selectedInstructor.socialLinks?.linkedin && selectedInstructor.socialLinks.linkedin.trim() !== '' && (
                        <a
                          href={selectedInstructor.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaLinkedin className="text-sm" />
                        </a>
                      )}
                      {selectedInstructor.socialLinks?.twitter && selectedInstructor.socialLinks.twitter.trim() !== '' && (
                        <a
                          href={selectedInstructor.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaTwitter className="text-sm" />
                        </a>
                      )}
                                             {selectedInstructor.socialLinks?.facebook && selectedInstructor.socialLinks.facebook.trim() !== '' && (
                         <a
                           href={selectedInstructor.socialLinks.facebook}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                         >
                           <FaFacebook className="text-sm" />
                         </a>
                       )}
                      {selectedInstructor.socialLinks?.whatsapp && selectedInstructor.socialLinks.whatsapp.trim() !== '' && (
                        <a
                          href={`https://wa.me/${selectedInstructor.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaWhatsapp className="text-sm" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Featured Badge */}
              {selectedInstructor.featured && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-3 rounded-full font-bold">
                    <FaAward className="ml-2" />
                    مدرس مميز
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorSection; 