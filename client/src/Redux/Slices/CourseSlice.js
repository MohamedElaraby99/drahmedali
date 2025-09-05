import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

const initialState = {
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  courseStats: null,
  loading: false,
  featuredLoading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

// Get all courses
export const getAllCourses = createAsyncThunk(
  'course/getAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/courses');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get all courses for admin (with full content)
export const getAdminCourses = createAsyncThunk(
  'course/getAdminCourses',
  async (queryParams = '', { rejectWithValue }) => {
    try {
      const url = queryParams ? `/courses/admin/all?${queryParams}` : '/courses/admin/all';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get featured courses
export const getFeaturedCourses = createAsyncThunk(
  'course/getFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/courses/featured');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Toggle course featured status
export const toggleFeatured = createAsyncThunk(
  'course/toggleFeatured',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/courses/${courseId}/toggle-featured`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get course by ID
export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Create course
export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('instructor', courseData.instructor);
      formData.append('stage', courseData.stage);
      formData.append('subject', courseData.subject);
      // category removed from backend
      
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }

      const response = await axiosInstance.post('/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update course
export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('instructor', courseData.instructor);
      formData.append('stage', courseData.stage);
      formData.append('subject', courseData.subject);
      // category removed from backend
      
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }

      const response = await axiosInstance.put(`/courses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete course
export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get course stats
export const getCourseStats = createAsyncThunk(
  'course/getCourseStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/courses/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Add unit to course
export const addUnitToCourse = createAsyncThunk(
  'course/addUnitToCourse',
  async ({ courseId, unitData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/units`, { unitData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Add lesson to unit by unit ID
export const addLessonToUnit = createAsyncThunk(
  'course/addLessonToUnit',
  async ({ courseId, unitId, lessonData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/units/${unitId}/lessons`, { lessonData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Add direct lesson to course
export const addDirectLessonToCourse = createAsyncThunk(
  'course/addDirectLessonToCourse',
  async ({ courseId, lessonData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/direct-lessons`, { lessonData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update lesson by lesson ID
export const updateLesson = createAsyncThunk(
  'course/updateLesson',
  async ({ courseId, unitId, lessonId, lessonData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}`, {
        unitId,
        lessonData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete lesson by lesson ID
export const deleteLesson = createAsyncThunk(
  'course/deleteLesson',
  async ({ courseId, unitId, lessonId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}/lessons/${lessonId}`, {
        data: { unitId }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete unit by unit ID
export const deleteUnit = createAsyncThunk(
  'course/deleteUnit',
  async ({ courseId, unitId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}/units/${unitId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update unit by unit ID
export const updateUnit = createAsyncThunk(
  'course/updateUnit',
  async ({ courseId, unitId, unitData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/units/${unitId}`, { unitData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Reorder lessons by lesson ID
export const reorderLessons = createAsyncThunk(
  'course/reorderLessons',
  async ({ courseId, unitId, lessonId, newIndex }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/reorder-lessons`, {
        unitId,
        lessonId,
        newIndex
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update lesson content (videos, pdfs, exams, trainings)
export const updateLessonContent = createAsyncThunk(
  'course/updateLessonContent',
  async ({ courseId, unitId, lessonId, contentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}/content`, {
        unitId,
        ...contentData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearCourseStats: (state) => {
      state.courseStats = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearCourseState: (state) => {
      state.courses = [];
      state.featuredCourses = [];
      state.currentCourse = null;
      state.courseStats = null;
      state.loading = false;
      state.featuredLoading = false;
      state.error = null;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all courses
      .addCase(getAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🔍 Frontend received courses data:', {
          totalCourses: action.payload.data.courses?.length,
          firstCourse: action.payload.data.courses?.[0],
          stageInfo: action.payload.data.courses?.map(c => ({
            id: c._id,
            title: c.title,
            stage: c.stage,
            stageName: c.stage?.name,
            hasStage: !!c.stage
          }))
        });
        state.courses = action.payload.data.courses;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get admin courses
      .addCase(getAdminCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data.courses;
      })
      .addCase(getAdminCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get featured courses
      .addCase(getFeaturedCourses.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(getFeaturedCourses.fulfilled, (state, action) => {
        state.featuredLoading = false;
        console.log('🌟 Frontend received FEATURED courses data:', {
          totalCourses: action.payload.data.courses?.length,
          firstCourse: action.payload.data.courses?.[0],
          stageInfo: action.payload.data.courses?.map(c => ({
            id: c._id,
            title: c.title,
            stage: c.stage,
            stageName: c.stage?.name,
            hasStage: !!c.stage
          }))
        });
        state.featuredCourses = action.payload.data.courses;
      })
      .addCase(getFeaturedCourses.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Toggle featured course
      .addCase(toggleFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload.data.course;
        
        // Update in courses array
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        
        // Update in featuredCourses array
        const featuredIndex = state.featuredCourses.findIndex(course => course._id === updatedCourse._id);
        if (featuredIndex !== -1) {
          state.featuredCourses[featuredIndex] = updatedCourse;
        }
        
        // Update currentCourse if it matches
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get course by ID
      .addCase(getCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload.data.course;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.createLoading = false;
        state.courses.unshift(action.payload.data.course);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.data?.course?._id;
        if (deletedId) {
          state.courses = state.courses.filter(course => course._id !== deletedId);
          if (state.currentCourse && state.currentCourse._id === deletedId) {
            state.currentCourse = null;
          }
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get course stats
      .addCase(getCourseStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseStats.fulfilled, (state, action) => {
        state.loading = false;
        state.courseStats = action.payload.data;
      })
      .addCase(getCourseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add unit to course
      .addCase(addUnitToCourse.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Add lesson to unit
      .addCase(addLessonToUnit.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Add direct lesson to course
      .addCase(addDirectLessonToCourse.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Update lesson
      .addCase(updateLesson.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Delete lesson
      .addCase(deleteLesson.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Reorder lessons
      .addCase(reorderLessons.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Delete unit
      .addCase(deleteUnit.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Update unit
      .addCase(updateUnit.fulfilled, (state, action) => {
        const updatedCourse = action.payload.data.course;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
      });
  }
});

export const { clearError, clearCurrentCourse, clearCourseStats, setCurrentPage } = courseSlice.actions;
export default courseSlice.reducer;
