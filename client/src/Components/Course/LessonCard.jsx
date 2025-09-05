import React from 'react';
import { 
  FaPlay, 
  FaEye, 
  FaClock, 
  FaVideo, 
  FaFilePdf, 
  FaClipboardCheck, 
  FaClipboardList, 
  FaGem
} from 'react-icons/fa';

export default function LessonCard({ 
  lesson, 
  role, 
  onDetail, 
  onAddVideo, 
  onAddPdf, 
  onAddTrainingExam, 
  onAddFinalExam, 
  getLessonTitle,
  getLessonDescription,
  getLessonDuration,
  hasVideo,
  hasPdf,
  hasTrainingExam,
  hasFinalExam
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Lesson Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-[#9b172a] to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaPlay className="text-white" />
              </div>
              {hasVideo && hasVideo(lesson) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#9b172a]-400 to-[#9b172a] rounded-full flex items-center justify-center">
                  <FaGem className="text-white text-xs" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                {getLessonTitle ? getLessonTitle(lesson) : lesson.title}
              </h3>
              {lesson.unitTitle && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  من وحدة: {lesson.unitTitle}
                </p>
              )}
              {lesson.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {getLessonDescription ? getLessonDescription(lesson) : lesson.description}
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
              {getLessonDuration ? getLessonDuration(lesson) : lesson.duration} دقيقة
            </span>
          )}
          {hasVideo && hasVideo(lesson) && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <FaVideo />
              فيديو متاح
            </span>
          )}
          {hasPdf && hasPdf(lesson) && (
            <span className="flex items-center gap-1 text-xs text-[#9b172a]">
              <FaFilePdf />
              PDF متاح
            </span>
          )}
          {hasTrainingExam && hasTrainingExam(lesson) && (
            <span className="flex items-center gap-1 text-xs text-[#9b172a]">
              <FaClipboardCheck />
              امتحان تدريبي
            </span>
          )}
          {hasFinalExam && hasFinalExam(lesson) && (
            <span className="flex items-center gap-1 text-xs text-[#9b172a]">
              <FaClipboardList />
              امتحان 
            </span>
          )}
        </div>

        {/* Action Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                متاح للمشاهدة
              </span>
            </div>
            <button
              onClick={() => onDetail && onDetail(lesson)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-[#9b172a] to-[#9b172a] text-white hover:from-[#9b172a] hover:to-[#9b172a]-700"
            >
              <FaEye />
              مشاهدة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}