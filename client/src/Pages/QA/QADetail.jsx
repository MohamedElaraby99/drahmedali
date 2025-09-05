import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getQAById, upvoteQA, downvoteQA, answerQuestion, updateQA, deleteQA } from "../../Redux/Slices/QASlice";
import Layout from "../../Layout/Layout";
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaEye, 
  FaCalendar, 
  FaUser, 
  FaTag,
  FaShare,
  FaArrowLeft,
  FaEdit,
  FaTrash
} from "react-icons/fa";

export default function QADetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentQA, loading } = useSelector((state) => state.qa);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === "ADMIN";
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getQAById(id));
    }
  }, [id, dispatch]);

  const handleVote = async (voteType) => {
    try {
      if (voteType === 'upvote') {
        await dispatch(upvoteQA(id));
      } else {
        await dispatch(downvoteQA(id));
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'featured': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'answered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Technical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Course Related': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Payment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Account': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentQA?.question,
        text: currentQA?.answer,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You can add a toast notification here
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    try {
      await dispatch(answerQuestion({ id, answer }));
      setAnswer("");
      setShowAnswerForm(false);
    } catch (error) {
      console.error('Answer submission error:', error);
    }
  };

  const handleDeleteQA = async () => {
    if (window.confirm('Are you sure you want to delete this Q&A?')) {
      try {
        await dispatch(deleteQA(id));
        // Redirect to Q&A list
        navigate('/qa');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Q&A...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentQA) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Q&A not found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The Q&A you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/qa"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft />
              Back to Q&As
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/qa"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaArrowLeft />
              Back to Q&As
            </Link>
          </div>

          {/* Q&A Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentQA.status)}`}>
                  {currentQA.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentQA.category)}`}>
                  {currentQA.category}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Share"
                >
                  <FaShare />
                </button>
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                  <>
                    <Link
                      to={`/qa/edit/${currentQA._id}`}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {currentQA.question}
                </h1>
                
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/qa/edit/${id}`}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <FaEdit />
                      Edit
                    </Link>
                    <button
                      onClick={handleDeleteQA}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <FaUser />
                  {currentQA.author}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendar />
                  {formatDate(currentQA.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FaEye />
                  {currentQA.views} views
                </span>
              </div>

              {/* Tags */}
              {currentQA.tags && currentQA.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentQA.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      <FaTag className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answer */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Answer
                </h2>
                
                {/* Admin Answer Button */}
                {isAdmin && !currentQA.answer && (
                  <button
                    onClick={() => setShowAnswerForm(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <FaEdit />
                    Provide Answer
                  </button>
                )}
              </div>
              
              {currentQA.answer ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentQA.answer}
                  </p>
                </div>
              ) : isAdmin && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    This question is waiting for an admin to provide an answer.
                  </p>
                </div>
              )}
              
              {/* Admin Answer Form */}
              {isAdmin && showAnswerForm && (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Provide Answer
                  </h3>
                  <form onSubmit={handleAnswerSubmit}>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      rows="6"
                      required
                    />
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Submit Answer
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnswerForm(false)}
                        className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Voting Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote('upvote')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <FaThumbsUp />
                      <span className="font-medium">{currentQA.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote('downvote')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <FaThumbsDown />
                      <span className="font-medium">{currentQA.downvotes}</span>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQA.upvotes + currentQA.downvotes} total votes
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(currentQA.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Related Q&As Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Related Questions
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Related Q&As feature coming soon...
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 