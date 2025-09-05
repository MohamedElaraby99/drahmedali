import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaUsers, FaClock, FaTag, FaPlay, FaGraduationCap } from "react-icons/fa";
import { generateImageUrl } from "../utils/fileUtils";
import { placeholderImages } from "../utils/placeholderImages";

const SubjectCard = ({ subject, showActions = false, onEdit, onDelete, onToggleFeatured }) => {

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:-translate-y-2" dir="rtl">
      {/* Image Container */}
      <div className="relative h-68 overflow-hidden">
        <img
          src={generateImageUrl(subject.image?.secure_url)}
          alt={subject.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src = placeholderImages.course;
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Featured Badge */}
        {subject.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
              ⭐ مميز
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-2">
        {/* Instructor Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            <FaGraduationCap className="ml-1.5" />
            {subject.instructor?.name || 'المدرس غير محدد'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 text-right leading-tight">
          {subject.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 text-right leading-relaxed">
          {subject.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between mb-6">   
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {(subject.rating || 5).toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              بواسطة {subject.instructor?.name || 'فريق التدريس المتخصص'}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">        
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(subject)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                تعديل
              </button>
              <button
                onClick={() => onToggleFeatured && onToggleFeatured(subject._id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  subject.featured 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                }`}
              >
                {subject.featured ? 'إلغاء التميز' : 'تمييز'}
              </button>
              <button
                onClick={() => onDelete(subject._id)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                حذف
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectCard; 