import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaPlus, FaArrowLeft, FaArrowRight, FaChartLine, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getCairoMonthRange, formatCairoDate, getCairoNow } from '../utils/timezone';
import toast from 'react-hot-toast';

export default function MonthlyDataManager({ 
  onMonthChange, 
  currentMonth = null, 
  showStartNewMonth = true, 
  className = "" 
}) {
  const dispatch = useDispatch();
  const { data: userData, role } = useSelector((state) => state.auth);
  
  // Available months (starting from January 2024 to current month + 1)
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth || null);
  const [isStartingNewMonth, setIsStartingNewMonth] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    generateAvailableMonths();
    if (!selectedMonth) {
      // Default to current month
      const now = getCairoNow();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(currentMonthKey);
    }
  }, []);

  useEffect(() => {
    if (selectedMonth && onMonthChange) {
      const monthData = getMonthData(selectedMonth);
      onMonthChange(monthData);
    }
  }, [selectedMonth]);

  const generateAvailableMonths = () => {
    const months = [];
    const now = getCairoNow();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Start from January 2024 or earlier if needed
    const startYear = Math.min(2024, currentYear);
    
    for (let year = startYear; year <= currentYear; year++) {
      const startMonth = year === startYear ? 0 : 0; // Start from January
      const endMonth = year === currentYear ? currentMonth : 11;
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthDate = new Date(year, month, 1);
        
        months.push({
          key: monthKey,
          label: monthDate.toLocaleDateString('ar-EG', { 
            month: 'long', 
            year: 'numeric' 
          }),
          year,
          month: month + 1,
          date: monthDate,
          isCurrent: year === currentYear && month === currentMonth,
          isFuture: year > currentYear || (year === currentYear && month > currentMonth)
        });
      }
    }
    
    // Add next month if we want to allow starting new month
    if (showStartNewMonth) {
      const nextMonth = currentMonth + 1;
      const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
      const nextMonthIndex = nextMonth > 11 ? 0 : nextMonth;
      
      const nextMonthKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}`;
      const nextMonthDate = new Date(nextYear, nextMonthIndex, 1);
      
      months.push({
        key: nextMonthKey,
        label: nextMonthDate.toLocaleDateString('ar-EG', { 
          month: 'long', 
          year: 'numeric' 
        }),
        year: nextYear,
        month: nextMonthIndex + 1,
        date: nextMonthDate,
        isCurrent: false,
        isFuture: true,
        isNext: true
      });
    }
    
    setAvailableMonths(months.reverse()); // Most recent first
  };

  const getMonthData = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    return {
      key: monthKey,
      year,
      month,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      label: startDate.toLocaleDateString('ar-EG', { 
        month: 'long', 
        year: 'numeric' 
      }),
      isCurrent: monthKey === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      isFuture: startDate > new Date()
    };
  };

  const handleMonthSelect = (monthKey) => {
    setSelectedMonth(monthKey);
  };

  const handleStartNewMonth = async () => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      toast.error('ليس لديك صلاحية لبدء شهر جديد');
      return;
    }

    const now = getCairoNow();
    const nextMonth = now.getMonth() + 1;
    const nextYear = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
    const nextMonthIndex = nextMonth > 11 ? 0 : nextMonth;
    const nextMonthKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}`;

    setIsStartingNewMonth(true);
    
    try {
      // Here you would typically call an API to initialize the new month
      // For now, we'll just simulate the process
      
      toast.success('تم بدء الشهر الجديد بنجاح!');
      
      // Update available months and select the new month
      generateAvailableMonths();
      setSelectedMonth(nextMonthKey);
      
    } catch (error) {
      console.error('Error starting new month:', error);
      toast.error('حدث خطأ في بدء الشهر الجديد');
    } finally {
      setIsStartingNewMonth(false);
    }
  };

  const navigateMonth = (direction) => {
    const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setSelectedMonth(availableMonths[newIndex].key);
    }
  };

  const getCurrentMonthData = () => {
    return availableMonths.find(m => m.key === selectedMonth);
  };

  const currentMonthData = getCurrentMonthData();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            {isCollapsed ? (
              <FaChevronDown className="text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronUp className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
              <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
              <span>إدارة البيانات الشهرية</span>
            </h2>
            {!isCollapsed ? (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                اختر الشهر لعرض البيانات أو ابدأ شهراً جديداً
              </p>
            ) : currentMonthData && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                الشهر المحدد: {currentMonthData.label}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          
          {showStartNewMonth && ['ADMIN', 'SUPER_ADMIN'].includes(role) && (
            <button
              onClick={handleStartNewMonth}
              disabled={isStartingNewMonth}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <FaPlus />
              <span>{isStartingNewMonth ? 'جاري البدء...' : 'بدء شهر جديد'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            disabled={availableMonths.findIndex(m => m.key === selectedMonth) === 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaArrowRight />
          </button>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMonthData?.label || 'اختر شهراً'}
            </h3>
            {currentMonthData && (
              <div className="flex items-center justify-center space-x-2 space-x-reverse mt-1">
                {currentMonthData.isCurrent && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                    الشهر الحالي
                  </span>
                )}
                {currentMonthData.isFuture && !currentMonthData.isCurrent && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    شهر مستقبلي
                  </span>
                )}
                {!currentMonthData.isCurrent && !currentMonthData.isFuture && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full flex items-center space-x-1 space-x-reverse">
                    <FaHistory />
                    <span>بيانات سابقة</span>
                  </span>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            disabled={availableMonths.findIndex(m => m.key === selectedMonth) === availableMonths.length - 1}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaArrowLeft />
          </button>
        </div>

        {/* Month Grid Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableMonths.slice(0, 12).map((month) => (
            <button
              key={month.key}
              onClick={() => handleMonthSelect(month.key)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedMonth === month.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : month.isCurrent
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : month.isFuture
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="font-medium text-sm">
                {month.date.toLocaleDateString('ar-EG', { month: 'short' })}
              </div>
              <div className="text-xs mt-1">
                {month.year}
              </div>
              {month.isCurrent && (
                <div className="mt-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              )}
              {month.isNext && (
                <div className="mt-1">
                  <FaPlus className="text-xs mx-auto" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected Month Info */}
        {currentMonthData && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {currentMonthData.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatCairoDate(currentMonthData.startDateTime, { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })} - {formatCairoDate(currentMonthData.endDateTime, { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <FaChartLine className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentMonthData.isCurrent ? 'بيانات حية' : 'بيانات مؤرشفة'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}