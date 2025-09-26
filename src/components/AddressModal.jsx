import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

// Country-specific data
const COUNTRIES = {
  Nigeria: {
    code: "NG",
    states: [
      "Abia",
      "Adamawa",
      "Akwa Ibom",
      "Anambra",
      "Bauchi",
      "Bayelsa",
      "Benue",
      "Borno",
      "Cross River",
      "Delta",
      "Ebonyi",
      "Edo",
      "Ekiti",
      "Enugu",
      "Federal Capital Territory",
      "Gombe",
      "Imo",
      "Jigawa",
      "Kaduna",
      "Kano",
      "Katsina",
      "Kebbi",
      "Kogi",
      "Kwara",
      "Lagos",
      "Nasarawa",
      "Niger",
      "Ogun",
      "Ondo",
      "Osun",
      "Oyo",
      "Plateau",
      "Rivers",
      "Sokoto",
      "Taraba",
      "Yobe",
      "Zamfara",
    ],
    stateLabel: "State",
    postcodeLabel: "Postcode",
  },
  Ghana: {
    code: "GH",
    states: [
      "Ashanti",
      "Brong-Ahafo",
      "Central",
      "Eastern",
      "Greater Accra",
      "Northern",
      "Upper East",
      "Upper West",
      "Volta",
      "Western",
    ],
    stateLabel: "Region",
    postcodeLabel: "Postcode",
  },
  Kenya: {
    code: "KE",
    states: [
      "Baringo",
      "Bomet",
      "Bungoma",
      "Busia",
      "Elgeyo-Marakwet",
      "Embu",
      "Garissa",
      "Homa Bay",
      "Isiolo",
      "Kajiado",
      "Kakamega",
      "Kericho",
      "Kiambu",
      "Kilifi",
      "Kirinyaga",
      "Kisii",
      "Kisumu",
      "Kitui",
      "Kwale",
      "Laikipia",
      "Lamu",
      "Machakos",
      "Makueni",
      "Mandera",
      "Marsabit",
      "Meru",
      "Migori",
      "Mombasa",
      "Murang'a",
      "Nairobi",
      "Nakuru",
      "Nandi",
      "Narok",
      "Nyamira",
      "Nyandarua",
      "Nyeri",
      "Samburu",
      "Siaya",
      "Taita-Taveta",
      "Tana River",
      "Tharaka-Nithi",
      "Trans Nzoia",
      "Turkana",
      "Uasin Gishu",
      "Vihiga",
      "Wajir",
      "West Pokot",
    ],
    stateLabel: "County",
    postcodeLabel: "Postal Code",
  },
  "South Africa": {
    code: "ZA",
    states: [
      "Eastern Cape",
      "Free State",
      "Gauteng",
      "KwaZulu-Natal",
      "Limpopo",
      "Mpumalanga",
      "North West",
      "Northern Cape",
      "Western Cape",
    ],
    stateLabel: "Province",
    postcodeLabel: "Postal Code",
  },
  "United States": {
    code: "US",
    states: [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ],
    stateLabel: "State",
    postcodeLabel: "ZIP Code",
  },
  "United Kingdom": {
    code: "GB",
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    stateLabel: "Country",
    postcodeLabel: "Postcode",
  },
};

const DEFAULT_COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
];

const AddressModal = ({
  isOpen,
  onClose,
  onAddressUpdated,
  getTokenFunction,
}) => {
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

  // Get current country data
  const currentCountryData = COUNTRIES[addressData.country];
  const isStateRequired =
    currentCountryData && currentCountryData.states.length > 0;

  // Load current address when modal opens
  useEffect(() => {
    if (isOpen && getTokenFunction) {
      loadCurrentAddress();
    }
  }, [isOpen, getTokenFunction]);

  const loadCurrentAddress = async () => {
    setIsLoadingCurrent(true);
    try {
      // Load from localStorage first
      const savedAddress = localStorage.getItem("boosty_user_address");
      if (savedAddress) {
        const addressData = JSON.parse(savedAddress);
        setAddressData({
          street: addressData.street || "",
          neighbourhood: addressData.neighbourhood || "",
          city: addressData.city || "",
          state: addressData.state || "",
          country: addressData.country || "Nigeria",
          postcode: addressData.postcode || "",
        });
        console.log("✅ Address loaded from localStorage");
      }
    } catch (error) {
      console.log("Failed to load address from localStorage:", error);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const handleInputChange = (field, value) => {
    // If country changes, reset state to empty
    if (field === "country") {
      setAddressData((prev) => ({
        ...prev,
        [field]: value,
        state: "", // Reset state when country changes
      }));
    } else {
      setAddressData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setError(""); // Clear error when user starts typing
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

    // Check if country is selected or custom country is provided
    const finalCountry =
      addressData.country === ""
        ? addressData.customCountry
        : addressData.country;
    if (!finalCountry || !finalCountry.trim()) {
      setError("Country is required");
      return false;
    }

    // Only require state if the country has states defined and it's not a custom country
    if (
      addressData.country !== "" &&
      isStateRequired &&
      !addressData.state.trim()
    ) {
      const stateLabel = currentCountryData.stateLabel || "State";
      setError(`${stateLabel} is required for ${addressData.country}`);
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
      // Save address to localStorage
      const addressToSave = {
        street: addressData.street,
        neighbourhood: addressData.neighbourhood,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postcode: addressData.postcode,
        fullAddress: `${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.country}`,
        source: "user_input",
        accuracy: "exact",
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "boosty_user_address",
        JSON.stringify(addressToSave)
      );
      console.log("✅ Address saved to localStorage");

      // Update the UI immediately
      onAddressUpdated(addressToSave);
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
    } catch (error) {
      console.error("Address save error:", error);
      setError("Failed to save address. Please try again.");
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

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
              Country *
            </label>
            <select
              value={addressData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
              required
            >
              <option value="">Select Country</option>
              {DEFAULT_COUNTRIES.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
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
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
                {currentCountryData
                  ? currentCountryData.stateLabel
                  : "State/Province"}
              </label>
              {currentCountryData && currentCountryData.states.length > 0 ? (
                <select
                  value={addressData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                >
                  <option value="">
                    Select {currentCountryData.stateLabel}
                  </option>
                  {currentCountryData.states.map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={addressData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder={`Enter ${
                    currentCountryData
                      ? currentCountryData.stateLabel.toLowerCase()
                      : "state/province"
                  }`}
                  className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Postcode */}
          <div>
            <label className="block text-sm font-semibold text-[#3D3E3E] mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={addressData.postcode}
              onChange={(e) => handleInputChange("postcode", e.target.value)}
              placeholder="Enter postal code"
              className="w-full px-3 py-2 border border-[#A6A0A3] rounded-lg focus:outline-none focus:ring-2 focus:ring-boostyYellow focus:border-transparent"
            />
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
        <div className="mt-4 p-3 bg-boostyBlack border border-blue-200 rounded-lg">
          <p className="text-xs  text-boostyYellow">
            💡 Your updated address will be used for all future solar
            recommendations and installations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
