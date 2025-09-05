import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Async thunks
export const getAllServices = createAsyncThunk(
    "whatsappService/getAllServices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/whatsapp-services");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get services");
        }
    }
);

export const getAllServicesAdmin = createAsyncThunk(
    "whatsappService/getAllServicesAdmin",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/whatsapp-services/admin/all");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get all services");
        }
    }
);

export const getServiceById = createAsyncThunk(
    "whatsappService/getServiceById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/whatsapp-services/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get service");
        }
    }
);

export const createService = createAsyncThunk(
    "whatsappService/createService",
    async (serviceData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/whatsapp-services", serviceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create service");
        }
    }
);

export const updateService = createAsyncThunk(
    "whatsappService/updateService",
    async ({ id, serviceData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/whatsapp-services/${id}`, serviceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update service");
        }
    }
);

export const deleteService = createAsyncThunk(
    "whatsappService/deleteService",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/whatsapp-services/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete service");
        }
    }
);

export const toggleServiceStatus = createAsyncThunk(
    "whatsappService/toggleServiceStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/whatsapp-services/${id}/toggle`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle service status");
        }
    }
);

export const addWhatsAppNumber = createAsyncThunk(
    "whatsappService/addWhatsAppNumber",
    async ({ serviceId, numberData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/whatsapp-services/${serviceId}/numbers`, numberData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add WhatsApp number");
        }
    }
);

export const removeWhatsAppNumber = createAsyncThunk(
    "whatsappService/removeWhatsAppNumber",
    async ({ serviceId, numberId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/whatsapp-services/${serviceId}/numbers/${numberId}`);
            return { serviceId, numberId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove WhatsApp number");
        }
    }
);

export const getServicesByCategory = createAsyncThunk(
    "whatsappService/getServicesByCategory",
    async (category, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/whatsapp-services/category/${category}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get services by category");
        }
    }
);

export const getPaymentServices = createAsyncThunk(
    "whatsappService/getPaymentServices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/whatsapp-services/payment");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get payment services");
        }
    }
);

export const getNonPaymentServices = createAsyncThunk(
    "whatsappService/getNonPaymentServices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/whatsapp-services/non-payment");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get non-payment services");
        }
    }
);

const initialState = {
    services: [],
    currentService: null,
    loading: false,
    error: null,
    adminLoading: false,
    adminError: null,
    createLoading: false,
    createError: null,
    updateLoading: false,
    updateError: null,
    deleteLoading: false,
    deleteError: null
};

const whatsappServiceSlice = createSlice({
    name: "whatsappService",
    initialState,
    reducers: {
        clearWhatsAppServiceError: (state) => {
            state.error = null;
            state.adminError = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },
        clearCurrentService: (state) => {
            state.currentService = null;
        },
        clearWhatsAppServiceState: (state) => {
            state.services = [];
            state.currentService = null;
            state.loading = false;
            state.error = null;
            state.adminLoading = false;
            state.adminError = null;
            state.createLoading = false;
            state.createError = null;
            state.updateLoading = false;
            state.updateError = null;
            state.deleteLoading = false;
            state.deleteError = null;
        }
    },
    extraReducers: (builder) => {
        // Get all services
        builder
            .addCase(getAllServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.data.services;
            })
            .addCase(getAllServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get all services admin
        builder
            .addCase(getAllServicesAdmin.pending, (state) => {
                state.adminLoading = true;
                state.adminError = null;
            })
            .addCase(getAllServicesAdmin.fulfilled, (state, action) => {
                state.adminLoading = false;
                state.services = action.payload.data.services;
            })
            .addCase(getAllServicesAdmin.rejected, (state, action) => {
                state.adminLoading = false;
                state.adminError = action.payload;
            });

        // Get service by ID
        builder
            .addCase(getServiceById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getServiceById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentService = action.payload.data.service;
            })
            .addCase(getServiceById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create service
        builder
            .addCase(createService.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.createLoading = false;
                state.services.unshift(action.payload.data.service);
            })
            .addCase(createService.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            });

        // Update service
        builder
            .addCase(updateService.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateService.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedService = action.payload.data.service;
                const index = state.services.findIndex(service => service._id === updatedService._id);
                if (index !== -1) {
                    state.services[index] = updatedService;
                }
                if (state.currentService && state.currentService._id === updatedService._id) {
                    state.currentService = updatedService;
                }
            })
            .addCase(updateService.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });

        // Delete service
        builder
            .addCase(deleteService.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.services = state.services.filter(service => service._id !== action.payload.id);
                if (state.currentService && state.currentService._id === action.payload.id) {
                    state.currentService = null;
                }
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            });

        // Toggle service status
        builder
            .addCase(toggleServiceStatus.fulfilled, (state, action) => {
                const updatedService = action.payload.data.service;
                const index = state.services.findIndex(service => service._id === updatedService._id);
                if (index !== -1) {
                    state.services[index] = updatedService;
                }
                if (state.currentService && state.currentService._id === updatedService._id) {
                    state.currentService = updatedService;
                }
            });

        // Add WhatsApp number
        builder
            .addCase(addWhatsAppNumber.fulfilled, (state, action) => {
                const updatedService = action.payload.data.service;
                const index = state.services.findIndex(service => service._id === updatedService._id);
                if (index !== -1) {
                    state.services[index] = updatedService;
                }
                if (state.currentService && state.currentService._id === updatedService._id) {
                    state.currentService = updatedService;
                }
            });

        // Remove WhatsApp number
        builder
            .addCase(removeWhatsAppNumber.fulfilled, (state, action) => {
                const updatedService = action.payload.data.service;
                const index = state.services.findIndex(service => service._id === updatedService.serviceId);
                if (index !== -1) {
                    state.services[index] = updatedService;
                }
                if (state.currentService && state.currentService._id === updatedService.serviceId) {
                    state.currentService = updatedService;
                }
            });

        // Get services by category
        builder
            .addCase(getServicesByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getServicesByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.data.services;
            })
            .addCase(getServicesByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get payment services
        builder
            .addCase(getPaymentServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.data.services;
            })
            .addCase(getPaymentServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get non-payment services
        builder
            .addCase(getNonPaymentServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNonPaymentServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.data.services;
            })
            .addCase(getNonPaymentServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    clearWhatsAppServiceError, 
    clearCurrentService, 
    clearWhatsAppServiceState 
} = whatsappServiceSlice.actions;

export default whatsappServiceSlice.reducer; 