import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks for groups management
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/groups', groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group');
    }
  }
);

export const getAllGroups = createAsyncThunk(
  'groups/getAllGroups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/groups', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
    }
  }
);

export const getGroupById = createAsyncThunk(
  'groups/getGroupById',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/groups/${groupId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update group');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete group');
    }
  }
);

export const addStudentToGroup = createAsyncThunk(
  'groups/addStudentToGroup',
  async ({ groupId, studentId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/groups/${groupId}/students`, { studentId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add student to group');
    }
  }
);

export const removeStudentFromGroup = createAsyncThunk(
  'groups/removeStudentFromGroup',
  async ({ groupId, studentId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/groups/${groupId}/students`, { data: { studentId } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove student from group');
    }
  }
);

export const getGroupsStats = createAsyncThunk(
  'groups/getGroupsStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/groups/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups stats');
    }
  }
);

export const getInstructors = createAsyncThunk(
  'groups/getInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/instructors?page=1&limit=100');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructors');
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  instructors: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocs: 0
  }
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Groups
      .addCase(getAllGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.data.docs || action.payload.data;
        state.pagination = {
          page: action.payload.data.page || 1,
          limit: action.payload.data.limit || 10,
          totalPages: action.payload.data.totalPages || 0,
          totalDocs: action.payload.data.totalDocs || 0
        };
        state.error = null;
      })
      .addCase(getAllGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Group By ID
      .addCase(getGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload.data;
        state.error = null;
      })
      .addCase(getGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGroup = action.payload.data;
        const index = state.groups.findIndex(group => group._id === updatedGroup._id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
        if (state.currentGroup && state.currentGroup._id === updatedGroup._id) {
          state.currentGroup = updatedGroup;
        }
        state.error = null;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group._id !== action.payload);
        if (state.currentGroup && state.currentGroup._id === action.payload) {
          state.currentGroup = null;
        }
        state.error = null;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Student to Group
      .addCase(addStudentToGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudentToGroup.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGroup = action.payload.data;
        const index = state.groups.findIndex(group => group._id === updatedGroup._id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
        if (state.currentGroup && state.currentGroup._id === updatedGroup._id) {
          state.currentGroup = updatedGroup;
        }
        state.error = null;
      })
      .addCase(addStudentToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Student from Group
      .addCase(removeStudentFromGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeStudentFromGroup.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGroup = action.payload.data;
        const index = state.groups.findIndex(group => group._id === updatedGroup._id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
        if (state.currentGroup && state.currentGroup._id === updatedGroup._id) {
          state.currentGroup = updatedGroup;
        }
        state.error = null;
      })
      .addCase(removeStudentFromGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Groups Stats
      .addCase(getGroupsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getGroupsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Instructors
      .addCase(getInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = action.payload.data.instructors;
        state.error = null;
      })
      .addCase(getInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentGroup, setPagination } = groupsSlice.actions;
export default groupsSlice.reducer;
