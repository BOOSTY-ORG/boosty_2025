import React, { useState, useEffect } from "react";
import { X, Plus, Lightbulb } from "lucide-react";

const ApplianceFormModal = ({ user, onClose, onApplianceAdded }) => {
  const [applianceData, setApplianceData] = useState({
    name: "",
    quantity: "1",
    dayHours: "",
    nightHours: "",
    wattage: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedAppliances, setAddedAppliances] = useState([]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Just suggestions, not hardcoded selection
  const applianceSuggestions = [
    "Refrigerator",
    "Freezer",
    "Air Conditioner",
    "Washing Machine",
    "Television",
    "Fan",
    "Microwave",
    "Electric Kettle",
    "Iron",
    "Blender",
    "Water Heater",
    "Dishwasher",
    "Electric Stove",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!applianceData.name.trim()) {
      newErrors.name = "Appliance name is required";
    }

    if (!applianceData.quantity || parseInt(applianceData.quantity) < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (!applianceData.wattage || parseFloat(applianceData.wattage) <= 0) {
      newErrors.wattage = "Wattage must be greater than 0";
    }

    const dayHours = parseFloat(applianceData.dayHours) || 0;
    const nightHours = parseFloat(applianceData.nightHours) || 0;

    if (dayHours < 0 || dayHours > 24) {
      newErrors.dayHours = "Day hours must be between 0 and 24";
    }

    if (nightHours < 0 || nightHours > 24) {
      newErrors.nightHours = "Night hours must be between 0 and 24";
    }

    if (dayHours + nightHours > 24) {
      newErrors.totalHours = "Total hours cannot exceed 24 hours per day";
    }

    if (dayHours + nightHours === 0) {
      newErrors.totalHours = "Please specify usage hours for day or night";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time
    setTimeout(() => {
      const formattedData = {
        id: Date.now(), // Simple ID for tracking
        ...applianceData,
        quantity: parseInt(applianceData.quantity),
        dayHours: parseFloat(applianceData.dayHours) || 0,
        nightHours: parseFloat(applianceData.nightHours) || 0,
        wattage: parseFloat(applianceData.wattage),
      };

      // Add to local list for display
      setAddedAppliances((prev) => [...prev, formattedData]);

      // Send to parent component
      onApplianceAdded(formattedData);
      setIsSubmitting(false);

      // Reset form for adding another appliance
      setApplianceData({
        name: "",
        quantity: "1",
        dayHours: "",
        nightHours: "",
        wattage: "",
      });
      setErrors({});
    }, 500);
  };

  const handleInputChange = (field, value) => {
    setApplianceData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const removeAppliance = (id) => {
    setAddedAppliances((prev) =>
      prev.filter((appliance) => appliance.id !== id)
    );
  };

  const totalDailyConsumption = addedAppliances.reduce((total, appliance) => {
    return (
      total +
      ((appliance.dayHours + appliance.nightHours) *
        appliance.wattage *
        appliance.quantity) /
        1000
    );
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-boostyBlack">
              Add Your Appliances
            </h2>
            <p className="text-boostyFooterBG">
              Hello {user?.firstName || "there"}! Add any appliances for your
              energy calculation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-boostyLightGray rounded-full transition-colors"
          >
            <X size={24} className="text-boostyFooterBG" />
          </button>
        </div>

        {/* Added Appliances Summary */}
        {addedAppliances.length > 0 && (
          <div className="mb-6 p-4 bg-boostyCTABG rounded-lg border border-boostyLightGray">
            <h3 className="font-semibold text-boostyBlack mb-2">
              Added Appliances ({addedAppliances.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {addedAppliances.map((appliance) => (
                <div
                  key={appliance.id}
                  className="flex items-center justify-between bg-white p-2 rounded border border-boostyLightGray"
                >
                  <span className="text-sm text-boostyFooterBG">
                    <strong className="text-boostyBlack">
                      {appliance.name}
                    </strong>{" "}
                    - {appliance.wattage}W × {appliance.quantity}(
                    {appliance.dayHours + appliance.nightHours}h/day)
                  </span>
                  <button
                    onClick={() => removeAppliance(appliance.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-boostyFooterBG mt-2 font-medium">
              Total Daily Consumption:{" "}
              <span className="text-boostyBlack font-bold">
                {totalDailyConsumption.toFixed(2)} kWh/day
              </span>
            </p>
          </div>
        )}

        {/* Appliance Input Form */}
        <div className="space-y-4">
          {/* Appliance Name with Suggestions */}
          <div>
            <label className="block text-sm font-medium text-boostyFooterBG mb-1">
              Appliance Name *
            </label>
            <input
              type="text"
              value={applianceData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter any appliance (e.g., Deep Freezer, LED Bulb, etc.)"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow ${
                errors.name ? "border-red-500" : "border-boostyLightGray"
              }`}
              list="appliance-suggestions"
            />
            <datalist id="appliance-suggestions">
              {applianceSuggestions.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
            <div className="flex items-center mt-1 text-xs text-boostyFooterBG">
              <Lightbulb size={12} className="mr-1" />
              <span>Type to see suggestions or enter any appliance name</span>
            </div>
          </div>

          {/* Quantity and Wattage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-boostyFooterBG mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={applianceData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow ${
                  errors.quantity ? "border-red-500" : "border-boostyLightGray"
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-boostyFooterBG mb-1">
                Power Consumption (Watts) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={applianceData.wattage}
                onChange={(e) => handleInputChange("wattage", e.target.value)}
                placeholder="e.g., 150"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow ${
                  errors.wattage ? "border-red-500" : "border-boostyLightGray"
                }`}
              />
              {errors.wattage && (
                <p className="text-red-500 text-xs mt-1">{errors.wattage}</p>
              )}
            </div>
          </div>

          {/* Usage Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-boostyFooterBG mb-1">
                Day Hours (6AM - 6PM)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={applianceData.dayHours}
                onChange={(e) => handleInputChange("dayHours", e.target.value)}
                placeholder="e.g., 8"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow ${
                  errors.dayHours ? "border-red-500" : "border-boostyLightGray"
                }`}
              />
              {errors.dayHours && (
                <p className="text-red-500 text-xs mt-1">{errors.dayHours}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-boostyFooterBG mb-1">
                Night Hours (6PM - 6AM)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={applianceData.nightHours}
                onChange={(e) =>
                  handleInputChange("nightHours", e.target.value)
                }
                placeholder="e.g., 4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow ${
                  errors.nightHours
                    ? "border-red-500"
                    : "border-boostyLightGray"
                }`}
              />
              {errors.nightHours && (
                <p className="text-red-500 text-xs mt-1">{errors.nightHours}</p>
              )}
            </div>
          </div>

          {errors.totalHours && (
            <p className="text-red-500 text-sm">{errors.totalHours}</p>
          )}

          {/* Current Appliance Preview */}
          {(applianceData.dayHours || applianceData.nightHours) &&
            applianceData.wattage && (
              <div className="bg-boostyCTABG p-3 rounded-lg border border-boostyLightGray">
                <h4 className="font-medium text-boostyBlack mb-1">
                  This Appliance Daily Consumption
                </h4>
                <p className="text-sm text-boostyFooterBG">
                  Total Hours:{" "}
                  {(parseFloat(applianceData.dayHours) || 0) +
                    (parseFloat(applianceData.nightHours) || 0)}{" "}
                  hours/day
                </p>
                <p className="text-sm text-boostyFooterBG">
                  Daily Consumption:{" "}
                  <span className="font-medium text-boostyBlack">
                    {(((parseFloat(applianceData.dayHours) || 0) +
                      (parseFloat(applianceData.nightHours) || 0)) *
                      (parseFloat(applianceData.wattage) || 0) *
                      (parseInt(applianceData.quantity) || 1)) /
                      1000}{" "}
                    kWh/day
                  </span>
                </p>
              </div>
            )}

          {/* Add Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-boostyBlack text-boostyYellow rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-boostyYellow mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-1" />
                Add This Appliance
              </>
            )}
          </button>

          {/* Bottom Actions */}
          <div className="flex space-x-3 pt-4 border-t border-boostyLightGray">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-boostyLightGray text-boostyFooterBG rounded-lg hover:bg-boostyLightGray transition-colors"
            >
              {addedAppliances.length > 0 ? "Done Adding" : "Cancel"}
            </button>
            <button
              onClick={() => {
                setApplianceData({
                  name: "",
                  quantity: "1",
                  dayHours: "",
                  nightHours: "",
                  wattage: "",
                });
                setErrors({});
              }}
              className="px-4 py-3 bg-boostyLightGray text-boostyFooterBG rounded-lg hover:bg-boostyCTABG transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceFormModal;
