import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from '../../Helpers/axiosInstance';
import toast from "react-hot-toast";

const initialState = {
  currentVideoProgress: null,
  courseProgress: [],
  allUsersProgress: [],
  loading: false,
  error: null
};

// Get video progress for current user
export const getVideoProgress = createAsyncThunk(
  "videoProgress/getVideoProgress",
  async ({ courseId, videoId }) => {
    try {
      const response = await axiosInstance.get(`/video-progress/${courseId}/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Update video progress
export const updateVideoProgress = createAsyncThunk(
  "videoProgress/updateVideoProgress",
  async ({ courseId, videoId, progressData }) => {
    try {
      const response = await axiosInstance.put(`/video-progress/${courseId}/${videoId}`, progressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Get course progress for current user
export const getCourseProgress = createAsyncThunk(
  "videoProgress/getCourseProgress",
  async (courseId) => {
    try {
      const response = await axiosInstance.get(`/video-progress/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Get all users progress for a video (admin only)
export const getAllUsersProgress = createAsyncThunk(
  "videoProgress/getAllUsersProgress",
  async ({ videoId, courseId }) => {
    try {
      const response = await axiosInstance.get(`/video-progress/admin/video/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Reset video progress
export const resetVideoProgress = createAsyncThunk(
  "videoProgress/resetVideoProgress",
  async (videoId) => {
    try {
      const response = await axiosInstance.delete(`/video-progress/${videoId}`);
      toast.success("Video progress reset successfully");
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset progress");
      throw error;
    }
  }
);

const videoProgressSlice = createSlice({
  name: "videoProgress",
  initialState,
  reducers: {
    clearCurrentProgress: (state) => {
      state.currentVideoProgress = null;
    },
    clearCourseProgress: (state) => {
      state.courseProgress = [];
    },
    clearAllUsersProgress: (state) => {
      state.allUsersProgress = [];
    },
    updateLocalProgress: (state, action) => {
      if (state.currentVideoProgress) {
        state.currentVideoProgress = {
          ...state.currentVideoProgress,
          ...action.payload
        };
      }
    }
  },
  extraReducers: (builder) => {
    // Get video progress
    builder
      .addCase(getVideoProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideoProgress = action.payload.data;
      })
      .addCase(getVideoProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update video progress
    builder
      .addCase(updateVideoProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideoProgress = action.payload.data;
      })
      .addCase(updateVideoProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Get course progress
    builder
      .addCase(getCourseProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.courseProgress = action.payload.data;
      })
      .addCase(getCourseProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Get all users progress
    builder
      .addCase(getAllUsersProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsersProgress = action.payload.data;
      })
      .addCase(getAllUsersProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Reset video progress
    builder
      .addCase(resetVideoProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetVideoProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideoProgress = action.payload.data;
      })
      .addCase(resetVideoProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  clearCurrentProgress,
  clearCourseProgress,
  clearAllUsersProgress,
  updateLocalProgress
} = videoProgressSlice.actions;

export default videoProgressSlice.reducer; 