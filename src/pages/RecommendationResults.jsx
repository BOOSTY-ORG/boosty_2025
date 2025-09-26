import React, { useState, useEffect } from "react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useRecommendation } from "../context/RecommendationContext";
import { useNavigate } from "react-router-dom";
import AddressModal from "../components/AddressModal";
import { API_ENDPOINTS } from "../config/api";

const RecommendationResults = () => {
  // Actual auth data from your Redux store and Clerk
  const { user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useAuth(); // Move getToken to useAuth hook
  const { openSignIn } = useClerk();
  const { user: reduxUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const {
    recommendationResult,
    resetRecommendation,
    hasRecommendation,
    settings = { language: "English" },
  } = useRecommendation();

  const navigate = useNavigate();

  // Local state
  const [paymentMethod, setPaymentMethod] = useState(""); // "" | "debit" | "installment"
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // Get user token for API calls
  const getUserToken = async () => {
    try {
      if (isSignedIn) {
        return await getToken();
      }
      return null;
    } catch (error) {
      console.error("Failed to get user token:", error);
      return null;
    }
  };

  // Load user's current address on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadUserAddress();
    }
  }, [isSignedIn]);

  const loadUserAddress = async () => {
    setAddressLoading(true);
    try {
      // Load from localStorage
      const savedAddress = localStorage.getItem("boosty_user_address");
      if (savedAddress) {
        const addressData = JSON.parse(savedAddress);
        setUserAddress(addressData);
        console.log("✅ Address loaded from localStorage");
        return;
      }

      // Fallback to recommendation location data
      const recommendationAddress =
        recommendationResult?.locationProfile?.location;
      if (recommendationAddress?.fullAddress) {
        setUserAddress({
          fullAddress: recommendationAddress.fullAddress,
          city: recommendationAddress.city,
          state: recommendationAddress.region,
          country: recommendationAddress.country,
          source: recommendationAddress.addressSource || "estimated",
          accuracy: recommendationAddress.addressAccuracy || "approximate",
        });
      }
    } catch (error) {
      console.error("Failed to load address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle case where no recommendation data - but check localStorage first
  if (!hasRecommendation || !recommendationResult) {
    // Try to load from localStorage directly as a fallback
    const savedData = localStorage.getItem("boosty_recommendation_results");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData && parsedData.recommendation) {
          // Force update the context with saved data
          console.log("Found saved recommendation data, redirecting...");
          window.location.reload(); // Force reload to reinitialize context
          return null;
        }
      } catch (error) {
        console.error("Failed to parse saved data:", error);
      }
    }

    // Only show this if there's truly no data
    return (
      <div className="fixed inset-0 bg-yellow-400 flex items-center justify-center">
        <div className="rounded-2xl p-6 max-w-lg text-center">
          <div className="w-16 h-16 border-4 border-boostyBlack border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div>No Recommendation Found</div>
          <button
            onClick={() => navigate("/voice-assistant")}
            className="px-6 py-2 h-[48px] bg-boostyBlack text-boostyYellow rounded-lg mt-4 cursor-pointer"
          >
            Start New Recommendation
          </button>
        </div>
      </div>
    );
  }

  const { components, pricing, performance } =
    recommendationResult.recommendation;

  const handleTapToTalk = () => {
    const totalAmount = pricing.totalAmount;
    const priceGuidanceText =
      settings.language === "Pidgin"
        ? `This solar system cost ₦${totalAmount.toLocaleString()}. If this price too much for you, you fit go back and change your appliance details.`
        : `This solar system costs ₦${totalAmount.toLocaleString()}. If this price is too high, you can go back and modify your appliance details.`;

    console.log("Would speak:", priceGuidanceText);
  };

  const handleRecalculate = () => {
    resetRecommendation();
    navigate("/voice-assistant");
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleChangeAddress = () => {
    if (!isSignedIn) {
      openSignIn({
        afterSignInUrl: "/recommendation-results",
        afterSignUpUrl: "/recommendation-results",
      });
      return;
    }
    setShowAddressModal(true);
  };

  const handleAddressUpdated = (newAddress) => {
    setUserAddress(newAddress);
    console.log("✅ Address updated in UI:", newAddress);
  };

  const handlePrimaryAction = () => {
    // If user is not signed in, trigger Clerk sign-in
    if (!isSignedIn) {
      openSignIn({
        afterSignInUrl: "/recommendation-results",
        afterSignUpUrl: "/recommendation-results",
      });
      return;
    }

    // User is signed in, proceed to next step
    if (paymentMethod === "installment") {
      // Navigate to financing application
      console.log("Navigate to financing application");
    } else {
      // Navigate to checkout/receipt
      navigate("/receipt")
    }
  };

  const getButtonText = () => {
    if (!isSignedIn) {
      return paymentMethod === "installment"
        ? "Sign in to Continue"
        : "Sign in to Place Order";
    }

    return paymentMethod === "installment"
      ? "Continue to Application"
      : "Place Order";
  };

  const showFinancingText = paymentMethod === "installment";

  const renderAddress = () => {
    if (addressLoading) {
      return (
        <div className="text-sm text-[#3D3E3E]">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (userAddress) {
      return (
        <div className="text-sm text-[#3D3E3E]">
          <p className="font-medium">
            {reduxUser?.fullName || clerkUser?.fullName || ""}
          </p>
          {userAddress.street && <p>{userAddress.street}</p>}
          {userAddress.neighbourhood && <p>{userAddress.neighbourhood}</p>}
          <p>
            {userAddress.city}
            {userAddress.state ? `, ${userAddress.state}` : ""}
          </p>
          {userAddress.country && <p>{userAddress.country}</p>}
          {userAddress.postcode && <p>{userAddress.postcode}</p>}

          {/* Show address accuracy indicator */}
          {userAddress.accuracy && userAddress.accuracy !== "exact" && (
            <p className="text-xs text-gray-500 mt-1 italic">
              {userAddress.accuracy === "approximate"
                ? "📍 Approximate location"
                : "🏙️ City-level location"}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="text-sm text-[#3D3E3E]">
        <p>{isSignedIn ? "No address provided" : "Sign in to add address"}</p>
        <p className="text-xs text-gray-500 mt-1 italic">
          Using estimated location for recommendations
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 bg-opacity-95 flex items-center justify-center z-50 p-4">
      {/* Tap here to talk button
      <button
        onClick={handleTapToTalk}
        className="absolute top-6 left-6 bg-[#E8F2F2] border-[2px] border-[#374646] rounded-full min-w-[220px] h-[38px] px-4 py-2 text-lg flex items-center space-x-2"
      >
        <img src="/tap.svg" alt="" />
        <span className="text-[#2B2D2C] font-semibold">
          {settings.language === "Pidgin"
            ? "Press here to talk"
            : "Tap here to talk"}
        </span>
      </button> */}

      {/* Settings icon
      <div className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center">
        <img src="/settings.svg" alt="" />
      </div> */}

      {/* Main recommendation card */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-boostyYellow scrollbar-track-boostyYellow">
        <h2 className="text-xl font-bold text-[#2B2D2C] mb-6">Order Summary</h2>

        {/* Pricing Summary */}
        <div className="space-y-3 mb-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between">
            <span className="text-[#3D3E3E] font-semibold">
              Items + installation:
            </span>
            <span className="font-semibold">
              ₦{pricing.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D3E3E] font-semibold">
              Total before Tax:
            </span>
            <span className="font-semibold">
              ₦{pricing.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D3E3E] font-semibold">Tax(7.5%):</span>
            <span className="font-semibold">
              ₦{pricing.vat.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-[#C42424]">Order Total:</span>
            <span className="text-[#C42424]">
              ₦{pricing.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 1. Address */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-[#2B2D2C]">1. Address</h3>
            <div className="flex-1 mx-4">{renderAddress()}</div>
            <button
              onClick={handleChangeAddress}
              className="text-[#202D2D] font-bold hover:underline flex-shrink-0"
            >
              Change
            </button>
          </div>
        </div>

        {/* 2. Payment Method */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#2B2D2C]">2. Payment Method</h3>
            <button className="text-[#202D2D] font-bold hover:underline">
              Change
            </button>
          </div>

          <div className="space-y-3">
            {/* Add a debit card */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="debit"
                name="payment"
                value="debit"
                checked={paymentMethod === "debit"}
                onChange={() => handlePaymentMethodChange("debit")}
                className="w-4 h-4 text-blue-600"
              />
              <label
                htmlFor="debit"
                className="flex items-center space-x-2 text-sm cursor-pointer"
              >
                <div className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span>Add a debit card</span>
              </label>
            </div>

            {/* Pay small-small */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="installment"
                name="payment"
                value="installment"
                checked={paymentMethod === "installment"}
                onChange={() => handlePaymentMethodChange("installment")}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="installment" className="text-sm cursor-pointer">
                Pay small-small
              </label>
            </div>
          </div>
        </div>

        {/* 3. Review Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#2B2D2C]">3. Review Items</h3>
            <button
              onClick={handleRecalculate}
              className="text-[#202D2D] font-bold hover:underline"
            >
              Recalculate
            </button>
          </div>

          <div className="space-y-4">
            {/* Inverter */}
            <div className="flex items-center space-x-3 p-3 rounded-lg">
              <div className="">
                <div className="w-[88px] h-[88px]">
                  <img src={`/inverter.svg`} alt="" className="w-full h-full" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#2B2D2C]">
                  {components.inverter.name}
                </p>
                <p className="text-xs text-[#3D3E3E] mb-2">
                  {components.inverter.warranty}
                </p>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value={components.inverter.quantity}>
                    Qty: {components.inverter.quantity}
                  </option>
                </select>
              </div>
            </div>

            {/* Batteries */}
            <div className="flex items-center space-x-3 p-3 rounded-lg">
              <div className="">
                <div className="w-[88px] h-[88px]">
                  <img src={`/battery.svg`} alt="" className="w-full h-full" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#2B2D2C]">
                  {components.battery.name}
                </p>
                <p className="text-xs text-[#3D3E3E]">
                  {components.battery.warranty}
                </p>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white mt-2">
                  <option value={components.battery.quantity}>
                    Qty: {components.battery.quantity}
                  </option>
                </select>
              </div>
            </div>

            {/* Solar Panels */}
            <div className="flex items-center space-x-3 p-3 rounded-lg">
              <div className="">
                <div className="w-[88px] h-[88px]">
                  <img
                    src={`/solar_panels.svg`}
                    alt=""
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#2B2D2C]">
                  {components.solarPanels.name}
                </p>
                <p className="text-xs text-[#3D3E3E]">
                  {components.solarPanels.warranty}
                </p>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white mt-2">
                  <option value={components.solarPanels.quantity}>
                    Qty: {components.solarPanels.quantity}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Installation Info */}
          <div>
            <p className=" text-[#2B2D2C] mb-1">
              Your installation will be in 1 - 2 weeks max.
            </p>
            <p className="text-[#3D3E3E]">
              Available dates will be sent to your email.
            </p>
          </div>

          {/* Financing Text (conditional) */}
          {showFinancingText && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-700">
                Apply for financing with our partner.
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="min-w-[142px] min-h-[44px]">
            <button
              onClick={handlePrimaryAction}
              className="w-full px-4 py-3 bg-[#202D2D] text-[#F3B921] rounded-full font-bold hover:bg-gray-700 transition-colors"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressUpdated={handleAddressUpdated}
        getTokenFunction={getUserToken}
      />
    </div>
  );
};

export default RecommendationResults;
