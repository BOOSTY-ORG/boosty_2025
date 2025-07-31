import React, { createContext, useContext, useReducer, useEffect } from "react";
import { safeStorage } from "../utils/safeStorage";

// Default voice settings with American male as default
const defaultSettings = {
  voiceType: "American", // American, Nigeria
  language: "English", // English, Pidgin
  gender: "male", // male, female
  accent: "american", // american (default), nigerian
  voiceEnabled: true,
  speechRate: 0.9,
  speechPitch: 1.0,
};

// Voice type configurations
const voiceConfigs = {
  American: {
    description: "American English",
    rate: 0.9,
    pitch: 1.0,
    lang: "en-US",
    style: "clear and professional",
  },
  Nigeria: {
    description: "Nigerian English",
    rate: 0.85,
    pitch: 0.95,
    lang: "en-NG",
    style: "warm Nigerian accent",
  },
};

// Action types
const VOICE_ACTIONS = {
  SET_VOICE_TYPE: "SET_VOICE_TYPE",
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_GENDER: "SET_GENDER",
  SET_ACCENT: "SET_ACCENT",
  TOGGLE_VOICE: "TOGGLE_VOICE",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  LOAD_SETTINGS: "LOAD_SETTINGS",
  RESET_TO_DEFAULT: "RESET_TO_DEFAULT",
};

// Reducer function
const voiceSettingsReducer = (state, action) => {
  switch (action.type) {
    case VOICE_ACTIONS.SET_VOICE_TYPE:
      return { ...state, voiceType: action.payload };

    case VOICE_ACTIONS.SET_LANGUAGE:
      return { ...state, language: action.payload };

    case VOICE_ACTIONS.SET_GENDER:
      return { ...state, gender: action.payload };

    case VOICE_ACTIONS.SET_ACCENT:
      return { ...state, accent: action.payload };

    case VOICE_ACTIONS.TOGGLE_VOICE:
      return { ...state, voiceEnabled: !state.voiceEnabled };

    case VOICE_ACTIONS.UPDATE_SETTINGS:
      return { ...state, ...action.payload };

    case VOICE_ACTIONS.LOAD_SETTINGS:
      return { ...state, ...action.payload };

    case VOICE_ACTIONS.RESET_TO_DEFAULT:
      return { ...defaultSettings };

    default:
      return state;
  }
};

// Create context
const VoiceSettingsContext = createContext();

// Custom hook for using voice settings
export const useVoiceSettings = () => {
  const context = useContext(VoiceSettingsContext);
  if (!context) {
    throw new Error(
      "useVoiceSettings must be used within a VoiceSettingsProvider"
    );
  }
  return context;
};

