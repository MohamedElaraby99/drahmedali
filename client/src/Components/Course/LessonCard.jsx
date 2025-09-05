import React from 'react';
import { 
  FaPlay, 
  FaEye, 
  FaClock, 
  FaVideo, 
  FaFilePdf, 
  FaClipboardCheck, 
  FaClipboardList, 
  FaGem, 
  FaCheck, 
  FaLock 
} from 'react-icons/fa';

export default function LessonCard({ 
  lesson, 
  role, 
  onDetail, 
  onAddVideo, 
  onAddPdf, 
  onAddTrainingExam, 
  onAddFinalExam, 
  isPurchased, 
  canAfford, 
  onPurchase,
  getLessonTitle,
  getLessonDescription,
  getLessonDuration,
  getLessonPrice,
  hasVideo,
  hasPdf,
  hasTrainingExam,
  hasFinalExam,
  formatPrice,
  getPriceBadgeColor
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Lesson Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaPlay className="text-white" />
              </div>
              {hasVideo(lesson) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FaGem className="text-white text-xs" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                {getLessonTitle(lesson)}
              </h3>
              {lesson.unitTitle && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  من وحدة: {lesson.unitTitle}
                </p>
              )}
              {lesson.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {getLessonDescription(lesson)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Features */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {lesson.duration && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <FaClock />
              {getLessonDuration(lesson)} دقيقة
            </span>
          )}
          {hasVideo(lesson) && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <FaVideo />
              فيديو متاح
            </span>
          )}
          {hasPdf(lesson) && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <FaFilePdf />
              PDF متاح
            </span>
          )}
          {hasTrainingExam(lesson) && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <FaClipboardCheck />
              امتحان تدريبي
            </span>
          )}
          {hasFinalExam(lesson) && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <FaClipboardList />
              امتحان 
            </span>
          )}
        </div>

        {/* Purchase Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPurchased ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <FaCheck className="inline mr-1" />
                  تم الشراء
                </span>
              ) : (
                <>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                    {formatPrice(getLessonPrice(lesson))}
                  </span>
                  {!canAfford && (
                    <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <FaLock />
                      رصيد غير كافي
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => onDetail(lesson)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <FaEye />
              {isPurchased ? 'مشاهدة' : 'التفاصيل'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 