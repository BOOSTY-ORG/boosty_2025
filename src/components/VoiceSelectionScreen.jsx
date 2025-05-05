import React from "react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";

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
      <p className={`text-lg ${isSelected ? "font-bold" : ""}`}>{name}</p>
      <p className="text-sm">{mood}</p>
    </div>
  );
};

const VoiceSelectionScreen = () => {
  const { state, actions, t } = useSolarAssistant();
  const { selectedVoice, language } = state;
  const { speak } = useWebSpeech();

  // Voice options with their properties
  const voices = [
    { id: "sonny", name: "Sonny", mood: "Calm" },
    { id: "bright", name: "Bright", mood: "Energetic" },
    { id: "lucky", name: "Lucky", mood: "Lively" },
  ];

  // Handle voice selection
  const handleVoiceSelect = (voiceId) => {
    actions.setVoice(voiceId);

    // Speak a sample using the selected voice
    const sampleText = {
      english: `This is the ${voiceId} voice. Is this what you'd like to use?`,
      pidgin: `This na the ${voiceId} voice. You like am?`,
    }[language];

    speak(sampleText);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    actions.setLanguage(newLanguage);
  };

  // Handle Done button click
  const handleDone = () => {
    actions.setView("voice");
  };

  // Handle Cancel button click
  const handleCancel = () => {
    actions.setView("landing");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 z-50 bg-yellow-400">
      {/* Language selection */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <button
          onClick={() => handleLanguageChange("pidgin")}
          className={`transition-colors ${
            language === "pidgin"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          } rounded-full px-4 py-1`}
        >
          Pidgin
        </button>
        <button
          onClick={() => handleLanguageChange("english")}
          className={`transition-colors ${
            language === "english"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          } rounded-full px-4 py-1`}
        >
          English
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">{t.chooseVoice}</h2>

      {/* Voice visualization icon */}
      <div className="bg-white rounded-full w-32 h-32 mb-12 flex items-center justify-center shadow-lg">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className="bg-yellow-600 w-2 h-10 rounded-full"
              style={{ margin: "0 2px" }}
            />
          ))}
        </div>
      </div>

      {/* Voice options carousel */}
      <div className="flex items-center justify-center w-full mb-16 relative">
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 focus:outline-none hover:text-gray-900"
          aria-label="Previous voice"
        >
          &lt;
        </button>

        <div className="flex space-x-16">
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
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 focus:outline-none hover:text-gray-900"
          aria-label="Next voice"
        >
          &gt;
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleCancel}
          className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-10 py-2 transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleDone}
          className="bg-gray-800 text-white hover:bg-gray-700 rounded-full px-10 py-2 transition-colors"
        >
          {t.done}
        </button>
      </div>
    </div>
  );
};

export default VoiceSelectionScreen;
