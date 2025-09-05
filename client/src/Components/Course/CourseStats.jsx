import React from 'react';
import { FaBook, FaUsers, FaStar, FaDollarSign, FaPlay, FaGraduationCap } from 'react-icons/fa';

const CourseStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="mt-4">
              <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "إجمالي الدورات",
      value: stats?.totalCourses || 0,
      icon: FaBook,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "الكورسات المنشورة",
      value: stats?.publishedCourses || 0,
      icon: FaPlay,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "إجمالي الطلاب",
      value: stats?.totalStudents || 0,
      icon: FaUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value.toLocaleString()}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {stat.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {index === 0 && "جميع الكورسات في النظام"}
              {index === 1 && "الكورسات المتاحة للطلاب"}
             
              {index === 3 && "إجمالي الطلاب المسجلين"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseStats;
