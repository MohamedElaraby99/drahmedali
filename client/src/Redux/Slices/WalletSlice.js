import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/wallet/balance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get wallet balance');
    }
  }
);

export const getWalletTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/wallet/transactions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get wallet transactions');
    }
  }
);

const initialState = {
  balance: 0,
  transactions: [],
  loading: false,
  error: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    clearWalletState: (state) => {
      state.balance = 0;
      state.transactions = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Wallet Balance
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.data.balance;
        state.transactions = action.payload.data.transactions || [];
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get wallet balance';
      })
      
      // Get Wallet Transactions
      .addCase(getWalletTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWalletTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data.transactions;
      })
      .addCase(getWalletTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get wallet transactions';
      });
  }
});

export const { clearWalletError, clearWalletState } = walletSlice.actions;
export default walletSlice.reducer;