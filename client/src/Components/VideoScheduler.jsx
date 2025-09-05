import React, { useState } from 'react';
import { FaCalendar, FaClock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../Helpers/axiosInstance';

const VideoScheduler = ({ 
  courseId, 
  lessonId, 
  lessonType, 
  isScheduled = false, 
  scheduledPublishDate = null,
  onScheduleUpdate 
}) => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    scheduledPublishDate ? new Date(scheduledPublishDate).toISOString().slice(0, 16) : ''
  );
  const [isScheduling, setIsScheduling] = useState(isScheduled);
  const [loading, setLoading] = useState(false);

  const handleScheduleUpdate = async () => {
    if (isScheduling && !scheduledDate) {
      toast.error('Please select a publish date');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/courses/${courseId}/lessons/${lessonId}/schedule/${lessonType}`,
        {
          isScheduled: isScheduling,
          scheduledPublishDate: isScheduling ? scheduledDate : null
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onScheduleUpdate && onScheduleUpdate({
          isScheduled: isScheduling,
          scheduledPublishDate: isScheduling ? scheduledDate : null
        });
        setShowScheduler(false);
      }
    } catch (error) {
      console.error('Error scheduling video:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule video');
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPublished = () => {
    if (!isScheduled || !scheduledPublishDate) return false;
    const now = new Date();
    const publishDate = new Date(scheduledPublishDate);
    return publishDate <= now;
  };

  return (
    <div className="relative">
      {/* Schedule Status Display */}
      <div className="flex items-center gap-2">
        {isScheduled ? (
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-blue-500" />
            <span className="text-blue-600 font-medium">
              {isPublished() ? 'Published' : 'Scheduled'}
            </span>
            {scheduledPublishDate && (
              <span className="text-gray-600">
                {isPublished() ? 'on' : 'for'} {formatScheduledDate(scheduledPublishDate)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaEye className="text-green-500" />
            <span>Available Now</span>
          </div>
        )}
        
        <button
          onClick={() => setShowScheduler(!showScheduler)}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
        >
          {isScheduled ? 'Edit Schedule' : 'Schedule Video'}
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduler && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-80">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-blue-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Schedule Video Publication
              </h4>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isScheduling}
                  onChange={(e) => setIsScheduling(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Schedule this video for later publication
                </span>
              </label>

              {isScheduling && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select when this video should become available to students
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleScheduleUpdate}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Updating...' : isScheduling ? 'Schedule Video' : 'Remove Schedule'}
              </button>
              <button
                onClick={() => setShowScheduler(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoScheduler; 