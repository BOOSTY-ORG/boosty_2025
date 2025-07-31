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
  const [currentPhase, setCurrentPhase] = useState("waiting"); // waiting, greeting, explaining, interactive
  const [showForm, setShowForm] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [ttsStatus, setTtsStatus] = useState("unknown");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNavigatingToSettings, setIsNavigatingToSettings] = useState(false);

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

  // ENHANCE your existing useEffect (around line 61)
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Add cleanup tracking
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
      console.log("Available voices:", voices.length);
      if (voices.length > 0) {
        setSpeechReady(true);
        console.log("Speech synthesis ready");
      }
    };

    checkVoices();
    synthRef.current.onvoiceschanged = checkVoices;

    const readyTimer = setTimeout(() => {
      setPageReady(true);
      console.log("Page ready for interaction");
    }, 2000);

    cleanupRefs.timers.add(readyTimer); // Track timer

    return () => {
      // Your existing cleanup is good, just add:
      cleanupRefs.abortControllers.forEach((controller) => controller.abort());
      cleanupRefs.timers.forEach((timer) => clearTimeout(timer));

      // Rest of your existing cleanup...
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

      console.log("🧹 Voice assistant cleanup completed");
    };
  }, []);

  // Handle recommendation errors
  useEffect(() => {
    if (error) {
      const errorText =
        settings.language === "Pidgin"
          ? "Sorry o, something happen when I dey try find your solar system. Make we try again."
          : "Sorry, something went wrong while finding your solar system. Please try again.";

      speakText(errorText);
    }
  }, [error]);

  const speakTextWithGoogleTTS = async (text) => {
    try {
      console.log("🎙️ Trying Google Cloud TTS...");

      // Add AbortController
      const abortController = new AbortController();

      // Store controller reference for cleanup
      const originalAudio = currentAudioRef.current;

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
        signal: abortController.signal, // Add this line
      });

      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.status}`);
      }

      console.log("✅ Google TTS API successful!");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        // Check if component is still mounted
        if (isNavigating || !synthRef.current) {
          URL.revokeObjectURL(audioUrl);
          resolve();
          return;
        }

        const audio = new Audio(audioUrl);
        audio.volume = volume;

        currentAudioRef.current = audio;

        audio.onplay = () => {
          console.log("🎵 Google TTS speech started!");
          setTtsStatus("premium");
        };

        audio.onended = () => {
          console.log("✅ Google TTS speech ended");
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onerror = (error) => {
          console.error("❌ Audio playback error:", error);
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          reject(error);
        };

        audio.onpause = () => {
          console.log("⏸️ Google TTS speech cancelled");
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("🔇 TTS request aborted");
        return;
      }
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
      const naturalText = text
        .replace(/\./g, "... ")
        .replace(/,/g, ", ")
        .replace(/!/g, "! ")
        .replace(/\?/g, "? ");

      const utterance = new SpeechSynthesisUtterance(naturalText);
      const voiceConfig = getVoiceConfig();
      const bestVoice = getBestVoice();

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = volume;
      utterance.lang = voiceConfig.lang;

      utterance.onstart = () => {
        console.log("🔊 Web Speech started - free voice active");
        setTtsStatus("free");
      };

      utterance.onend = () => {
        console.log("✅ Web Speech ended");
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("❌ Web Speech error:", error);
        resolve();
      };

      synthRef.current.cancel();

      setTimeout(() => {
        synthRef.current.speak(utterance);
      }, 100);
    });
  };

  const speakText = async (text) => {
    console.log("speakText called with:", text);

    if (isMuted || !settings.voiceEnabled || isNavigating) {
      console.log("🔇 Speech blocked - muted, disabled, or navigating");
      return Promise.resolve();
    }

    setIsSpeaking(true);

    try {
      if (ttsStatus !== "free") {
        try {
          await speakTextWithGoogleTTS(text);
          setIsSpeaking(false);
          return;
        } catch (error) {
          console.log("🔄 Google TTS failed, falling back to Web Speech API");
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

  // RESTORED: All the original helper functions
  const isFormComplete = () => {
    return (
      applianceData.name.trim() !== "" && applianceData.wattage.trim() !== ""
    );
  };

  const navigateToVoiceSettings = async () => {
    console.log("🔧 Starting navigation to voice-settings with cleanup");

    setIsNavigatingToSettings(true);
    setIsNavigating(true);
    setIsSpeaking(false);

    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }

    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.load();
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (formCompleteTimer) {
      clearTimeout(formCompleteTimer);
      setFormCompleteTimer(null);
    }

    console.log("🔇 All audio stopped, waiting for cleanup to complete...");

    await new Promise((resolve) => setTimeout(resolve, 400));

    console.log("✅ Cleanup complete, navigating...");

    navigate("/voice-settings");
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

  // RESTORED: Start AI Introduction from original
  const startAIIntroduction = async () => {
    if (hasGreeted) return;

    setHasGreeted(true);

    try {
      if (!synthRef.current) {
        console.log("Speech synthesis not available");
        setCurrentPhase("interactive");
        setShowForm(true);
        return;
      }

      const voices = synthRef.current.getVoices();
      console.log("Available voices when starting:", voices.length);
      if (voices.length === 0) {
        console.log("Waiting for voices to load...");
        await new Promise((resolve) => {
          const checkVoices = () => {
            if (synthRef.current.getVoices().length > 0) {
              resolve();
            }
          };
          synthRef.current.onvoiceschanged = checkVoices;
          setTimeout(resolve, 3000);
        });
      }

      console.log("🎯 STARTING GREETING PHASE");
      setCurrentPhase("greeting");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const greeting = getPersonalizedGreeting(user?.firstName);
      console.log("About to speak greeting:", greeting);

      await speakText(greeting);

      console.log("Greeting completed - waiting for user confirmation");

      console.log("Pausing for 2 seconds after greeting...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("🎯 STARTING EXPLANATION PHASE");
      setCurrentPhase("explaining");
      setShowForm(true);
      console.log("Form shown, waiting before explanation...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const explanation = getExplanationText();
      const muteInstruction =
        settings.language === "Pidgin"
          ? " If you want make I quiet, just click the mic button again."
          : " You can click the mic button anytime to mute me if needed.";

      const settingsInstruction =
        settings.language === "Pidgin"
          ? " Also, if you want change my voice or language, just click the settings button for top right."
          : " Also, you can click the settings button in the top right to change my voice or language.";

      const fullExplanation =
        explanation + muteInstruction + settingsInstruction;

      console.log("About to speak explanation:", fullExplanation);
      await speakText(fullExplanation);
      console.log("Explanation completed");

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentPhase("interactive");
      console.log("Now in interactive phase");
    } catch (error) {
      console.error("Error in AI introduction:", error);
      setCurrentPhase("interactive");
      setShowForm(true);
    }
  };

  // RESTORED: All original field guidance functions
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

  const handleFieldFocus = async (fieldName) => {
    if (currentPhase !== "interactive" || isSpeaking) return;

    resetFormTimer();

    await new Promise((resolve) => setTimeout(resolve, 300));

    const fieldValue = applianceData[fieldName];

    let responseText;

    if (fieldValue && fieldValue.trim() !== "") {
      responseText = getFieldReadback(fieldName, fieldValue);
    } else {
      responseText = getFieldGuidance(fieldName);
    }

    await speakText(responseText);
  };

  const handleInputChange = (field, value) => {
    setApplianceData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset recommendation state when user starts editing
    if (hasRecommendation) {
      resetRecommendation();
    }

    resetFormTimer();
  };

  const handleMicClick = () => {
    if (currentPhase === "waiting" && pageReady && speechReady) {
      startAIIntroduction();
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

  const handleExitClick = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSpeaking(false);
    setIsMuted(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (formCompleteTimer) {
      clearTimeout(formCompleteTimer);
    }

    console.log("🛑 All audio stopped - exiting voice assistant");

    navigate("/");
  };

  // UPDATED: handleConfirmDetails with context integration
  const handleConfirmDetails = async () => {
    if (!applianceData.name || !applianceData.wattage) {
      const errorText =
        settings.language === "Pidgin"
          ? "Abeg make sure you write the appliance name and wattage before you confirm."
          : "Please make sure you enter the appliance name and wattage before confirming.";

      await speakText(errorText);
      return;
    }

    try {
      // Submit appliance data using context (AI stays silent during processing)
      const result = await submitAppliance(applianceData);

      if (result) {
        // Success - Navigate to results page (AI stays silent as per requirements)
        console.log("Recommendation received:", result);
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

  const getFormClassName = () => {
    return "bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg animate-fade-in";
  };

  return (
    <div className="fixed inset-0 bg-boostyYellow overflow-hidden">
      {/* Settings Button - DISABLED until interactive phase */}
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
        {/* Voice Circle with Animation */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              isSpeaking
                ? "w-52 h-52 shadow-2xl scale-105"
                : "w-48 h-48 shadow-lg scale-100"
            }`}
          >
            {/* Soundwave Bars - 5 bars with middle tallest */}
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
                  : baseHeight;

                return (
                  <div
                    key={bar}
                    className={`w-2 bg-yellow-600 rounded-full transition-all duration-200 ${
                      isSpeaking ? "soundwave-animate" : ""
                    }`}
                    style={{
                      height: `${animatedHeight * 4}px`,
                      animationDelay: isSpeaking ? `${bar * 0.1}s` : "0s",
                    }}
                  />
                );
              })}
            </div>
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
              className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              {isMuted ? (
                <MicOff size={20} className="text-boostyBlack" />
              ) : (
                <Mic size={20} className="text-boostyBlack" />
              )}
            </button>
          </div>

          {/* Instructions - Only when waiting */}
          {currentPhase === "waiting" && pageReady && speechReady && (
            <div className="mt-6 text-center">
              <p className="text-sm text-boostyBlack opacity-75">
                Click the mic when you're ready to begin
              </p>
            </div>
          )}
        </div>

        {/* Appliance Form - Shows during explanation phase */}
        {showForm && (
          <div className={getFormClassName()}>
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

            <div className="flex items-center justify-end">
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

      {/* SETTINGS NAVIGATION LOADING OVERLAY */}
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
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .soundwave-animate {
          animation: soundwave-bounce 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
