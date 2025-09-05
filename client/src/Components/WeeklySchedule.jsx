import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaClock, FaUsers, FaPlay } from 'react-icons/fa';
import { getAllGroups } from '../Redux/Slices/GroupsSlice';

const WeeklySchedule = () => {
  const dispatch = useDispatch();
  const { groups: groupsData, loading: groupsLoading } = useSelector((state) => state.groups);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  useEffect(() => {
    if (groupsData) {
      setGroups(groupsData);
    }
  }, [groupsData]);

  // Get current day name in Arabic
  const getCurrentDayName = () => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[currentDate.getDay()];
  };

  // Format date in Arabic
  const formatDate = (date) => {
    return date.toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get day name in Arabic
  const getDayName = (dayKey) => {
    const dayNames = {
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت'
    };
    return dayNames[dayKey] || dayKey;
  };

  // Format time for display
  const formatTime = (hour, minute, period) => {
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
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${displayPeriod}`;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startHour, startMinute, duration) => {
    let endHour = startHour;
    let endMinute = startMinute + duration;
    
    // Handle minute overflow
    while (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
    
    // Handle hour overflow (24-hour format)
    if (endHour >= 24) {
      endHour -= 24;
    }
    
    // Convert to 12-hour format
    let displayHour = endHour;
    let displayPeriod = 'AM';
    
    if (endHour === 0) {
      displayHour = 12;
      displayPeriod = 'AM';
    } else if (endHour > 12) {
      displayHour = endHour - 12;
      displayPeriod = 'PM';
    } else if (endHour === 12) {
      displayPeriod = 'PM';
    }
    
    return `${displayHour}:${endMinute.toString().padStart(2, '0')} ${displayPeriod}`;
  };

  // Check if a day is today
  const isToday = (dayKey) => {
    const today = new Date();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayKey);
    return today.getDay() === dayIndex;
  };

  // Get groups for a specific day
  const getGroupsForDay = (dayKey) => {
    return groups.filter(group => {
      const daySchedule = group.weeklySchedule?.[dayKey];
      return daySchedule && daySchedule.timeSlots && daySchedule.timeSlots.length > 0;
    }).flatMap(group => {
      const daySchedule = group.weeklySchedule[dayKey];
      return daySchedule.timeSlots.map(timeSlot => {
        const startTime = formatTime(timeSlot.hour, timeSlot.minute, timeSlot.period);
        const endTime = calculateEndTime(timeSlot.hour, timeSlot.minute, timeSlot.duration || 60);
        
        return {
          ...group,
          timeSlot,
          displayTime: `${startTime} - ${endTime}`
        };
      });
    }).sort((a, b) => {
      // Sort by time
      const timeA = a.timeSlot.hour * 60 + a.timeSlot.minute;
      const timeB = b.timeSlot.hour * 60 + b.timeSlot.minute;
      return timeA - timeB;
    });
  };

  // Handle join button click
  const handleJoin = (group) => {
    console.log('Joining group:', group.name);
    // TODO: Implement join functionality
  };

  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  if (groupsLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">جاري تحميل الجدول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
          <FaCalendarAlt className="text-xl sm:text-2xl text-blue-500" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              جدول الأسبوع الدراسي
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              اليوم {getCurrentDayName()}، {formatDate(currentDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px] sm:min-w-[600px] lg:min-w-[800px] xl:min-w-[1000px]">
          {/* Mobile: Single column view */}
          <div className="block lg:hidden">
            <div className="space-y-4">
              {days.map((dayKey) => {
                const dayGroups = getGroupsForDay(dayKey);
                const isCurrentDay = isToday(dayKey);
                
                return (
                  <div
                    key={dayKey}
                    className={`rounded-lg p-4 ${
                      isCurrentDay 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700' 
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-bold text-lg ${
                        isCurrentDay 
                          ? 'text-purple-700 dark:text-purple-300' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {getDayName(dayKey)}
                      </h3>
                      {isCurrentDay && (
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                      )}
                    </div>

                    {/* Groups for this day - Horizontal scroll on mobile */}
                    <div className="overflow-x-auto">
                      <div className="flex space-x-3 space-x-reverse min-w-max">
                        {dayGroups.length > 0 ? (
                          dayGroups.map((group, index) => (
                            <div
                              key={`${group._id}-${index}`}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow min-w-[200px] flex-shrink-0"
                            >
                              {/* Time */}
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <FaClock className="text-xs text-gray-500" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {group.displayTime}
                                </span>
                              </div>

                              {/* Group Name */}
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {group.name}
                              </h4>

                              {/* Instructor */}
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {group.instructor?.name || 'غير محدد'}
                              </p>

                              {/* Students Count */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-1 space-x-reverse">
                                  <FaUsers className="text-xs text-gray-500" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {group.currentStudents || 0}/{group.maxStudents}
                                  </span>
                                </div>
                              </div>

                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center min-w-[200px] h-32">
                            <div className="text-gray-400 dark:text-gray-500 text-sm">
                              لا توجد حصص
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: 7-column grid view */}
          <div className="hidden lg:grid grid-cols-7 gap-2 xl:gap-4">
            {days.map((dayKey) => {
              const dayGroups = getGroupsForDay(dayKey);
              const isCurrentDay = isToday(dayKey);
              
              return (
                <div
                  key={dayKey}
                  className={`min-h-[500px] xl:min-h-[600px] p-2 xl:p-4 rounded-lg ${
                    isCurrentDay 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700' 
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  {/* Day Header */}
                  <div className="text-center mb-3 xl:mb-4">
                    <h3 className={`font-bold text-sm xl:text-lg ${
                      isCurrentDay 
                        ? 'text-purple-700 dark:text-purple-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getDayName(dayKey)}
                    </h3>
                    {isCurrentDay && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                    )}
                  </div>

                  {/* Groups for this day */}
                  <div className="space-y-2 xl:space-y-3">
                    {dayGroups.length > 0 ? (
                      dayGroups.map((group, index) => (
                        <div
                          key={`${group._id}-${index}`}
                          className="bg-white dark:bg-gray-800 rounded-lg p-2 xl:p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                          {/* Time */}
                          <div className="flex items-center space-x-1 space-x-reverse mb-2">
                            <FaClock className="text-xs text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {group.displayTime}
                            </span>
                          </div>

                          {/* Group Name */}
                          <h4 className="font-bold text-xs xl:text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {group.name}
                          </h4>

                          {/* Instructor */}
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {group.instructor?.name || 'غير محدد'}
                          </p>

                          {/* Students Count */}
                          <div className="flex items-center justify-between mb-2 xl:mb-3">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <FaUsers className="text-xs text-gray-500" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {group.currentStudents || 0}/{group.maxStudents}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 xl:py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-xs xl:text-sm">
                          لا توجد حصص
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
