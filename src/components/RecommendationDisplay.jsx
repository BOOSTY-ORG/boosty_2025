import React from "react";

const RecommendationDisplay = ({
  recommendation,
  onTapToTalk,
  onCancelOrder,
  settings,
}) => {
  if (!recommendation) return null;

  const { components, pricing, performance, suitability } =
    recommendation.recommendation;

  return (
    <div className="fixed inset-0 bg-boostyYellow bg-opacity-95 flex items-center justify-center z-50 p-4">
      {/* Tap here to talk button */}
      <button
        onClick={onTapToTalk}
        className="absolute top-6 left-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-opacity-30 transition-all"
      >
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-boostyYellow rounded-full"></div>
        </div>
        <span className="text-boostyBlack font-medium text-sm">
          {settings?.language === "Pidgin"
            ? "Press here to talk"
            : "Tap here to talk"}
        </span>
      </button>

      {/* Main recommendation card */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-boostyBlack mb-6 text-center">
          {settings?.language === "Pidgin" ? "System Summary" : "Order Summary"}
        </h2>

        {/* Pricing Summary */}
        <div className="space-y-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {settings?.language === "Pidgin"
                ? "Items + installation:"
                : "Items + installation:"}
            </span>
            <span className="font-medium">
              ₦{pricing.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {settings?.language === "Pidgin"
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
              {settings?.language === "Pidgin" ? "Total Cost:" : "Order Total:"}
            </span>
            <span className="text-red-600">
              ₦{pricing.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* System Performance */}
        <div className="mb-6">
          <h3 className="font-semibold text-boostyBlack mb-3 flex items-center justify-between">
            <span>
              {settings?.language === "Pidgin"
                ? "System Performance"
                : "1. System Performance"}
            </span>
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings?.language === "Pidgin"
                  ? "Daily power need:"
                  : "Daily consumption:"}
              </span>
              <span className="font-medium">
                {performance.dailyConsumption}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings?.language === "Pidgin"
                  ? "Backup time:"
                  : "Backup duration:"}
              </span>
              <span className="font-medium">{performance.backupDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {settings?.language === "Pidgin"
                  ? "System efficiency:"
                  : "Efficiency:"}
              </span>
              <span className="font-medium">{performance.efficiency}</span>
            </div>
          </div>
        </div>

        {/* Components Review */}
        <div className="mb-6">
          <h3 className="font-semibold text-boostyBlack mb-3 flex items-center justify-between">
            <span>
              {settings?.language === "Pidgin"
                ? "System Components"
                : "2. Review Items"}
            </span>
            <button
              onClick={onCancelOrder}
              className="text-blue-600 text-sm hover:underline"
            >
              {settings?.language === "Pidgin" ? "Change" : "Recalculate"}
            </button>
          </h3>

          <div className="space-y-4">
            {/* Inverter */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {components.inverter.imageUrl ? (
                  <img
                    src={components.inverter.imageUrl}
                    alt="Inverter"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600"
                  style={{
                    display: components.inverter.imageUrl ? "none" : "flex",
                  }}
                >
                  INV
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-boostyBlack truncate">
                  {components.inverter.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.inverter.warranty}
                </p>
              </div>
              <div className="text-right">
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value={components.inverter.quantity}>
                    Qty: {components.inverter.quantity}
                  </option>
                </select>
              </div>
            </div>

            {/* Batteries */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {components.battery.imageUrl ? (
                  <img
                    src={components.battery.imageUrl}
                    alt="Battery"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600"
                  style={{
                    display: components.battery.imageUrl ? "none" : "flex",
                  }}
                >
                  BAT
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-boostyBlack truncate">
                  {components.battery.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.battery.warranty}
                </p>
              </div>
              <div className="text-right">
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value={components.battery.quantity}>
                    Qty: {components.battery.quantity}
                  </option>
                </select>
              </div>
            </div>

            {/* Solar Panels */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {components.solarPanels.imageUrl ? (
                  <img
                    src={components.solarPanels.imageUrl}
                    alt="Solar Panel"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600"
                  style={{
                    display: components.solarPanels.imageUrl ? "none" : "flex",
                  }}
                >
                  PANEL
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-boostyBlack truncate">
                  {components.solarPanels.name}
                </p>
                <p className="text-xs text-gray-500">
                  {components.solarPanels.warranty}
                </p>
              </div>
              <div className="text-right">
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value={components.solarPanels.quantity}>
                    Qty: {components.solarPanels.quantity}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Info */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-boostyBlack mb-1">
            {settings?.language === "Pidgin"
              ? "We go install your system within 1-2 weeks."
              : "Your installation will be in 1 - 2 weeks max."}
          </p>
          <p className="text-xs text-gray-600">
            {settings?.language === "Pidgin"
              ? "We go send available dates to your email."
              : "Available dates will be sent to your email."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancelOrder}
            className="flex-1 px-4 py-3 bg-gray-200 text-boostyBlack rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            {settings?.language === "Pidgin" ? "Cancel Order" : "Cancel Order"}
          </button>
          <button
            onClick={() => {
              // Handle place order - could navigate to checkout
              console.log("Place order clicked");
            }}
            className="flex-1 px-4 py-3 bg-boostyBlack text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            {settings?.language === "Pidgin" ? "Place Order" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
