import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance.js';

// Async thunks
export const purchaseLesson = createAsyncThunk(
    'lessonPurchase/purchaseLesson',
    async (purchaseData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/lesson-purchases/purchase', purchaseData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Purchase failed' });
        }
    }
);

export const checkLessonAccess = createAsyncThunk(
    'lessonPurchase/checkLessonAccess',
    async ({ courseId, lessonId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/lesson-purchases/access/${courseId}/${lessonId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Access check failed' });
        }
    }
);

export const getUserPurchases = createAsyncThunk(
    'lessonPurchase/getUserPurchases',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/lesson-purchases/user-purchases');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to get purchases' });
        }
    }
);

export const getLessonDetails = createAsyncThunk(
    'lessonPurchase/getLessonDetails',
    async ({ courseId, lessonId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/lesson-purchases/lesson/${courseId}/${lessonId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to get lesson details' });
        }
    }
);

const initialState = {
    purchases: [],
    currentPurchase: null,
    lessonAccess: {},
    lessonDetails: {},
    loading: false,
    error: null,
    totalPurchases: 0,
    totalSpent: 0
};

const lessonPurchaseSlice = createSlice({
    name: 'lessonPurchase',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPurchase: (state) => {
            state.currentPurchase = null;
        },
        clearLessonDetails: (state) => {
            state.lessonDetails = {};
        },
        setLessonAccess: (state, action) => {
            const { courseId, lessonId, hasAccess, isInPaidStudents } = action.payload;
            state.lessonAccess[`${courseId}-${lessonId}`] = hasAccess || isInPaidStudents;
        }
    },
    extraReducers: (builder) => {
        builder
            // Purchase Lesson
            .addCase(purchaseLesson.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(purchaseLesson.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPurchase = action.payload.data.purchase;
                state.purchases.unshift(action.payload.data.purchase);
                state.totalPurchases += 1;
                state.totalSpent += action.payload.data.purchase.amount;
            })
            .addCase(purchaseLesson.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Purchase failed';
            })
            
            // Check Lesson Access
            .addCase(checkLessonAccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkLessonAccess.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, lessonId } = action.meta.arg;
                const hasAccess = action.payload.data.hasAccess;
                const isInPaidStudents = action.payload.data.isInPaidStudents;
                state.lessonAccess[`${courseId}-${lessonId}`] = hasAccess || isInPaidStudents;
            })
            .addCase(checkLessonAccess.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Access check failed';
            })
            
            // Get User Purchases
            .addCase(getUserPurchases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserPurchases.fulfilled, (state, action) => {
                state.loading = false;
                state.purchases = action.payload.data.purchases;
                state.totalPurchases = action.payload.data.totalPurchases;
                state.totalSpent = action.payload.data.totalSpent;
            })
            .addCase(getUserPurchases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get purchases';
            })
            
            // Get Lesson Details
            .addCase(getLessonDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLessonDetails.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, lessonId } = action.meta.arg;
                state.lessonDetails[`${courseId}-${lessonId}`] = action.payload.data;
            })
            .addCase(getLessonDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get lesson details';
            });
    }
});

export const { clearError, clearCurrentPurchase, clearLessonDetails, setLessonAccess } = lessonPurchaseSlice.actions;

export default lessonPurchaseSlice.reducer; 