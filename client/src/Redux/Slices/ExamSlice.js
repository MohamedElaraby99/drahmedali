import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const takeTrainingExam = createAsyncThunk(
  'exam/takeTrainingExam',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/exams/training', examData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to take training exam');
    }
  }
);

export const takeFinalExam = createAsyncThunk(
  'exam/takeFinalExam',
  async (examData, { rejectWithValue }) => {
    try {
      console.log('=== REDUX FINAL EXAM SUBMISSION ===');
      console.log('Exam Data:', examData);
      console.log('Posting to:', '/exams/final');
      
      const response = await axiosInstance.post('/exams/final', examData);
      
      console.log('Success Response:', response.data);
      return response.data.data;
    } catch (error) {
      console.log('=== REDUX FINAL EXAM ERROR ===');
      console.log('Error:', error);
      console.log('Error Response:', error.response?.data);
      console.log('Error Message:', error.response?.data?.message);
      console.log('Error Status:', error.response?.status);
      
      return rejectWithValue(error.response?.data?.message || 'Failed to take final exam');
    }
  }
);

export const getExamResults = createAsyncThunk(
  'exam/getExamResults',
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/exams/results/${courseId}/${lessonId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get exam results');
    }
  }
);

export const getUserExamHistory = createAsyncThunk(
  'exam/getUserExamHistory',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/exams/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get exam history');
    }
  }
);

const initialState = {
  currentExam: null,
  examResults: [],
  examHistory: [],
  examHistoryPagination: {
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
    resultsPerPage: 10
  },
  loading: false,
  error: null,
  lastExamResult: null
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearExamError: (state) => {
      state.error = null;
    },
    clearLastExamResult: (state) => {
      state.lastExamResult = null;
    },
    setCurrentExam: (state, action) => {
      state.currentExam = action.payload;
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
    }
  },
  extraReducers: (builder) => {
    // Take Training Exam
    builder
      .addCase(takeTrainingExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(takeTrainingExam.fulfilled, (state, action) => {
        state.loading = false;
        state.lastExamResult = action.payload;
        state.examResults.push(action.payload);
      })
      .addCase(takeTrainingExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Take Final Exam
    builder
      .addCase(takeFinalExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(takeFinalExam.fulfilled, (state, action) => {
        state.loading = false;
        state.lastExamResult = action.payload;
        state.examResults.push(action.payload);
      })
      .addCase(takeFinalExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Exam Results
    builder
      .addCase(getExamResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExamResults.fulfilled, (state, action) => {
        state.loading = false;
        state.examResults = action.payload;
      })
      .addCase(getExamResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get User Exam History
    builder
      .addCase(getUserExamHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserExamHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.examHistory = action.payload.data;
        state.examHistoryPagination = action.payload.pagination;
      })
      .addCase(getUserExamHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearExamError, 
  clearLastExamResult, 
  setCurrentExam, 
  clearCurrentExam 
} = examSlice.actions;

export default examSlice.reducer; 