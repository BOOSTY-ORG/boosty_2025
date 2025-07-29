import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useVoiceSettings } from "../context/VoiceSettingsContext";

const VoiceSettings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useVoiceSettings();

  // Store original settings for cancel functionality
  const [originalSettings, setOriginalSettings] = useState(null);

  // Temporary settings for editing
  const [tempLanguage, setTempLanguage] = useState("English");
  const [tempVoiceType, setTempVoiceType] = useState("American");
  const [tempGender, setTempGender] = useState("male");

  // Voice options - matching your context structure
  const voices = [
    {
      name: "Sonny",
      description: "American", // ✅ Changed from "Calm" to "American"
      type: "American",
      gender: "male",
    },
    {
      name: "Bright",
      description: "Nigerian", // ✅ Changed from "Energetic" to "Nigerian"
      type: "Nigeria",
      gender: "male", // ✅ Changed to male to use "elijah" (actual Nigerian voice)
    },
  ];

  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio reference for voice preview
  const currentAudioRef = useRef(null);

  useEffect(() => {
    console.log(
      "🔇 Voice Settings page mounted - stopping any lingering VoiceAssistant audio"
    );

    // ONE-TIME cleanup of lingering audio from VoiceAssistant page
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop all existing audio elements (catches lingering Google TTS from VoiceAssistant)
    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.load();
    });

    console.log(
      "✅ Lingering audio cleanup complete - voice-settings can now use audio normally"
    );

    // Small delay to ensure cleanup completes, then voice-settings page can use audio
    setTimeout(() => {
      console.log("🎙️ Voice-settings page ready for its own audio");
    }, 100);
  }, []);

  // Initialize settings when component mounts
  useEffect(() => {
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

    // Find current voice index
    const currentIndex = voices.findIndex(
      (voice) =>
        voice.type === settings.voiceType && voice.gender === settings.gender
    );
    setCurrentVoiceIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [settings]);

  // Get current voice
  const currentVoice = voices[currentVoiceIndex];

  // Handle voice switching with arrows
  const handleVoiceChange = (direction) => {
    let newIndex;
    if (direction === "next") {
      newIndex = (currentVoiceIndex + 1) % voices.length;
    } else {
      newIndex =
        currentVoiceIndex === 0 ? voices.length - 1 : currentVoiceIndex - 1;
    }

    setCurrentVoiceIndex(newIndex);
    const selectedVoice = voices[newIndex];

    // Update temporary settings
    setTempVoiceType(selectedVoice.type);
    setTempGender(selectedVoice.gender);

    // ✅ REMOVED: Auto language switching - let user choose language independently
    // Don't auto-change language when switching voices

    // Play voice preview
    playVoicePreview(selectedVoice);
  };

  // Play voice preview
  const playVoicePreview = async (voice) => {
    if (isPlaying) return;

    setIsPlaying(true);

    try {
      const sampleText =
        tempLanguage === "Pidgin"
          ? "Hello, na so I dey sound. I fit help you with your energy needs."
          : "Hello, this is how I sound. I can help you with your energy needs.";

      console.log("🔍 Making TTS request...");
      const response = await fetch("http://localhost:3001/api/tts/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sampleText,
          voiceType: voice.type,
          gender: voice.gender,
          language: tempLanguage,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      console.log("Audio blob size:", audioBlob.size);
      console.log("Audio blob type:", audioBlob.type);

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
        console.log("🎵 Voice preview started playing");
      };

      // Play the audio
      console.log("▶️ Starting voice preview playback...");
      await audio.play();
    } catch (error) {
      console.error("Voice preview failed:", error);
      setIsPlaying(false);
    }
  };

  // Handle language toggle
  const handleLanguageToggle = (language) => {
    setTempLanguage(language);

    // Just play preview with current voice and new language
    if (voices[currentVoiceIndex]) {
      playVoicePreview(voices[currentVoiceIndex]);
    }
  };

  // Handle Done - save settings
  const handleDone = () => {
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
            English
          </button>
          <button
            onClick={() => handleLanguageToggle("English")}
            className={`px-6 py-2 rounded-full transition-all ${
              tempLanguage === "English"
                ? "bg-[#E8F2F2] text-[#374646] font-bold"
                : "text-[#736C59] font-semibold"
            }`}
          >
            Pidgin
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
            className="w-12 h-12 flex items-center justify-center"
            disabled={isPlaying}
          >
            <ChevronLeft size={24} className="text-boostyBlack" />
          </button>

          {/* Voice Cards */}
          <div className="flex space-x-6">
            {voices.map((voice, index) => {
              const isActive = index === currentVoiceIndex;
              const position =
                index < currentVoiceIndex
                  ? "left"
                  : index > currentVoiceIndex
                  ? "right"
                  : "center";

              return (
                <div
                  key={voice.name}
                  className={`text-center transition-all duration-300 ${
                    position === "center"
                      ? "opacity-100 scale-100"
                      : position === "left"
                      ? "opacity-60 scale-90 -translate-x-4"
                      : "opacity-60 scale-90 translate-x-4"
                  }`}
                >
                  <h3
                    className={`text-xl font-bold text-boostyBlack ${
                      isActive ? "text-2xl" : ""
                    }`}
                  >
                    {voice.name}
                  </h3>
                  <p className="text-boostyBlack opacity-75 text-sm">
                    {voice.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handleVoiceChange("next")}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            disabled={isPlaying}
          >
            <ChevronRight size={24} className="text-boostyBlack" />
          </button>
        </div>

        {/* Current Selection Display */}
        <div className="mb-8 text-center">
          <p className="text-boostyBlack opacity-75">
            Selected: <span className="font-medium">{currentVoice?.name}</span>{" "}
            •<span className="font-medium"> {tempLanguage}</span> •
            <span className="font-medium"> {currentVoice?.type}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleDone}
            className="px-8 py-3 bg-[#202D2D] text-[#F5C13C] rounded-full font-semibold"
            disabled={isPlaying}
          >
            Done
          </button>
          <button
            onClick={handleCancel}
            className="px-8 py-3 bg-[#E8F2F2] border-[2px] border-[#374646] text-[#202D2D] rounded-full font-bold"
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
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

export default VoiceSettings;
