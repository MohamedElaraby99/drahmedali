import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllInstructors, getFeaturedInstructors } from '../Redux/Slices/InstructorSlice';
import Layout from '../Layout/Layout';
import { 
  FaStar, 
  FaUsers, 
  FaGraduationCap, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook,
  FaWhatsapp,
  FaSearch,
  FaFilter,
  FaEye
} from 'react-icons/fa';
import { generateImageUrl } from "../utils/fileUtils";

export default function Instructors() {
  const dispatch = useDispatch();
  const { instructors, loading } = useSelector((state) => state.instructor);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAllInstructors({ page: 1, limit: 100 }));
    dispatch(getFeaturedInstructors());
  }, [dispatch]);



  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeatured = !filterFeatured || instructor.featured === (filterFeatured === 'true');
    
    return matchesSearch && matchesFeatured;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-blue-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleViewDetails = (instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                مدرسونا المتميزون
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                تعرف على فريقنا من المدرسين المحترفين والخبراء في مجالاتهم
              </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث في المدرسين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Instructor Header */}
                  <div className="relative p-6 bg-gradient-to-r from-blue-500 to-blue-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {instructor.profileImage?.secure_url ? (
                          <img 
                            src={generateImageUrl(instructor.profileImage.secure_url)} 
                            alt={instructor.name} 
                            className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <FaGraduationCap className="text-white text-xl" />
                          </div>
                        )}
                        <div className="mr-3">
                          <h3 className="text-white font-semibold text-right">{instructor.name}</h3>
                          <p className="text-white/80 text-sm text-right">{instructor.specialization}</p>
                        </div>
                      </div>
                      {instructor.featured && (
                        <span className="bg-blue-400 text-blue-900 px-2 py-1 rounded-full text-xs font-semibold">
                          مميز
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center ml-2">
                          {renderStars(5)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          (5.0)
                        </span>
                      </div>
                     
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 text-right">
                      {instructor.bio || 'لا يوجد وصف متاح'}
                    </p>

                    {instructor.experience && (
                      <div className="mb-3 text-right">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          الخبرة:
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                          {instructor.experience} سنة
                        </span>
                      </div>
                    )}

                    {/* Social Links */}
                    {(() => {
                                             const hasSocialLinks = (
                         (instructor.socialLinks?.linkedin && instructor.socialLinks.linkedin.trim() !== '') ||
                         (instructor.socialLinks?.twitter && instructor.socialLinks.twitter.trim() !== '') ||
                         (instructor.socialLinks?.facebook && instructor.socialLinks.facebook.trim() !== '') ||
                         (instructor.socialLinks?.whatsapp && instructor.socialLinks.whatsapp.trim() !== '')
                       );
                      
                      if (!hasSocialLinks) return null;
                      
                      return (
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          {instructor.socialLinks?.linkedin && instructor.socialLinks.linkedin.trim() !== '' && (
                            <a
                              href={instructor.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FaLinkedin size={16} />
                            </a>
                          )}
                          {instructor.socialLinks?.twitter && instructor.socialLinks.twitter.trim() !== '' && (
                            <a
                              href={instructor.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                            >
                              <FaTwitter size={16} />
                            </a>
                          )}
                                                     {instructor.socialLinks?.facebook && instructor.socialLinks.facebook.trim() !== '' && (
                             <a
                               href={instructor.socialLinks.facebook}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                             >
                               <FaFacebook size={16} />
                             </a>
                           )}
                          {instructor.socialLinks?.whatsapp && instructor.socialLinks.whatsapp.trim() !== '' && (
                            <a
                              href={`https://wa.me/${instructor.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <FaWhatsapp size={16} />
                            </a>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex justify-center">
                      <button
                        onClick={() => handleViewDetails(instructor)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <FaEye />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredInstructors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  لم يتم العثور على مدرسين
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Instructor Details Modal */}
        {showModal && selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedInstructor.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedInstructor(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Image */}
                  <div className="md:col-span-1">
                    {selectedInstructor.profileImage?.secure_url ? (
                      <img 
                        src={generateImageUrl(selectedInstructor.profileImage.secure_url)} 
                        alt={selectedInstructor.name} 
                        className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FaGraduationCap className="text-gray-400 text-6xl" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                          التخصص
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-right">
                          {selectedInstructor.specialization || 'غير محدد'}
                        </p>
                      </div>

                      {selectedInstructor.bio && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                            نبذة
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-right">
                            {selectedInstructor.bio}
                          </p>
                        </div>
                      )}

                      {selectedInstructor.experience && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                            الخبرة
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-right">
                            {selectedInstructor.experience} سنة
                          </p>
                        </div>
                      )}

                      {selectedInstructor.education && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                            التعليم
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-right">
                            {selectedInstructor.education}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                            التقييم
                          </h3>
                          <div className="flex items-center justify-end">
                            {renderStars(5)}
                            <span className="mr-2 text-gray-600 dark:text-gray-300">
                              (5.0)
                            </span>
                          </div>
                        </div>

                      </div>

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
                           <div>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-right">
                               روابط التواصل
                             </h3>
                             <div className="flex items-center gap-4 justify-end">
                               {selectedInstructor.socialLinks?.linkedin && selectedInstructor.socialLinks.linkedin.trim() !== '' && (
                                 <a
                                   href={selectedInstructor.socialLinks.linkedin}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                 >
                                   <FaLinkedin size={20} />
                                 </a>
                               )}
                               {selectedInstructor.socialLinks?.twitter && selectedInstructor.socialLinks.twitter.trim() !== '' && (
                                 <a
                                   href={selectedInstructor.socialLinks.twitter}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                                 >
                                   <FaTwitter size={20} />
                                 </a>
                               )}
                                                               {selectedInstructor.socialLinks?.facebook && selectedInstructor.socialLinks.facebook.trim() !== '' && (
                                  <a
                                    href={selectedInstructor.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                  >
                                    <FaFacebook size={20} />
                                  </a>
                                )}
                               {selectedInstructor.socialLinks?.whatsapp && selectedInstructor.socialLinks.whatsapp.trim() !== '' && (
                                 <a
                                   href={`https://wa.me/${selectedInstructor.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                 >
                                   <FaWhatsapp size={20} />
                                 </a>
                               )}
                             </div>
                           </div>
                         );
                       })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 