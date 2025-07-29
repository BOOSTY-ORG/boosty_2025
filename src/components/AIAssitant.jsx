import React from "react";
import { useNavigate } from "react-router-dom";

const AIAssistantCard = ({
  buttonText = "Tap here to start talking",
  containerClassName = "",
  onStartTalking = () => {},
}) => {
  const navigate = useNavigate();

  const handleStartVoiceAssistant = () => {
    onStartTalking();
    navigate("/voice-assistant");
  };

  return (
    <div
      className={`min-w-[95vw] md:min-w-[70vw] lg:min-w-[460px] bg-white px-2 lg:px-[20px] py-[48px] rounded-2xl shadow-lg ${containerClassName}`}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-6">
        <img
          src="/boosty_eye.gif"
          alt="Boosty Watches Out For Yah!!!"
          className="w-10 sm:w-[59px] h-10 sm:h-[59px]"
        />

        <button
          onClick={handleStartVoiceAssistant}
          className="bg-boostyBlack text-boostyYellow min-h-[44px] min-w-max lg:min-w-[300px] flex items-center justify-center gap-2 rounded-full px-4 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <img src="/soundwave.svg" alt="Start talking to AI assistant" />
          <span className="text-base font-bold leading-7">{buttonText}</span>
        </button>
      </div>
    </div>
  );
};

export default AIAssistantCard;
