const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  BACKEND_URL:
    import.meta.env.VITE_BACKEND_URL ||
    "https://boosty-2025-backend.vercel.app",
};

export const API_ENDPOINTS = {
  RECOMMENDATIONS: `${API_CONFIG.BASE_URL}/api/recommendations`,
  TTS_SPEAK: `${API_CONFIG.BASE_URL}/api/tts/speak`,
  AUTH_SYNC: `${API_CONFIG.BACKEND_URL}/api/auth/clerk-sync`,
  // Address management endpoints
  USER_ADDRESS: `${API_CONFIG.BASE_URL}/api/recommendations/user/address`,
  UPDATE_ADDRESS: `${API_CONFIG.BASE_URL}/api/recommendations/user/address`,
};
