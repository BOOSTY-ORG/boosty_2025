import React, { createContext, useContext, useState } from "react";

// Create the context
const RecommendationContext = createContext();

// Context provider component
export const RecommendationProvider = ({ children }) => {
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API call function
  const makeRecommendationAPICall = async (applianceData) => {
    const response = await fetch("http://localhost:3001/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [applianceData],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  };

  // Main function to get recommendation
  const getRecommendation = async (applianceData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!applianceData.nameOfItem || !applianceData.wattage) {
        throw new Error("Appliance name and wattage are required");
      }

      console.log("Getting recommendation for:", applianceData);

      // Make API call
      const result = await makeRecommendationAPICall(applianceData);

      console.log("Recommendation result:", result);

      // Validate response
      if (!result.success || !result.recommendation) {
        throw new Error("Invalid recommendation response");
      }

      // Store the result
      setRecommendationResult(result);
      return result;
    } catch (err) {
      console.error("Failed to get recommendation:", err);
      setError(err.message);
      throw err; // Re-throw so caller can handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  // Reset recommendation state
  const resetRecommendation = () => {
    setRecommendationResult(null);
    setError(null);
    setIsLoading(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Helper to check if high price
  const isHighPrice = (threshold = 4000000) => {
    if (!recommendationResult?.recommendation?.pricing?.totalAmount)
      return false;
    return recommendationResult.recommendation.pricing.totalAmount > threshold;
  };

  // Helper to get formatted price
  const getFormattedPrice = () => {
    if (!recommendationResult?.recommendation?.pricing?.totalAmount)
      return "N/A";
    return `₦${recommendationResult.recommendation.pricing.totalAmount.toLocaleString()}`;
  };

  // Context value
  const value = {
    // State
    recommendationResult,
    isLoading,
    error,

    // Actions
    getRecommendation,
    resetRecommendation,
    clearError,

    // Helpers
    isHighPrice,
    getFormattedPrice,

    // Computed values
    hasRecommendation: !!recommendationResult,
    hasError: !!error,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

// Custom hook to use the recommendation context
export const useRecommendation = () => {
  const context = useContext(RecommendationContext);

  if (!context) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  }

  return context;
};

// Optional: Hook for easy form submission
export const useRecommendationSubmit = () => {
  const { getRecommendation, isLoading, error } = useRecommendation();

  const submitAppliance = async (formData) => {
    // Transform form data to API format
    const applianceData = {
      nameOfItem: formData.name,
      quantity: parseInt(formData.quantity) || 1,
      dayHours: parseFloat(formData.dayHours) || 0,
      nightHours: parseFloat(formData.nightHours) || 0,
      wattage: parseFloat(formData.wattage) || 0,
    };

    return await getRecommendation(applianceData);
  };

  return {
    submitAppliance,
    isLoading,
    error,
  };
};

export default RecommendationContext;
