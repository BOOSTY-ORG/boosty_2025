import React from "react";
import { AudioLines } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";

const LandingComponent = ({ variant }) => {
  const { actions, t } = useSolarAssistant();

  const handleStartClick = () => {
    // Skip the voice selection screen and go directly to voice interface
    actions.setView("voice");
  };

  // Different button texts based on the variant
  const buttonText =
    variant === "friendly" ? "Talk to me, my friend" : t.tapHereToTalk;

  return (
    <div className="bg-white w-full lg:min-w-[460px] min-h-[153.99px] max-w-lg h-auto rounded-3xl p-4 md:p-6 flex items-center justify-between gap-3 md:gap-6 shadow-md">
      <div className="flex items-center">
        <img
          src="/boosty.gif"
          alt="Assistant Logo"
          className="w-14 h-14 md:w-16 md:h-16"
        />
      </div>

      <div className="flex-1">
        <button
          onClick={handleStartClick}
          className="bg-gray-800 text-[#F5C13CE0] text-lg font-bold md:text-lg rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center justify-center gap-2 w-full transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <AudioLines size={30} className="text-[#F5C13CE0]" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default LandingComponent;
