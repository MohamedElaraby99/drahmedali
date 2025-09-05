import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Async thunks
export const getWalletBalance = createAsyncThunk(
    "wallet/getBalance",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wallet/balance");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get wallet balance");
        }
    }
);

export const rechargeWallet = createAsyncThunk(
    "wallet/recharge",
    async ({ code, amount }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/wallet/recharge", { code, amount });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to recharge wallet");
        }
    }
);

export const getTransactionHistory = createAsyncThunk(
    "wallet/getTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wallet/transactions");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get transaction history");
        }
    }
);

export const validateRechargeCode = createAsyncThunk(
    "wallet/validateCode",
    async ({ code }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/wallet/validate-code", { code });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to validate code");
        }
    }
);

const initialState = {
    balance: 0,
    transactions: [],
    loading: false,
    error: null,
    rechargeLoading: false,
    rechargeError: null,
    codeValidation: {
        isValid: false,
        loading: false,
        error: null
    }
};

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        clearWalletError: (state) => {
            state.error = null;
            state.rechargeError = null;
            state.codeValidation.error = null;
        },
        clearWalletState: (state) => {
            state.balance = 0;
            state.transactions = [];
            state.loading = false;
            state.error = null;
            state.rechargeLoading = false;
            state.rechargeError = null;
            state.codeValidation = {
                isValid: false,
                loading: false,
                error: null
            };
        }
    },
    extraReducers: (builder) => {
        // Get wallet balance
        builder
            .addCase(getWalletBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWalletBalance.fulfilled, (state, action) => {
                state.loading = false;
                state.balance = action.payload.data.balance;
                state.transactions = action.payload.data.transactions;
            })
            .addCase(getWalletBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Recharge wallet
        builder
            .addCase(rechargeWallet.pending, (state) => {
                state.rechargeLoading = true;
                state.rechargeError = null;
            })
            .addCase(rechargeWallet.fulfilled, (state, action) => {
                state.rechargeLoading = false;
                state.balance = action.payload.data.balance;
                state.transactions.push(action.payload.data.transaction);
            })
            .addCase(rechargeWallet.rejected, (state, action) => {
                state.rechargeLoading = false;
                state.rechargeError = action.payload;
            });

        // Get transaction history
        builder
            .addCase(getTransactionHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTransactionHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data.transactions;
            })
            .addCase(getTransactionHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Validate recharge code
        builder
            .addCase(validateRechargeCode.pending, (state) => {
                state.codeValidation.loading = true;
                state.codeValidation.error = null;
            })
            .addCase(validateRechargeCode.fulfilled, (state, action) => {
                state.codeValidation.loading = false;
                state.codeValidation.isValid = action.payload.data.isValid;
            })
            .addCase(validateRechargeCode.rejected, (state, action) => {
                state.codeValidation.loading = false;
                state.codeValidation.error = action.payload;
                state.codeValidation.isValid = false;
            });
    }
});

export const { clearWalletError, clearWalletState } = walletSlice.actions;
export default walletSlice.reducer; 