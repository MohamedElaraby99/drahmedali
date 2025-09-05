import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSubjects } from "../../Redux/Slices/SubjectSlice";
import Layout from "../../Layout/Layout";
import SubjectCard from "../../Components/SubjectCard";
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaStar,
  FaUsers,
  FaClock
} from "react-icons/fa";

export default function SubjectList() {
  const dispatch = useDispatch();
  const { subjects, loading, totalPages, currentPage, total, categories, levels } = useSelector((state) => state.subject);
  const { role } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(getAllSubjects({ 
      page: currentPage, 
      category, 
      search, 
      status,
      sortBy 
    }));
  }, [currentPage, category, search, status, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getAllSubjects({ 
      page: 1, 
      category, 
      search, 
      status,
      sortBy 
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setStatus("");
    setSortBy("newest");
    dispatch(getAllSubjects({ page: 1 }));
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {role === "USER" ? "كورساتي" : "Available Courses"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {role === "USER" 
                ? "استكشف دوراتك الشخصية عبر مختلف المواد" 
                : "Explore our comprehensive collection of courses across various subjects"
              }
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={role === "USER" ? "البحث في كورساتي..." : "Search courses..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {total} {role === "USER" ? "كورسة" : "courses"} found
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  مسح الفلتر
                </button>
              </div>
            </form>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {role === "USER" ? "جاري تحميل كورساتي..." : "Loading courses..."}
              </p>
            </div>
          ) : subjects && subjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.map((subject) => (
                  <SubjectCard key={subject._id} subject={subject} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => dispatch(getAllSubjects({ 
                          page, 
                          category, 
                          search, 
                          status, 
                          sortBy 
                        }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {role === "USER" ? "لا توجد كورسات" : "No courses found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {search || category || level 
                  ? (role === "USER" ? "حاول تعديل معايير البحث" : "Try adjusting your search criteria")
                  : (role === "USER" ? "لا توجد كورسات متاحة في الوقت الحالي" : "No courses available at the moment")
                }
              </p>
              {!search && !category && !level && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  <FaSearch />
                  {role === "USER" ? "تصفح جميع كورساتي" : "Browse All Courses"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 