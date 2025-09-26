import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mic, MicOff } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useVoiceSettings } from "../context/VoiceSettingsContext";
import {
  useRecommendationSubmit,
  useRecommendation,
} from "../context/RecommendationContext";
import { API_ENDPOINTS } from "../config/api";
import ConversationEngine from "../utils/conversationEngine";

// NEW: Smart Fallback Assistant for when AI conversation fails
class FallbackAssistant {
  constructor(settings, applianceDatabase) {
    this.settings = settings;
    this.applianceDatabase = applianceDatabase;
    this.isActive = false;
    this.currentField = null;
  }

  activate() {
    this.isActive = true;
    console.log("🛡️ Fallback Assistant activated");
  }

  deactivate() {
    this.isActive = false;
  }

  // Smart form guidance without AI
  processUserInput(userInput, currentFormData) {
    const input = userInput.toLowerCase().trim();
    const response = { actions: [], suggestions: [] };

    // Detect appliance mentions
    const detectedAppliance = this.detectAppliance(input);
    if (detectedAppliance) {
      response.actions.push({
        type: "fill_field",
        field: "name",
        value: detectedAppliance.name,
        confidence: 0.9,
      });

      response.actions.push({
        type: "fill_field",
        field: "wattage",
        value: detectedAppliance.wattage.toString(),
        confidence: 0.8,
      });

      const responseText =
        this.settings.language === "Pidgin"
          ? `I don detect say you talk about ${detectedAppliance.name}. I go set the wattage to ${detectedAppliance.wattage} watts. You fit change am if e no correct.`
          : `I detected you mentioned a ${detectedAppliance.name}. I'll set the wattage to ${detectedAppliance.wattage} watts. You can adjust it if needed.`;

      return {
        ...response,
        intent: "appliance_recognition",
        response: responseText,
        success: true,
      };
    }

    // Detect numbers for wattage/hours
    const numbers = input.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const number = numbers[0];

      // If they mention watts or power
      if (
        input.includes("watt") ||
        input.includes("power") ||
        input.includes("consume")
      ) {
        response.actions.push({
          type: "fill_field",
          field: "wattage",
          value: number,
          confidence: 0.85,
        });

        const responseText =
          this.settings.language === "Pidgin"
            ? `I don set the wattage to ${number} watts.`
            : `I've set the wattage to ${number} watts.`;

        return {
          ...response,
          intent: "form_fill",
          response: responseText,
          success: true,
        };
      }

      // If they mention hours
      if (
        input.includes("hour") ||
        input.includes("time") ||
        input.includes("day") ||
        input.includes("night")
      ) {
        const isNight = input.includes("night") || input.includes("evening");
        const field = isNight ? "nightHours" : "dayHours";

        response.actions.push({
          type: "fill_field",
          field: field,
          value: number,
          confidence: 0.85,
        });

        const responseText =
          this.settings.language === "Pidgin"
            ? `I don set ${isNight ? "night" : "day"} hours to ${number}.`
            : `I've set ${isNight ? "night" : "day"} hours to ${number}.`;

        return {
          ...response,
          intent: "form_fill",
          response: responseText,
          success: true,
        };
      }
    }

    // Help requests
    if (
      input.includes("help") ||
      input.includes("how") ||
      input.includes("what")
    ) {
      return this.provideHelp(currentFormData);
    }

    // Solar knowledge questions
    if (
      input.includes("solar") ||
      input.includes("battery") ||
      input.includes("panel")
    ) {
      return this.provideSolarKnowledge(input);
    }

    // Default encouragement
    const defaultResponse =
      this.settings.language === "Pidgin"
        ? "I dey listen o. You fit talk about your appliance like 'I get freezer' or ask me about solar power."
        : "I'm listening! You can tell me about your appliances like 'I have a freezer' or ask me about solar power.";

