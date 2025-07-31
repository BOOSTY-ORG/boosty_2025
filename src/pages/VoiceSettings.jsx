import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVoiceSettings } from "../context/VoiceSettingsContext";
import { API_ENDPOINTS } from "../config/api";

const VoiceSettings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useVoiceSettings();

  // Store original settings for cancel functionality
  const [originalSettings, setOriginalSettings] = useState(null);

  // Temporary settings for editing
  const [tempLanguage, setTempLanguage] = useState("English");
  const [tempVoiceType, setTempVoiceType] = useState("American");
  const [tempGender, setTempGender] = useState("male");

  // Complete voice options with both genders - matching your context
  const voices = [
    {
      id: "american-male",
      name: "Sonny",
      description: "American Male",
      type: "American", // matches context
      gender: "male",
    },
    {
      id: "american-female",
      name: "Sarah",
      description: "American Female",
      type: "American",
      gender: "female",
    },
    {
      id: "nigerian-male",
      name: "Bright",
      description: "Nigerian Male",
      type: "Nigeria", // matches context exactly
      gender: "male",
    },
    {
      id: "nigerian-female",
      name: "Ada",
      description: "Nigerian Female",
      type: "Nigeria",
      gender: "female",
    },
  ];

  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio reference for voice preview
  const currentAudioRef = useRef(null);

  // Cleanup lingering audio on mount
  useEffect(() => {
    console.log(
      "🔇 Voice Settings page mounted - stopping any lingering audio"
    );

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.load();
    });

    console.log("✅ Audio cleanup complete");
  }, []);

  // Initialize settings when component mounts
  useEffect(() => {
    console.log("Initializing with settings:", settings);

    // Store original settings for cancel functionality
    setOriginalSettings({
      language: settings.language,
      voiceType: settings.voiceType,
      gender: settings.gender,
    });

    // Set temporary settings to current settings
    setTempLanguage(settings.language);
    setTempVoiceType(settings.voiceType);
    setTempGender(settings.gender);

    // Find current voice index based on type AND gender
    const currentIndex = voices.findIndex(
      (voice) =>
        voice.type === settings.voiceType && voice.gender === settings.gender
    );

    console.log("Found voice index:", currentIndex);
    console.log("Looking for:", {
      type: settings.voiceType,
      gender: settings.gender,
    });
    console.log("Available voices:", voices);

    // If exact match found, use it; otherwise find best fallback
    if (currentIndex >= 0) {
      setCurrentVoiceIndex(currentIndex);
    } else {
      // Fallback: try to match just the voice type
      const typeIndex = voices.findIndex(
        (voice) => voice.type === settings.voiceType
      );
      if (typeIndex >= 0) {
        setCurrentVoiceIndex(typeIndex);
        // Update temp gender to match the found voice
        setTempGender(voices[typeIndex].gender);
      } else {
        // Final fallback to first voice
        setCurrentVoiceIndex(0);
        setTempVoiceType(voices[0].type);
        setTempGender(voices[0].gender);
      }
    }
  }, [settings]);

  // Get current voice
  const currentVoice = voices[currentVoiceIndex];

  // Handle voice switching with arrows
  const handleVoiceChange = (direction) => {
    if (isPlaying) return; // Don't change while playing

    let newIndex;
    if (direction === "next") {
      newIndex = (currentVoiceIndex + 1) % voices.length;
    } else {
      newIndex =
        currentVoiceIndex === 0 ? voices.length - 1 : currentVoiceIndex - 1;
    }

    setCurrentVoiceIndex(newIndex);
    const selectedVoice = voices[newIndex];

    console.log("Voice changed to:", selectedVoice);

    // Update temporary settings to match selected voice
    setTempVoiceType(selectedVoice.type);
    setTempGender(selectedVoice.gender);

    // Play voice preview with current language
    playVoicePreview(selectedVoice);
  };

  // Play voice preview with current language
  const playVoicePreview = async (voice) => {
    return playVoicePreviewWithLanguage(voice, tempLanguage);
  };

  // Handle language toggle - maintains current voice type and gender
  const handleLanguageToggle = (language) => {
    setTempLanguage(language);

    // Play preview with current voice and new language
    if (currentVoice) {
      // Use the new language directly rather than waiting for state
      playVoicePreviewWithLanguage(currentVoice, language);
    }
  };

  // Helper function to play preview with specific language
  const playVoicePreviewWithLanguage = async (voice, language) => {
    if (isPlaying) return;

    setIsPlaying(true);

    try {
      const sampleText =
        language === "Pidgin"
          ? "Hello, na so I dey sound. I fit help you with your energy needs."
          : "Hello, this is how I sound. I can help you with your energy needs.";

      console.log(
        "🔍 Making TTS request for:",
        voice,
        "with language:",
        language
      );

      const response = await fetch(API_ENDPOINTS.TTS_SPEAK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sampleText,
          voiceType: voice.type,
          gender: voice.gender,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("TTS Error response:", errorText);
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      console.log("Audio blob size:", audioBlob.size, "type:", audioBlob.type);

      if (audioBlob.size === 0) {
        throw new Error("Received empty audio blob");
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any current audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Create and play audio
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.volume = 1.0;

      // Handle audio events
      audio.onended = () => {
        console.log("🎵 Voice preview ended");
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setIsPlaying(false);
      };

      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setIsPlaying(false);
      };

      audio.onplay = () => {
        console.log("🎵 Voice preview started");
      };

      console.log("▶️ Starting voice preview playback...");
      await audio.play();
    } catch (error) {
      console.error("Voice preview failed:", error);
      setIsPlaying(false);

      // Show user-friendly error
      console.log(`Voice preview failed: ${error.message}`);
    }
  };

  // Handle Done - save settings
  const handleDone = () => {
    console.log("Saving settings:", {
      tempLanguage,
      tempVoiceType,
      tempGender,
    });

    updateSettings({
      language: tempLanguage,
      voiceType: tempVoiceType,
      gender: tempGender,
    });

    navigate("/voice-assistant");
  };

  // Handle Cancel - revert to original settings
  const handleCancel = () => {
    if (originalSettings) {
      console.log("Reverting to original settings:", originalSettings);
      updateSettings(originalSettings);
    }
    navigate("/voice-assistant");
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-boostyYellow overflow-hidden">
      {/* Language Toggle - Top */}
      <div className="flex justify-start pl-8 pt-8 mb-8 min-h-[48px]">
        <div className="bg-[#374646] rounded-full p-1 flex">
          <button
            onClick={() => handleLanguageToggle("Pidgin")}
            className={`px-6 py-2 rounded-full transition-all ${
              tempLanguage === "Pidgin"
                ? "bg-[#E8F2F2] text-[#374646] font-bold"
                : "text-[#736C59] font-semibold"
            }`}
          >
            Pidgin
          </button>
          <button
            onClick={() => handleLanguageToggle("English")}
            className={`px-6 py-2 rounded-full transition-all ${
              tempLanguage === "English"
                ? "bg-[#E8F2F2] text-[#374646] font-bold"
                : "text-[#736C59] font-semibold"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-boostyBlack">Choose a voice</h1>
      </div>

      {/* Voice Interface */}
      <div className="flex flex-col items-center justify-center flex-1">
        {/* Voice Circle with Animation */}
        <div className="mb-12">
          <div
            className={`relative bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              isPlaying
                ? "w-52 h-52 shadow-2xl scale-105"
                : "w-48 h-48 shadow-lg scale-100"
            }`}
          >
            {/* Soundwave Bars */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((bar) => {
                const baseHeight =
                  bar === 3 ? 8 : bar === 2 || bar === 4 ? 6 : 4;
                const animatedHeight = isPlaying
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
                      isPlaying ? "soundwave-animate" : ""
                    }`}
                    style={{
                      height: `${animatedHeight * 4}px`,
                      animationDelay: isPlaying ? `${bar * 0.1}s` : "0s",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Voice Selection Carousel */}
        <div className="flex items-center space-x-8 mb-16">
          {/* Previous Button */}
          <button
            onClick={() => handleVoiceChange("prev")}
            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
            disabled={isPlaying}
          >
            <ChevronLeft
              size={24}
              className={`text-boostyBlack ${
                isPlaying ? "opacity-50" : "opacity-100"
              }`}
            />
          </button>

          {/* Current Voice Display */}
          <div className="text-center min-w-[200px]">
            <h3 className="text-2xl font-bold text-boostyBlack mb-2">
              {currentVoice?.name}
            </h3>
            <p className="text-boostyBlack opacity-75 text-sm">
              {currentVoice?.description}
            </p>
          </div>

          {/* Next Button */}
          <button
            onClick={() => handleVoiceChange("next")}
            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
            disabled={isPlaying}
          >
            <ChevronRight
              size={24}
              className={`text-boostyBlack ${
                isPlaying ? "opacity-50" : "opacity-100"
              }`}
            />
          </button>
        </div>

        {/* Current Selection Display */}
        <div className="mb-8 text-center">
          <p className="text-boostyBlack opacity-75">
            <span className="font-medium">{tempLanguage}</span> •
            <span className="font-medium"> {currentVoice?.type}</span> •
            <span className="font-medium"> {currentVoice?.gender}</span>
          </p>
          <p className="text-xs text-boostyBlack opacity-50 mt-1">
            Voice {currentVoiceIndex + 1} of {voices.length}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleDone}
            className="px-8 py-3 bg-[#202D2D] text-[#F5C13C] rounded-full font-semibold hover:bg-[#1a2424] transition-colors"
            disabled={isPlaying}
          >
            Done
          </button>
          <button
            onClick={handleCancel}
            className="px-8 py-3 bg-[#E8F2F2] border-[2px] border-[#374646] text-[#202D2D] rounded-full font-bold hover:bg-[#dde7e7] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default VoiceSettings;
