import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUpcomingLiveMeetings, 
  getUserLiveMeetings, 
  joinLiveMeeting,
  getLiveMeeting
} from '../../Redux/Slices/LiveMeetingSlice';
import Layout from '../../Layout/Layout';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaVideo, 
  FaChalkboardTeacher,
  FaBookOpen,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaPlay,
  FaEye,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LiveMeetings = () => {
  const dispatch = useDispatch();
  const { upcomingMeetings, myMeetings, loading } = useSelector(state => state.liveMeeting);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      dispatch(getUpcomingLiveMeetings());
    } else {
      dispatch(getUserLiveMeetings({ status: statusFilter === 'all' ? '' : statusFilter }));
    }
  }, [dispatch, activeTab, statusFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'live': return 'مباشر الآن';
      case 'completed': return 'انتهى';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      // Get the meeting details first to get the Google Meet link
      const result = await dispatch(getLiveMeeting(meetingId)).unwrap();
      if (result.liveMeeting?.googleMeetLink) {
        window.open(result.liveMeeting.googleMeetLink, '_blank');
      } else {
        toast.error('رابط الاجتماع غير متوفر');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      toast.error('فشل في الانضمام للاجتماع');
    }
  };

  const handleViewMeeting = async (meetingId) => {
    try {
      const result = await dispatch(getLiveMeeting(meetingId)).unwrap();
      setSelectedMeeting(result.liveMeeting);
      setShowMeetingModal(true);
    } catch (error) {
      console.error('Failed to get meeting details:', error);
    }
  };

  const isMeetingLive = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.scheduledDate);
    const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    return now >= startTime && now <= endTime && meeting.status === 'live';
  };

  const isMeetingUpcoming = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.scheduledDate);
    return startTime > now && meeting.status === 'scheduled';
  };

  const filterMeetings = (meetings) => {
    return meetings.filter(meeting => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meeting.subject?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const renderMeetingCard = (meeting) => (
    <div key={meeting._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {meeting.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {meeting.description}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
          {getStatusText(meeting.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <FaCalendarAlt className="ml-2 text-blue-500" />
          <span className="text-sm">{formatDate(meeting.scheduledDate)}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <FaClock className="ml-2 text-green-500" />
          <span className="text-sm">{formatTime(meeting.scheduledDate)} ({getDuration(meeting.duration)})</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <FaChalkboardTeacher className="ml-2 text-blue-500" />
          <span className="text-sm">{meeting.instructor?.name}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <FaBookOpen className="ml-2 text-blue-500" />
          <span className="text-sm">{meeting.subject?.title}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300 col-span-full">
          <FaVideo className="ml-2 text-red-500" />
          <span className="text-sm">
            <a 
              href={meeting.googleMeetLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {meeting.googleMeetLink}
            </a>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <FaUsers className="ml-2 text-cyan-500" />
          <span className="text-sm">{meeting.attendeesCount || 0} مشارك</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(meeting.googleMeetLink);
              toast.success('تم نسخ الرابط إلى الحافظة');
            }}
            className="flex items-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
            title="نسخ الرابط"
          >
            <FaVideo />
            نسخ الرابط
          </button>
          
          <button
            onClick={() => handleViewMeeting(meeting._id)}
            className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm"
          >
            <FaEye />
            التفاصيل
          </button>
          
          {isMeetingLive(meeting) && (
            <button
              onClick={() => handleJoinMeeting(meeting._id)}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm animate-pulse"
            >
              <FaVideo />
              انضم الآن
            </button>
          )}
          
          {isMeetingUpcoming(meeting) && (
            <button
              onClick={() => toast.success('سيتم إشعارك قبل بدء الاجتماع')}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <FaPlay />
              تذكير
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              الجلسات المباشرة
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              شاهد واشترك في الجلسات التعليمية المباشرة
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                الجلسات القادمة
              </button>
              <button
                onClick={() => setActiveTab('my-meetings')}
                className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'my-meetings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                اجتماعاتي
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الجلسات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {activeTab === 'my-meetings' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="scheduled">مجدولة</option>
                  <option value="live">مباشرة</option>
                  <option value="completed">منتهية</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              )}
            </div>
          </div>

          {/* Meetings Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل الجلسات...</p>
            </div>
          ) : (
            <div>
              {activeTab === 'upcoming' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterMeetings(upcomingMeetings).length > 0 ? (
                    filterMeetings(upcomingMeetings).map(renderMeetingCard)
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FaCalendarAlt className="mx-auto text-gray-400 text-6xl mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        لا توجد اجتماعات قادمة
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        سيتم إشعارك عند إضافة اجتماعات جديدة
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterMeetings(myMeetings).length > 0 ? (
                    filterMeetings(myMeetings).map(renderMeetingCard)
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FaVideo className="mx-auto text-gray-400 text-6xl mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        لا توجد اجتماعات
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        لم تشترك في أي اجتماعات بعد
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meeting Details Modal */}
        {showMeetingModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedMeeting.title}
                </h2>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تفاصيل الاجتماع</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaCalendarAlt className="ml-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300">{formatDate(selectedMeeting.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="ml-3 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-300">{formatTime(selectedMeeting.scheduledDate)} ({getDuration(selectedMeeting.duration)})</span>
                    </div>
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="ml-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedMeeting.instructor?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <FaGraduationCap className="ml-3 text-indigo-500" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedMeeting.stage?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBookOpen className="ml-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedMeeting.subject?.title}</span>
                    </div>
                    <div className="flex items-center">
                      <FaVideo className="ml-3 text-red-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        <a 
                          href={selectedMeeting.googleMeetLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {selectedMeeting.googleMeetLink}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">الوصف</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedMeeting.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إغلاق
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMeeting.googleMeetLink);
                    toast.success('تم نسخ الرابط إلى الحافظة');
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  نسخ الرابط
                </button>
                
                {isMeetingLive(selectedMeeting) && (
                  <button
                    onClick={() => {
                      window.open(selectedMeeting.googleMeetLink, '_blank');
                      setShowMeetingModal(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors animate-pulse"
                  >
                    <FaVideo />
                    انضم للجلسةالمباشر
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                )}
                
                {!isMeetingLive(selectedMeeting) && selectedMeeting.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      window.open(selectedMeeting.googleMeetLink, '_blank');
                      setShowMeetingModal(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaVideo />
                    فتح الرابط
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default LiveMeetings;
