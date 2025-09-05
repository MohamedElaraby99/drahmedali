import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBlogById, likeBlog } from "../../Redux/Slices/BlogSlice";
import { generateImageUrl } from "../../utils/fileUtils";
import Layout from "../../Layout/Layout";
import { FaEye, FaHeart, FaCalendar, FaUser, FaArrowLeft } from "react-icons/fa";
import { placeholderImages } from "../../utils/placeholderImages";

export default function BlogDetail() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentBlog, loading } = useSelector((state) => state.blog);

  useEffect(() => {
    if (id) {
      dispatch(getBlogById(id));
    }
  }, [id, dispatch]);

  const handleLike = () => {
    dispatch(likeBlog(id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!currentBlog) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              المدونة غير موجودة
            </h2>
            <Link
              to="/blogs"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              العودة إلى المدونات
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <FaArrowLeft />
            العودة إلى المدونات
          </Link>

          {/* Blog Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-right">
              {currentBlog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-2">
                <FaUser />
                {currentBlog.author}
              </span>
              <span className="flex items-center gap-2">
                <FaCalendar />
                {formatDate(currentBlog.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <FaEye />
                {currentBlog.views} مشاهدة
              </span>
              <span className="flex items-center gap-2">
                <FaHeart />
                {currentBlog.likes} إعجاب
              </span>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-4 mb-6 justify-end">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                {currentBlog.category}
              </span>
              {currentBlog.tags && currentBlog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Blog Image */}
          <div className="mb-8">
            <img
              src={generateImageUrl(currentBlog.image?.secure_url)}
              alt={currentBlog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = placeholderImages.blogLarge;
              }}
            />
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-right">
              {currentBlog.content}
            </div>
          </div>

          {/* Like Button */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaHeart />
              أعجب بهذا المنشور
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
} 