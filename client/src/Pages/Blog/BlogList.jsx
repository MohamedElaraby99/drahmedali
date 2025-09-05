import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBlogs } from "../../Redux/Slices/BlogSlice";
import Layout from "../../Layout/Layout";
import { Link } from "react-router-dom";
import { FaEye, FaHeart, FaCalendar, FaUser } from "react-icons/fa";
import { placeholderImages } from "../../utils/placeholderImages";
import { generateImageUrl } from "../../utils/fileUtils";

export default function BlogList() {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blog);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAllBlogs({ page: currentPage, category, search }));
  }, [currentPage, category, search]);

  const categories = [
    "Technology",
    "Education", 
    "Programming",
    "Design",
    "Business",
    "Other"
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              مدونتنا
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              اكتشف الرؤى والنصائح والقصص من مجتمعنا التعليمي
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="البحث في المدونات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">جاري تحميل المدونات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs?.map((blog) => (
                <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Blog Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={generateImageUrl(blog.image?.secure_url)}
                      alt={blog.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = placeholderImages.blog;
                      }}
                    />
                  </div>
                  
                  {/* Blog Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 text-right">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-right">
                      {blog.excerpt}
                    </p>
                    
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 justify-end">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        {blog.category}
                      </span>
                    </div>
                    
                    {/* Read More Button */}
                    <Link
                      to={`/blog/${blog._id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      اقرأ المزيد
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {blogs?.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">لم يتم العثور على مدونات.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 