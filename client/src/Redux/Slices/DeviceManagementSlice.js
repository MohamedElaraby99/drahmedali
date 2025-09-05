import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

const initialState = {
    devices: [],
    usersDevices: [],
    deviceStats: {
        totalDevices: 0,
        activeDevices: 0,
        inactiveDevices: 0,
        platformStats: [],
        browserStats: [],
        usersOverLimit: 0,
        maxDevicesPerUser: 2
    },
    currentDevice: null,
    loading: false,
    actionLoading: false,
    error: null,
    actionError: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 20
    }
};

// Register device
export const registerDevice = createAsyncThunk(
    "deviceManagement/register",
    async (deviceInfo, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/device-management/register", deviceInfo);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to register device");
        }
    }
);

// Check device authorization
export const checkDeviceAuthorization = createAsyncThunk(
    "deviceManagement/checkAuthorization",
    async (deviceInfo, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/device-management/check-authorization", deviceInfo);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Device not authorized");
        }
    }
);

// Get all users with device information (Admin)
export const getAllUsersDevices = createAsyncThunk(
    "deviceManagement/getAllUsersDevices",
    async ({ page = 1, limit = 20, search = '', deviceStatus = 'all' } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                deviceStatus
            });
            
            const response = await axiosInstance.get(`/device-management/users?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch users devices");
        }
    }
);

// Get user devices (Admin)
export const getUserDevices = createAsyncThunk(
    "deviceManagement/getUserDevices",
    async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            const response = await axiosInstance.get(`/device-management/users/${userId}/devices?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user devices");
        }
    }
);

// Reset user devices (Admin)
export const resetUserDevices = createAsyncThunk(
    "deviceManagement/resetUserDevices",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/device-management/users/${userId}/reset`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset user devices");
        }
    }
);

// Remove specific device (Admin)
export const removeDevice = createAsyncThunk(
    "deviceManagement/removeDevice",
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/device-management/devices/${deviceId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove device");
        }
    }
);

// Get device statistics (Admin)
export const getDeviceStats = createAsyncThunk(
    "deviceManagement/getStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/device-management/stats");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch device statistics");
        }
    }
);

// Get device limit (Admin)
export const getDeviceLimit = createAsyncThunk(
    "deviceManagement/getLimit",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/device-management/limit");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch device limit");
        }
    }
);

// Update device limit (Admin)
export const updateDeviceLimit = createAsyncThunk(
    "deviceManagement/updateLimit",
    async (newLimit, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/device-management/limit", { newLimit });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update device limit");
        }
    }
);

const deviceManagementSlice = createSlice({
    name: "deviceManagement",
    initialState,
    reducers: {
        clearDeviceError: (state) => {
            state.error = null;
            state.actionError = null;
        },
        setCurrentDevice: (state, action) => {
            state.currentDevice = action.payload;
        },
        resetDeviceState: (state) => {
            state.devices = [];
            state.usersDevices = [];
            state.currentDevice = null;
            state.error = null;
            state.actionError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register device
            .addCase(registerDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerDevice.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDevice = action.payload.data.device;
                if (action.payload.data.isNewDevice) {
                    toast.success("تم تسجيل الجهاز بنجاح");
                }
            })
            .addCase(registerDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                if (action.payload.includes("DEVICE_LIMIT_EXCEEDED")) {
                    toast.error("تم الوصول للحد الأقصى من الأجهزة المسموحة");
                } else {
                    toast.error(action.payload);
                }
            })

            // Check device authorization
            .addCase(checkDeviceAuthorization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkDeviceAuthorization.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDevice = action.payload.data.device;
            })
            .addCase(checkDeviceAuthorization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                if (action.payload.includes("DEVICE_NOT_AUTHORIZED")) {
                    toast.error("هذا الجهاز غير مصرح له بالوصول");
                }
            })

            // Get all users devices
            .addCase(getAllUsersDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsersDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.usersDevices = action.payload.data.users;
                state.pagination = action.payload.data.pagination;
            })
            .addCase(getAllUsersDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get user devices
            .addCase(getUserDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload.data.devices;
            })
            .addCase(getUserDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reset user devices
            .addCase(resetUserDevices.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(resetUserDevices.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update the users devices list to reflect the reset
                state.usersDevices = state.usersDevices.map(user => {
                    if (user._id === action.payload.data.userId) {
                        return {
                            ...user,
                            activeDevices: 0,
                            totalDevices: user.totalDevices // Keep total but set active to 0
                        };
                    }
                    return user;
                });
                toast.success(action.payload.data.message || "تم إعادة تعيين الأجهزة بنجاح");
            })
            .addCase(resetUserDevices.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
                toast.error(action.payload);
            })

            // Remove device
            .addCase(removeDevice.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(removeDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove the device from the devices list
                state.devices = state.devices.filter(device => device._id !== action.payload.data.device._id);
                toast.success(action.payload.data.message || "تم إلغاء تفعيل الجهاز بنجاح");
            })
            .addCase(removeDevice.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
                toast.error(action.payload);
            })

            // Get device statistics
            .addCase(getDeviceStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDeviceStats.fulfilled, (state, action) => {
                state.loading = false;
                state.deviceStats = action.payload.data;
            })
            .addCase(getDeviceStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get device limit
            .addCase(getDeviceLimit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDeviceLimit.fulfilled, (state, action) => {
                state.loading = false;
                state.deviceStats.maxDevicesPerUser = action.payload.data.maxDevicesPerUser;
            })
            .addCase(getDeviceLimit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update device limit
            .addCase(updateDeviceLimit.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateDeviceLimit.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.deviceStats.maxDevicesPerUser = action.payload.data.maxDevicesPerUser;
                toast.success(action.payload.data.message || "Device limit updated successfully");
            })
            .addCase(updateDeviceLimit.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
                toast.error(action.payload);
            });
    }
});

export const { clearDeviceError, setCurrentDevice, resetDeviceState } = deviceManagementSlice.actions;

export default deviceManagementSlice.reducer;
