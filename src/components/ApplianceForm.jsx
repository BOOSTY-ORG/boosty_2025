import React from "react";

const ApplianceForm = ({
  applianceData,
  onInputChange,
  onFieldFocus,
  onConfirmDetails,
  isLoading,
  showPriceGuidance,
  settings,
}) => {
  const getFormClassName = () => {
    let baseClass =
      "bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg animate-fade-in";

    if (showPriceGuidance) {
      baseClass += " ring-2 ring-yellow-400 ring-opacity-50";
    }

    return baseClass;
  };

  return (
    <div className={getFormClassName()}>
      {/* Show modification hint when user is in price guidance mode */}
      {showPriceGuidance && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            {settings?.language === "Pidgin"
              ? "💡 Modify the details below to reduce the system cost"
              : "💡 Modify the details below to reduce the system cost"}
          </p>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-[#3D3E3E] mb-2">
            Name of Item
          </label>
          <input
            type="text"
            value={applianceData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            onFocus={() => onFieldFocus("name")}
            placeholder="Freezer"
            className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#3D3E3E] mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={applianceData.quantity}
            onChange={(e) => onInputChange("quantity", e.target.value)}
            onFocus={() => onFieldFocus("quantity")}
            className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block font-semibold text-[#3D3E3E] mb-2">
            Day Hours
          </label>
          <input
            type="text"
            value={applianceData.dayHours}
            onChange={(e) => onInputChange("dayHours", e.target.value)}
            onFocus={() => onFieldFocus("dayHours")}
            placeholder="8 hours"
            className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#3D3E3E] mb-2">
            Night Hours
          </label>
          <input
            type="text"
            value={applianceData.nightHours}
            onChange={(e) => onInputChange("nightHours", e.target.value)}
            onFocus={() => onFieldFocus("nightHours")}
            placeholder="3 hours"
            className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#3D3E3E] mb-2">
            Wattage
          </label>
          <input
            type="text"
            value={applianceData.wattage}
            onChange={(e) => onInputChange("wattage", e.target.value)}
            onFocus={() => onFieldFocus("wattage")}
            placeholder="800 W"
            className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Confirm Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={onConfirmDetails}
          disabled={isLoading}
          className={`min-w-[170px] min-h-[36px] border-[2px] border-[#736C59] bg-[#E8F2F2] text-[#3D3E3E] font-bold py-3 rounded-full transition-all flex items-center justify-center ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d6e8e8]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#3D3E3E] border-t-transparent rounded-full animate-spin mr-2"></div>
              {settings?.language === "Pidgin"
                ? "Processing..."
                : "Processing..."}
            </>
          ) : showPriceGuidance ? (
            settings?.language === "Pidgin" ? (
              "Try Again"
            ) : (
              "Try Again"
            )
          ) : (
            "Confirm details"
          )}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ApplianceForm;
