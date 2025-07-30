import React, { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useRecommendation } from "../context/RecommendationContext";
import { useNavigate } from "react-router-dom";

const RecommendationResults = () => {
  // Actual auth data from your Redux store and Clerk
  const { user: clerkUser, isSignedIn } = useUser();
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

  // Handle case where no recommendation data
  if (!hasRecommendation || !recommendationResult) {
    return (
      <div className="fixed inset-0 bg-yellow-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4 capitalize">
            Going back to start the recommendation process
          </h2>
          <p className="text-[#3D3E3E] mb-4">
            {settings.language === "Pidgin"
              ? "You're going back to fill the applainces form to get new recommendations"
              : "You're going back to fill the applainces form to get new recommendations"}
          </p>
          <button
            onClick={() => navigate("/voice-assistant")}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            {settings.language === "Pidgin" ? "Go Back" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  const { components, pricing, performance } =
    recommendationResult.recommendation;

  // Get user address - only show if it actually exists
  const getUserAddress = () => {
    // Try to get address from Clerk user metadata or Redux user
    const clerkAddress =
      clerkUser?.unsafeMetadata?.address ||
      clerkUser?.publicMetadata?.address ||
      clerkUser?.privateMetadata?.address;

    const reduxAddress = reduxUser?.address;

    // Return the address if found, otherwise return null
    if (clerkAddress) {
      return clerkAddress;
    }

    if (reduxAddress) {
      return reduxAddress;
    }

    // No address found
    return null;
  };

  const address = getUserAddress();

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
    console.log("Navigate back to voice assistant");
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleAddDebitCard = () => {
    // TODO: Implement debit card modal/flow
    console.log("Add debit card clicked - implement later");
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
      console.log("Navigate to receipt page");
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

  return (
    <div className="fixed inset-0 bg-yellow-400 bg-opacity-95 flex items-center justify-center z-50 p-4">
      {/* Tap here to talk button */}
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
      </button>

      {/* Settings icon */}
      <div className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center">
        <img src="/settings.svg" alt="" />
      </div>

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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#2B2D2C]">1. Address</h3>
            <div className="text-sm text-[#3D3E3E]">
              {address ? (
                <>
                  <p className="font-medium">
                    {address.name ||
                      reduxUser?.fullName ||
                      clerkUser?.fullName ||
                      ""}
                  </p>
                  <p>{address.street || ""}</p>
                  <p>{address.city || ""}</p>
                  <p>{address.zipCode || ""}</p>
                </>
              ) : (
                <p className="text-[#3D3E3E]">Address not found</p>
              )}
            </div>
            <button className="text-[#202D2D] font-bold hover:underline">
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
    </div>
  );
};

export default RecommendationResults;
