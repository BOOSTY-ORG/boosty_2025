import React, { createContext, useContext, useState } from "react";

const RecommendationContext = createContext();

export const RecommendationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  // Modified getRecommendations function in RecommendationContext.jsx
  const getRecommendations = async (appliance) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure all fields are proper types and explicitly set
      const payload = {
        items: [
          {
            nameOfItem: String(appliance.name || "Unknown Appliance").trim(),
            quantity: Number(appliance.quantity || 1),
            dayHours: Number(appliance.dayHours || 0),
            nightHours: Number(appliance.nightHours || 0),
            wattage: Number(appliance.wattage || 100),
          },
        ],
      };

      console.log("API Payload:", JSON.stringify(payload, null, 2));

      // Add debugging to see exact data being sent
      const stringifiedPayload = JSON.stringify(payload);
      console.log("Stringified Payload:", stringifiedPayload);

      const response = await fetch(
        "https://boosty-backend-6f1c.vercel.app/api/item/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: stringifiedPayload,
        }
      );

      // Get full response text regardless of success/failure
      const responseText = await response.text();
      console.log("Full API Response:", responseText);

      // Parse JSON only if there's content
      let data;
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          throw new Error("Invalid response format from API");
        }
      } else {
        throw new Error("Empty response from API");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch recommendations");
      }

      // Rest of your function remains the same
      const recommendationWithId = {
        ...data,
        applianceId: appliance.id,
      };

      setRecommendations((prevRecommendations) => {
        const existingRecs = prevRecommendations?.recommendations || [];
        return {
          totalWattage: data.totalWattage,
          recommendations: [...existingRecs, ...data.recommendations],
        };
      });

      saveRecommendationToStorage(recommendationWithId);
      return data;
    } catch (error) {
      setError(error.message);
      console.error("Error fetching recommendations:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to save recommendation to localStorage
  const saveRecommendationToStorage = (recommendation) => {
    try {
      // Get existing recommendations
      const storedRecs = localStorage.getItem("solarRecommendations");
      let recommendations = storedRecs ? JSON.parse(storedRecs) : [];

      // Add new recommendation
      recommendations.push(recommendation);

      // Save back to localStorage
      localStorage.setItem(
        "solarRecommendations",
        JSON.stringify(recommendations)
      );
    } catch (error) {
      console.error("Error saving recommendation to localStorage:", error);
    }
  };

  // New function to load recommendations from localStorage
  const loadRecommendationsFromStorage = () => {
    try {
      const storedRecs = localStorage.getItem("solarRecommendations");
      if (storedRecs) {
        const parsedRecs = JSON.parse(storedRecs);

        // Transform data back to the expected format
        const formattedRecs = {
          totalWattage: parsedRecs.reduce(
            (sum, rec) => sum + rec.totalWattage,
            0
          ),
          recommendations: parsedRecs.flatMap(
            (rec) => rec.recommendations || []
          ),
        };

        setRecommendations(formattedRecs);
        return formattedRecs;
      }
      return null;
    } catch (error) {
      console.error("Error loading recommendations from localStorage:", error);
      return null;
    }
  };
  // Clear recommendations
  const clearRecommendations = () => {
    setRecommendations(null);
  };

  const clearAllData = () => {
    // Clear localStorage
    localStorage.removeItem("solarRecommendations");
    localStorage.removeItem("solarAppliances");

    // Clear state
    setRecommendations(null);
    setError(null);
  };

  // Add this function to RecommendationContext.jsx
  const testApiConnection = async () => {
    try {
      // Use a very simple test payload that should work
      const testPayload = {
        items: [
          {
            nameOfItem: "Test Appliance",
            quantity: 1,
            dayHours: 1,
            nightHours: 1,
            wattage: 100,
          },
        ],
      };

      console.log("Test Payload:", JSON.stringify(testPayload));

      const response = await fetch(
        "https://boosty-backend-6f1c.vercel.app/api/item/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testPayload),
        }
      );

      const responseText = await response.text();
      console.log("Test API Response:", responseText);

      return {
        ok: response.ok,
        status: response.status,
        response: responseText,
      };
    } catch (error) {
      console.error("API Test Error:", error);
      return { ok: false, error: error.message };
    }
  };

  // Export in the provider value
  return (
    <RecommendationContext.Provider
      value={{
        loading,
        recommendations,
        error,
        getRecommendations,
        clearRecommendations,
        loadRecommendationsFromStorage,
        testApiConnection, // Add this
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );

  return (
    <RecommendationContext.Provider
      value={{
        loading,
        recommendations,
        error,
        getRecommendations,
        clearRecommendations,
        loadRecommendationsFromStorage,
        clearAllData,
        testApiConnection,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  }
  return context;
};
