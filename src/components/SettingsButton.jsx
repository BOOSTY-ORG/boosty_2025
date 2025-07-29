import React from "react";

const SettingsButton = ({ onClick, disabled, isNavigating }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-6 right-6 w-10 h-10 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Using a simple settings icon instead of img */}
      <div className="w-6 h-6 flex items-center justify-center">
        <img src="/settings.svg" alt="" />
      </div>
    </button>
  );
};

export default SettingsButton;
