import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

const AddressModal = ({ isOpen, onClose, onAddressUpdated, userToken }) => {
  const [addressData, setAddressData] = useState({
    street: "",
    neighbourhood: "",
    city: "",
    state: "",
    country: "Nigeria",
    postcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);

  useEffect(() => {
    if (isOpen && userToken) {
      loadCurrentAddress();
    }
  }, [isOpen, userToken]);

  const loadCurrentAddress = async () => {
    setIsLoadingCurrent(true);
    try {
      const response = await fetch(API_ENDPOINTS.USER_ADDRESS, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const result = await response.json();

      if (result.success && result.hasAddress) {
        setAddressData({
          street: result.address.street || "",
          neighbourhood: result.address.neighbourhood || "",
          city: result.address.city || "",
          state: result.address.state || "",
          country: result.address.country || "Nigeria",
          postcode: result.address.postcode || "",
        });
      }
    } catch (error) {
      console.error("Failed to load current address:", error);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAddressData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); 
  };

  const validateAddress = () => {
    if (!addressData.street.trim()) {
      setError("Street address is required");
      return false;
    }
    if (!addressData.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!addressData.state.trim()) {
      setError("State is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAddress()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_ADDRESS, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          address: addressData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Address updated successfully");
        onAddressUpdated(result.address);
        onClose();

        // Reset form
        setAddressData({
          street: "",
          neighbourhood: "",
          city: "",
          state: "",
          country: "Nigeria",
          postcode: "",
        });
      } else {
        setError(result.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Address update error:", error);
      setError("Failed to update address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2B2D2C]">Update Address</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Loading current address */}
        {isLoadingCurrent && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Loading current address...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Street Address */}
          <div>
            <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={addressData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="15 Victoria Island Road"
              className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
              required
            />
          </div>

          {/* Neighbourhood */}
          <div>
            <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
              Neighbourhood
            </label>
            <input
              type="text"
              value={addressData.neighbourhood}
              onChange={(e) =>
                handleInputChange("neighbourhood", e.target.value)
              }
              placeholder="Victoria Island"
              className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
                City *
              </label>
              <input
                type="text"
                value={addressData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Lagos"
                className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
                State *
              </label>
              <select
                value={addressData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                <option value="Abia">Abia</option>
                <option value="Adamawa">Adamawa</option>
                <option value="Akwa Ibom">Akwa Ibom</option>
                <option value="Anambra">Anambra</option>
                <option value="Bauchi">Bauchi</option>
                <option value="Bayelsa">Bayelsa</option>
                <option value="Benue">Benue</option>
                <option value="Borno">Borno</option>
                <option value="Cross River">Cross River</option>
                <option value="Delta">Delta</option>
                <option value="Ebonyi">Ebonyi</option>
                <option value="Edo">Edo</option>
                <option value="Ekiti">Ekiti</option>
                <option value="Enugu">Enugu</option>
                <option value="FCT">Federal Capital Territory</option>
                <option value="Gombe">Gombe</option>
                <option value="Imo">Imo</option>
                <option value="Jigawa">Jigawa</option>
                <option value="Kaduna">Kaduna</option>
                <option value="Kano">Kano</option>
                <option value="Katsina">Katsina</option>
                <option value="Kebbi">Kebbi</option>
                <option value="Kogi">Kogi</option>
                <option value="Kwara">Kwara</option>
                <option value="Lagos">Lagos</option>
                <option value="Nasarawa">Nasarawa</option>
                <option value="Niger">Niger</option>
                <option value="Ogun">Ogun</option>
                <option value="Ondo">Ondo</option>
                <option value="Osun">Osun</option>
                <option value="Oyo">Oyo</option>
                <option value="Plateau">Plateau</option>
                <option value="Rivers">Rivers</option>
                <option value="Sokoto">Sokoto</option>
                <option value="Taraba">Taraba</option>
                <option value="Yobe">Yobe</option>
                <option value="Zamfara">Zamfara</option>
              </select>
            </div>
          </div>

          {/* Country and Postcode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
                Country
              </label>
              <input
                type="text"
                value={addressData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={addressData.postcode}
                onChange={(e) => handleInputChange("postcode", e.target.value)}
                placeholder="101001"
                className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-boostyBlack rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-3 bg-boostyBlack text-white rounded-full font-medium transition-colors flex items-center justify-center ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Address"
              )}
            </button>
          </div>
        </form>

        {/* Help text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-600">
            💡 Your updated address will be used for all future solar
            recommendations and installations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
