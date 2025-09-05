import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaBook, FaVideo, FaFileAlt, FaExclamationCircle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { axiosInstance } from '../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';

const CourseNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: userData } = useSelector((state) => state.auth);

  // Fetch course notifications
  const fetchNotifications = async () => {
    if (!userData?._id) return;
    
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications for user:', userData._id);
      const response = await axiosInstance.get('/notifications/notifications');
      console.log('🔔 Notifications response:', response.data);
      
      if (response.data?.success) {
        const notificationData = response.data.data || [];
        console.log('🔔 Notification data:', notificationData);
        setNotifications(notificationData);
        
        // Count unread notifications
        const unread = notificationData.filter(notif => !notif.isRead).length;
        setUnreadCount(unread);
        console.log('🔔 Unread count:', unread);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      console.log('🔔 Marking notification as read:', notificationId);
      await axiosInstance.patch(`/notifications/notifications/${notificationId}/read`);
      
      // Update local state - remove the notification entirely
      setNotifications(prev => {
        const updated = prev.filter(notif => notif._id !== notificationId);
        console.log('🔔 Notifications after removal:', updated.length);
        return updated;
      });
      
      // Update unread count
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('🔔 New unread count:', newCount);
        return newCount;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/notifications/read-all');
      
      // Remove all notifications from the list
      setNotifications([]);
      setUnreadCount(0);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_video':
        return <FaVideo className="text-blue-500" />;
      case 'new_lesson':
        return <FaBook className="text-green-500" />;
      case 'new_material':
        return <FaFileAlt className="text-purple-500" />;
      case 'course_update':
        return <FaExclamationCircle className="text-orange-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'منذ قليل';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (userData?._id) {
      fetchNotifications();
      
      // Set up polling for new notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userData?._id]);

  // Don't render if user is not logged in
  if (!userData?._id) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-700 dark:hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200 dark:border-blue-600"
      >
        <FaBell className="w-4 h-4 md:w-5 md:h-5 text-blue-700 dark:text-blue-300" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              إشعارات الكورسات
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  تحديد الكل كمقروء
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                جاري تحميل الإشعارات...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                لا توجد إشعارات جديدة
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={async () => {
                    if (!notification.isRead) {
                      await markAsRead(notification._id);
                    }
                    // Close dropdown immediately
                    setIsOpen(false);
                    // Navigate to course page
                    if (notification.courseUrl) {
                      window.location.href = notification.courseUrl;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      
                      {/* Show content details if available */}
                      {notification.contentDetails && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                          {notification.contentDetails.videoTitle && (
                            <p className="font-medium text-gray-700 dark:text-gray-200">
                              🎥 {notification.contentDetails.videoTitle}
                            </p>
                          )}
                          {notification.contentDetails.lessonTitle && (
                            <p className="text-gray-600 dark:text-gray-300">
                              📚 درس: {notification.contentDetails.lessonTitle}
                            </p>
                          )}
                          {notification.contentDetails.videoDescription && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              {notification.contentDetails.videoDescription}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {notification.courseName}
                          </span>
                          {notification.actionText && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                              {notification.actionText}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to courses page or notifications page
                  window.location.href = '/courses';
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                عرض جميع الكورسات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CourseNotifications;
