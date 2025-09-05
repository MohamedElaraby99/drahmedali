import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks for users management
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching users with params:', params);
      // Use admin endpoint if requested (returns complete paginated users for admins)
      const endpoint = params.admin ? '/admin/users/users' : '/users';
      const { admin, ...query } = params;
      const response = await axiosInstance.get(endpoint, { params: query });
      console.log('Users API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Users API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 0,
    totalDocs: 0
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the actual API response structure
        // The API returns { success: true, message: "...", data: { users: [...], pagination: {...}, stats: {...} } }
        const apiData = action.payload.data;
        
        // Check if it's the admin endpoint response (with users array) or regular endpoint (with docs array)
        if (apiData.users && Array.isArray(apiData.users)) {
          // Admin endpoint response
          state.users = apiData.users;
          state.pagination = {
            page: apiData.pagination?.currentPage || 1,
            limit: apiData.pagination?.limit || 20,
            totalPages: apiData.pagination?.totalPages || 0,
            totalDocs: apiData.stats?.totalUsers || apiData.users.length || 0
          };
        } else if (apiData.docs && Array.isArray(apiData.docs)) {
          // Regular paginated response
          state.users = apiData.docs;
          state.pagination = {
            page: apiData.page || 1,
            limit: apiData.limit || 20,
            totalPages: apiData.totalPages || 0,
            totalDocs: apiData.totalDocs || 0
          };
        } else if (Array.isArray(apiData)) {
          // Simple array response
          state.users = apiData;
          state.pagination = {
            page: 1,
            limit: apiData.length,
            totalPages: 1,
            totalDocs: apiData.length
          };
        } else {
          // Fallback
          state.users = [];
          state.pagination = {
            page: 1,
            limit: 20,
            totalPages: 0,
            totalDocs: 0
          };
        }
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        if (state.currentUser && state.currentUser._id === action.payload) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentUser, setPagination } = usersSlice.actions;
export default usersSlice.reducer;
