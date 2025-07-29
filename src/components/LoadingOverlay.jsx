import React from "react";

const LoadingOverlay = ({ isVisible, settings }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-yellow-400 bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-800 font-bold text-xl mb-2">
          {settings?.language === "Pidgin"
            ? "I dey find your perfect solar system..."
            : "Finding your perfect solar system..."}
        </p>
        <p className="text-gray-800 text-sm opacity-75">
          {settings?.language === "Pidgin"
            ? "No worry, e no go take time"
            : "This won't take long"}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
