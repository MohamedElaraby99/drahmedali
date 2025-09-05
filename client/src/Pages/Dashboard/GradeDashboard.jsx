import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaGraduationCap,
  FaBook,
  FaUsers,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaInfo
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { 
  getAllGrades, 
  createGrade, 
  updateGrade, 
  deleteGrade,
  addSubjectsToGrade,
  removeSubjectsFromGrade,
  getGradesWithSubjectsCount,
  clearError 
} from '../../Redux/Slices/GradeSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import { toast } from 'react-hot-toast';

const GradeDashboard = () => {
  const dispatch = useDispatch();
  const { grades, loading, error, pagination, gradesWithCount } = useSelector((state) => state.grade);
  const { subjects } = useSelector((state) => state.subject);
  const { role } = useSelector((state) => state.auth);

  // State for modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Form states
  const [gradeForm, setGradeForm] = useState({
    name: '',
    description: '',
    subjects: []
  });

  // Subjects modal state
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Load grades and subjects on component mount
  useEffect(() => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      dispatch(getAllGrades());
      dispatch(getGradesWithSubjectsCount());
      dispatch(getAllSubjects());
    }
  }, [dispatch, role]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setGradeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId, checked) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setGradeForm({
      name: '',
      description: '',
      subjects: []
    });
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (grade) => {
    setSelectedGrade(grade);
    setGradeForm({
      name: grade.name,
      description: grade.description,
      subjects: grade.subjects?.map(subject => subject._id) || []
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (grade) => {
    setSelectedGrade(grade);
    setShowDeleteModal(true);
  };

  // Open subjects modal
  const openSubjectsModal = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubjects(grade.subjects?.map(subject => subject._id) || []);
    setAvailableSubjects(subjects.filter(subject => 
      !grade.subjects?.some(gradeSubject => gradeSubject._id === subject._id)
    ));
    setShowSubjectsModal(true);
  };

  // Handle create grade
  const handleCreateGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeForm.name.trim()) {
      toast.error('Grade name is required');
      return;
    }

    try {
      await dispatch(createGrade(gradeForm)).unwrap();
      setShowCreateModal(false);
      setGradeForm({ name: '', description: '', subjects: [] });
    } catch (error) {
      console.error('Error creating grade:', error);
    }
  };

  // Handle update grade
  const handleUpdateGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeForm.name.trim()) {
      toast.error('Grade name is required');
      return;
    }

    try {
      await dispatch(updateGrade({ 
        id: selectedGrade._id, 
        gradeData: gradeForm 
      })).unwrap();
      setShowEditModal(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

  // Handle delete grade
  const handleDeleteGrade = async () => {
    try {
      await dispatch(deleteGrade(selectedGrade._id)).unwrap();
      setShowDeleteModal(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  // Handle add subjects to grade
  const handleAddSubjects = async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    try {
      await dispatch(addSubjectsToGrade({
        id: selectedGrade._id,
        subjects: selectedSubjects
      })).unwrap();
      setShowSubjectsModal(false);
      setSelectedGrade(null);
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Error adding subjects:', error);
    }
  };

  // Handle remove subjects from grade
  const handleRemoveSubjects = async (subjectIds) => {
    try {
      await dispatch(removeSubjectsFromGrade({
        id: selectedGrade._id,
        subjects: subjectIds
      })).unwrap();
    } catch (error) {
      console.error('Error removing subjects:', error);
    }
  };

  // Filter grades based on search and filter
  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && grade.isActive) ||
                         (filterActive === 'inactive' && !grade.isActive);
    return matchesSearch && matchesFilter;
  });

  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grade Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage grades and link them with subjects</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Add Grade
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Grades</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{grades.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Grades</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {grades.filter(grade => grade.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaBook className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{subjects.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FaUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Linked Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {grades.reduce((total, grade) => total + (grade.subjects?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search grades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Grades</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grades List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {loading ? (
              <div className="p-8 text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading grades...</p>
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="p-8 text-center">
                <FaInfo className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No grades found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || filterActive !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first grade'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Grade Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredGrades.map((grade) => (
                      <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaGraduationCap className="text-blue-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {grade.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Created {new Date(grade.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                            {grade.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {grade.subjects?.length || 0} subjects
                            </span>
                            {grade.subjects && grade.subjects.length > 0 && (
                              <button
                                onClick={() => openSubjectsModal(grade)}
                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <FaEye className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            grade.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {grade.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(grade)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openSubjectsModal(grade)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <FaBook />
                            </button>
                            <button
                              onClick={() => openDeleteModal(grade)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Grade Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Grade</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleCreateGrade}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={gradeForm.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter grade name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={gradeForm.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter grade description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Grade Modal */}
        {showEditModal && selectedGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Grade</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleUpdateGrade}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={gradeForm.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter grade name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={gradeForm.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter grade description"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={gradeForm.isActive !== false}
                        onChange={(e) => setGradeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Grade</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete the grade "{selectedGrade.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGrade}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subjects Management Modal */}
        {showSubjectsModal && selectedGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manage Subjects for {selectedGrade.name}
                </h3>
                <button
                  onClick={() => setShowSubjectsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Subjects */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Current Subjects ({selectedGrade.subjects?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedGrade.subjects && selectedGrade.subjects.length > 0 ? (
                      selectedGrade.subjects.map((subject) => (
                        <div key={subject._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subject.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {subject.description}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSubjects([subject._id])}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No subjects assigned</p>
                    )}
                  </div>
                </div>

                {/* Available Subjects */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Available Subjects
                  </h4>
                  <div className="space-y-2">
                    {availableSubjects.length > 0 ? (
                      availableSubjects.map((subject) => (
                        <label key={subject._id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject._id)}
                            onChange={(e) => handleSubjectChange(subject._id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subject.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {subject.description}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No available subjects</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSubjectsModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleAddSubjects}
                  disabled={selectedSubjects.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected Subjects
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GradeDashboard; 