import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const createEssayExam = createAsyncThunk(
  'essayExam/create',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/essay-exams/create', examData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء الامتحان المقالي');
    }
  }
);

export const getEssayExams = createAsyncThunk(
  'essayExam/getAll',
  async ({ courseId, lessonId, unitId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/essay-exams/course/${courseId}/lesson/${lessonId}?${unitId ? `unitId=${unitId}` : ''}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الامتحانات المقالية');
    }
  }
);

export const getEssayExamById = createAsyncThunk(
  'essayExam/getById',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/essay-exams/${examId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الامتحان المقالي');
    }
  }
);

export const submitEssayExam = createAsyncThunk(
  'essayExam/submit',
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/essay-exams/${examId}/submit`, { answers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تسليم الامتحان المقالي');
    }
  }
);

export const getEssayExamSubmissions = createAsyncThunk(
  'essayExam/getSubmissions',
  async ({ examId, page = 1, limit = 20, status, sortBy = 'submittedAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/essay-exams/${examId}/submissions`, {
        params: { page, limit, status, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب التقديمات');
    }
  }
);

export const gradeEssaySubmission = createAsyncThunk(
  'essayExam/gradeSubmission',
  async ({ examId, userId, questionIndex, grade, feedback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/essay-exams/${examId}/grade`, {
        userId,
        questionIndex,
        grade,
        feedback
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تصحيح التقديم');
    }
  }
);

export const getUserEssaySubmissions = createAsyncThunk(
  'essayExam/getUserSubmissions',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/essay-exams/user/submissions', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب التقديمات');
    }
  }
);

export const updateEssayExam = createAsyncThunk(
  'essayExam/update',
  async ({ examId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/essay-exams/${examId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحديث الامتحان المقالي');
    }
  }
);

export const deleteEssayExam = createAsyncThunk(
  'essayExam/delete',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/essay-exams/${examId}`);
      return { examId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في حذف الامتحان المقالي');
    }
  }
);

export const getEssayExamStatistics = createAsyncThunk(
  'essayExam/getStatistics',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/essay-exams/course/${courseId}/statistics`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الإحصائيات');
    }
  }
);

const initialState = {
  essayExams: [],
  currentExam: null,
  submissions: [],
  userSubmissions: [],
  statistics: [],
  loading: false,
  error: null,
  success: false,
  message: ''
};

const essayExamSlice = createSlice({
  name: 'essayExam',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create essay exam
      .addCase(createEssayExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEssayExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.essayExams.push(action.payload.data);
      })
      .addCase(createEssayExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get essay exams
      .addCase(getEssayExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEssayExams.fulfilled, (state, action) => {
        state.loading = false;
        state.essayExams = action.payload.data;
      })
      .addCase(getEssayExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get essay exam by ID
      .addCase(getEssayExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEssayExamById.fulfilled, (state, action) => {
        state.loading = false;
        // API returns { exam, userSubmission } in data; store the exam object in currentExam
        state.currentExam = action.payload?.data?.exam || action.payload?.data || null;
      })
      .addCase(getEssayExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit essay exam
      .addCase(submitEssayExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitEssayExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(submitEssayExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get essay exam submissions
      .addCase(getEssayExamSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEssayExamSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.data;
      })
      .addCase(getEssayExamSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Grade essay submission
      .addCase(gradeEssaySubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(gradeEssaySubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(gradeEssaySubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user essay submissions
      .addCase(getUserEssaySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserEssaySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userSubmissions = action.payload.data;
      })
      .addCase(getUserEssaySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update essay exam
      .addCase(updateEssayExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEssayExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        const index = state.essayExams.findIndex(exam => exam._id === action.payload.data._id);
        if (index !== -1) {
          state.essayExams[index] = action.payload.data;
        }
      })
      .addCase(updateEssayExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete essay exam
      .addCase(deleteEssayExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEssayExam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.essayExams = state.essayExams.filter(exam => exam._id !== action.payload.examId);
      })
      .addCase(deleteEssayExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get essay exam statistics
      .addCase(getEssayExamStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEssayExamStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data;
      })
      .addCase(getEssayExamStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearCurrentExam, clearSubmissions } = essayExamSlice.actions;
export default essayExamSlice.reducer;
