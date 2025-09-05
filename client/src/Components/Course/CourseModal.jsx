import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../../Redux/Slices/CourseSlice';
import { getAllInstructors } from '../../Redux/Slices/InstructorSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import { FaTimes } from 'react-icons/fa';

const CourseModal = ({ course, onClose, isOpen }) => {
  const dispatch = useDispatch();
  const { createLoading, updateLoading } = useSelector((state) => state.course);
  const { instructors = [] } = useSelector((state) => state.instructor);
  const { stages = [] } = useSelector((state) => state.stage);
  const { subjects = [] } = useSelector((state) => state.subject);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    stage: '',
    subject: ''
  });


  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        instructor: course.instructor?._id || course.instructor || '',
        stage: course.stage?._id || course.stage || '',
        subject: course.subject?._id || course.subject || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        instructor: '',
        stage: '',
        subject: ''
      });
    }
    setThumbnail(null);
  }, [course]);

  useEffect(() => {
    dispatch(getAllInstructors());
    dispatch(getAllStages());
    dispatch(getAllSubjects());
  }, [dispatch]);





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.instructor || !formData.stage || !formData.subject) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructor: formData.instructor,
        stage: formData.stage,
        subject: formData.subject
      };



      if (thumbnail) {
        courseData.thumbnail = thumbnail;
      }

      if (course) {
        await dispatch(updateCourse({ id: course._id, courseData })).unwrap();
      } else {
        await dispatch(createCourse(courseData)).unwrap();
      }

      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {course ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="أدخل عنوان الدورة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="أدخل وصف الدورة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">المدرس *</label>
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">اختر المدرس</option>
              {instructors?.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>



          <div>
            <label className="block text-sm font-medium mb-1">المرحلة *</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">اختر المرحلة</option>
              {stages?.map((stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">المادة *</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">اختر المادة</option>
              {subjects?.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name || subject.title || subject._id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">صورة الدورة</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createLoading || updateLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading || updateLoading ? 'جاري الحفظ...' : (course ? 'تحديث' : 'إنشاء')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
