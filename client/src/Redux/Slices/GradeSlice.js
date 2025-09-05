import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';

// Async thunks
export const createGrade = createAsyncThunk(
  'grade/createGrade',
  async (gradeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/grades', gradeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create grade');
    }
  }
);

export const getAllGrades = createAsyncThunk(
  'grade/getAllGrades',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/grades?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get grades');
    }
  }
);

export const getGradeById = createAsyncThunk(
  'grade/getGradeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/grades/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get grade');
    }
  }
);

export const updateGrade = createAsyncThunk(
  'grade/updateGrade',
  async ({ id, gradeData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/grades/${id}`, gradeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update grade');
    }
  }
);

export const deleteGrade = createAsyncThunk(
  'grade/deleteGrade',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/grades/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete grade');
    }
  }
);

export const addSubjectsToGrade = createAsyncThunk(
  'grade/addSubjectsToGrade',
  async ({ id, subjects }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/grades/${id}/subjects`, { subjects });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subjects to grade');
    }
  }
);

export const removeSubjectsFromGrade = createAsyncThunk(
  'grade/removeSubjectsFromGrade',
  async ({ id, subjects }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/grades/${id}/subjects`, { 
        data: { subjects } 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove subjects from grade');
    }
  }
);

export const getGradesWithSubjectsCount = createAsyncThunk(
  'grade/getGradesWithSubjectsCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/grades/with-subjects-count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get grades with subjects count');
    }
  }
);

const initialState = {
  grades: [],
  currentGrade: null,
  gradesWithCount: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const gradeSlice = createSlice({
  name: 'grade',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGrade: (state) => {
      state.currentGrade = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Grade
      .addCase(createGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades.unshift(action.payload.grade);
        toast.success('Grade created successfully');
      })
      .addCase(createGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get All Grades
      .addCase(getAllGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = action.payload.grades;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Grade By ID
      .addCase(getGradeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGradeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGrade = action.payload.grade;
      })
      .addCase(getGradeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Update Grade
      .addCase(updateGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGrade = action.payload.grade;
        state.grades = state.grades.map(grade => 
          grade._id === updatedGrade._id ? updatedGrade : grade
        );
        if (state.currentGrade && state.currentGrade._id === updatedGrade._id) {
          state.currentGrade = updatedGrade;
        }
        toast.success('Grade updated successfully');
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Delete Grade
      .addCase(deleteGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = state.grades.filter(grade => grade._id !== action.payload.id);
        if (state.currentGrade && state.currentGrade._id === action.payload.id) {
          state.currentGrade = null;
        }
        toast.success('Grade deleted successfully');
      })
      .addCase(deleteGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Add Subjects to Grade
      .addCase(addSubjectsToGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubjectsToGrade.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGrade = action.payload.grade;
        state.grades = state.grades.map(grade => 
          grade._id === updatedGrade._id ? updatedGrade : grade
        );
        if (state.currentGrade && state.currentGrade._id === updatedGrade._id) {
          state.currentGrade = updatedGrade;
        }
        toast.success('Subjects added to grade successfully');
      })
      .addCase(addSubjectsToGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Remove Subjects from Grade
      .addCase(removeSubjectsFromGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSubjectsFromGrade.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGrade = action.payload.grade;
        state.grades = state.grades.map(grade => 
          grade._id === updatedGrade._id ? updatedGrade : grade
        );
        if (state.currentGrade && state.currentGrade._id === updatedGrade._id) {
          state.currentGrade = updatedGrade;
        }
        toast.success('Subjects removed from grade successfully');
      })
      .addCase(removeSubjectsFromGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Grades with Subjects Count
      .addCase(getGradesWithSubjectsCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGradesWithSubjectsCount.fulfilled, (state, action) => {
        state.loading = false;
        state.gradesWithCount = action.payload.grades;
      })
      .addCase(getGradesWithSubjectsCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError, clearCurrentGrade, setLoading } = gradeSlice.actions;

export default gradeSlice.reducer; 