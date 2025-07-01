import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for syncing user with backend after Clerk authentication
export const syncUserWithBackend = createAsyncThunk(
  "auth/syncUserWithBackend",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "http://boosty-backend.vercel.app/api/auth/clerk-sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.clerkToken}`,
          },
          body: JSON.stringify({
            email: userData.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sync user with backend");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    syncStatus: "idle", // 'idle' | 'pending' | 'fulfilled' | 'rejected'
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.syncStatus = "idle";
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUserWithBackend.pending, (state) => {
        state.syncStatus = "pending";
        state.error = null;
      })
      .addCase(syncUserWithBackend.fulfilled, (state, action) => {
        state.syncStatus = "fulfilled";
        // Update user data with backend response if needed
        if (action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
      })
      .addCase(syncUserWithBackend.rejected, (state, action) => {
        state.syncStatus = "rejected";
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, setLoading, setError, clearError } =
  authSlice.actions;
export default authSlice.reducer;