    return {
      ...response,
      intent: "general_chat",
      response: defaultResponse,
      suggestions: [
        "Tell me about an appliance",
        "Ask about solar panels",
        "Need help with the form",
      ],
      success: true,
    };
  }

  detectAppliance(input) {
    // Enhanced appliance detection
    const applianceKeywords = {
      refrigerator: { name: "Refrigerator", wattage: 150 },
      fridge: { name: "Refrigerator", wattage: 150 },
      freezer: { name: "Freezer", wattage: 300 },
      "deep freezer": { name: "Deep Freezer", wattage: 400 },
      "air conditioner": { name: "Air Conditioner", wattage: 1500 },
      ac: { name: "Air Conditioner", wattage: 1500 },
      fan: { name: "Ceiling Fan", wattage: 75 },
      "ceiling fan": { name: "Ceiling Fan", wattage: 75 },
      tv: { name: "LED TV", wattage: 100 },
      television: { name: "LED TV", wattage: 100 },
      laptop: { name: "Laptop", wattage: 65 },
      computer: { name: "Laptop", wattage: 65 },
      phone: { name: "Phone Charger", wattage: 15 },
      charger: { name: "Phone Charger", wattage: 15 },
      bulb: { name: "LED Bulb", wattage: 12 },
      light: { name: "LED Bulb", wattage: 12 },
      "washing machine": { name: "Washing Machine", wattage: 500 },
      microwave: { name: "Microwave", wattage: 1000 },
      iron: { name: "Iron", wattage: 1200 },
      "water heater": { name: "Water Heater", wattage: 2000 },
      stabilizer: { name: "Stabilizer", wattage: 50 },
    };

    for (const [keyword, appliance] of Object.entries(applianceKeywords)) {
      if (input.includes(keyword)) {
        return appliance;
      }
    }

    return null;
  }

  provideHelp(currentFormData) {
    const missingFields = [];
    if (!currentFormData.name) missingFields.push("appliance name");
    if (!currentFormData.wattage) missingFields.push("wattage");

    let helpText;
    if (missingFields.length > 0) {
      helpText =
        this.settings.language === "Pidgin"
          ? `You still need to fill: ${missingFields.join(
              " and "
            )}. Just talk about your appliance and I go help you.`
          : `You still need to fill: ${missingFields.join(
              " and "
            )}. Just tell me about your appliance and I'll help you.`;
    } else {
      helpText =
        this.settings.language === "Pidgin"
          ? "Your form don complete! You fit click 'Confirm details' to see recommendations."
          : "Your form is complete! You can click 'Confirm details' to see recommendations.";
    }

    return {
      intent: "help",
      response: helpText,
      actions: [],
      suggestions: [
        "Tell me about an appliance",
        "Ask about wattage",
        "Submit the form",
      ],
      success: true,
    };
  }

  provideSolarKnowledge(input) {
    let knowledge = "";

    if (input.includes("battery")) {
      knowledge =
        this.settings.language === "Pidgin"
          ? "For battery, lithium battery dey last long pass - like 10 years. Lead acid battery na 3-5 years but e cheap."
          : "For batteries, lithium batteries last longest - about 10 years. Lead acid batteries last 3-5 years but are cheaper.";
    } else if (input.includes("panel")) {
      knowledge =
        this.settings.language === "Pidgin"
          ? "Monocrystalline panel dey efficient pass but e cost. Polycrystalline panel dey cheaper and still good."
          : "Monocrystalline panels are most efficient but cost more. Polycrystalline panels are cheaper and still good quality.";
    } else {
      knowledge =
        this.settings.language === "Pidgin"
          ? "Solar power go save your money for long run. You no go dey buy fuel for generator again."
          : "Solar power will save you money in the long run. You won't need to buy generator fuel anymore.";
    }

    return {
      intent: "solar_knowledge",
      response: knowledge,
      actions: [],
      suggestions: [
        "Ask about batteries",
        "Ask about panels",
        "Continue with form",
      ],
      success: true,
    };
  }
}

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    settings,
    getVoiceConfig,
    getBestVoice,
    getPersonalizedGreeting,
    getExplanationText,
    getFieldGuidance,
  } = useVoiceSettings();

  // Recommendation hooks
  const {
    submitAppliance,
    isLoading: isGettingRecommendations,
    error,
  } = useRecommendationSubmit();
  const { recommendationResult, resetRecommendation, hasRecommendation } =
    useRecommendation();

  // AI States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("waiting");
  const [showForm, setShowForm] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [ttsStatus, setTtsStatus] = useState("unknown");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNavigatingToSettings, setIsNavigatingToSettings] = useState(false);
  const [showError, setShowError] = useState(false);

  // Enhanced AI States
  const [conversation] = useState(new ConversationEngine());
  const [fallbackAssistant] = useState(new FallbackAssistant(settings, {}));
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInConversationMode, setIsInConversationMode] = useState(false);
  const [aiStatus, setAiStatus] = useState("unknown"); // "active", "fallback", "error"
  const [fallbackActive, setFallbackActive] = useState(false);

  // Form States
  const [applianceData, setApplianceData] = useState({
    name: "",
    quantity: "1",
    dayHours: "",
    nightHours: "",
    wattage: "",
  });

  // Form completion tracking
  const [formCompleteTimer, setFormCompleteTimer] = useState(null);
  const [hasPromptedSubmit, setHasPromptedSubmit] = useState(false);

  // References
  const synthRef = useRef(null);
  const timeoutRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Keep existing initialization useEffect...
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    const cleanupRefs = {
      abortControllers: new Set(),
      timers: new Set(),
    };

    if (!synthRef.current) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    const checkVoices = () => {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        setSpeechReady(true);
      }
    };

    checkVoices();
    synthRef.current.onvoiceschanged = checkVoices;

    const readyTimer = setTimeout(() => {
      setPageReady(true);
    }, 2000);

    cleanupRefs.timers.add(readyTimer);

    conversation.updateContext({
      currentPage: "voice-assistant",
      formData: applianceData,
      location: "Lagos",
      voiceSettings: settings,
    });

    return () => {
      cleanupRefs.abortControllers.forEach((controller) => controller.abort());
      cleanupRefs.timers.forEach((timer) => clearTimeout(timer));

      if (synthRef.current) {
        synthRef.current.cancel();
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (formCompleteTimer) {
        clearTimeout(formCompleteTimer);
      }

      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  // Keep existing TTS functions...
  const speakText = async (text) => {
    if (isMuted || !settings.voiceEnabled || isNavigating) {
      return Promise.resolve();
    }

    setIsSpeaking(true);

    try {
      // Try Google TTS first, fallback to Web Speech
      if (ttsStatus !== "free") {
        try {
          await speakTextWithGoogleTTS(text);
          setIsSpeaking(false);
          return;
        } catch (error) {
          setTtsStatus("free");
        }
      }

      await speakTextWithWebSpeech(text);
      setIsSpeaking(false);
    } catch (error) {
      console.error("❌ All TTS methods failed:", error);
      setIsSpeaking(false);
    }
  };

  // Keep existing Google TTS and Web Speech functions (unchanged)...
  const speakTextWithGoogleTTS = async (text) => {
    try {
      console.log("🎙️ Trying Google Cloud TTS...");

      const response = await fetch(API_ENDPOINTS.TTS_SPEAK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceType: settings.voiceType,
          gender: settings.gender,
          language: settings.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        if (isNavigating || !synthRef.current) {
          URL.revokeObjectURL(audioUrl);
          resolve();
          return;
        }

        const audio = new Audio(audioUrl);
        audio.volume = volume;
        currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          reject(error);
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.log("❌ Google TTS failed:", error.message);
      throw error;
    }
  };

  const speakTextWithWebSpeech = async (text) => {
    console.log("🔊 Using Web Speech API (free fallback)");

    if (!synthRef.current) {
      throw new Error("Web Speech API not available");
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceConfig = getVoiceConfig();
      const bestVoice = getBestVoice();

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = volume;
      utterance.lang = voiceConfig.lang;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("❌ Web Speech error:", error);
        resolve(); // Don't fail, just resolve
      };

      if (synthRef.current) {
        synthRef.current.cancel();
        synthRef.current.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  // ENHANCED: Voice recognition with smart fallback
  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);
      console.log("🎤 Starting voice recognition...");

      let result;

      try {
        // Try advanced conversation AI first
        result = await conversation.startListening();
        setAiStatus("active");

        if (result.transcript) {
          await handleConversationalInput(result.transcript);
        }
      } catch (error) {
        console.log("🛡️ AI conversation failed, activating fallback assistant");

        // Activate fallback mode
        setAiStatus("fallback");
        setFallbackActive(true);
        fallbackAssistant.activate();

        // Try basic speech recognition for fallback
        result = await startBasicSpeechRecognition();

        if (result && result.transcript) {
          await handleFallbackInput(result.transcript);
        }
      }
    } catch (error) {
      console.error("All voice recognition failed:", error);
      setAiStatus("error");

      const errorMessage =
        settings.language === "Pidgin"
          ? "Sorry o, I no fit hear you well. But I still dey here to help you with the form. You fit type or use the form directly."
          : "Sorry, I can't hear you clearly right now. But I'm still here to help you with the form. You can type or use the form directly.";

      await speakText(errorMessage);
    } finally {
      setIsListening(false);
    }
  };

  // NEW: Basic speech recognition for fallback
  const startBasicSpeechRecognition = async () => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let hasResult = false;

      recognition.onresult = (event) => {
        hasResult = true;
        const transcript = event.results[0][0].transcript;
        resolve({ transcript: transcript.trim(), confidence: 85 });
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error("No speech detected"));
        }
      };

      recognition.start();

      // Auto-stop after 6 seconds
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 6000);
    });
  };

  // ENHANCED: Handle AI conversation input
  const handleConversationalInput = async (userMessage) => {
    try {
      console.log("💬 Processing with full AI:", userMessage);

      const response = await conversation.processUserMessage(userMessage);

      setConversationHistory((prev) => [
        ...prev,
        {
          user: userMessage,
          assistant: response.response,
          intent: response.intent,
          actions: response.actions,
          timestamp: new Date(),
          source: "ai",
        },
      ]);

      await speakText(response.response);

      if (response.actions && response.actions.length > 0) {
        await executeConversationActions(response.actions);
      }
    } catch (error) {
      console.error("AI conversation failed:", error);
      // Fall back to basic assistant
      await handleFallbackInput(userMessage);
    }
  };

  // NEW: Handle fallback assistant input
  const handleFallbackInput = async (userMessage) => {
    try {
      console.log("🛡️ Processing with fallback assistant:", userMessage);

      const response = fallbackAssistant.processUserInput(
        userMessage,
        applianceData
      );

      setConversationHistory((prev) => [
        ...prev,
        {
          user: userMessage,
          assistant: response.response,
          intent: response.intent,
          actions: response.actions,
          timestamp: new Date(),
          source: "fallback",
        },
      ]);

      await speakText(response.response);

      if (response.actions && response.actions.length > 0) {
        await executeConversationActions(response.actions);
      }
    } catch (error) {
      console.error("Fallback processing failed:", error);

      const errorMessage =
        settings.language === "Pidgin"
          ? "I hear you but I no too understand. You fit try again or use the form directly."
          : "I heard you but didn't quite understand. Please try again or use the form directly.";

      await speakText(errorMessage);
    }
  };

  // Keep existing executeConversationActions function...
  const executeConversationActions = async (actions) => {
    const actionResults = await conversation.executeActions(actions, {
      handleInputChange: (field, value) => {
        console.log(`🔄 Auto-filling ${field} with ${value}`);
        setApplianceData((prev) => ({
          ...prev,
          [field]: value,
        }));

        const feedback =
          settings.language === "Pidgin"
            ? `I don set ${field} to ${value}`
            : `I've set ${field} to ${value}`;

        speakText(feedback);
      },
      speakText,
    });
  };

  // ENHANCED: Mic instructions with fallback status
  const getMicInstructions = () => {
    if (currentPhase === "waiting" && pageReady && speechReady) {
      return "Click the mic when you're ready to begin";
    } else if (currentPhase === "interactive" && isInConversationMode) {
      if (isListening) {
        return fallbackActive
          ? "Listening... Basic voice help active"
          : "Listening... AI conversation active";
      } else if (isSpeaking) {
        return "Speaking... Click mic to mute";
      } else {
        const baseText = "Click mic to speak or ask questions";
        if (fallbackActive) {
          return `${baseText} (Basic assistant mode)`;
        }
        return baseText;
      }
    }
    return "";
  };

  // ENHANCED: AI introduction with fallback mention
  const startAIIntroduction = async () => {
    if (hasGreeted) return;

    setHasGreeted(true);

    try {
      setCurrentPhase("greeting");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const greeting = getPersonalizedGreeting(user?.firstName);
      await speakText(greeting);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentPhase("explaining");
      setShowForm(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const explanation = getExplanationText();

      const conversationCapability =
        settings.language === "Pidgin"
          ? " You fit talk to me naturally about your appliances and I go help you fill the form. Even if my smart features no dey work, I still get basic help for you."
          : " You can speak to me naturally about your appliances and I'll help fill the form. Even if my smart features aren't working, I still have basic assistance for you.";

      const fullExplanation = explanation + conversationCapability;

      await speakText(fullExplanation);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentPhase("interactive");
      setIsInConversationMode(true);

      // Test AI status
      try {
        await conversation.processUserMessage("test");
        setAiStatus("active");
        console.log("✅ Full AI conversation ready");
      } catch (error) {
        setAiStatus("fallback");
        setFallbackActive(true);
        fallbackAssistant.activate();
        console.log("🛡️ Fallback assistant ready");
      }
    } catch (error) {
      console.error("Error in AI introduction:", error);
      setCurrentPhase("interactive");
      setShowForm(true);
      setIsInConversationMode(true);
      setAiStatus("fallback");
      setFallbackActive(true);
      fallbackAssistant.activate();
    }
  };

  // Keep existing helper functions (unchanged)...
  const handleMicClick = () => {
    if (currentPhase === "waiting" && pageReady && speechReady) {
      startAIIntroduction();
    } else if (currentPhase === "interactive") {
      if (isListening) {
        setIsListening(false);
        if (conversation.isCurrentlyListening()) {
          conversation.stopListening();
        }
      } else if (isSpeaking) {
        setIsMuted(!isMuted);
        if (!isMuted) {
          if (synthRef.current) {
            synthRef.current.cancel();
          }
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
          }
          setIsSpeaking(false);
        }
      } else {
        startVoiceRecognition();
      }
    } else {
      setIsMuted(!isMuted);
      if (!isMuted) {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        setIsSpeaking(false);
      }
    }
  };

  // Keep all other existing functions unchanged...
  const handleInputChange = (field, value) => {
    setApplianceData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setShowError(false);

    if (hasRecommendation) {
      resetRecommendation();
    }

    resetFormTimer();
  };

  // Keep existing form and navigation functions...

  return (
    <div className="fixed inset-0 bg-boostyYellow overflow-hidden">
      {/* Settings Button */}
      <button
        onClick={navigateToVoiceSettings}
        disabled={isNavigatingToSettings || currentPhase !== "interactive"}
        className={`absolute top-6 right-6 w-10 h-10 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all ${
          isNavigatingToSettings || currentPhase !== "interactive"
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <img src="/settings.svg" alt="" className="w-7 h-7" />
      </button>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Voice Circle with Enhanced Status */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              isSpeaking
                ? "w-52 h-52 shadow-2xl scale-105"
                : isListening
                ? `w-52 h-52 shadow-xl scale-105 ring-4 ${
                    fallbackActive ? "ring-orange-300" : "ring-blue-300"
                  } ring-opacity-50`
                : "w-48 h-48 shadow-lg scale-100"
            }`}
          >
            {/* Soundwave Bars with Status Colors */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((bar) => {
                const baseHeight =
                  bar === 3 ? 8 : bar === 2 || bar === 4 ? 6 : 4;
                const animatedHeight = isSpeaking
                  ? bar === 3
                    ? 12
                    : bar === 2 || bar === 4
                    ? 10
                    : 6
                  : isListening
                  ? bar === 3
                    ? 10
                    : bar === 2 || bar === 4
                    ? 8
                    : 6
                  : baseHeight;

                let colorClass = "bg-yellow-600";
                if (isSpeaking) {
                  colorClass = "bg-yellow-600 soundwave-animate";
                } else if (isListening) {
                  colorClass = fallbackActive
                    ? "bg-orange-500 listening-animate"
                    : "bg-blue-500 listening-animate";
                }

                return (
                  <div
                    key={bar}
                    className={`w-2 rounded-full transition-all duration-200 ${colorClass}`}
                    style={{
                      height: `${animatedHeight * 4}px`,
                      animationDelay:
                        isSpeaking || isListening ? `${bar * 0.1}s` : "0s",
                    }}
                  />
                );
              })}
            </div>

            {/* AI Status Indicator */}
            {currentPhase === "interactive" && (
              <div className="absolute -bottom-2 -right-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    aiStatus === "active"
                      ? "bg-green-500 text-white"
                      : aiStatus === "fallback"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {aiStatus === "active"
                    ? "AI"
                    : aiStatus === "fallback"
                    ? "⚡"
                    : "!"}
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-6 mt-8">
            <button
              onClick={handleExitClick}
              className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <X size={20} className="text-boostyBlack" />
            </button>

            <button
              onClick={handleMicClick}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? fallbackActive
                    ? "bg-orange-500 text-white animate-pulse"
                    : "bg-blue-500 text-white animate-pulse"
                  : isMuted
                  ? "bg-gray-400 bg-opacity-40 text-gray-600"
                  : "bg-yellow-600 bg-opacity-20 text-boostyBlack hover:bg-opacity-30"
              }`}
            >
              {isListening || isMuted ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>
          </div>

          {/* Enhanced Instructions with Status */}
          {getMicInstructions() && (
            <div className="mt-6 text-center">
              <p className="text-sm text-boostyBlack opacity-75">
                {getMicInstructions()}
              </p>
              {currentPhase === "interactive" &&
                isInConversationMode &&
                !isListening &&
                !isSpeaking && (
                  <div className="mt-2">
                    <p className="text-xs text-boostyBlack opacity-60">
                      {settings.language === "Pidgin"
                        ? fallbackActive
                          ? "Basic mode: Talk naturally about appliances"
                          : "Smart mode: Ask questions or describe appliances"
                        : fallbackActive
                        ? "Basic mode: Speak naturally about your appliances"
                        : "Smart mode: Ask questions or describe appliances"}
                    </p>
                    {fallbackActive && (
                      <p className="text-xs text-orange-600 opacity-80 mt-1">
                        {settings.language === "Pidgin"
                          ? "Advanced AI offline, but basic help dey work"
                          : "Advanced AI offline, but basic assistance is working"}
                      </p>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Appliance Form with Enhanced Status */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg animate-fade-in">
            {/* AI Status Banner */}
            {currentPhase === "interactive" && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  aiStatus === "active"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : aiStatus === "fallback"
                    ? "bg-orange-50 border border-orange-200 text-orange-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      aiStatus === "active"
                        ? "bg-green-500"
                        : aiStatus === "fallback"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="font-medium">
                    {aiStatus === "active"
                      ? settings.language === "Pidgin"
                        ? "Smart AI Active"
                        : "Smart AI Active"
                      : aiStatus === "fallback"
                      ? settings.language === "Pidgin"
                        ? "Basic Assistant Active"
                        : "Basic Assistant Active"
                      : settings.language === "Pidgin"
                      ? "Voice Help Offline"
                      : "Voice Help Offline"}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {aiStatus === "active"
                    ? settings.language === "Pidgin"
                      ? "Full conversation and smart form filling available"
                      : "Full conversation and smart form filling available"
                    : aiStatus === "fallback"
                    ? settings.language === "Pidgin"
                      ? "Basic voice help and appliance recognition working"
                      : "Basic voice help and appliance recognition working"
                    : settings.language === "Pidgin"
                    ? "Please use form directly or try voice again later"
                    : "Please use form directly or try voice again later"}
                </p>
              </div>
            )}

            {/* Error Message */}
            {showError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">
                  {settings.language === "Pidgin"
                    ? "Something happen. Abeg click 'Confirm details' to try again."
                    : "Something went wrong. Please click 'Confirm details' again to try."}
                </p>
              </div>
            )}

            {/* Enhanced Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-32 overflow-y-auto">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                  <span>Recent Conversation:</span>
                  {conversationHistory[conversationHistory.length - 1]
                    ?.source === "fallback" && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      Basic Mode
                    </span>
                  )}
                </h4>
                {conversationHistory.slice(-2).map((exchange, index) => (
                  <div key={index} className="text-xs mb-2">
                    <div className="text-blue-700">
                      <strong>You:</strong> {exchange.user}
                    </div>
                    <div className="text-green-700">
                      <strong>AI:</strong> {exchange.assistant}
                    </div>
                    {exchange.actions && exchange.actions.length > 0 && (
                      <div className="text-purple-600 italic">
                        Actions:{" "}
                        {exchange.actions
                          .map((a) => `${a.field}=${a.value}`)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold text-[#3D3E3E] mb-2">
                  Name of Item
                </label>
                <input
                  type="text"
                  value={applianceData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onFocus={() => handleFieldFocus("name")}
                  placeholder="Freezer"
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D3E3E] mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={applianceData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  onFocus={() => handleFieldFocus("quantity")}
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block font-semibold text-[#3D3E3E] mb-2">
                  Day Hours
                </label>
                <input
                  type="text"
                  value={applianceData.dayHours}
                  onChange={(e) =>
                    handleInputChange("dayHours", e.target.value)
                  }
                  onFocus={() => handleFieldFocus("dayHours")}
                  placeholder="8 hours"
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D3E3E] mb-2">
                  Night Hours
                </label>
                <input
                  type="text"
                  value={applianceData.nightHours}
                  onChange={(e) =>
                    handleInputChange("nightHours", e.target.value)
                  }
                  onFocus={() => handleFieldFocus("nightHours")}
                  placeholder="3 hours"
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D3E3E] mb-2">
                  Wattage
                </label>
                <input
                  type="text"
                  value={applianceData.wattage}
                  onChange={(e) => handleInputChange("wattage", e.target.value)}
                  onFocus={() => handleFieldFocus("wattage")}
                  placeholder="800 W"
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              </div>
            </div>

            {/* Enhanced Form Actions */}
            <div className="flex items-center justify-between">
              {/* Voice Help Hint */}
              {currentPhase === "interactive" &&
                !isListening &&
                !isSpeaking && (
                  <div className="text-xs text-gray-600">
                    {settings.language === "Pidgin"
                      ? "💡 Talk: 'I get refrigerator wey dey work 24 hours'"
                      : "💡 Try: 'I have a refrigerator that runs 24 hours'"}
                  </div>
                )}

              <div className="flex-1"></div>

              <button
                onClick={handleConfirmDetails}
                disabled={isGettingRecommendations}
                className={`min-w-[170px] min-h-[36px] border-[2px] border-[#736C59] bg-[#E8F2F2] text-[#3D3E3E] font-bold py-3 rounded-full transition-all flex items-center justify-center ${
                  isGettingRecommendations
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#d6e8e8]"
                }`}
              >
                {isGettingRecommendations ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#3D3E3E] border-t-transparent rounded-full animate-spin mr-2"></div>
                    {settings.language === "Pidgin"
                      ? "Processing..."
                      : "Processing..."}
                  </>
                ) : (
                  "Confirm details"
                )}
              </button>
            </div>

            {/* Quick Actions for Fallback Mode */}
            {fallbackActive && currentPhase === "interactive" && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h5 className="text-sm font-medium text-orange-800 mb-2">
                  {settings.language === "Pidgin"
                    ? "Quick Help:"
                    : "Quick Help:"}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleFallbackInput("I have a refrigerator")}
                    className="text-xs bg-white border border-orange-300 text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
                  >
                    Add Refrigerator
                  </button>
                  <button
                    onClick={() => handleFallbackInput("I have a freezer")}
                    className="text-xs bg-white border border-orange-300 text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
                  >
                    Add Freezer
                  </button>
                  <button
                    onClick={() =>
                      handleFallbackInput("Tell me about solar panels")
                    }
                    className="text-xs bg-white border border-orange-300 text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
                  >
                    Solar Info
                  </button>
                  <button
                    onClick={() => handleFallbackInput("Help me with the form")}
                    className="text-xs bg-white border border-orange-300 text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
                  >
                    Form Help
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isGettingRecommendations && (
        <div className="absolute inset-0 bg-boostyYellow bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-boostyBlack font-bold text-xl mb-2">
              {settings.language === "Pidgin"
                ? "I dey find your perfect solar system..."
                : "Finding your perfect solar system..."}
            </p>
            <p className="text-boostyBlack text-sm opacity-75">
              {settings.language === "Pidgin"
                ? "No worry, e no go take time"
                : "This won't take long"}
            </p>
          </div>
        </div>
      )}

      {/* Settings Navigation Loading Overlay */}
      {isNavigatingToSettings && (
        <div className="absolute inset-0 bg-boostyYellow bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-boostyBlack font-bold text-lg">
              Opening voice settings...
            </p>
            <p className="text-boostyBlack text-sm opacity-75 mt-2">
              Stopping current audio
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes soundwave-bounce {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .soundwave-animate {
          animation: soundwave-bounce 0.8s ease-in-out infinite;
        }

        @keyframes listening-pulse {
          0%, 100% {
            transform: scaleY(1);
            opacity: 1;
          }
          50% {
            transform: scaleY(1.2);
            opacity: 0.7;
          }
        }

        .listening-animate {
          animation: listening-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  const handleFieldFocus = async (fieldName) => {
    if (currentPhase !== "interactive" || isSpeaking) return;

    resetFormTimer();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fieldValue = applianceData[fieldName];
    let responseText;

    if (fieldValue && fieldValue.trim() !== "") {
      responseText = getFieldReadback(fieldName, fieldValue);
    } else {
      const baseGuidance = getFieldGuidance(fieldName);
      const conversationHint =
        settings.language === "Pidgin"
          ? " You fit also talk to me make I help you fill am."
          : " You can also speak to me and I'll help you fill it out.";
      responseText = baseGuidance + conversationHint;
    }

    await speakText(responseText);
  };

  const isFormComplete = () => {
    return (
      applianceData.name.trim() !== "" && applianceData.wattage.trim() !== ""
    );
  };

  const resetFormTimer = () => {
    if (formCompleteTimer) {
      clearTimeout(formCompleteTimer);
    }
    setHasPromptedSubmit(false);

    if (isFormComplete() && currentPhase === "interactive") {
      const newTimer = setTimeout(() => {
        promptFormSubmission();
      }, 3000);
      setFormCompleteTimer(newTimer);
    }
  };

  const promptFormSubmission = async () => {
    if (hasPromptedSubmit || currentPhase !== "interactive") return;
    setHasPromptedSubmit(true);

    const promptText =
      settings.language === "Pidgin"
        ? "I see say you don fill all the important details. You wan submit am make I show you recommendations?"
        : "I see you've filled in all the essential details. Would you like to submit the form to see recommendations?";

    await speakText(promptText);
  };

  const getFieldReadback = (fieldName, value) => {
    const { language } = settings;

    if (language === "Pidgin") {
      switch (fieldName) {
        case "name":
          return `You don write ${value} as your appliance name.`;
        case "quantity":
          return `You set the quantity to ${value} ${
            value === "1" ? "piece" : "pieces"
          }.`;
        case "dayHours":
          return `You don enter ${value} hours for day time usage.`;
        case "nightHours":
          return `You don enter ${value} hours for night time usage.`;
        case "wattage":
          return `You set the power consumption to ${value} watts.`;
        default:
          return `You don enter ${value} for this field.`;
      }
    } else {
      switch (fieldName) {
        case "name":
          return `You have entered ${value} as your appliance name.`;
        case "quantity":
          return `You have set the quantity to ${value} ${
            value === "1" ? "unit" : "units"
          }.`;
        case "dayHours":
          return `You've entered ${value} hours for daytime usage.`;
        case "nightHours":
          return `You've entered ${value} hours for nighttime usage.`;
        case "wattage":
          return `You've set the power consumption to ${value} watts.`;
        default:
          return `You have entered ${value} for this field.`;
      }
    }
  };

  const handleConfirmDetails = async () => {
    setShowError(false);

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);

    if (!applianceData.name || !applianceData.wattage) {
      const errorText =
        settings.language === "Pidgin"
          ? "Abeg make sure you write the appliance name and wattage before you confirm."
          : "Please make sure you enter the appliance name and wattage before confirming.";

      await speakText(errorText);
      return;
    }

    try {
      const result = await submitAppliance(applianceData);
      if (result) {
        navigate("/recommendation-results");
      }
    } catch (err) {
      console.error("Failed to get recommendations:", err);
      const errorText =
        settings.language === "Pidgin"
          ? "Sorry o, something happen when I dey try find your solar system. Make we try again."
          : "Sorry, something went wrong while finding your solar system. Please try again.";

      await speakText(errorText);
    }
  };

  const handleExitClick = async () => {
    console.log("🛑 Exiting to homepage...");

    setIsNavigating(true);
    setIsSpeaking(false);
    setIsListening(false);

    // Stop all audio
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (conversation && conversation.isCurrentlyListening()) {
      conversation.stopListening();
    }

    // Clean up timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (formCompleteTimer) {
      clearTimeout(formCompleteTimer);
    }

    // Stop all audio elements
    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.src = "";
    });

    // Wait a bit then navigate
    await new Promise((resolve) => setTimeout(resolve, 300));
    navigate("/");
  };

  const navigateToVoiceSettings = async () => {
    console.log("🔧 Opening voice settings...");

    setIsNavigatingToSettings(true);
    setIsNavigating(true);

    // Stop audio
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Wait then navigate
    await new Promise((resolve) => setTimeout(resolve, 400));
    navigate("/voice-settings");
  };
};

export default VoiceAssistant;
