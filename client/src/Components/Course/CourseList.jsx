import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { deleteCourse, toggleFeatured } from '../../Redux/Slices/CourseSlice';
import { FaEdit, FaTrash, FaList, FaEye, FaStar } from 'react-icons/fa';
import CourseStructureModal from './CourseStructureModal';
import { generateImageUrl } from "../../utils/fileUtils";
import { placeholderImages } from "../../utils/placeholderImages";

const CourseDetailsModal = ({ course, onClose }) => {
  if (!course) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل الدرس</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">×</button>
        </div>
        <div className="space-y-2">
          <div><span className="font-semibold">العنوان:</span> {course.title}</div>
          <div><span className="font-semibold">الوصف:</span> {course.description}</div>
          {course.instructor && <div><span className="font-semibold">المدرس:</span> {course.instructor.name}</div>}
          {course.stage && <div><span className="font-semibold">المرحلة:</span> {course.stage.name}</div>}
          {course.category && <div><span className="font-semibold">فئة المرحلة:</span> {course.category.name}</div>}
          <div><span className="font-semibold">عدد الوحدات:</span> {course.units?.length || 0}</div>
          <div><span className="font-semibold">مقدمة:</span> {course.directLessons?.length || 0}</div>
        </div>
      </div>
    </div>
  );
};

const CourseList = ({ courses, loading, pagination, onEditCourse, role, onRefresh }) => {
  const dispatch = useDispatch();
  const [structureModalCourse, setStructureModalCourse] = useState(null);
  const [detailsModalCourse, setDetailsModalCourse] = useState(null);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدرس؟')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        // Refresh the courses list after deletion
        if (onRefresh) onRefresh();
      } catch (error) {
        // console.error('Error deleting course:', error);
      }
    }
  };

  const handleToggleFeatured = async (courseId, currentFeatured) => {
    try {
      await dispatch(toggleFeatured(courseId)).unwrap();
      // Refresh the courses list after toggling featured status
      if (onRefresh) onRefresh();
    } catch (error) {
      // console.error('Error toggling featured status:', error);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        {/* <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" /> */}
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد دورات</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ابدأ بإنشاء دورة جديدة لإضافة محتوى تعليمي.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* Course Image */}
            <div className="h-48 relative overflow-hidden">
              {/* Featured Badge Overlay */}
              {course.featured && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-400 text-blue-900 text-xs font-bold rounded-full shadow-lg">
                    <FaStar className="w-3 h-3 mr-1 fill-current" />
                    مميز
                  </span>
                </div>
              )}
              
              {course.image?.secure_url ? (
                <>
                  {console.log('🖼️ Course image found:', {
                    courseTitle: course.title,
                    imageUrl: course.image.secure_url,
                    isDataUri: course.image.secure_url.startsWith('data:'),
                    isUpload: course.image.secure_url.startsWith('/uploads/')
                  })}
                  <img
                    src={generateImageUrl(course.image?.secure_url)}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = placeholderImages.course;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </>
              ) : (
                <>
                  {console.log('📚 No course image, using fallback for:', course.title)}
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-4xl">📚</div>
                  </div>
                </>
              )}
              
              {/* Fallback gradient for broken images */}
              <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-blue-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-4xl">📚</div>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{course.title}</h3>
              
              {/* Instructor Info */}
              {course.instructor && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {course.instructor.avatar ? (
                      <img 
                        src={course.instructor.avatar} 
                        alt={course.instructor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-semibold">
                        {course.instructor.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {course.instructor.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">المدرس</p>
                  </div>
                </div>
              )}
              
              {/* Stage Info */}
              {course.stage && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {course.stage.name}
                  </span>
                </div>
              )}
              
              {/* Featured Badge */}
              {course.featured && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <FaStar className="w-3 h-3 mr-1 fill-current" />
                    مميز
                  </span>
                </div>
              )}
              
              {/* Category Info */}
              {course.category && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {course.category.name}
                  </span>
                </div>
              )}
              </div>
            
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditCourse(course)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="تعديل"
                >
                  <FaEdit className="text-sm" />
                </button>
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="حذف"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                  <button
                    onClick={() => handleToggleFeatured(course._id, course.featured)}
                    className={`p-2 rounded-lg transition-colors ${
                      course.featured 
                        ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    title={course.featured ? 'إلغاء التمييز' : 'تمييز الدورة'}
                  >
                    <FaStar className={`text-sm ${course.featured ? 'fill-current' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => setStructureModalCourse(course._id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="إدارة الهيكل"
                >
                  <FaList className="text-sm" />
                </button>
              </div>
              <button
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="عرض التفاصيل"
                onClick={() => setDetailsModalCourse(course)}
              >
                <FaEye className="text-sm" />
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
            {pagination.page} من {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      )}
      {/* CourseStructureModal rendered once at the root */}
      {structureModalCourse && (
        <CourseStructureModal
          courseId={structureModalCourse}
          onClose={() => setStructureModalCourse(null)}
          isOpen={true}
        />
      )}
      {/* CourseDetailsModal rendered once at the root */}
      {detailsModalCourse && (
        <CourseDetailsModal
          course={detailsModalCourse}
          onClose={() => setDetailsModalCourse(null)}
        />
      )}
    </div>
  );
};

export default CourseList;
