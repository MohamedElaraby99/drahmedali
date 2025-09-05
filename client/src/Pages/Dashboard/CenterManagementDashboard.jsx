import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CenterManagementDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're at the exact path
    if (location.pathname === '/admin/center-management') {
      navigate('/admin/center-management/overview', { replace: true });
    }
  }, [navigate, location.pathname]);

  // If we're not at the exact path, don't render anything (let the router handle it)
  if (location.pathname !== '/admin/center-management') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">جاري التوجيه...</p>
      </div>
    </div>
  );
}
