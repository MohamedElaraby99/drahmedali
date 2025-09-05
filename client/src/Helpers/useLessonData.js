import { useState, useEffect } from 'react';
import { axiosInstance } from './axiosInstance';

/**
 * Custom hook to fetch optimized lesson data with processed exam results and essay exams
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID  
 * @param {string} unitId - Unit ID (optional)
 * @returns {object} { lesson, courseInfo, loading, error, refetch }
 */
export const useLessonData = (courseId, lessonId, unitId = null) => {
  const [lesson, setLesson] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessonData = async () => {
    if (!courseId || !lessonId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = unitId ? { unitId } : {};
      const response = await axiosInstance.get(`/courses/${courseId}/lessons/${lessonId}`, {
        params
      });
      
      if (response.data.success) {
        let lessonData = response.data.data.lesson;
        
        // Fetch essay exams for this lesson
        try {
          const essayResponse = await axiosInstance.get(`/essay-exams/course/${courseId}/lesson/${lessonId}`, {
            params: unitId ? { unitId } : {}
          });
          
          if (essayResponse.data.success) {
            // Add essay exams to the lesson data
            lessonData = {
              ...lessonData,
              essayExams: essayResponse.data.data || []
            };
          }
        } catch (essayError) {
          console.warn('Failed to fetch essay exams:', essayError);
          // Don't fail the entire request if essay exams fail to load
          lessonData = {
            ...lessonData,
            essayExams: []
          };
        }
        
        setLesson(lessonData);
        setCourseInfo(response.data.data.courseInfo);
      } else {
        setError(response.data.message || 'Failed to fetch lesson data');
      }
    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError(err.response?.data?.message || 'Failed to fetch lesson data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [courseId, lessonId, unitId]);

  const refetch = () => {
    fetchLessonData();
  };

  return {
    lesson,
    courseInfo,
    loading,
    error,
    refetch
  };
};

export default useLessonData;
