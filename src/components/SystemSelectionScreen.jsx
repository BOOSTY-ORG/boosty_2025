import React from "react";
import { X, Mic } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";

const SystemCard = ({ system, onSelect }) => {
  // Format currency with Naira symbol
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-md">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>460 W Solar Panels</span>
          <span className="font-medium">{system.solarPanels.quantity}</span>
        </div>

        <div className="flex justify-between">
          <span>{system.inverter.kva} KVA inverter</span>
          <span className="font-medium">{system.inverter.quantity}</span>
        </div>

        <div className="flex justify-between">
          <span>15 KWH Lithium Ion Batteries</span>
          <span className="font-medium">{system.batteries.quantity}</span>
        </div>
      </div>

      <div className="mt-4 text-right">
        <div className="text-lg font-bold">{formatCurrency(system.price)}</div>
        <div className="text-sm text-gray-600">Installation included</div>
      </div>

      <button
        onClick={() => onSelect(system)}
        className="mt-4 w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors"
      >
        Select
      </button>
    </div>
  );
};

const SystemSelectionScreen = () => {
  const { state, actions, t } = useSolarAssistant();
  const { systemOptions } = state;
  const { speak, startListening, stopListening } = useWebSpeech();

  // Handle system selection
  const handleSelectSystem = (system) => {
    actions.setSelectedSystem(system);
    actions.setView("checkout");

    // Announce the selection
    const message = `You've selected the ${system.inverter.kva} KVA system with ${system.solarPanels.quantity} solar panels and ${system.batteries.quantity} batteries.`;
    speak(message);
  };

  // Handle close button click
  const handleCloseClick = () => {
    stopListening();
    actions.setView("voice");
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 flex flex-col items-center p-4 z-50">
      {/* Top section with voice visualization */}
      <div className="w-full flex justify-center items-center mb-8 relative">
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-md">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar, index) => (
              <div
                key={index}
                className="bg-yellow-600 w-1.5 rounded-full"
                style={{ height: `${10 + index * 2}px` }}
              />
            ))}
          </div>
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-0 flex space-x-4 mt-4">
          <button
            onClick={handleCloseClick}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-3 transition-colors"
            aria-label="Cancel"
          >
            <X size={20} className="text-gray-800" />
          </button>
          <button
            onClick={startListening}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-3 transition-colors"
            aria-label="Start listening"
          >
            <Mic size={20} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* System options */}
      <div className="w-full max-w-md mx-auto mb-4 space-y-4">
        {systemOptions.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            onSelect={handleSelectSystem}
          />
        ))}
      </div>
    </div>
  );
};

export default SystemSelectionScreen;
