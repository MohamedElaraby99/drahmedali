import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const purchaseContent = createAsyncThunk(
  'payment/purchaseContent',
  async ({ courseId, purchaseType, itemId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/purchase-content', {
        courseId,
        purchaseType,
        itemId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Purchase failed');
    }
  }
);

export const getPurchaseHistory = createAsyncThunk(
  'payment/getPurchaseHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/purchase-history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch purchase history');
    }
  }
);

export const checkPurchaseStatus = createAsyncThunk(
  'payment/checkPurchaseStatus',
  async ({ courseId, purchaseType, itemId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/check-purchase-status', {
        params: { courseId, purchaseType, itemId }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to check purchase status');
    }
  }
);

export const getWalletBalance = createAsyncThunk(
  'payment/getWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/wallet/balance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet balance');
    }
  }
);

export const getPurchasedContent = createAsyncThunk(
  'payment/getPurchasedContent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/purchased-content');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch purchased content');
    }
  }
);

const initialState = {
  walletBalance: 0,
  purchaseHistory: [],
  purchasedContent: [],
  purchaseStatus: {},
  loading: false,
  error: null,
  lastPurchase: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastPurchase: (state) => {
      state.lastPurchase = null;
    },
    updatePurchaseStatus: (state, action) => {
      const { courseId, purchaseType, itemId, isPurchased } = action.payload;
      const key = `${courseId}-${purchaseType}-${itemId}`;
      state.purchaseStatus[key] = isPurchased;
    },
    clearPaymentState: (state) => {
      state.walletBalance = 0;
      state.purchaseHistory = [];
      state.purchasedContent = [];
      state.purchaseStatus = {};
      state.loading = false;
      state.error = null;
      state.lastPurchase = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Purchase Content
      .addCase(purchaseContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseContent.fulfilled, (state, action) => {
        state.loading = false;
        state.walletBalance = action.payload.data.newBalance;
        state.lastPurchase = action.payload.data.purchase;
        // Update purchase status
        const { courseId, purchaseType, purchasedItemId } = action.payload.data.purchase;
        const key = `${courseId}-${purchaseType}-${purchasedItemId}`;
        state.purchaseStatus[key] = true;
      })
      .addCase(purchaseContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Purchase failed';
      })
      
      // Get Purchase History
      .addCase(getPurchaseHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPurchaseHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseHistory = action.payload.data.purchases;
      })
      .addCase(getPurchaseHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch purchase history';
      })
      
      // Check Purchase Status
      .addCase(checkPurchaseStatus.fulfilled, (state, action) => {
        const { courseId, purchaseType, itemId } = action.meta.arg;
        const key = `${courseId}-${purchaseType}-${itemId}`;
        state.purchaseStatus[key] = action.payload.data.isPurchased;
      })
      
      // Get Wallet Balance
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.walletBalance = action.payload.data.balance;
      })
      
      // Get Purchased Content
      .addCase(getPurchasedContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPurchasedContent.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedContent = action.payload.data.purchases;
      })
      .addCase(getPurchasedContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch purchased content';
      });
  }
});

export const { clearError, clearLastPurchase, updatePurchaseStatus, clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
