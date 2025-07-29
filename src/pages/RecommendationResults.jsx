import React from "react";
import { useRecommendation } from "../context/RecommendationContext";

const RecommendationResults = () => {
  const {
    recommendationResult,
    resetRecommendation,
    hasRecommendation,
    getFormattedPrice,
    settings = { language: "English" }, // fallback
  } = useRecommendation();

  // Handle case where no recommendation data
  if (!hasRecommendation || !recommendationResult) {
    return (
      <div className="fixed inset-0 bg-yellow-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">No Recommendation Found</h2>
          <p className="text-gray-600 mb-4">
            {settings.language === "Pidgin"
              ? "No solar system recommendation found. Please go back and fill the form."
              : "No solar system recommendation found. Please go back and fill the form."}
          </p>
          <button
            onClick={() => {
              // In real app: navigate('/voice-assistant')
              console.log("Navigate back to voice assistant");
            }}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            {settings.language === "Pidgin" ? "Go Back" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  const { components, pricing, performance, suitability } =
    recommendationResult.recommendation;

  const handleTapToTalk = () => {
    // In real app, this would trigger voice guidance
    const totalAmount = pricing.totalAmount;
    const priceGuidanceText =
      settings.language === "Pidgin"
        ? `This solar system cost ₦${totalAmount.toLocaleString()}. If this price too much for you, you fit go back and change your appliance details.`
        : `This solar system costs ₦${totalAmount.toLocaleString()}. If this price is too high, you can go back and modify your appliance details.`;

    console.log("Would speak:", priceGuidanceText);
    // In real app: speakText(priceGuidanceText);
  };

  const handleCancelOrder = () => {
    resetRecommendation();
    // In real app: navigate('/voice-assistant')
    console.log("Navigate back to voice assistant form");
  };

  const handlePlaceOrder = () => {
    // In real app, this would handle order placement
    console.log("Place order for:", recommendationResult);
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 bg-opacity-95 flex items-center justify-center z-50 p-4">
      {/* Tap here to talk button */}
      <button
        onClick={handleTapToTalk}
        className="absolute top-6 left-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-opacity-30 transition-all"
      >
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
        </div>
        <span className="text-gray-800 font-medium text-sm">
          {settings.language === "Pidgin"
            ? "Press here to talk"
            : "Tap here to talk"}
        </span>
      </button>

      {/* Main recommendation card */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {settings.language === "Pidgin" ? "System Summary" : "Order Summary"}
        </h2>

        {/* Pricing Summary */}
        <div className="space-y-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {settings.language === "Pidgin"
                ? "Items + installation:"
                : "Items + installation:"}
            </span>
            <span className="font-medium">
              ₦{pricing.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {settings.language === "Pidgin"
                ? "Total before Tax:"
                : "Total before Tax:"}
            </span>
            <span className="font-medium">
              ₦{pricing.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax(7.5%):</span>
            <span className="font-medium">₦{pricing.vat.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-red-600">
              {settings.language === "Pidgin" ? "Total Cost:" : "Order Total:"}
            </span>
            <span className="text-red-600">
              ₦{pricing.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* System Performance */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            {settings.language === "Pidgin"
              ? "System Performance"
              : "1. System Performance"}
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings.language === "Pidgin"
                  ? "Daily power need:"
                  : "Daily consumption:"}
              </span>
              <span className="font-medium">
                {performance.dailyConsumption}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings.language === "Pidgin"
                  ? "Backup time:"
                  : "Backup duration:"}
              </span>
              <span className="font-medium">{performance.backupDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings.language === "Pidgin"
                  ? "System efficiency:"
                  : "Efficiency:"}
              </span>
              <span className="font-medium">{performance.efficiency}</span>
            </div>
          </div>
        </div>

        {/* Components Review */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
            <span>
              {settings.language === "Pidgin"
                ? "System Components"
                : "2. Review Items"}
            </span>
            <button
              onClick={handleCancelOrder}
              className="text-blue-600 text-sm hover:underline"
            >
              {settings.language === "Pidgin" ? "Change" : "Recalculate"}
            </button>
          </h3>

          <div className="space-y-4">
            {/* Inverter */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-bold">INV</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {components.inverter.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.inverter.warranty}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  Qty: {components.inverter.quantity}
                </span>
              </div>
            </div>

            {/* Batteries */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-bold">BAT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {components.battery.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.battery.warranty}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  Qty: {components.battery.quantity}
                </span>
              </div>
            </div>

            {/* Solar Panels */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-bold">PANEL</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {components.solarPanels.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.solarPanels.warranty}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  Qty: {components.solarPanels.quantity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Info */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-800 mb-1">
            {settings.language === "Pidgin"
              ? "We go install your system within 1-2 weeks."
              : "Your installation will be in 1 - 2 weeks max."}
          </p>
          <p className="text-xs text-gray-600">
            {settings.language === "Pidgin"
              ? "We go send available dates to your email."
              : "Available dates will be sent to your email."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleCancelOrder}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            {settings.language === "Pidgin" ? "Cancel Order" : "Cancel Order"}
          </button>
          <button
            onClick={handlePlaceOrder}
            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
          >
            {settings.language === "Pidgin" ? "Place Order" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResults;
