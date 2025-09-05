import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const createInstructor = createAsyncThunk(
  'instructor/createInstructor',
  async (instructorData, { rejectWithValue }) => {
    try {
      let formData;
      
      // If instructorData is already FormData, use it directly
      if (instructorData instanceof FormData) {
        formData = instructorData;
      } else {
        // Otherwise, create FormData from object
        formData = new FormData();
        Object.keys(instructorData).forEach(key => {
          if (key === 'socialLinks') {
            formData.append(key, JSON.stringify(instructorData[key]));
          } else {
            formData.append(key, instructorData[key]);
          }
        });
      }

      const response = await axiosInstance.post('/instructors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Instructor created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create instructor');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getAllInstructors = createAsyncThunk(
  'instructor/getAllInstructors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/instructors', { params });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get instructors');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getFeaturedInstructors = createAsyncThunk(
  'instructor/getFeaturedInstructors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/instructors/featured', { params });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get featured instructors');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getInstructorById = createAsyncThunk(
  'instructor/getInstructorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/instructors/${id}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get instructor');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateInstructor = createAsyncThunk(
  'instructor/updateInstructor',
  async ({ id, instructorData }, { rejectWithValue }) => {
    try {
      let formData;
      
      // If instructorData is already FormData, use it directly
      if (instructorData instanceof FormData) {
        formData = instructorData;
      } else {
        // Otherwise, create FormData from object
        formData = new FormData();
        Object.keys(instructorData).forEach(key => {
          if (key === 'socialLinks') {
            formData.append(key, JSON.stringify(instructorData[key]));
          } else {
            formData.append(key, instructorData[key]);
          }
        });
      }

      const response = await axiosInstance.put(`/instructors/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Instructor updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update instructor');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteInstructor = createAsyncThunk(
  'instructor/deleteInstructor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/instructors/${id}`);
      toast.success('Instructor deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete instructor');
      return rejectWithValue(error.response?.data);
    }
  }
);



export const getInstructorStats = createAsyncThunk(
  'instructor/getInstructorStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/instructors/${id}/stats`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get instructor statistics');
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  instructors: [],
  featuredInstructors: [],
  currentInstructor: null,
  instructorStats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInstructor: (state) => {
      state.currentInstructor = null;
    },
    clearInstructorStats: (state) => {
      state.instructorStats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create instructor
      .addCase(createInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInstructor.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors.unshift(action.payload.data.instructor);
      })
      .addCase(createInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all instructors
      .addCase(getAllInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = action.payload.data.instructors;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getAllInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get featured instructors
      .addCase(getFeaturedInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeaturedInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredInstructors = action.payload.data.instructors;
      })
      .addCase(getFeaturedInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get instructor by ID
      .addCase(getInstructorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInstructorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInstructor = action.payload.data.instructor;
      })
      .addCase(getInstructorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update instructor
      .addCase(updateInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInstructor.fulfilled, (state, action) => {
        state.loading = false;
        const updatedInstructor = action.payload.data.instructor;
        state.instructors = state.instructors.map(instructor => 
          instructor._id === updatedInstructor._id ? updatedInstructor : instructor
        );
        if (state.currentInstructor && state.currentInstructor._id === updatedInstructor._id) {
          state.currentInstructor = updatedInstructor;
        }
      })
      .addCase(updateInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete instructor
      .addCase(deleteInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInstructor.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from instructors list
        state.instructors = state.instructors.filter(instructor => 
          instructor._id !== action.meta.arg
        );
        // Clear current instructor if it was deleted
        if (state.currentInstructor && state.currentInstructor._id === action.meta.arg) {
          state.currentInstructor = null;
        }
      })
      .addCase(deleteInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      

      
      // Get instructor stats
      .addCase(getInstructorStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInstructorStats.fulfilled, (state, action) => {
        state.loading = false;
        state.instructorStats = action.payload.data.stats;
      })
      .addCase(getInstructorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentInstructor, clearInstructorStats } = instructorSlice.actions;
export default instructorSlice.reducer; 