import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

const initialState = {
    blogs: [],
    currentBlog: null,
    loading: false,
    totalPages: 0,
    currentPage: 1,
    total: 0
};

// Get all blogs (public)
export const getAllBlogs = createAsyncThunk("/blogs/get", async (params = {}) => {
    const { page = 1, limit = 10, category = '', search = '' } = params;
    try {
        const res = await axiosInstance.get(`/blogs?page=${page}&limit=${limit}&category=${category}&search=${search}`);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Get all blogs for admin (including drafts)
export const getAllBlogsForAdmin = createAsyncThunk("/blogs/getForAdmin", async (params = {}) => {
    const { page = 1, limit = 10, category = '', search = '', status = '' } = params;
    try {
        const res = await axiosInstance.get(`/admin/blogs?page=${page}&limit=${limit}&category=${category}&search=${search}&status=${status}`);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Get blog by ID
export const getBlogById = createAsyncThunk("/blogs/getById", async (id) => {
    try {
        const res = await axiosInstance.get(`/blogs/${id}`);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Create blog
export const createBlog = createAsyncThunk("/blogs/create", async (data) => {
    try {
        const res = await axiosInstance.post("/blogs", data);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Update blog
export const updateBlog = createAsyncThunk("/blogs/update", async ({ id, data }) => {
    try {
        const res = await axiosInstance.put(`/blogs/${id}`, data);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Delete blog
export const deleteBlog = createAsyncThunk("/blogs/delete", async (id) => {
    try {
        const res = await axiosInstance.delete(`/blogs/${id}`);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

// Like blog
export const likeBlog = createAsyncThunk("/blogs/like", async (id) => {
    try {
        const res = await axiosInstance.post(`/blogs/${id}/like`);
        return res?.data;
    } catch (error) {
        throw error;
    }
});

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        }
    },
    extraReducers: (builder) => {
        // Get all blogs (public)
        builder.addCase(getAllBlogs.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllBlogs.fulfilled, (state, action) => {
            state.loading = false;
            state.blogs = action?.payload?.blogs;
            state.totalPages = action?.payload?.totalPages;
            state.currentPage = action?.payload?.currentPage;
            state.total = action?.payload?.total;
        });
        builder.addCase(getAllBlogs.rejected, (state) => {
            state.loading = false;
        });

        // Get all blogs for admin
        builder.addCase(getAllBlogsForAdmin.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllBlogsForAdmin.fulfilled, (state, action) => {
            state.loading = false;
            state.blogs = action?.payload?.blogs;
            state.totalPages = action?.payload?.totalPages;
            state.currentPage = action?.payload?.currentPage;
            state.total = action?.payload?.total;
        });
        builder.addCase(getAllBlogsForAdmin.rejected, (state) => {
            state.loading = false;
        });

        // Get blog by ID
        builder.addCase(getBlogById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getBlogById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentBlog = action?.payload?.blog;
        });
        builder.addCase(getBlogById.rejected, (state) => {
            state.loading = false;
        });

        // Create blog
        builder.addCase(createBlog.fulfilled, (state, action) => {
            state.blogs.unshift(action?.payload?.blog);
        });

        // Update blog
        builder.addCase(updateBlog.fulfilled, (state, action) => {
            const index = state.blogs.findIndex(blog => blog._id === action?.payload?.blog._id);
            if (index !== -1) {
                state.blogs[index] = action?.payload?.blog;
            }
            if (state.currentBlog?._id === action?.payload?.blog._id) {
                state.currentBlog = action?.payload?.blog;
            }
        });

        // Delete blog
        builder.addCase(deleteBlog.fulfilled, (state, action) => {
            state.blogs = state.blogs.filter(blog => blog._id !== action?.meta?.arg);
            if (state.currentBlog?._id === action?.meta?.arg) {
                state.currentBlog = null;
            }
        });

        // Like blog
        builder.addCase(likeBlog.fulfilled, (state, action) => {
            const blogId = action?.meta?.arg;
            const blog = state.blogs.find(b => b._id === blogId);
            if (blog) {
                blog.likes = action?.payload?.likes;
            }
            if (state.currentBlog?._id === blogId) {
                state.currentBlog.likes = action?.payload?.likes;
            }
        });
    }
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer; 