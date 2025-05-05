import React, { useEffect, useState } from "react";
import { X, Mic, Settings } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";


const VoiceInterface = () => {
  const { state, actions, t } = useSolarAssistant();
  const { isListening, transcript } = state;
  const { startListening, stopListening } = useWebSpeech();

  // State for voice visualization
  const [barHeights, setBarHeights] = useState([20, 20, 20, 20, 20]);

  // Animate the voice visualization bars when listening
  useEffect(() => {
    let animationFrame;
    let animationInterval;

    const animateBars = () => {
      if (isListening) {
        // Generate random heights for voice visualization bars
        const newHeights = barHeights.map(() =>
          Math.floor(20 + Math.random() * 20)
        );
        setBarHeights(newHeights);
      }
    };

    if (isListening) {
      // Use interval for more consistent animation timing
      animationInterval = setInterval(animateBars, 150);
    }

    return () => {
      clearInterval(animationInterval);
      cancelAnimationFrame(animationFrame);
    };
  }, [isListening, barHeights]);

  // Start listening automatically when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startListening();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle click on settings button
  const handleSettingsClick = () => {
    actions.setView("appliance");
  };

  // Handle close button click
  const handleCloseClick = () => {
    stopListening();
    actions.setView("landing");
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 flex flex-col items-center justify-center p-4 z-50">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => actions.setView("settings")}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-700 rounded-full p-2 transition-colors"
          aria-label="Settings"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Voice visualization */}
      <div className="bg-white rounded-full w-32 h-32 mb-12 relative flex items-center justify-center shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {barHeights.map((height, index) => (
              <div
                key={index}
                className="bg-yellow-600 w-2 rounded-full transition-all duration-200 ease-in-out"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Voice control buttons */}
      <div className="flex space-x-4 mt-8">
        <button
          onClick={handleCloseClick}
          className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-4 transition-colors"
          aria-label="Cancel"
        >
          <X size={24} className="text-gray-800" />
        </button>
        <button
          onClick={isListening ? stopListening : startListening}
          className={`${
            isListening
              ? "bg-yellow-600 animate-pulse"
              : "bg-yellow-500 hover:bg-yellow-600"
          } rounded-full p-4 transition-colors`}
          aria-label={isListening ? "Listening..." : "Start listening"}
        >
          <Mic size={24} className="text-gray-800" />
        </button>
      </div>

      {/* Display current transcript if available */}
      {transcript && (
        <div className="mt-8 bg-white bg-opacity-80 p-4 rounded-lg max-w-md shadow-md">
          <p className="text-gray-800 text-center">{transcript}</p>
        </div>
      )}

      {/* Floating container for confirmations and information */}
      {state.appliances.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 mx-auto max-w-md bg-white rounded-lg p-4 shadow-lg">
          <h3 className="font-bold text-lg mb-2">Appliances to Power</h3>
          <ul className="space-y-2">
            {state.appliances.map((appliance) => (
              <li key={appliance.id} className="flex justify-between">
                <span>{appliance.name}</span>
                <span className="text-gray-600">
                  {appliance.quantity} × {appliance.wattage}W (
                  {appliance.dayHours}h day / {appliance.nightHours}h night)
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              className="bg-gray-800 text-yellow-400 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
              onClick={() => actions.setView("systemSelection")}
            >
              Confirm Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
