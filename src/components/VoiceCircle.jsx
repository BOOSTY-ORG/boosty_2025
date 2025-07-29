import React from "react";

const VoiceCircle = ({ isSpeaking, currentPhase, pageReady, speechReady }) => {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Voice Circle with Animation */}
      <div
        className={`relative bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
          isSpeaking
            ? "w-52 h-52 shadow-2xl scale-105"
            : "w-48 h-48 shadow-lg scale-100"
        }`}
      >
        {/* Soundwave Bars - 5 bars with middle tallest */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((bar) => {
            const baseHeight = bar === 3 ? 8 : bar === 2 || bar === 4 ? 6 : 4;
            const animatedHeight = isSpeaking
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
                  isSpeaking ? "soundwave-animate" : ""
                }`}
                style={{
                  height: `${animatedHeight * 4}px`,
                  animationDelay: isSpeaking ? `${bar * 0.1}s` : "0s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Instructions - Only when waiting */}
      {currentPhase === "waiting" && pageReady && speechReady && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-800 opacity-75">
            Click the mic when you're ready to begin
          </p>
        </div>
      )}

      <style>{`
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

export default VoiceCircle;
