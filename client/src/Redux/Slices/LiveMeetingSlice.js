import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import { axiosInstance } from "../../Helpers/axiosInstance";

const initialState = {
  liveMeetings: [],
  myMeetings: [],
  upcomingMeetings: [],
  currentMeeting: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    upcoming: 0,
    live: 0,
    completed: 0,
    totalAttendees: 0,
    joinedAttendees: 0,
    attendanceRate: 0
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMeetings: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Create live meeting
export const createLiveMeeting = createAsyncThunk(
  'liveMeeting/create',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/live-meetings', meetingData);
      toast.success(response.data.message || 'تم إنشاء الاجتماع المباشر بنجاح');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في إنشاء الاجتماع المباشر';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get all live meetings (Admin)
export const getAllLiveMeetings = createAsyncThunk(
  'liveMeeting/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/live-meetings/admin/all?${queryParams}`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في استرجاع الاجتماعات المباشرة';
      return rejectWithValue(message);
    }
  }
);

// Get user's live meetings
export const getUserLiveMeetings = createAsyncThunk(
  'liveMeeting/getUserMeetings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/live-meetings/my-meetings?${queryParams}`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في استرجاع اجتماعاتك المباشرة';
      return rejectWithValue(message);
    }
  }
);

// Get upcoming live meetings
export const getUpcomingLiveMeetings = createAsyncThunk(
  'liveMeeting/getUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/live-meetings/upcoming');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في استرجاع الاجتماعات القادمة';
      return rejectWithValue(message);
    }
  }
);

// Get single live meeting
export const getLiveMeeting = createAsyncThunk(
  'liveMeeting/getOne',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/live-meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في استرجاع الاجتماع المباشر';
      return rejectWithValue(message);
    }
  }
);

// Update live meeting
export const updateLiveMeeting = createAsyncThunk(
  'liveMeeting/update',
  async ({ meetingId, meetingData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/live-meetings/${meetingId}`, meetingData);
      toast.success(response.data.message || 'تم تحديث الاجتماع المباشر بنجاح');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في تحديث الاجتماع المباشر';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete live meeting
export const deleteLiveMeeting = createAsyncThunk(
  'liveMeeting/delete',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/live-meetings/${meetingId}`);
      toast.success(response.data.message || 'تم حذف الاجتماع المباشر بنجاح');
      return { meetingId, message: response.data.message };
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في حذف الاجتماع المباشر';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Join live meeting
export const joinLiveMeeting = createAsyncThunk(
  'liveMeeting/join',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/live-meetings/${meetingId}/join`);
      toast.success(response.data.message || 'تم الانضمام للاجتماع بنجاح');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في الانضمام للاجتماع';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Add attendees to meeting
export const addAttendees = createAsyncThunk(
  'liveMeeting/addAttendees',
  async ({ meetingId, attendees }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/live-meetings/${meetingId}/attendees`, { attendees });
      toast.success(response.data.message || 'تم إضافة الحضور بنجاح');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في إضافة الحضور';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Remove attendee from meeting
export const removeAttendee = createAsyncThunk(
  'liveMeeting/removeAttendee',
  async ({ meetingId, attendeeId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/live-meetings/${meetingId}/attendees/${attendeeId}`);
      toast.success(response.data.message || 'تم إزالة الحضور بنجاح');
      return { meetingId, attendeeId, message: response.data.message };
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في إزالة الحضور';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get live meeting statistics
export const getLiveMeetingStats = createAsyncThunk(
  'liveMeeting/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/live-meetings/admin/stats');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'فشل في استرجاع إحصائيات الاجتماعات المباشرة';
      return rejectWithValue(message);
    }
  }
);

const liveMeetingSlice = createSlice({
  name: 'liveMeeting',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create live meeting
      .addCase(createLiveMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLiveMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.liveMeetings.unshift(action.payload.liveMeeting);
      })
      .addCase(createLiveMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all live meetings (Admin)
      .addCase(getAllLiveMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLiveMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.liveMeetings = action.payload.liveMeetings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllLiveMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user's live meetings
      .addCase(getUserLiveMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserLiveMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.myMeetings = action.payload.liveMeetings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserLiveMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get upcoming live meetings
      .addCase(getUpcomingLiveMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpcomingLiveMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingMeetings = action.payload.upcomingMeetings;
      })
      .addCase(getUpcomingLiveMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single live meeting
      .addCase(getLiveMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLiveMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload.liveMeeting;
      })
      .addCase(getLiveMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update live meeting
      .addCase(updateLiveMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLiveMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeeting = action.payload.liveMeeting;
        const index = state.liveMeetings.findIndex(meeting => meeting._id === updatedMeeting._id);
        if (index !== -1) {
          state.liveMeetings[index] = updatedMeeting;
        }
        if (state.currentMeeting && state.currentMeeting._id === updatedMeeting._id) {
          state.currentMeeting = updatedMeeting;
        }
      })
      .addCase(updateLiveMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete live meeting
      .addCase(deleteLiveMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLiveMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const { meetingId } = action.payload;
        state.liveMeetings = state.liveMeetings.filter(meeting => meeting._id !== meetingId);
        state.myMeetings = state.myMeetings.filter(meeting => meeting._id !== meetingId);
        if (state.currentMeeting && state.currentMeeting._id === meetingId) {
          state.currentMeeting = null;
        }
      })
      .addCase(deleteLiveMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Join live meeting
      .addCase(joinLiveMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinLiveMeeting.fulfilled, (state, action) => {
        state.loading = false;
        // Update meeting status if needed
      })
      .addCase(joinLiveMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add attendees
      .addCase(addAttendees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttendees.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh current meeting data if needed
      })
      .addCase(addAttendees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove attendee
      .addCase(removeAttendee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAttendee.fulfilled, (state, action) => {
        state.loading = false;
        // Update current meeting if needed
      })
      .addCase(removeAttendee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get statistics
      .addCase(getLiveMeetingStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLiveMeetingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getLiveMeetingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentMeeting, setCurrentPage } = liveMeetingSlice.actions;
export default liveMeetingSlice.reducer;
