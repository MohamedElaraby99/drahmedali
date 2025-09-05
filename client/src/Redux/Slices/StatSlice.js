import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    allUsersCount: 0,
    subscribedCount: 0,
    totalCourses: 0,
    totalLectures: 0,
    totalPayments: 0,
    totalRevenue: 0,
    monthlySalesData: new Array(12).fill(0),
    recentPayments: [],
    recentCourses: [],
    loading: false,
    lastFetchedAt: 0
};

// ......get stats data......
export const getStatsData = createAsyncThunk(
    "stats/get",
    async (_, { getState }) => {
        try {
            const response = await axiosInstance.get("/admin/stats/users");
            return response?.data;
        } catch (error) {
            throw error;
        }
    },
    {
        // Prevent duplicate in-flight requests and rate-limit to 5s
        condition: (_, { getState }) => {
            const state = getState();
            const stat = state?.stat || state?.state; // fallback if slice name differs
            if (!stat) return true;
            if (stat.loading) return false;
            const now = Date.now();
            if (now - (stat.lastFetchedAt || 0) < 5000) return false;
            return true;
        }
    }
)

const statSlice = createSlice({
    name: "state",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getStatsData.pending, (state) => {
            state.loading = true;
        })
        .addCase(getStatsData.fulfilled, (state, action) => {
            state.loading = false;
            state.lastFetchedAt = Date.now();
            state.allUsersCount = action?.payload?.allUsersCount || 0;
            state.subscribedCount = action?.payload?.subscribedUsersCount || 0;
            state.totalCourses = action?.payload?.totalCourses || 0;
            state.totalLectures = action?.payload?.totalLectures || 0;
            state.totalPayments = action?.payload?.totalPayments || 0;
            state.totalRevenue = action?.payload?.totalRevenue || 0;
            state.monthlySalesData = action?.payload?.monthlySalesData || new Array(12).fill(0);
            state.recentPayments = action?.payload?.recentPayments || [];
            state.recentCourses = action?.payload?.recentCourses || [];
        })
        .addCase(getStatsData.rejected, (state) => {
            state.loading = false;
        })
    }
});

export default statSlice.reducer;