import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addUnitToCourse, 
  addLessonToUnit, 
  addDirectLessonToCourse,
  updateUnit,
  deleteUnit,
  getCourseById,
  deleteLesson
} from '../../Redux/Slices/CourseSlice';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LessonModal from './LessonModal';

const CourseStructureModal = ({ courseId, onClose, isOpen }) => {
  const dispatch = useDispatch();
  const currentCourse = useSelector(state => state.course.currentCourse);
  const course = currentCourse && currentCourse._id === courseId ? currentCourse : null;
  
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState({ unitId: null, show: false });
  const [showAddDirectLesson, setShowAddDirectLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: ''
  });

  // Only fetch if modal is open and currentCourse is not the right one
  useEffect(() => {
    if (isOpen && (!currentCourse || currentCourse._id !== courseId)) {
      dispatch(getCourseById(courseId));
    }
  }, [isOpen, courseId, dispatch, currentCourse]);

  const refreshCourse = () => {
    if (courseId) {
      dispatch(getCourseById(courseId));
    }
  };

  const handleAddUnit = async () => {
    if (!newUnit.title.trim()) {
      toast.error('Unit title is required');
      return;
    }

    try {
      await dispatch(addUnitToCourse({ 
        courseId: courseId, 
        unitData: newUnit 
      })).unwrap();
      toast.success('Unit added successfully');
      setShowAddUnit(false);
      setNewUnit({ title: '', description: '' });
      refreshCourse();
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error(error.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleUpdateUnit = async (unitId, unitData) => {
    if (!unitData.title.trim()) {
      toast.error('Unit title is required');
      return;
    }

    try {
      await dispatch(updateUnit({ 
        courseId: courseId, 
        unitId, 
        unitData 
      })).unwrap();
      toast.success('Unit updated successfully');
      setSelectedUnit(null);
      refreshCourse();
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error(error.response?.data?.message || 'Failed to update unit');
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit? All lessons in this unit will also be deleted.')) {
      try {
        await dispatch(deleteUnit({ 
          courseId: courseId, 
          unitId 
        })).unwrap();
        toast.success('Unit deleted successfully');
        refreshCourse();
      } catch (error) {
        console.error('Error deleting unit:', error);
        toast.error(error.response?.data?.message || 'Failed to delete unit');
      }
    }
  };

  const handleAddLesson = async (unitId = null) => {
    if (!newLesson.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    try {
      if (unitId) {
        await dispatch(addLessonToUnit({ 
          courseId: courseId, 
          unitId, 
          lessonData: newLesson 
        })).unwrap();
      } else {
        await dispatch(addDirectLessonToCourse({ 
          courseId: courseId, 
          lessonData: newLesson 
        })).unwrap();
      }
      
      toast.success('Lesson added successfully');
      setShowAddLesson({ unitId: null, show: false });
      setShowAddDirectLesson(false);
      setNewLesson({
        title: '',
        description: ''
      });
      refreshCourse();
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to add lesson');
    }
  };

  const handleDeleteDirectLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this direct lesson?')) {
      try {
        await dispatch(deleteLesson({
          courseId: courseId,
          lessonId,
          unitId: null
        })).unwrap();
        toast.success('Direct lesson deleted successfully');
        refreshCourse();
      } catch (error) {
        console.error('Error deleting direct lesson:', error);
        toast.error(error.response?.data?.message || 'Failed to delete direct lesson');
      }
    }
  };

  const handleDeleteUnitLesson = async (unitId, lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson from the unit?')) {
      try {
        await dispatch(deleteLesson({
          courseId: courseId,
          lessonId,
          unitId
        })).unwrap();
        toast.success('Lesson deleted successfully');
        refreshCourse();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error(error.response?.data?.message || 'Failed to delete lesson');
      }
    }
  };

  const openLessonModal = (lesson, unitId, lessonId) => {
    setSelectedLesson({ lesson, unitId, lessonId });
  };

  const handleLessonUpdate = () => {
    refreshCourse();
    setSelectedLesson(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            هيكل الدورة: {course?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Units */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">وحدات</h3>
              <button
                onClick={() => setShowAddUnit(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <FaPlus className="text-sm" />
اضافة وحدة              </button>
            </div>

            {course?.units?.map((unit) => (
              <div key={unit._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {unit.title}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded sr-only">
                      ID: {unit._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUnit(unit)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Unit"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Unit"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                    <button
                      onClick={() => setShowAddLesson({ unitId: unit._id, show: true })}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                    >
                      <FaPlus className="text-xs" />
                      اضافة درس
                    </button>
                  </div>
                </div>
                
                {unit.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {unit.description}
                  </p>
                )}

                {/* Lessons in Unit */}
                <div className="space-y-2">
                  {unit.lessons?.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FaGripVertical className="text-gray-400" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </h5>
                          {lesson.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {lesson.description}
                            </p>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded sr-only">
                            ID: {lesson._id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openLessonModal(lesson, unit._id, lesson._id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnitLesson(unit._id, lesson._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Lesson"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* درس */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">درس</h3>
              <button
                onClick={() => setShowAddDirectLesson(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <FaPlus className="text-sm" />
اضافة درس
              </button>
            </div>

            {course?.directLessons?.map((lesson) => (
              <div
                key={lesson._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-500"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FaGripVertical className="text-gray-400" />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {lesson.title}
                    </h5>
                    {lesson.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {lesson.description}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded sr-only">
                      ID: {lesson._id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openLessonModal(lesson, null, lesson._id)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDeleteDirectLesson(lesson._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Direct Lesson"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Unit Modal */}
        {showAddUnit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">اضافة وحدة جديدة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={newUnit.title}
                    onChange={(e) => setNewUnit({ ...newUnit, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل عنوان الوحدة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    value={newUnit.description}
                    onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="ادخل وصف الوحدة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    value={newUnit.price || ''}
                    onChange={(e) => setNewUnit({ ...newUnit, price: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل سعر الوحدة"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddUnit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  اضافة وحدة
                </button>
                <button
                  onClick={() => setShowAddUnit(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  الغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Unit Modal */}
        {selectedUnit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">تعديل الوحدة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={selectedUnit.title}
                    onChange={(e) => setSelectedUnit({ ...selectedUnit, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل عنوان الوحدة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    value={selectedUnit.description || ''}
                    onChange={(e) => setSelectedUnit({ ...selectedUnit, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                      placeholder="ادخل وصف الوحدة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    value={selectedUnit.price !== undefined ? selectedUnit.price : ''}
                    onChange={(e) => setSelectedUnit({ ...selectedUnit, price: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل سعر الوحدة"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleUpdateUnit(selectedUnit._id, { title: selectedUnit.title, description: selectedUnit.description, price: selectedUnit.price })}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  تعديل الوحدة
                </button>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  الغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Lesson Modal */}
        {(showAddLesson.show || showAddDirectLesson) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">اضافة درس جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل عنوان الدرس"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="ادخل وصف الدرس"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السعر</label>
                  <input
                    type="number"
                    value={newLesson.price || ''}
                    onChange={(e) => setNewLesson({ ...newLesson, price: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ادخل سعر الدرس"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => showAddDirectLesson ? handleAddLesson() : handleAddLesson(showAddLesson.unitId)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  اضافة الدرس
                </button>
                <button
                  onClick={() => {
                    setShowAddLesson({ unitId: null, show: false });
                    setShowAddDirectLesson(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  الغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Modal for editing content */}
        {selectedLesson && (
          <LessonModal
            lesson={selectedLesson.lesson}
            unitId={selectedLesson.unitId}
            lessonId={selectedLesson.lessonId}
            courseId={courseId}
            onClose={handleLessonUpdate}
            isOpen={true}
          />
        )}
      </div>
    </div>
  );
};

export default CourseStructureModal;
