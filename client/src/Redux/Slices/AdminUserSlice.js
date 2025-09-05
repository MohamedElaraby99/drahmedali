import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Async thunks
export const getAllUsers = createAsyncThunk(
    "adminUser/getAll",
    async ({ page = 1, limit = 20, role, status, search, stage }, { rejectWithValue }) => {
        try {
            console.log('getAllUsers called with params:', { page, limit, role, status, search, stage });
            
            const params = new URLSearchParams({
                page,
                limit,
                ...(role && { role }),
                ...(status && { status }),
                ...(search && { search }),
                ...(stage && { stage })
            });
            
            console.log('API URL params:', params.toString());
            const response = await axiosInstance.get(`/admin/users/users?${params}`);
            console.log('API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('getAllUsers error:', error);
            return rejectWithValue(error.response?.data?.message || "Failed to get users");
        }
    }
);

export const getUserDetails = createAsyncThunk(
    "adminUser/getDetails",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/users/users/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user details");
        }
    }
);

export const createUser = createAsyncThunk(
    "adminUser/create",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/admin/users/create`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create user");
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    "adminUser/toggleStatus",
    async ({ userId, isActive }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle user status");
        }
    }
);

export const updateUserRole = createAsyncThunk(
    "adminUser/updateRole",
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user role");
        }
    }
);

export const updateUser = createAsyncThunk(
    "adminUser/updateUser",
    async ({ userId, userData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user");
        }
    }
);

export const updateUserPassword = createAsyncThunk(
    "adminUser/updatePassword",
    async ({ userId, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}/password`, { password });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user password");
        }
    }
);

export const resetAllUserWallets = createAsyncThunk(
    "adminUser/resetAllWallets",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/admin/users/users/reset-all-wallets`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset user wallets");
        }
    }
);

export const resetUserWallet = createAsyncThunk(
    "adminUser/resetUserWallet",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/admin/users/users/${userId}/reset-wallet`);
            return response.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset user wallet");
        }
    }
);

export const resetAllRechargeCodes = createAsyncThunk(
    "adminUser/resetAllCodes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/admin/users/users/reset-all-codes`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset recharge codes");
        }
    }
);

export const deleteUser = createAsyncThunk(
    "adminUser/delete",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/admin/users/users/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete user");
        }
    }
);

export const getUserActivities = createAsyncThunk(
    "adminUser/getActivities",
    async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, limit });
            const response = await axiosInstance.get(`/admin/users/users/${userId}/activities?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user activities");
        }
    }
);

export const getUserStats = createAsyncThunk(
    "adminUser/getStats",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/users/users/${userId}/stats`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user stats");
        }
    }
);

const initialState = {
    users: [],
    selectedUser: null,
    userActivities: [],
    userStats: null,
    stats: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        regularUsers: 0
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    },
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null
};

const adminUserSlice = createSlice({
    name: "adminUser",
    initialState,
    reducers: {
        clearAdminUserError: (state) => {
            state.error = null;
            state.actionError = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
            state.userActivities = [];
            state.userStats = null;
        },
        clearAdminUserState: (state) => {
            state.users = [];
            state.selectedUser = null;
            state.userActivities = [];
            state.userStats = null;
            state.stats = {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                adminUsers: 0,
                regularUsers: 0
            };
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                total: 0,
                limit: 20
            };
            state.loading = false;
            state.error = null;
            state.actionLoading = false;
            state.actionError = null;
        }
    },
    extraReducers: (builder) => {
        // Get all users
        builder
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data.users;
                state.pagination = action.payload.data.pagination;
                state.stats = action.payload.data.stats;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get user details
        builder
            .addCase(getUserDetails.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserDetails.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.selectedUser = action.payload.data.user;
            })
            .addCase(getUserDetails.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Create user
        builder
            .addCase(createUser.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Add new user to the beginning of the list
                state.users.unshift(action.payload.data.user);
                // Update stats
                if (state.stats) {
                    state.stats.totalUsers += 1;
                    if (action.payload.data.user.isActive) {
                        state.stats.activeUsers += 1;
                    }
                    if (action.payload.data.user.role === 'ADMIN') {
                        state.stats.adminUsers += 1;
                    } else {
                        state.stats.regularUsers += 1;
                    }
                }
            })
            .addCase(createUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Toggle user status
        builder
            .addCase(toggleUserStatus.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex].isActive = action.payload.data.isActive;
                }
                // Update selected user if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser.isActive = action.payload.data.isActive;
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Update user role
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex].role = action.payload.data.role;
                }
                // Update selected user if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser.role = action.payload.data.role;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove user from the list
                const userId = action.meta.arg;
                state.users = state.users.filter(user => user.id !== userId);
                // Clear selected user if it's the deleted user
                if (state.selectedUser && state.selectedUser.id === userId) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Get user activities
        builder
            .addCase(getUserActivities.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserActivities.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.userActivities = action.payload.data.activities;
            })
            .addCase(getUserActivities.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Get user stats
        builder
            .addCase(getUserStats.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserStats.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.userStats = action.payload.data.stats;
            })
            .addCase(getUserStats.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Update user
        builder
            .addCase(updateUser.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex] = { ...state.users[userIndex], ...action.payload.data.user };
                }
                // Update selected user if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser = { ...state.selectedUser, ...action.payload.data.user };
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Update user password
        builder
            .addCase(updateUserPassword.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateUserPassword.fulfilled, (state) => {
                state.actionLoading = false;
                // Password update doesn't change the user object, just show success
            })
            .addCase(updateUserPassword.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Reset all user wallets
        builder
            .addCase(resetAllUserWallets.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(resetAllUserWallets.fulfilled, (state) => {
                state.actionLoading = false;
                // Reset wallet balance for all users in the list
                state.users.forEach(user => {
                    user.walletBalance = 0;
                    user.totalTransactions = 0;
                });
                // Reset selected user wallet if exists
                if (state.selectedUser) {
                    state.selectedUser.walletBalance = 0;
                    state.selectedUser.totalTransactions = 0;
                }
            })
            .addCase(resetAllUserWallets.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Reset specific user wallet
        builder
            .addCase(resetUserWallet.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(resetUserWallet.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Reset wallet balance for the specific user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex].walletBalance = 0;
                    state.users[userIndex].totalTransactions = 0;
                }
                // Reset selected user wallet if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser.walletBalance = 0;
                    state.selectedUser.totalTransactions = 0;
                }
            })
            .addCase(resetUserWallet.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Reset all recharge codes
        builder
            .addCase(resetAllRechargeCodes.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(resetAllRechargeCodes.fulfilled, (state) => {
                state.actionLoading = false;
            })
            .addCase(resetAllRechargeCodes.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    }
});

export const { clearAdminUserError, clearSelectedUser, clearAdminUserState } = adminUserSlice.actions;
export default adminUserSlice.reducer; 