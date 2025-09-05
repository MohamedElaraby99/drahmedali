import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Get all Q&As
export const getAllQAs = createAsyncThunk("/qas/get", async (params = {}) => {
  const { page = 1, limit = 10, category = '', search = '', status = '' } = params;
  try {
    const res = await axiosInstance.get(`/qas?page=${page}&limit=${limit}&category=${category}&search=${search}&status=${status}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Get single Q&A
export const getQAById = createAsyncThunk("/qas/getById", async (id) => {
  try {
    const res = await axiosInstance.get(`/qas/${id}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Create Q&A
export const createQA = createAsyncThunk("/qas/create", async (qaData) => {
  try {
    const res = await axiosInstance.post("/qas", qaData);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Update Q&A
export const updateQA = createAsyncThunk("/qas/update", async ({ id, qaData }) => {
  try {
    const res = await axiosInstance.put(`/qas/${id}`, qaData);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Delete Q&A
export const deleteQA = createAsyncThunk("/qas/delete", async (id) => {
  try {
    const res = await axiosInstance.delete(`/qas/${id}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Upvote Q&A
export const upvoteQA = createAsyncThunk("/qas/upvote", async (id) => {
  try {
    const res = await axiosInstance.post(`/qas/${id}/upvote`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Downvote Q&A
export const downvoteQA = createAsyncThunk("/qas/downvote", async (id) => {
  try {
    const res = await axiosInstance.post(`/qas/${id}/downvote`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Get featured Q&As
export const getFeaturedQAs = createAsyncThunk("/qas/featured", async () => {
  try {
    const res = await axiosInstance.get("/qas/featured");
    return res?.data;
  } catch (error) {
    console.error("Error fetching featured Q&As:", error);
    throw error;
  }
});

// Answer a question (Admin only)
export const answerQuestion = createAsyncThunk("/qas/answer", async ({ id, answer }) => {
  try {
    const res = await axiosInstance.post(`/qas/${id}/answer`, { answer });
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Get pending questions (Admin only)
export const getPendingQuestions = createAsyncThunk("/qas/pending", async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  try {
    const res = await axiosInstance.get(`/qas/pending?page=${page}&limit=${limit}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

const initialState = {
  qas: [],
  currentQA: null,
  featuredQAs: [],
  pendingQuestions: [],
  loading: false,
  totalPages: 1,
  currentPage: 1,
  total: 0,
  categories: [
    'General',
    'Technical', 
    'Course Related',
    'Payment',
    'Account',
    'Other'
  ]
};

const qaSlice = createSlice({
  name: "qa",
  initialState,
  reducers: {
    clearCurrentQA: (state) => {
      state.currentQA = null;
    },
    clearQAs: (state) => {
      state.qas = [];
    }
  },
  extraReducers: (builder) => {
    // Get all Q&As
    builder.addCase(getAllQAs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllQAs.fulfilled, (state, action) => {
      state.loading = false;
      state.qas = action?.payload?.qas;
      state.totalPages = action?.payload?.totalPages;
      state.currentPage = action?.payload?.currentPage;
      state.total = action?.payload?.total;
    });
    builder.addCase(getAllQAs.rejected, (state) => {
      state.loading = false;
    });

    // Get single Q&A
    builder.addCase(getQAById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getQAById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentQA = action?.payload?.qa;
    });
    builder.addCase(getQAById.rejected, (state) => {
      state.loading = false;
    });

    // Create Q&A
    builder.addCase(createQA.fulfilled, (state, action) => {
      state.qas.unshift(action?.payload?.qa);
    });

    // Update Q&A
    builder.addCase(updateQA.fulfilled, (state, action) => {
      const updatedQA = action?.payload?.qa;
      if (updatedQA && updatedQA._id) {
        const index = state.qas.findIndex(qa => qa && qa._id === updatedQA._id);
        if (index !== -1) {
          state.qas[index] = updatedQA;
        }
        if (state.currentQA && state.currentQA._id === updatedQA._id) {
          state.currentQA = updatedQA;
        }
      }
    });

    // Delete Q&A
    builder.addCase(deleteQA.fulfilled, (state, action) => {
      const deletedId = action?.payload?.qa?._id;
      if (deletedId) {
        state.qas = state.qas.filter(qa => qa && qa._id !== deletedId);
        if (state.currentQA && state.currentQA._id === deletedId) {
          state.currentQA = null;
        }
      }
    });

    // Upvote Q&A
    builder.addCase(upvoteQA.fulfilled, (state, action) => {
      const updatedQA = action?.payload?.qa;
      if (updatedQA && updatedQA._id) {
        const index = state.qas.findIndex(qa => qa && qa._id === updatedQA._id);
        if (index !== -1) {
          state.qas[index] = updatedQA;
        }
        if (state.currentQA && state.currentQA._id === updatedQA._id) {
          state.currentQA = updatedQA;
        }
      }
    });

    // Downvote Q&A
    builder.addCase(downvoteQA.fulfilled, (state, action) => {
      const updatedQA = action?.payload?.qa;
      if (updatedQA && updatedQA._id) {
        const index = state.qas.findIndex(qa => qa && qa._id === updatedQA._id);
        if (index !== -1) {
          state.qas[index] = updatedQA;
        }
        if (state.currentQA && state.currentQA._id === updatedQA._id) {
          state.currentQA = updatedQA;
        }
      }
    });

    // Get featured Q&As
    builder.addCase(getFeaturedQAs.fulfilled, (state, action) => {
      state.featuredQAs = action?.payload?.qas;
    });

    // Answer question
    builder.addCase(answerQuestion.fulfilled, (state, action) => {
      const updatedQA = action?.payload?.qa;
      if (updatedQA && updatedQA._id) {
        const index = state.qas.findIndex(qa => qa && qa._id === updatedQA._id);
        if (index !== -1) {
          state.qas[index] = updatedQA;
        }
        if (state.currentQA && state.currentQA._id === updatedQA._id) {
          state.currentQA = updatedQA;
        }
        // Remove from pending questions if it was there
        state.pendingQuestions = state.pendingQuestions.filter(qa => qa && qa._id !== updatedQA._id);
      }
    });

    // Get pending questions
    builder.addCase(getPendingQuestions.fulfilled, (state, action) => {
      state.pendingQuestions = action?.payload?.questions;
    });
  }
});

export const { clearCurrentQA, clearQAs } = qaSlice.actions;
export default qaSlice.reducer; 