// config/api.js - Updated configuration

const BASE_URL = "http://localhost:3001";

export const API_ENDPOINTS = {
  BASE_URL,

  // Existing endpoints
  TTS_SPEAK: `${BASE_URL}/api/tts/speak`,
  RECOMMENDATIONS: `${BASE_URL}/api/recommendations`,
  USER_ADDRESS: `${BASE_URL}/api/user/address`,

  // Conversation endpoints
  CONVERSATION: `${BASE_URL}/api/conversation/conversation`,
  SPEECH_TO_TEXT: `${BASE_URL}/api/conversation/speech-to-text`,
  SOLAR_KNOWLEDGE: `${BASE_URL}/api/conversation/solar-knowledge`,
  APPLIANCES: `${BASE_URL}/api/conversation/appliances`,
};
