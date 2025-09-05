import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

export const checkVideoAccess = createAsyncThunk(
  "videoAccess/check",
  async ({ courseId, lessonId, videoId, unitId }, { rejectWithValue }) => {
    try {
      // Use the new dedicated video access check endpoint
      const params = unitId ? `?unitId=${unitId}` : '';
      const res = await axiosInstance.get(`/course-access/check-video/${courseId}/${lessonId}/${videoId}${params}`);
      return { courseId, lessonId, videoId, data: res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to check video access" });
    }
  }
);

export const redeemVideoAccessCode = createAsyncThunk(
  "videoAccess/redeem",
  async ({ code, courseId, lessonId, unitId, videoId }, { rejectWithValue }) => {
    try {
      // Use the existing video access redeem endpoint
      const res = await axiosInstance.post(`/course-access/redeem-video`, { 
        code, 
        courseId, 
        lessonId, 
        unitId, 
        videoId 
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to redeem video access code" });
    }
  }
);

// ADMIN: generate video access codes (using course access endpoint for now)
export const adminGenerateVideoAccessCodes = createAsyncThunk(
  "videoAccess/adminGenerate",
  async ({ courseId, lessonId, accessStartAt, accessEndAt, quantity = 1, codeExpiresAt }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/course-access/admin/codes`, {
        courseId,
        lessonId, // Store lessonId for future use
        accessStartAt,
        accessEndAt,
        quantity,
        codeExpiresAt
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to generate video access codes" });
    }
  }
);

// ADMIN: list video access codes (using course access endpoint for now)
export const adminListVideoAccessCodes = createAsyncThunk(
  "videoAccess/adminList",
  async ({ courseId, lessonId, isUsed, q, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (courseId) params.append("courseId", courseId);
      // Note: lessonId filtering will be handled on frontend for now
      if (typeof isUsed !== "undefined") params.append("isUsed", String(isUsed));
      if (q) params.append("q", q);
      if (page) params.append("page", String(page));
      if (limit) params.append("limit", String(limit));
      const url = `/course-access/admin/codes${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await axiosInstance.get(url);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch video access codes" });
    }
  }
);

// ADMIN: delete single video access code (using course access endpoint for now)
export const adminDeleteVideoAccessCode = createAsyncThunk(
  "videoAccess/adminDeleteOne",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/course-access/admin/codes/${id}`);
      return { id, data: res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete video access code" });
    }
  }
);

// ADMIN: bulk delete video access codes (using course access endpoint for now)
export const adminBulkDeleteVideoAccessCodes = createAsyncThunk(
  "videoAccess/adminBulkDelete",
  async ({ ids, courseId, lessonId, onlyUnused = true }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/course-access/admin/codes/bulk-delete`, { 
        ids, 
        courseId, 
        // Note: lessonId filtering will be handled on frontend for now
        onlyUnused 
      });
      return { ids, data: res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to bulk delete video access codes" });
    }
  }
);

const initialState = {
  byVideoId: {}, // `${courseId}-${lessonId}` -> { hasAccess, accessEndAt }
  byCourseId: {}, // courseId -> { hasAccess, accessEndAt } (for compatibility with CourseAccessSlice)
  loading: false,
  error: null,
  lastRedemption: null,
  admin: {
    generating: false,
    listing: false,
    codes: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
  }
};

const videoAccessSlice = createSlice({
  name: "videoAccess",
  initialState,
  reducers: {
    clearVideoAccessError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkVideoAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVideoAccess.fulfilled, (state, action) => {
        state.loading = false;
        const { courseId, lessonId, videoId, data } = action.payload;
        const videoKey = `${courseId}-${lessonId}-${videoId}`;
        state.byVideoId[videoKey] = {
          hasAccess: !!data.hasAccess,
          accessEndAt: data.accessEndAt || null,
          source: data.source || null,
          requiresCode: data.requiresCode || false
        };
        
        // Also update course access state for compatibility
        state.byCourseId[courseId] = {
          hasAccess: !!data.hasAccess,
          accessEndAt: data.accessEndAt || null,
          source: data.source || null
        };
      })
      .addCase(checkVideoAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to check video access";
      })
      .addCase(redeemVideoAccessCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemVideoAccessCode.fulfilled, (state, action) => {
        state.loading = false;
        const { access } = action.payload;
        state.lastRedemption = access;
        const videoKey = `${access.courseId}-${access.lessonId}`;
        state.byVideoId[videoKey] = {
          hasAccess: true,
          accessEndAt: access.accessEndAt
        };
        
        // Also update course access state for compatibility
        state.byCourseId = state.byCourseId || {};
        state.byCourseId[access.courseId] = {
          hasAccess: true,
          accessEndAt: access.accessEndAt,
          source: 'code'
        };
      })
      .addCase(redeemVideoAccessCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to redeem video access code";
      })
      // Admin generate
      .addCase(adminGenerateVideoAccessCodes.pending, (state) => {
        state.admin.generating = true;
        state.error = null;
      })
      .addCase(adminGenerateVideoAccessCodes.fulfilled, (state, action) => {
        state.admin.generating = false;
        const { codes } = action.payload || { codes: [] };
        state.admin.codes = [...codes, ...state.admin.codes];
      })
      .addCase(adminGenerateVideoAccessCodes.rejected, (state, action) => {
        state.admin.generating = false;
        state.error = action.payload?.message || "Failed to generate video access codes";
      })
      // Admin list
      .addCase(adminListVideoAccessCodes.pending, (state) => {
        state.admin.listing = true;
        state.error = null;
      })
      .addCase(adminListVideoAccessCodes.fulfilled, (state, action) => {
        state.admin.listing = false;
        state.admin.codes = action.payload.codes || [];
        state.admin.pagination = action.payload.pagination || { 
          page: 1, 
          limit: 20, 
          total: (action.payload.codes || []).length, 
          totalPages: 1 
        };
      })
      .addCase(adminListVideoAccessCodes.rejected, (state, action) => {
        state.admin.listing = false;
        state.error = action.payload?.message || "Failed to fetch video access codes";
      })
      // Admin delete one
      .addCase(adminDeleteVideoAccessCode.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.admin.codes = state.admin.codes.filter(c => (c._id || c.id) !== id);
      })
      // Admin bulk delete
      .addCase(adminBulkDeleteVideoAccessCodes.fulfilled, (state, action) => {
        const { ids } = action.payload;
        const idSet = new Set(ids);
        state.admin.codes = state.admin.codes.filter(c => !idSet.has(c._id || c.id));
      });
  }
});

export const { clearVideoAccessError } = videoAccessSlice.actions;
export default videoAccessSlice.reducer;
