import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const CourseFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="mt-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="البحث في الدورات..."
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-2"
        >
          {showAdvancedFilters ? 'إخفاء' : 'إظهار'} الفلاتر المتقدمة
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium flex items-center gap-2"
          >
            <FaTimes className="text-sm" />
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {/* Instructor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المدرب
            </label>
            <input
              type="text"
              placeholder="اسم المدرب..."
              value={filters.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المادة
            </label>
            <input
              type="text"
              placeholder="اسم المادة..."
              value={filters.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المستوى
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع المستويات</option>
              <option value="Beginner">مبتدئ</option>
              <option value="Intermediate">متوسط</option>
              <option value="Advanced">متقدم</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اللغة
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع اللغات</option>
              <option value="Arabic">العربية</option>
              <option value="English">الإنجليزية</option>
              <option value="French">الفرنسية</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              مميز
            </label>
            <select
              value={filters.featured}
              onChange={(e) => handleInputChange('featured', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الدورات</option>
              <option value="true">مميزة فقط</option>
              <option value="false">غير مميزة</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الحالة
            </label>
            <select
              value={filters.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="true">منشورة</option>
             
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الصف
            </label>
            <input
              type="text"
              placeholder="اسم الصف..."
              value={filters.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المرحلة
            </label>
            <input
              type="text"
              placeholder="اسم المرحلة..."
              value={filters.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;
