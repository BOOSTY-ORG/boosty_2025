import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "../config/api";

// In authSlice.js, enhance the error handling
export const syncUserWithBackend = createAsyncThunk(
  "auth/syncUserWithBackend",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("🚀 Attempting backend sync...");

      const response = await fetch(
        "https://boosty-2025-backend.vercel.app/api/auth/clerk-sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-clerk-auth-token": userData.clerkToken,
          },
          body: JSON.stringify({
            email: userData.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
          }),
        }
      );

      // 🔍 ADD DETAILED ERROR LOGGING
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend sync failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(
          `Backend sync failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ Backend sync successful:", data);
      return data;
    } catch (error) {
      console.error("❌ Sync error:", error);
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
