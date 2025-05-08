import React, { useEffect, useRef, useState } from "react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";
import { ChevronLeft, ChevronRight } from "lucide-react";

const VoiceOption = ({ id, name, mood, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`text-center cursor-pointer transition-all duration-200 px-4 py-2 ${
        isSelected
          ? "text-gray-800 font-bold transform scale-110"
          : "text-gray-600 hover:text-gray-700"
      }`}
    >
      <p className={`text-lg leading-[24px] ${isSelected ? "font-bold" : ""}`}>
        {name}
      </p>
      <p className="text-sm">{mood}</p>
    </div>
  );
};

const VoiceSelectionScreen = () => {
  const { state, actions, t } = useSolarAssistant();
  const { selectedVoice, language } = state;
  const { speak } = useWebSpeech();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTime, setAnimationTime] = useState(Date.now());

  const animationFrameRef = useRef(null);

  // Voice options with their properties
  const voices = [
    { id: "sonny", name: "Sonny", mood: "Calm" },
    { id: "bright", name: "Bright", mood: "Energetic" },
    { id: "lucky", name: "Lucky", mood: "Lively" },
  ];

  // Function to handle voice selection AND animation
  const handleVoiceSelect = (voiceId) => {
    actions.setVoice(voiceId);

    // Speak a sample using the selected voice
    const sampleText = {
      english: `This is the ${voiceId} voice. Is this what you'd like to use?`,
      pidgin: `This na the ${voiceId} voice. You like am?`,
    }[language];

    // Start the animation
    setIsAnimating(true);

    // Speak the text
    speak(sampleText, voiceId);

    // Set a timeout to stop the animation when speech ends
    const estimatedDuration = sampleText.length * 100; // ~100ms per character
    setTimeout(() => {
      setIsAnimating(false);
    }, estimatedDuration);
  };

  // Add this effect for continuous animation
  useEffect(() => {
    const animate = () => {
      // Force a re-render to update the wave heights
      setAnimationTime(Date.now());
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Only run animation when isAnimating is true
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Cleanup function to cancel animation
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    actions.setLanguage(newLanguage);
  };

  const handleDone = () => {
    actions.setView("voice");
  };

  const handleCancel = () => {
    actions.setView("voice");
  };

  // Navigation functions
  const handlePreviousVoice = () => {
    const currentIndex = voices.findIndex(
      (voice) => voice.id === selectedVoice
    );
    const prevIndex = currentIndex <= 0 ? voices.length - 1 : currentIndex - 1;
    handleVoiceSelect(voices[prevIndex].id);
  };

  const handleNextVoice = () => {
    const currentIndex = voices.findIndex(
      (voice) => voice.id === selectedVoice
    );
    const nextIndex = currentIndex >= voices.length - 1 ? 0 : currentIndex + 1;
    handleVoiceSelect(voices[nextIndex].id);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 z-50 bg-[#F5C13C]">
      {/* Language selection - Updated to look like a toggle */}
      <div className=" absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:top-16 lg:left-32">
        <div className="flex rounded-full overflow-hidden bg-[#374646] h-[40px] p-1">
          <button
            onClick={() => handleLanguageChange("pidgin")}
            className={`transition-colors px-4 py-1 text-sm font-[700] rounded-full ${
              language === "pidgin"
                ? "bg-[#E8F2F2] text-[#202D2D]"
                : "bg-transparent text-[#736C59]"
            }`}
          >
            Pidgin
          </button>
          <button
            onClick={() => handleLanguageChange("english")}
            className={`transition-colors px-4 py-1 text-sm rounded-full font-[700]  ${
              language === "english"
                ? "bg-[#E8F2F2] text-[#202D2D]"
                : "bg-transparent text-[#736C59]"
            }`}
          >
            English
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-8">{t.chooseVoice}</h2>
      {/* Voice visualization icon - Updated with varying heights */}
      <div className="bg-white rounded-full w-[202px] h-[202px] mb-12 flex items-center justify-center shadow-lg shadow-slate-50">
        <div className="flex items-center space-x-1">
          {[22, 34, 50, 69, 50, 34, 22].map((height, index) => {
            // Store the base height as a constant
            const baseHeight = height;

            // Calculate animated height only when animating
            const animatedHeight = isAnimating
              ? baseHeight +
                Math.sin(Date.now() / 200 + index) * (baseHeight * 0.4)
              : baseHeight;

            return (
              <div
                key={index}
                className="bg-[#B78A16] w-2 rounded-full transition-all duration-100"
                style={{
                  height: `${animatedHeight}px`,
                  margin: "0 2px",
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Voice options carousel */}
      <div className="flex items-center justify-between w-full lg:w-[50%] mb-16 px-[10px]">
        <button
          onClick={handlePreviousVoice}
          className=" text-[#202D2D] focus:outline-none hover:text-[#202D2D]/80"
          aria-label="Previous voice"
        >
          <ChevronLeft
            size={30}
            className="hover:scale-[1.2] duration-150 transition-all ease-linear"
          />
        </button>

        <div className="flex space-x-6 lg:space-x-16">
          {voices.map((voice) => (
            <VoiceOption
              key={voice.id}
              id={voice.id}
              name={voice.name}
              mood={voice.mood}
              isSelected={selectedVoice === voice.id}
              onSelect={handleVoiceSelect}
            />
          ))}
        </div>

        <button
          onClick={handleNextVoice}
          className=" text-[#202D2D] focus:outline-none hover:text-[#202D2D]/80"
          aria-label="Next voice"
        >
          <ChevronRight
            size={30}
            className="hover:scale-[1.2] duration-150 transition-all ease-linear"
          />
        </button>
      </div>
      {/* Action buttons */}
      <div className="flex space-x-8">
        <button
          onClick={handleDone}
          className="bg-[#202D2D] text-[#F5C13C] border-2 border-[#374646] leading-[24px] font-[700] hover:bg-gray-700 rounded-full w-[90px] h-[44px] px-[24px] py-[10px] transition-colors"
        >
          {t.done}
        </button>
        <button
          onClick={handleCancel}
          className="bg-[#E8F2F2] border-2 border-[#374646] font-[700] text-[#202D2D] hover:bg-gray-100 rounded-full w-[101px] h-[44px] px-[24px] py-[10px] transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

export default VoiceSelectionScreen;
