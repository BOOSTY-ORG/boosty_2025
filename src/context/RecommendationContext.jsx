import React, { createContext, useContext, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

// Create the context
const RecommendationContext = createContext();

// Context provider component
export const RecommendationProvider = ({ children }) => {
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API call function
  const makeRecommendationAPICall = async (applianceData) => {
    const response = await fetch(API_ENDPOINTS.RECOMMENDATIONS, {
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

  const getRecommendation = async (applianceData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create AbortController for this request
      const abortController = new AbortController();

      // Store the controller to cancel if component unmounts
      const cleanup = () => abortController.abort();

      const response = await fetch(API_ENDPOINTS.RECOMMENDATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [applianceData] }),
        signal: abortController.signal, // Add abort signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Only update state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setRecommendationResult(result);
      }

      return result;
    } catch (err) {
      // Don't set error if request was intentionally aborted
      if (err.name !== "AbortError") {
        console.error("Failed to get recommendation:", err);
        setError(err.message);
        throw err;
      }
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
