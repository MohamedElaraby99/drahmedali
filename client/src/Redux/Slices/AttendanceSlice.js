import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const scanQRAttendance = createAsyncThunk(
  'attendance/scanQR',
  async (scanData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/attendance/scan-qr', scanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في تسجيل الحضور');
    }
  }
);

export const takeAttendanceByPhone = createAsyncThunk(
  'attendance/takeByPhone',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/attendance/take-by-phone', attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في تسجيل الحضور');
    }
  }
);

export const getUserAttendance = createAsyncThunk(
  'attendance/getUserAttendance',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/attendance/user/${userId}?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب بيانات الحضور');
    }
  }
);

export const getUserAttendanceStats = createAsyncThunk(
  'attendance/getUserStats',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/attendance/user/${userId}/stats?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب إحصائيات الحضور');
    }
  }
);

export const getAllAttendance = createAsyncThunk(
  'attendance/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/attendance?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب بيانات الحضور');
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/attendance/${id}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في تحديث سجل الحضور');
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في حذف سجل الحضور');
    }
  }
);

export const getAttendanceDashboard = createAsyncThunk(
  'attendance/getDashboard',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/attendance/dashboard?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب لوحة تحكم الحضور');
    }
  }
);

const initialState = {
  // User attendance data
  userAttendance: {
    data: [],
    pagination: {},
    loading: false,
    error: null
  },
  
  // User attendance statistics
  userStats: {
    data: null,
    loading: false,
    error: null
  },
  
  // All attendance records (for admins/instructors)
  allAttendance: {
    data: [],
    pagination: {},
    loading: false,
    error: null
  },
  
  // Dashboard data
  dashboard: {
    data: null,
    loading: false,
    error: null
  },
  
  // QR scan result
  scanResult: {
    data: null,
    loading: false,
    error: null
  },
  
  // Update/Delete operations
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state, action) => {
      const errorType = action.payload || 'all';
      
      if (errorType === 'all' || errorType === 'userAttendance') {
        state.userAttendance.error = null;
      }
      if (errorType === 'all' || errorType === 'userStats') {
        state.userStats.error = null;
      }
      if (errorType === 'all' || errorType === 'allAttendance') {
        state.allAttendance.error = null;
      }
      if (errorType === 'all' || errorType === 'dashboard') {
        state.dashboard.error = null;
      }
      if (errorType === 'all' || errorType === 'scanResult') {
        state.scanResult.error = null;
      }
      if (errorType === 'all' || errorType === 'update') {
        state.updateError = null;
      }
      if (errorType === 'all' || errorType === 'delete') {
        state.deleteError = null;
      }
    },
    
    clearScanResult: (state) => {
      state.scanResult = {
        data: null,
        loading: false,
        error: null
      };
    },
    
    resetAttendanceState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Scan QR Attendance
      .addCase(scanQRAttendance.pending, (state) => {
        state.scanResult.loading = true;
        state.scanResult.error = null;
      })
      .addCase(scanQRAttendance.fulfilled, (state, action) => {
        state.scanResult.loading = false;
        state.scanResult.data = action.payload;
        state.scanResult.error = null;
      })
      .addCase(scanQRAttendance.rejected, (state, action) => {
        state.scanResult.loading = false;
        state.scanResult.error = action.payload;
      })
      
      // Take Attendance by Phone
      .addCase(takeAttendanceByPhone.pending, (state) => {
        state.scanResult.loading = true;
        state.scanResult.error = null;
      })
      .addCase(takeAttendanceByPhone.fulfilled, (state, action) => {
        state.scanResult.loading = false;
        state.scanResult.data = action.payload;
        state.scanResult.error = null;
      })
      .addCase(takeAttendanceByPhone.rejected, (state, action) => {
        state.scanResult.loading = false;
        state.scanResult.error = action.payload;
      })
      
      // Get User Attendance
      .addCase(getUserAttendance.pending, (state) => {
        state.userAttendance.loading = true;
        state.userAttendance.error = null;
      })
      .addCase(getUserAttendance.fulfilled, (state, action) => {
        state.userAttendance.loading = false;
        state.userAttendance.data = action.payload.data.docs || action.payload.data;
        state.userAttendance.pagination = {
          page: action.payload.data.page,
          limit: action.payload.data.limit,
          totalPages: action.payload.data.totalPages,
          totalDocs: action.payload.data.totalDocs
        };
        state.userAttendance.error = null;
      })
      .addCase(getUserAttendance.rejected, (state, action) => {
        state.userAttendance.loading = false;
        state.userAttendance.error = action.payload;
      })
      
      // Get User Attendance Stats
      .addCase(getUserAttendanceStats.pending, (state) => {
        state.userStats.loading = true;
        state.userStats.error = null;
      })
      .addCase(getUserAttendanceStats.fulfilled, (state, action) => {
        state.userStats.loading = false;
        state.userStats.data = action.payload.data;
        state.userStats.error = null;
      })
      .addCase(getUserAttendanceStats.rejected, (state, action) => {
        state.userStats.loading = false;
        state.userStats.error = action.payload;
      })
      
      // Get All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.allAttendance.loading = true;
        state.allAttendance.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.allAttendance.loading = false;
        state.allAttendance.data = action.payload.data.docs || action.payload.data;
        state.allAttendance.pagination = {
          page: action.payload.data.page,
          limit: action.payload.data.limit,
          totalPages: action.payload.data.totalPages,
          totalDocs: action.payload.data.totalDocs
        };
        state.allAttendance.error = null;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.allAttendance.loading = false;
        state.allAttendance.error = action.payload;
      })
      
      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        
        // Update the attendance record in the relevant list
        const updatedRecord = action.payload.data;
        const updateInList = (list) => {
          const index = list.findIndex(item => item._id === updatedRecord._id);
          if (index !== -1) {
            list[index] = updatedRecord;
          }
        };
        
        updateInList(state.userAttendance.data);
        updateInList(state.allAttendance.data);
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete Attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        
        // Remove the attendance record from the relevant list
        const deletedId = action.meta.arg;
        const removeFromList = (list) => {
          return list.filter(item => item._id !== deletedId);
        };
        
        state.userAttendance.data = removeFromList(state.userAttendance.data);
        state.allAttendance.data = removeFromList(state.allAttendance.data);
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Get Attendance Dashboard
      .addCase(getAttendanceDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(getAttendanceDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload.data;
        state.dashboard.error = null;
      })
      .addCase(getAttendanceDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      });
  }
});

export const { 
  clearAttendanceError, 
  clearScanResult, 
  resetAttendanceState 
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
