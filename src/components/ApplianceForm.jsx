import React, { useState } from "react";
import { X, Mic } from "lucide-react";
import { useWebSpeech } from "../services/WebSpeechService";
import { useSolarAssistant } from "../context/SolarAssistantContext";

/**
 * ApplianceForm component for adding or editing appliance details
 */
const ApplianceForm = () => {
  const { state, actions, t } = useSolarAssistant();
  const { speak, startListening, stopListening } = useWebSpeech();

  // Form state
  const [applianceName, setApplianceName] = useState("Freezer");
  const [quantity, setQuantity] = useState("1");
  const [dayHours, setDayHours] = useState("8 hours");
  const [nightHours, setNightHours] = useState("3 hours");
  const [wattage, setWattage] = useState("800 W");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse numeric values
    const parsedQuantity = parseInt(quantity, 10);
    const parsedDayHours = parseInt(dayHours, 10);
    const parsedNightHours = parseInt(nightHours, 10);
    const parsedWattage = parseInt(wattage, 10);

    // Add the appliance to our state
    actions.addAppliance({
      id: Date.now().toString(),
      name: applianceName,
      quantity: parsedQuantity,
      dayHours: parsedDayHours,
      nightHours: parsedNightHours,
      wattage: parsedWattage,
    });

    // Announce the addition
    speak(
      `Added ${quantity} ${applianceName} that runs for ${dayHours} during the day and ${nightHours} at night.`
    );

    // Return to voice interface
    actions.setView("voice");
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
            aria-label="Close"
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

      {/* Appliance form */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Name of Item</label>
              <input
                type="text"
                value={applianceName}
                onChange={(e) => setApplianceName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Day Hours</label>
              <input
                type="text"
                value={dayHours}
                onChange={(e) => setDayHours(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Night Hours</label>
              <input
                type="text"
                value={nightHours}
                onChange={(e) => setNightHours(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Wattage</label>
              <input
                type="text"
                value={wattage}
                onChange={(e) => setWattage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-white border border-gray-500 text-gray-800 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              {t.confirmButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplianceForm;
