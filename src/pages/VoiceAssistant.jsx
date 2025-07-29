import React, { useState, useEffect, useRef } from "react";

import {
  useRecommendationSubmit,
  useRecommendation,
} from "../context/RecommendationContext";
import VoiceCircle from "../components/VoiceCircle";
import VoiceControls from "../components/VoiceControls";
import ApplianceForm from "../components/ApplianceForm";
import LoadingOverlay from "../components/LoadingOverlay";
import SettingsButton from "../components/SettingsButton";
import { useNavigate } from "react-router-dom";

const VoiceAssistant = () => {
  // Mock settings and user for demo
  const settings = {
    language: "English",
    voiceEnabled: true,
    voiceType: "standard",
    gender: "female",
  };

  const user = { firstName: "User" };

  // Recommendation hooks
  const {
    submitAppliance,
    isLoading: isGettingRecommendations,
    error,
  } = useRecommendationSubmit();
  const { recommendationResult, resetRecommendation, hasRecommendation } =
    useRecommendation();

  const navigate = useNavigate();

  // AI States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("waiting"); // waiting, greeting, explaining, interactive
  const [showForm, setShowForm] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [ttsStatus, setTtsStatus] = useState("unknown");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNavigatingToSettings, setIsNavigatingToSettings] = useState(false);

  // Form States
  const [applianceData, setApplianceData] = useState({
    name: "",
    quantity: "1",
    dayHours: "",
    nightHours: "",
    wattage: "",
  });

  // Form completion tracking
  const [formCompleteTimer, setFormCompleteTimer] = useState(null);
  const [hasPromptedSubmit, setHasPromptedSubmit] = useState(false);

  // References
  const synthRef = useRef(null);
  const timeoutRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const checkVoices = () => {
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          setSpeechReady(true);
        }
      };

      checkVoices();
      synthRef.current.onvoiceschanged = checkVoices;
    }

    const readyTimer = setTimeout(() => {
      setPageReady(true);
    }, 2000);

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (formCompleteTimer) {
        clearTimeout(formCompleteTimer);
      }
      clearTimeout(readyTimer);
    };
  }, []);

  // Handle recommendation errors
  useEffect(() => {
    if (error) {
      const errorText =
        settings.language === "Pidgin"
          ? "Sorry o, something happen when I dey try find your solar system. Make we try again."
          : "Sorry, something went wrong while finding your solar system. Please try again.";

      speakText(errorText);
    }
  }, [error]);

  // Mock speech functions for demo
  const speakText = async (text) => {
    if (isMuted || !settings.voiceEnabled || isNavigating) {
      return Promise.resolve();
    }

    setIsSpeaking(true);

    // Mock speech delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSpeaking(false);
  };

  const getPersonalizedGreeting = (name) => {
    return settings.language === "Pidgin"
      ? `Hello ${
          name || "friend"
        }! I be your solar assistant. I go help you find the perfect solar system for your house.`
      : `Hello ${
          name || "friend"
        }! I'm your solar assistant. I'll help you find the perfect solar system for your home.`;
  };

  const getExplanationText = () => {
    return settings.language === "Pidgin"
      ? "Make you fill this form with your appliance details. I need to know the name, how many hours you dey use am for day and night, and the wattage."
      : "Please fill out this form with your appliance details. I need to know the name, how many hours you use it during day and night, and the wattage.";
  };

  const getFieldGuidance = (fieldName) => {
    const guidanceMap = {
      name:
        settings.language === "Pidgin"
          ? "Write the name of your appliance here, like Freezer or TV"
          : "Enter the name of your appliance here, like Freezer or TV",
      quantity:
        settings.language === "Pidgin"
          ? "How many of this appliance you get?"
          : "How many of this appliance do you have?",
      dayHours:
        settings.language === "Pidgin"
          ? "How many hours you dey use am for daytime?"
          : "How many hours do you use it during the day?",
      nightHours:
        settings.language === "Pidgin"
          ? "How many hours you dey use am for nighttime?"
          : "How many hours do you use it at night?",
      wattage:
        settings.language === "Pidgin"
          ? "What be the power consumption in watts?"
          : "What is the power consumption in watts?",
    };
    return guidanceMap[fieldName] || "Please fill in this field";
  };

  // Form completion helper functions
  const isFormComplete = () => {
    return (
      applianceData.name.trim() !== "" && applianceData.wattage.trim() !== ""
    );
  };

  const promptFormSubmission = async () => {
    if (hasPromptedSubmit || currentPhase !== "interactive") return;

    setHasPromptedSubmit(true);

    const promptText =
      settings.language === "Pidgin"
        ? "I see say you don fill all the important details. You wan submit am make I show you recommendations?"
        : "I see you've filled in all the essential details. Would you like to submit the form to see recommendations?";

    await speakText(promptText);
  };

  const resetFormTimer = () => {
    if (formCompleteTimer) {
      clearTimeout(formCompleteTimer);
    }
    setHasPromptedSubmit(false);

    if (isFormComplete() && currentPhase === "interactive") {
      const newTimer = setTimeout(() => {
        promptFormSubmission();
      }, 3000);
      setFormCompleteTimer(newTimer);
    }
  };

  // Start AI Introduction
  const startAIIntroduction = async () => {
    if (hasGreeted) return;

    setHasGreeted(true);

    try {
      setCurrentPhase("greeting");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const greeting = getPersonalizedGreeting(user?.firstName);
      await speakText(greeting);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentPhase("explaining");
      setShowForm(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const explanation = getExplanationText();
      const muteInstruction =
        settings.language === "Pidgin"
          ? " If you want make I quiet, just click the mic button again."
          : " You can click the mic button anytime to mute me if needed.";

      const settingsInstruction =
        settings.language === "Pidgin"
          ? " Also, if you want change my voice or language, just click the settings button for top right."
          : " Also, you can click the settings button in the top right to change my voice or language.";

      const fullExplanation =
        explanation + muteInstruction + settingsInstruction;
      await speakText(fullExplanation);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentPhase("interactive");
    } catch (error) {
      console.error("Error in AI introduction:", error);
      setCurrentPhase("interactive");
      setShowForm(true);
    }
  };

  // Event Handlers
  const handleMicClick = () => {
    if (currentPhase === "waiting" && pageReady && speechReady) {
      startAIIntroduction();
    } else {
      setIsMuted(!isMuted);
      if (!isMuted) {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        setIsSpeaking(false);
      }
    }
  };

  const handleExitClick = () => {
    navigate("/");
  };

  const handleSettingsClick = async () => {
    setIsNavigatingToSettings(true);
    // Mock navigation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Navigate to settings");
    setIsNavigatingToSettings(false);
  };

  const handleInputChange = (field, value) => {
    setApplianceData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset recommendation state when user modifies form
    if (hasRecommendation) {
      resetRecommendation();
    }

    resetFormTimer();
  };

  const handleFieldFocus = async (fieldName) => {
    if (currentPhase !== "interactive" || isSpeaking) return;

    resetFormTimer();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fieldValue = applianceData[fieldName];
    let responseText;

    if (fieldValue && fieldValue.trim() !== "") {
      // Mock field readback
      responseText = `You have entered ${fieldValue} for ${fieldName}`;
    } else {
      responseText = getFieldGuidance(fieldName);
    }

    await speakText(responseText);
  };

  const handleConfirmDetails = async () => {
    if (!applianceData.name || !applianceData.wattage) {
      const errorText =
        settings.language === "Pidgin"
          ? "Abeg make sure you write the appliance name and wattage before you confirm."
          : "Please make sure you enter the appliance name and wattage before confirming.";

      await speakText(errorText);
      return;
    }

    try {
      // Submit appliance data using context
      const result = await submitAppliance(applianceData);

      if (result) {
        // Success - AI stays silent as per requirements
        console.log("Recommendation received:", result);

        // Navigate to recommendation results page
        // In real app with react-router, this would be:
        // navigate('/recommendation-results');
        // The RecommendationDisplay page would get data from context using:
        // const { recommendationResult } = useRecommendation();
        console.log("Would navigate to /recommendation-results");
        console.log("Recommendation data available in context:", result);

        // For demo, let's show that we got the data
        const successText =
          settings.language === "Pidgin"
            ? `Perfect! I don find your solar system for ₦${result.recommendation.pricing.totalAmount.toLocaleString()}.`
            : `Perfect! I found your solar system for ₦${result.recommendation.pricing.totalAmount.toLocaleString()}.`;

        // Note: In actual implementation, AI should stay silent here
        // This is just for demo to show the context is working
        await speakText(successText);
      }
    } catch (err) {
      console.error("Failed to get recommendations:", err);

      const errorText =
        settings.language === "Pidgin"
          ? "Sorry o, something happen when I dey try find your solar system. Make we try again."
          : "Sorry, something went wrong while finding your solar system. Please try again.";

      await speakText(errorText);
    }
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 overflow-hidden">
      {/* Settings Button */}
      <SettingsButton
        onClick={handleSettingsClick}
        disabled={isNavigatingToSettings || currentPhase !== "interactive"}
        isNavigating={isNavigatingToSettings}
      />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Voice Circle */}
        <VoiceCircle
          isSpeaking={isSpeaking}
          currentPhase={currentPhase}
          pageReady={pageReady}
          speechReady={speechReady}
        />

        {/* Voice Controls */}
        <VoiceControls
          isMuted={isMuted}
          onMicClick={handleMicClick}
          onExitClick={handleExitClick}
        />

        {/* Appliance Form */}
        {showForm && (
          <ApplianceForm
            applianceData={applianceData}
            onInputChange={handleInputChange}
            onFieldFocus={handleFieldFocus}
            onConfirmDetails={handleConfirmDetails}
            isLoading={isGettingRecommendations}
            showPriceGuidance={false}
            settings={settings}
          />
        )}
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isGettingRecommendations}
        settings={settings}
      />

      {/* Settings Navigation Loading */}
      {isNavigatingToSettings && (
        <div className="absolute inset-0 bg-yellow-400 bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-800 font-bold text-lg">
              Opening voice settings...
            </p>
            <p className="text-gray-800 text-sm opacity-75 mt-2">
              Stopping current audio
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
