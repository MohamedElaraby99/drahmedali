import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks for financial data
export const getFinancialStats = createAsyncThunk(
  'financial/getFinancialStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/financial/stats?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial stats');
    }
  }
);

export const getAllTransactions = createAsyncThunk(
  'financial/getAllTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/financial?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const addIncome = createAsyncThunk(
  'financial/addIncome',
  async (incomeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/financial/income', incomeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add income');
    }
  }
);

export const addExpense = createAsyncThunk(
  'financial/addExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/financial/expense', expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add expense');
    }
  }
);

export const generateFinancialReport = createAsyncThunk(
  'financial/generateFinancialReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/financial/report?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate financial report');
    }
  }
);

export const getGroupPaymentStatus = createAsyncThunk(
  'financial/getGroupPaymentStatus',
  async ({ groupId, month, year }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const response = await axiosInstance.get(`/financial/group/${groupId}/payment-status?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group payment status');
    }
  }
);

const initialState = {
  // Financial statistics
  stats: {
    data: null,
    loading: false,
    error: null
  },
  
  // Transactions
  transactions: {
    data: [],
    pagination: {},
    loading: false,
    error: null
  },
  
  // Financial reports
  reports: {
    data: null,
    loading: false,
    error: null
  },
  
  // Group payment status
  groupPaymentStatus: {
    data: null,
    loading: false,
    error: null
  },
  
  // Add income/expense operations
  addIncomeLoading: false,
  addIncomeError: null,
  addExpenseLoading: false,
  addExpenseError: null
};

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    clearFinancialError: (state, action) => {
      const errorType = action.payload || 'all';
      
      if (errorType === 'all' || errorType === 'stats') {
        state.stats.error = null;
      }
      if (errorType === 'all' || errorType === 'transactions') {
        state.transactions.error = null;
      }
      if (errorType === 'all' || errorType === 'reports') {
        state.reports.error = null;
      }
      if (errorType === 'all' || errorType === 'groupPaymentStatus') {
        state.groupPaymentStatus.error = null;
      }
      if (errorType === 'all' || errorType === 'addIncome') {
        state.addIncomeError = null;
      }
      if (errorType === 'all' || errorType === 'addExpense') {
        state.addExpenseError = null;
      }
    },
    
    resetFinancialState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Financial Stats
      .addCase(getFinancialStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(getFinancialStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload.data;
        state.stats.error = null;
      })
      .addCase(getFinancialStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      
      // Get All Transactions
      .addCase(getAllTransactions.pending, (state) => {
        state.transactions.loading = true;
        state.transactions.error = null;
      })
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.transactions.loading = false;
        state.transactions.data = action.payload.data.docs || action.payload.data;
        state.transactions.pagination = {
          page: action.payload.data.page || 1,
          limit: action.payload.data.limit || 10,
          totalPages: action.payload.data.totalPages || 0,
          totalDocs: action.payload.data.totalDocs || 0
        };
        state.transactions.error = null;
      })
      .addCase(getAllTransactions.rejected, (state, action) => {
        state.transactions.loading = false;
        state.transactions.error = action.payload;
      })
      
      // Add Income
      .addCase(addIncome.pending, (state) => {
        state.addIncomeLoading = true;
        state.addIncomeError = null;
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.addIncomeLoading = false;
        // Add new income to transactions list if it exists
        if (state.transactions.data) {
          state.transactions.data.unshift(action.payload.data);
        }
        state.addIncomeError = null;
      })
      .addCase(addIncome.rejected, (state, action) => {
        state.addIncomeLoading = false;
        state.addIncomeError = action.payload;
      })
      
      // Add Expense
      .addCase(addExpense.pending, (state) => {
        state.addExpenseLoading = true;
        state.addExpenseError = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.addExpenseLoading = false;
        // Add new expense to transactions list if it exists
        if (state.transactions.data) {
          state.transactions.data.unshift(action.payload.data);
        }
        state.addExpenseError = null;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.addExpenseLoading = false;
        state.addExpenseError = action.payload;
      })
      
      // Generate Financial Report
      .addCase(generateFinancialReport.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(generateFinancialReport.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.data = action.payload.data;
        state.reports.error = null;
      })
      .addCase(generateFinancialReport.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload;
      })
      
      // Get Group Payment Status
      .addCase(getGroupPaymentStatus.pending, (state) => {
        state.groupPaymentStatus.loading = true;
        state.groupPaymentStatus.error = null;
      })
      .addCase(getGroupPaymentStatus.fulfilled, (state, action) => {
        state.groupPaymentStatus.loading = false;
        state.groupPaymentStatus.data = action.payload.data;
        state.groupPaymentStatus.error = null;
      })
      .addCase(getGroupPaymentStatus.rejected, (state, action) => {
        state.groupPaymentStatus.loading = false;
        state.groupPaymentStatus.error = action.payload;
      });
  }
});

export const { clearFinancialError, resetFinancialState } = financialSlice.actions;
export default financialSlice.reducer;