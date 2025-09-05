import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaQrcode, FaBook, FaUsers, FaCog, FaMoneyBillWave, FaGraduationCap, FaGalacticRepublic } from 'react-icons/fa';

const CenterManagementHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'overview',
      name: 'نظرة عامة',
      icon: FaChartLine,
      path: '/admin/center-management',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'attendance',
      name: 'إدارة الحضور',
      icon: FaQrcode,
      path: '/admin/center-management/attendance',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'groups',
      name: 'إدارة المجموعات',
      icon: FaBook,
      path: '/admin/center-management/groups',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'students',
      name: 'إدارة الطلاب',
      icon: FaUsers,
      path: '/admin/center-management/students',
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'financial',
      name: 'إدارة المالية',
      icon: FaMoneyBillWave,
      path: '/admin/center-management/financial',
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'offline-grades',
      name: ' رصد الدرجات  ',
      icon: FaGraduationCap,
      path: '/admin/center-management/offline-grades',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'achievements',
      name: 'الإنجازات',
      icon: FaGalacticRepublic,
      path: '/admin/center-management/achievements',
      color: 'text-pink-600 dark:text-pink-400'
    },
  ];

  const isActiveTab = (tabPath) => {
    if (tabPath === '/admin/center-management') {
      return location.pathname === tabPath;
    }
    return location.pathname.startsWith(tabPath);
  };

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            إدارة المركز
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة شامل لجميع جوانب المركز التعليمي
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <FaChartLine className="text-3xl text-blue-500" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="flex space-x-8 space-x-reverse overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? `border-blue-500 ${tab.color}`
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`text-lg ${isActive ? tab.color : ''}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default CenterManagementHeader;