// Provider component
export const VoiceSettingsProvider = ({ children }) => {
  const [settings, dispatch] = useReducer(
    voiceSettingsReducer,
    defaultSettings
  );

  useEffect(() => {
    const savedSettings = safeStorage.get("boosty-voice-settings");
    if (savedSettings) {
      dispatch({ type: VOICE_ACTIONS.LOAD_SETTINGS, payload: savedSettings });
    }
  }, []);

  useEffect(() => {
    safeStorage.set("boosty-voice-settings", settings);
  }, [settings]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("boosty-voice-settings", JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save voice settings to localStorage:", error);
    }
  }, [settings]);

  // Voice synthesis helper functions
  const getVoiceConfig = () => {
    const voiceConfig = voiceConfigs[settings.voiceType];
    return {
      rate: voiceConfig.rate,
      pitch: voiceConfig.pitch,
      volume: 1.0,
      lang: voiceConfig.lang,
    };
  };

  const getAvailableVoices = () => {
    if (!window.speechSynthesis) return [];

    const voices = window.speechSynthesis.getVoices();
    const preferredLang = settings.voiceType === "Nigeria" ? "en-NG" : "en-US";

    // Filter by language preference first
    return voices.filter((voice) => {
      const isLanguageMatch = voice.lang.includes(preferredLang.split("-")[0]);
      return isLanguageMatch;
    });
  };

  const getBestVoice = () => {
    const availableVoices = getAvailableVoices();

    // For Nigerian voices, try to find Nigerian accent
    if (settings.voiceType === "Nigeria") {
      // Try Nigerian English first
      let voice = availableVoices.find((v) => v.lang.includes("en-NG"));

      // Fallback to British English (closer to Nigerian)
      if (!voice) {
        voice = availableVoices.find((v) => v.lang.includes("en-GB"));
      }

      // Filter by gender if we have options
      if (voice && availableVoices.length > 1) {
        const genderFilteredVoices = availableVoices.filter((v) => {
          const voiceName = v.name.toLowerCase();
          return settings.gender === "male"
            ? voiceName.includes("male") ||
                voiceName.includes("man") ||
                voiceName.includes("david") ||
                voiceName.includes("daniel")
            : voiceName.includes("female") ||
                voiceName.includes("woman") ||
                voiceName.includes("samantha") ||
                voiceName.includes("victoria");
        });

        if (genderFilteredVoices.length > 0) {
          voice = genderFilteredVoices[0];
        }
      }

      // Final fallback to American if no Nigerian found
      if (!voice) {
        voice = availableVoices.find((v) => v.lang.includes("en-US"));
      }

      return voice || availableVoices[0] || null;
    }

    // For American voices
    let voice = availableVoices.find((v) => v.lang.includes("en-US"));

    // Filter by gender preference for American voices
    if (voice && availableVoices.length > 1) {
      const genderFilteredVoices = availableVoices.filter((v) => {
        const voiceName = v.name.toLowerCase();
        return settings.gender === "male"
          ? voiceName.includes("male") ||
              voiceName.includes("man") ||
              voiceName.includes("david") ||
              voiceName.includes("alex")
          : voiceName.includes("female") ||
              voiceName.includes("woman") ||
              voiceName.includes("samantha") ||
              voiceName.includes("allison");
      });

      if (genderFilteredVoices.length > 0) {
        voice = genderFilteredVoices[0];
      }
    }

    // Final fallback to any English voice
    if (!voice) {
      voice = availableVoices.find((v) => v.lang.includes("en"));
    }

    return voice || availableVoices[0] || null;
  };

  // Action creators
  const actions = {
    setVoiceType: (voiceType) =>
      dispatch({ type: VOICE_ACTIONS.SET_VOICE_TYPE, payload: voiceType }),

    setLanguage: (language) =>
      dispatch({ type: VOICE_ACTIONS.SET_LANGUAGE, payload: language }),

    setGender: (gender) =>
      dispatch({ type: VOICE_ACTIONS.SET_GENDER, payload: gender }),

    setAccent: (accent) =>
      dispatch({ type: VOICE_ACTIONS.SET_ACCENT, payload: accent }),

    toggleVoice: () => dispatch({ type: VOICE_ACTIONS.TOGGLE_VOICE }),

    updateSettings: (newSettings) =>
      dispatch({ type: VOICE_ACTIONS.UPDATE_SETTINGS, payload: newSettings }),

    resetToDefault: () => dispatch({ type: VOICE_ACTIONS.RESET_TO_DEFAULT }),
  };

  // Greeting text generators
  const getPersonalizedGreeting = (userName = "there") => {
    const { voiceType, language } = settings;

    if (language === "Pidgin") {
      if (voiceType === "Nigeria") {
        return `Wetin dey happen ${userName}! I be your Nigerian energy assistant. I dey here to help you calculate how much energy your appliances dey use. Make we start this journey together!`;
      } else {
        return `Hello ${userName}! I be your energy assistant wey sabi both American and Nigerian way. I go help you calculate your solar energy needs.`;
      }
    } else {
      if (voiceType === "Nigeria") {
        return `Hello ${userName}! I'm your Nigerian energy assistant. I'm here to help you calculate how much energy your appliances use. Let's make this journey together!`;
      } else {
        return `Hello ${userName}! I'm your energy assistant. I'm here to help you calculate your solar energy needs and find the perfect system for you.`;
      }
    }
  };

  const getExplanationText = () => {
    const { language } = settings;

    if (language === "Pidgin") {
      return "This page na where we go calculate how much energy your appliances dey use. I go help you fill the form wey dey below. Just tell me about your appliances - their name, how many hours you dey use am for day and night, and the wattage. Make we start!";
    } else {
      return "This page is where we'll calculate how much energy your appliances use. I'll help you fill out the form below. Just tell me about your appliances - their names, how many hours you use them during day and night, and their wattage. Let's get started!";
    }
  };

  const getFieldGuidance = (fieldName) => {
    const { language } = settings;

    const guidanceTexts = {
      English: {
        name: "Please enter the name of your appliance, like refrigerator, fan, or television.",
        quantity:
          "How many of this appliance do you have? Enter a number like 1, 2, or 3.",
        dayHours:
          "How many hours do you use this appliance during the day, from 6 AM to 6 PM?",
        nightHours:
          "How many hours do you use this appliance at night, from 6 PM to 6 AM?",
        wattage:
          "What's the power consumption of this appliance in watts? You can usually find this on a label.",
      },
      Pidgin: {
        name: "Write the name of your appliance here, like fridge, fan, or TV.",
        quantity:
          "How many of this thing you get? Just write number like 1, 2, or 3.",
        dayHours:
          "How many hours you dey use this thing for day time, from 6 morning to 6 evening?",
        nightHours:
          "How many hours you dey use am for night, from 6 evening to 6 morning?",
        wattage:
          "Wetin be the watts of this appliance? You fit see am for sticker or manual.",
      },
    };

    return guidanceTexts[language][fieldName] || "Please fill in this field.";
  };

  // Context value
  const contextValue = {
    // Settings state
    settings,

    // Action creators
    ...actions,

    // Helper functions
    getVoiceConfig,
    getAvailableVoices,
    getBestVoice,
    getPersonalizedGreeting,
    getExplanationText,
    getFieldGuidance,

    // Constants
    voiceConfigs,
    defaultSettings,
  };

  return (
    <VoiceSettingsContext.Provider value={contextValue}>
      {children}
    </VoiceSettingsContext.Provider>
  );
};

export default VoiceSettingsContext;
