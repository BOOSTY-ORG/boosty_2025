import React from "react";
import { X, Mic, MicOff } from "lucide-react";

const VoiceControls = ({ isMuted, onMicClick, onExitClick }) => {
  return (
    <div className="flex space-x-6 mt-8">
      {/* Exit Button */}
      <button
        onClick={onExitClick}
        className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
      >
        <X size={20} className="text-gray-800" />
      </button>

      {/* Mic Button */}
      <button
        onClick={onMicClick}
        className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
      >
        {isMuted ? (
          <MicOff size={20} className="text-gray-800" />
        ) : (
          <Mic size={20} className="text-gray-800" />
        )}
      </button>
    </div>
  );
};

export default VoiceControls;
