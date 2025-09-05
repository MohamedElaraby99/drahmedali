import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBook, FaUsers, FaPlus, FaEdit, FaTrash, FaClock, FaEye, FaTimes, FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Layout from '../../../Layout/Layout';
import CenterManagementHeader from '../../../Components/CenterManagementHeader';
import { createGroup, getAllGroups, getInstructors, deleteGroup, updateGroup } from '../../../Redux/Slices/GroupsSlice';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../../Helpers/axiosInstance';

export default function Groups() {
  const dispatch = useDispatch();
  const { data: userData, role } = useSelector((state) => state.auth);
  const { groups: groupsData, instructors: instructorsData, loading: groupsLoading } = useSelector((state) => state.groups);
  
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupAttendance, setGroupAttendance] = useState([]);
  const [groups, setGroups] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [expandedStudents, setExpandedStudents] = useState({});
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    instructor: '',
    price: '',
    maxStudents: 15,
    monthlyPayment: {
      enabled: false,
      price: '',
      dueDay: 1
    },
    weeklySchedule: {
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] },
      monday: { enabled: false, timeSlots: [] },
      tuesday: { enabled: false, timeSlots: [] },
      wednesday: { enabled: false, timeSlots: [] },
      thursday: { enabled: false, timeSlots: [] },
      friday: { enabled: false, timeSlots: [] }
    }
  });

  // Load groups and instructors data
  useEffect(() => {
    dispatch(getAllGroups());
    dispatch(getInstructors());
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (groupsData) {
      setGroups(groupsData);
    }
  }, [groupsData]);

  useEffect(() => {
    if (instructorsData) {
      setInstructors(instructorsData);
    }
  }, [instructorsData]);

  const handleGroupFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setGroupForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (field.includes('weeklySchedule.')) {
      const parts = field.split('.');
      const day = parts[1];
      const property = parts[2];
      setGroupForm(prev => ({
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            [property]: value
          }
        }
      }));
    } else {
      setGroupForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTimeSlot = (day) => {
    setGroupForm(prev => {
      const daySchedule = prev.weeklySchedule[day];
      const timeSlots = [...(daySchedule.timeSlots || [])];
      
      // Add new time slot with default values
      timeSlots.push({
        hour: 9,
        minute: 0,
        period: 'AM',
        duration: 60
      });
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...daySchedule,
            timeSlots
          }
        }
      };
    });
  };

  const removeTimeSlot = (day, index) => {
    setGroupForm(prev => {
      const daySchedule = prev.weeklySchedule[day];
      const timeSlots = [...(daySchedule.timeSlots || [])];
      
      timeSlots.splice(index, 1);
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...daySchedule,
            timeSlots
          }
        }
      };
    });
  };

  const updateTimeSlot = (day, index, field, value) => {
    setGroupForm(prev => {
      const daySchedule = prev.weeklySchedule[day];
      const timeSlots = [...(daySchedule.timeSlots || [])];
      
      timeSlots[index] = {
        ...timeSlots[index],
        [field]: value
      };
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...daySchedule,
            timeSlots
          }
        }
      };
    });
  };

  // Helper function to format time slots for display
  const formatTimeSlots = (weeklySchedule) => {
    const dayNames = {
      saturday: 'السبت',
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة'
    };

    const activeDays = [];
    
    // Debug: Log the weekly schedule data
    console.log('Weekly Schedule Data:', weeklySchedule);
    
    Object.entries(weeklySchedule || {}).forEach(([day, schedule]) => {
      console.log(`Day: ${day}, Schedule:`, schedule);
      
      // Check if there are time slots (regardless of enabled status)
      if (schedule && schedule.timeSlots && schedule.timeSlots.length > 0) {
        const dayName = dayNames[day];
        const timeSlotsText = schedule.timeSlots.map(slot => {
          const hour = slot.hour || 0;
          const minute = slot.minute || 0;
          const period = slot.period || 'AM';
          const duration = slot.duration || 60;
          
          // Format time (convert 24h to 12h if needed)
          let displayHour = hour;
          let displayPeriod = period;
          
          if (hour === 0) {
            displayHour = 12;
            displayPeriod = 'AM';
          } else if (hour > 12) {
            displayHour = hour - 12;
            displayPeriod = 'PM';
          } else if (hour === 12) {
            displayPeriod = 'PM';
          }
          
          const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${displayPeriod}`;
          return `${timeStr} (${duration}د)`;
        }).join(', ');
        
        activeDays.push(`${dayName}: ${timeSlotsText}`);
      }
    });
    
    console.log('Active Days:', activeDays);
    return activeDays;
  };

  const handleCreateGroup = async () => {
    try {
      await dispatch(createGroup(groupForm)).unwrap();
      toast.success('تم إنشاء المجموعة بنجاح');
      setShowGroupModal(false);
      setGroupForm({
        name: '',
        instructor: '',
        price: '',
        maxStudents: 15,
        monthlyPayment: {
          enabled: false,
          price: '',
          dueDay: 1
        },
        weeklySchedule: {
          saturday: { enabled: false, timeSlots: [] },
          sunday: { enabled: false, timeSlots: [] },
          monday: { enabled: false, timeSlots: [] },
          tuesday: { enabled: false, timeSlots: [] },
          wednesday: { enabled: false, timeSlots: [] },
          thursday: { enabled: false, timeSlots: [] },
          friday: { enabled: false, timeSlots: [] }
        }
      });
      // Reload groups list
      dispatch(getAllGroups());
    } catch (error) {
      toast.error(error || 'حدث خطأ في إنشاء المجموعة');
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`هل أنت متأكد من حذف المجموعة "${groupName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        await dispatch(deleteGroup(groupId)).unwrap();
        toast.success('تم حذف المجموعة بنجاح');
        // Reload groups list
        dispatch(getAllGroups());
      } catch (error) {
        toast.error(error || 'حدث خطأ في حذف المجموعة');
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name || '',
      instructor: group.instructor?._id || group.instructor || '',
      price: group.price || '',
      maxStudents: group.maxStudents || 15,
      monthlyPayment: {
        enabled: group.monthlyPayment?.enabled || false,
        price: group.monthlyPayment?.price || '',
        dueDay: group.monthlyPayment?.dueDay || 1
      },
      weeklySchedule: group.weeklySchedule || {
        saturday: { enabled: false, timeSlots: [] },
        sunday: { enabled: false, timeSlots: [] },
        monday: { enabled: false, timeSlots: [] },
        tuesday: { enabled: false, timeSlots: [] },
        wednesday: { enabled: false, timeSlots: [] },
        thursday: { enabled: false, timeSlots: [] },
        friday: { enabled: false, timeSlots: [] }
      },
      subjects: group.subjects || [],
      description: group.description || ''
    });
    setShowGroupModal(true);
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      instructor: '',
      price: '',
      maxStudents: 15,
      monthlyPayment: {
        enabled: false,
        price: '',
        dueDay: 1
      },
      weeklySchedule: {
        saturday: { enabled: false, timeSlots: [] },
        sunday: { enabled: false, timeSlots: [] },
        monday: { enabled: false, timeSlots: [] },
        tuesday: { enabled: false, timeSlots: [] },
        wednesday: { enabled: false, timeSlots: [] },
        thursday: { enabled: false, timeSlots: [] },
        friday: { enabled: false, timeSlots: [] }
      }
    });
  };

  // Fetch group attendance data
  const fetchGroupAttendance = async (groupId) => {
    try {
      setLoading(true);
      
      // Get current month's date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await axiosInstance.get(`/attendance/group/${groupId}`, {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      });
      
      setGroupAttendance(response.data?.data?.docs || []);
    } catch (error) {
      console.error('Error fetching group attendance:', error);
      toast.error('حدث خطأ في جلب بيانات الحضور');
      setGroupAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle view group details
  const handleViewGroupDetails = async (group) => {
    setSelectedGroup(group);
    setShowGroupDetailsModal(true);
    await fetchGroupAttendance(group._id);
  };

  const handleUpdateGroup = async () => {
    try {
      await dispatch(updateGroup({ 
        groupId: editingGroup._id, 
        updateData: groupForm 
      })).unwrap();
      toast.success('تم تحديث المجموعة بنجاح');
      setShowGroupModal(false);
      resetGroupForm();
      setEditingGroup(null);
      
      // Reload groups list
      dispatch(getAllGroups());
    } catch (error) {
      toast.error(error || 'حدث خطأ في تحديث المجموعة');
    }
  };

  if (loading || groupsLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Center Management Header */}
          <CenterManagementHeader />

          {/* Add Group Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <FaPlus />
              <span>إضافة مجموعة جديدة</span>
            </button>
          </div>

          {/* Groups List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                قائمة المجموعات
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {groups && groups.length} مجموعة
              </div>
            </div>

            {groupsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-4 text-sm sm:text-base">جاري التحميل...</p>
              </div>
            ) : !groups || groups.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد مجموعات بعد</p>
                <p className="text-sm text-gray-400 mt-2">ابدأ بإنشاء مجموعة جديدة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groups && groups.map((group) => (
                  <div key={group._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FaBook className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              المدرس: {group.instructor?.name || 'غير محدد'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button 
                            onClick={() => handleViewGroupDetails(group)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="عرض تفاصيل المجموعة"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleEditGroup(group)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="تعديل المجموعة"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteGroup(group._id, group.name)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="حذف المجموعة"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                            المعلومات الأساسية
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">السعر:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{group.price} ج.م</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">الطلاب:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {group.currentStudents || 0} / {group.maxStudents}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(group.createdAt).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Monthly Payment */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                            الدفع الشهري
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">مفعل:</span>
                              <span className={`text-sm font-medium ${group.monthlyPayment?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                {group.monthlyPayment?.enabled ? 'نعم' : 'لا'}
                              </span>
                            </div>
                            {group.monthlyPayment?.enabled && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">السعر الشهري:</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {group.monthlyPayment?.price || group.price} ج.م
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">يوم الاستحقاق:</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {group.monthlyPayment?.dueDay} من الشهر
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
                            الجدول الأسبوعي
                          </h4>
                          <div className="space-y-2">
                            {group.weeklySchedule && formatTimeSlots(group.weeklySchedule).length > 0 ? (
                              formatTimeSlots(group.weeklySchedule).map((daySchedule, index) => (
                                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                  {daySchedule}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                                لا توجد أوقات محددة
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingGroup ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowGroupModal(false);
                    setEditingGroup(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم المجموعة *
                    </label>
                    <input
                      type="text"
                      value={groupForm.name || ''}
                      onChange={(e) => handleGroupFormChange('name', e.target.value)}
                      placeholder="أدخل اسم المجموعة"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدرس *
                    </label>
                    <select
                      value={groupForm.instructor || ''}
                      onChange={(e) => handleGroupFormChange('instructor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={groupsLoading}
                    >
                      <option value="">
                        {groupsLoading ? 'جاري تحميل المدرسين...' : 'اختر المدرس'}
                      </option>
                      {instructors && instructors.length > 0 ? (
                        instructors.map((instructor) => (
                          <option key={instructor._id} value={instructor._id}>
                            {instructor.name}
                          </option>
                        ))
                      ) : (
                        !groupsLoading && <option value="" disabled>لا يوجد مدرسين متاحين</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سعر المجموعة (ج.م) *
                    </label>
                    <input
                      type="number"
                      value={groupForm.price || ''}
                      onChange={(e) => handleGroupFormChange('price', e.target.value)}
                      placeholder="أدخل سعر المجموعة"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحد الأقصى للطلاب
                    </label>
                    <input
                      type="number"
                      value={groupForm.maxStudents || 15}
                      onChange={(e) => handleGroupFormChange('maxStudents', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Monthly Payment Settings */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">إعدادات الدفع الشهري</h4>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="monthlyPayment"
                      checked={groupForm.monthlyPayment.enabled}
                      onChange={(e) => handleGroupFormChange('monthlyPayment.enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="monthlyPayment" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      تفعيل الدفع الشهري
                    </label>
                  </div>

                  {groupForm.monthlyPayment.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          السعر الشهري (ج.م)
                        </label>
                        <input
                          type="number"
                          value={groupForm.monthlyPayment.price || ''}
                          onChange={(e) => handleGroupFormChange('monthlyPayment.price', e.target.value)}
                          placeholder="اتركه فارغ لاستخدام السعر الكلي"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">إذا تُرك فارغًا، سيتم استخدام السعر الكلي</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          يوم استحقاق الدفع (من الشهر)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={groupForm.monthlyPayment.dueDay || 1}
                          onChange={(e) => handleGroupFormChange('monthlyPayment.dueDay', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">اليوم من الشهر الذي يستحق فيه الدفع</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Schedule */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الجدول الأسبوعي</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">اختر الأيام والأوقات التي تريد إضافة دروس فيها</p>
                  
                  <div className="space-y-4">
                    {Object.entries({
                      saturday: 'السبت',
                      sunday: 'الأحد',
                      monday: 'الاثنين',
                      tuesday: 'الثلاثاء',
                      wednesday: 'الأربعاء',
                      thursday: 'الخميس',
                      friday: 'الجمعة'
                    }).map(([day, dayName]) => (
                      <div key={day} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {dayName}
                          </h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {groupForm.weeklySchedule[day].timeSlots?.length || 0} وقت محدد
                          </div>
                        </div>

                        {/* Time Slots Management */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              الأوقات المتاحة
                            </label>
                            <button
                              type="button"
                              onClick={() => addTimeSlot(day)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              + إضافة وقت
                            </button>
                          </div>

                          {groupForm.weeklySchedule[day].timeSlots && groupForm.weeklySchedule[day].timeSlots.length > 0 && (
                            <div className="space-y-3">
                              {groupForm.weeklySchedule[day].timeSlots.map((timeSlot, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      وقت {index + 1}
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() => removeTimeSlot(day, index)}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">الساعة</label>
                                      <select
                                        value={timeSlot.hour}
                                        onChange={(e) => updateTimeSlot(day, index, 'hour', parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5</option>
                                        <option value={6}>6</option>
                                        <option value={7}>7</option>
                                        <option value={8}>8</option>
                                        <option value={9}>9</option>
                                        <option value={10}>10</option>
                                        <option value={11}>11</option>
                                        <option value={12}>12</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">الدقيقة</label>
                                      <select
                                        value={timeSlot.minute}
                                        onChange={(e) => updateTimeSlot(day, index, 'minute', parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      >
                                        <option value={0}>00</option>
                                        <option value={15}>15</option>
                                        <option value={30}>30</option>
                                        <option value={45}>45</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">فترة</label>
                                      <select
                                        value={timeSlot.period}
                                        onChange={(e) => updateTimeSlot(day, index, 'period', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      >
                                        <option value="AM">ص</option>
                                        <option value="PM">م</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">المدة</label>
                                      <select
                                        value={timeSlot.duration}
                                        onChange={(e) => updateTimeSlot(day, index, 'duration', parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      >
                                        <option value={30}>30 دقيقة</option>
                                        <option value={45}>45 دقيقة</option>
                                        <option value={60}>60 دقيقة</option>
                                        <option value={90}>90 دقيقة</option>
                                        <option value={120}>120 دقيقة</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                      <span className="font-medium">الوقت المحدد:</span> {' '}
                                      {timeSlot.hour}:{String(timeSlot.minute).padStart(2, '0')} {timeSlot.period === 'AM' ? 'صباحاً' : 'مساءً'} - 
                                      مدة الدرس: {timeSlot.duration} دقيقة
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {(!groupForm.weeklySchedule[day].timeSlots || groupForm.weeklySchedule[day].timeSlots.length === 0) && (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">لا توجد أوقات محددة لهذا اليوم</p>
                              <p className="text-xs mt-1">اضغط على "إضافة وقت" لبدء إضافة الأوقات</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                    className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingGroup ? 'تحديث المجموعة' : 'إنشاء المجموعة'}
                  </button>
                  <button
                    onClick={() => {
                      setShowGroupModal(false);
                      setEditingGroup(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  تفاصيل المجموعة - {selectedGroup.name}
                </h3>
                <button
                  onClick={() => {
                    setShowGroupDetailsModal(false);
                    setSelectedGroup(null);
                    setGroupAttendance([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Group Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  معلومات المجموعة
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">اسم المجموعة:</span>
                    <p className="font-medium">{selectedGroup.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">المدرس:</span>
                    <p className="font-medium">{selectedGroup.instructor?.name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">السعر:</span>
                    <p className="font-medium">{selectedGroup.price} جنيه</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">الحد الأقصى للطلاب:</span>
                    <p className="font-medium">{selectedGroup.maxStudents}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">عدد الطلاب الحالي:</span>
                    <p className="font-medium">{selectedGroup.students?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">تاريخ الإنشاء:</span>
                    <p className="font-medium">{new Date(selectedGroup.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل بيانات الحضور...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Attendance Section */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaCalendarAlt className="text-green-600" />
                      سجل الحضور الشهري
                    </h4>
                    
                    {groupAttendance.length > 0 ? (
                      <div className="overflow-x-auto">
                        {(() => {
                          // Group attendance by student
                          const attendanceByStudent = {};
                          groupAttendance.forEach(record => {
                            const studentName = record.qrData?.fullName || record.user?.fullName || 'غير محدد';
                            const studentId = record.user?._id || record.qrData?.userId || studentName;
                            
                            if (!attendanceByStudent[studentId]) {
                              attendanceByStudent[studentId] = {
                                name: studentName,
                                records: [],
                                presentCount: 0,
                                absentCount: 0,
                                lateCount: 0
                              };
                            }
                            
                            attendanceByStudent[studentId].records.push(record);
                            
                            if (record.status === 'present') {
                              attendanceByStudent[studentId].presentCount++;
                            } else if (record.status === 'absent') {
                              attendanceByStudent[studentId].absentCount++;
                            } else {
                              attendanceByStudent[studentId].lateCount++;
                            }
                          });

                          return (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                  <th className="text-right py-3 px-4">اسم الطالب</th>
                                  <th className="text-center py-3 px-4">أيام الحضور</th>
                                  <th className="text-center py-3 px-4">أيام الغياب</th>
                                  <th className="text-center py-3 px-4">أيام التأخير</th>
                                  <th className="text-center py-3 px-4">إجمالي الأيام</th>
                                  <th className="text-center py-3 px-4">نسبة الحضور</th>
                                  <th className="text-center py-3 px-4">التفاصيل</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.values(attendanceByStudent).map((student, index) => {
                                  const totalDays = student.records.length;
                                  const attendanceRate = totalDays > 0 ? Math.round((student.presentCount / totalDays) * 100) : 0;
                                  const studentKey = `student-${index}`;
                                  const isExpanded = expandedStudents[studentKey];
                                  
                                  return (
                                    <React.Fragment key={index}>
                                      <tr className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="py-3 px-4 font-medium">
                                          {student.name}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                            {student.presentCount}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                                            {student.absentCount}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                                            {student.lateCount}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-medium">
                                          {totalDays}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <div className={`w-12 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600`}>
                                              <div 
                                                className={`h-full transition-all duration-300 ${
                                                  attendanceRate >= 80 ? 'bg-green-500' : 
                                                  attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${attendanceRate}%` }}
                                              ></div>
                                            </div>
                                            <span className={`text-xs font-medium ${
                                              attendanceRate >= 80 ? 'text-green-600 dark:text-green-400' : 
                                              attendanceRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                              {attendanceRate}%
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <button
                                            onClick={() => {
                                              setExpandedStudents(prev => ({
                                                ...prev,
                                                [studentKey]: !prev[studentKey]
                                              }));
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                            title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                          >
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                          </button>
                                        </td>
                                      </tr>
                                      
                                      {/* Expanded Details Row */}
                                      {isExpanded && (
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                          <td colSpan="7" className="px-4 py-3">
                                            <div className="space-y-3">
                                              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                تفاصيل الحضور لـ {student.name}
                                              </h5>
                                              
                                              {/* Present Days */}
                                              {student.records.filter(r => r.status === 'present').length > 0 && (
                                                <div>
                                                  <h6 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                                    أيام الحضور ({student.presentCount}):
                                                  </h6>
                                                  <div className="flex flex-wrap gap-2">
                                                    {student.records
                                                      .filter(r => r.status === 'present')
                                                      .sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate))
                                                      .map((record, idx) => (
                                                        <span 
                                                          key={idx}
                                                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs"
                                                        >
                                                          {new Date(record.attendanceDate).toLocaleDateString('ar-EG')} - {new Date(record.attendanceDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                      ))
                                                    }
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Absent Days */}
                                              {student.records.filter(r => r.status === 'absent').length > 0 && (
                                                <div>
                                                  <h6 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                                                    أيام الغياب ({student.absentCount}):
                                                  </h6>
                                                  <div className="flex flex-wrap gap-2">
                                                    {student.records
                                                      .filter(r => r.status === 'absent')
                                                      .sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate))
                                                      .map((record, idx) => (
                                                        <span 
                                                          key={idx}
                                                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-xs"
                                                        >
                                                          {new Date(record.attendanceDate).toLocaleDateString('ar-EG')}
                                                        </span>
                                                      ))
                                                    }
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Late Days */}
                                              {student.records.filter(r => r.status === 'late').length > 0 && (
                                                <div>
                                                  <h6 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                                                    أيام التأخير ({student.lateCount}):
                                                  </h6>
                                                  <div className="flex flex-wrap gap-2">
                                                    {student.records
                                                      .filter(r => r.status === 'late')
                                                      .sort((a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate))
                                                      .map((record, idx) => (
                                                        <span 
                                                          key={idx}
                                                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded text-xs"
                                                        >
                                                          {new Date(record.attendanceDate).toLocaleDateString('ar-EG')} - {new Date(record.attendanceDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                      ))
                                                    }
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()}
                        
                        {/* Attendance Summary */}
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {groupAttendance.filter(r => r.status === 'present').length}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">حضور</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {groupAttendance.filter(r => r.status === 'absent').length}
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-300">غياب</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {groupAttendance.length}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">إجمالي السجلات</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        لا توجد سجلات حضور لهذا الشهر
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
