import React, { useEffect, useState, useRef } from "react";
import { X, Mic, HouseIcon } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";
import { useRecommendation } from "../context/RecommendationContext";

const VoiceInterface = () => {
  const { state, actions, t } = useSolarAssistant();
  const { selectedVoice } = state;
  const { speak, startListening, stopListening, isListening, transcript } =
    useWebSpeech();
  const {
    loading,
    recommendations,
    error,
    getRecommendations,
    clearRecommendations,
    loadRecommendationsFromStorage,
    clearAllData,
    testApiConnection,
  } = useRecommendation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTime, setAnimationTime] = useState(Date.now());
  const animationFrameRef = useRef(null);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showSystems, setShowSystems] = useState(true);

  // Form state
  const [formState, setFormState] = useState({
    name: "",
    quantity: "",
    dayHours: "",
    nightHours: "",
    wattage: "",
  });

  // Current question being asked
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [conversationActive, setConversationActive] = useState(false);
  const [recognitionError, setRecognitionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    try {
      // Start with clean state
      actions.setAppliances([]);

      // Load appliances from localStorage
      const savedAppliances = localStorage.getItem("solarAppliances");
      if (savedAppliances) {
        try {
          const parsedAppliances = JSON.parse(savedAppliances);

          // Add each appliance to state
          if (Array.isArray(parsedAppliances)) {
            // Handle the case of an empty array or too many appliances
            const limitedAppliances = parsedAppliances.slice(0, 10); // Limit to 10
            actions.setAppliances(limitedAppliances);
          }
        } catch (parseError) {
          console.error("Error parsing appliances:", parseError);
          // Reset localStorage if corrupt
          localStorage.removeItem("solarAppliances");
        }
      }

      // Load recommendations
      loadRecommendationsFromStorage();

      // Always show recommendations by default, regardless of whether there are any
      setShowForm(false);
      setShowSystems(true);
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Reset everything on error
      handleClearAllData();
    }
  }, []);

  // Animation effect
  useEffect(() => {
    const animate = () => {
      setAnimationTime(Date.now());
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  // Listen for transcript changes
  useEffect(() => {
    if (transcript && conversationActive && currentQuestion) {
      handleAnswer(currentQuestion, transcript);
    }
  }, [transcript]);

  // Questions to ask the user
  const questions = {
    name: "What appliance would you like to power?",
    quantity: "How many of these appliances do you have?",
    dayHours: "How many hours will you use this appliance during the day?",
    nightHours: "How many hours will you use this appliance at night?",
    wattage: "What is the wattage of this appliance in watts?",
  };

  // Start the conversation
  const startConversation = async () => {
    // Switch to form view
    setShowSystems(false);
    setShowForm(true);

    setIsAnimating(true);
    setConversationActive(true);

    // Reset form
    setFormState({
      name: "",
      quantity: "",
      dayHours: "",
      nightHours: "",
      wattage: "",
    });

    // Ask the first question
    await askQuestion("name");
  };

  // Ask a specific question
  const askQuestion = async (questionKey) => {
    setCurrentQuestion(questionKey);

    // Stop any ongoing listening
    stopListening();

    try {
      // Speak the question using the selected voice
      await speak(questions[questionKey], selectedVoice);

      console.log(`Asked question for ${questionKey}, now starting to listen`);

      // Set up retry counter for no-speech errors
      let noSpeechRetries = 0;
      const MAX_NO_SPEECH_RETRIES = 2;

      // Start listening with error callback
      setTimeout(() => {
        startListening(async (errorType) => {
          if (
            errorType === "no-speech" &&
            noSpeechRetries < MAX_NO_SPEECH_RETRIES
          ) {
            noSpeechRetries++;

            // Use your existing retry message system
            const noSpeechMessage = `I can't hear you. ${getRetryMessage(
              questionKey,
              0
            )}`;

            // Speak the error message
            await speak(noSpeechMessage, selectedVoice);

            // Mark as recognition error for UI
            setRecognitionError(true);

            // Continue listening
            startListening();
          } else if (noSpeechRetries >= MAX_NO_SPEECH_RETRIES) {
            // Too many retries, use default
            const defaultValue = getDefaultValue(questionKey);
            setFormState((prev) => ({
              ...prev,
              [questionKey]: defaultValue,
            }));

            // Notify the user
            await speak(
              `I'll use ${defaultValue} for ${getFieldDisplayName(
                questionKey
              )} and move on.`,
              selectedVoice
            );

            // Move to next question
            const questionOrder = [
              "name",
              "quantity",
              "dayHours",
              "nightHours",
              "wattage",
            ];
            const currentIndex = questionOrder.indexOf(questionKey);

            if (currentIndex < questionOrder.length - 1) {
              setTimeout(() => {
                askQuestion(questionOrder[currentIndex + 1]);
              }, 500);
            } else {
              finishConversation();
            }
          }
        });
      }, 500);
    } catch (error) {
      console.error("Error during speech:", error);

      // Proper recovery logic
      setRecognitionError(true);

      // Notify the user about the error
      try {
        await speak(
          "I'm having trouble with speech. Let me try again.",
          selectedVoice
        );

        // Try asking the question again after a short delay
        setTimeout(() => {
          askQuestion(questionKey);
        }, 1500);
      } catch (secondError) {
        console.error("Failed recovery attempt:", secondError);

        // If we can't even speak the error message, use a default value and move on
        const defaultValue = getDefaultValue(questionKey);
        setFormState((prev) => ({
          ...prev,
          [questionKey]: defaultValue,
        }));

        // Move to next question
        const questionOrder = [
          "name",
          "quantity",
          "dayHours",
          "nightHours",
          "wattage",
        ];
        const currentIndex = questionOrder.indexOf(questionKey);

        if (currentIndex < questionOrder.length - 1) {
          setTimeout(() => {
            askQuestion(questionOrder[currentIndex + 1]);
          }, 1000);
        } else {
          // Reset states and end conversation
          setRecognitionError(false);
          setIsAnimating(false);
          setConversationActive(false);
        }
      }
    }
  };

  // Handle the user's answer
  const handleAnswer = async (questionKey, answer) => {
    // Stop listening first to prevent overlapping recognition
    stopListening();

    console.log(`Processing answer for ${questionKey}: "${answer}"`); // Debug log

    // Check if the answer is clear or valid
    let processedAnswer = null;
    let validAnswer = false;

    // Process different types of answers based on field type
    if (questionKey === "name") {
      if (answer && answer.trim() !== "") {
        processedAnswer = answer.trim();
        validAnswer = true;
      }
    } else if (questionKey === "quantity") {
      // Extract numbers from the answer
      const numberMatch = answer.match(/\d+/);
      if (numberMatch) {
        processedAnswer = numberMatch[0];
        validAnswer = true;
      }
    } else if (questionKey === "dayHours" || questionKey === "nightHours") {
      // Extract numbers from the answer
      const numberMatch = answer.match(/\d+/);
      if (numberMatch) {
        processedAnswer = numberMatch[0];
        validAnswer = true;
      }
    } else if (questionKey === "wattage") {
      // Extract numbers from the answer
      const numberMatch = answer.match(/\d+/);
      if (numberMatch) {
        processedAnswer = numberMatch[0];
        validAnswer = true;
      }
    }

    // Handle valid and invalid answers differently
    if (validAnswer) {
      console.log(`Valid answer detected: ${processedAnswer}`); // Debug log

      // Reset retry count for the next question
      setRetryCount(0);
      setRecognitionError(false);

      // Update form state with the processed answer
      setFormState((prev) => ({
        ...prev,
        [questionKey]: processedAnswer,
      }));

      try {
        // Provide confirmation feedback (await the promise)
        await speak(
          `Got it, ${getFieldDisplayName(questionKey)}: ${processedAnswer}`,
          selectedVoice
        );

        console.log("Finished speaking confirmation"); // Debug log

        // Determine the next question to ask
        const questionOrder = [
          "name",
          "quantity",
          "dayHours",
          "nightHours",
          "wattage",
        ];
        const currentIndex = questionOrder.indexOf(questionKey);

        if (currentIndex < questionOrder.length - 1) {
          // Ask the next question after confirmation
          setTimeout(() => {
            console.log(
              `Moving to next question: ${questionOrder[currentIndex + 1]}`
            ); // Debug log
            askQuestion(questionOrder[currentIndex + 1]);
          }, 500);
        } else {
          // All questions answered
          console.log("All questions answered, finishing conversation"); // Debug log
          finishConversation();
        }
      } catch (error) {
        console.error("Error during speech:", error);

        // Even if speech fails, move to next question after a delay
        const questionOrder = [
          "name",
          "quantity",
          "dayHours",
          "nightHours",
          "wattage",
        ];
        const currentIndex = questionOrder.indexOf(questionKey);

        if (currentIndex < questionOrder.length - 1) {
          setTimeout(() => {
            askQuestion(questionOrder[currentIndex + 1]);
          }, 1000);
        } else {
          finishConversation();
        }
      }
    } else {
      // Handle invalid or unclear answer
      console.log(`Invalid answer, retry count: ${retryCount}`); // Debug log

      setRecognitionError(true);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      try {
        if (newRetryCount < MAX_RETRIES) {
          // Ask again with more specific prompt
          const retryMessage = getRetryMessage(questionKey, retryCount);
          console.log(`Retrying with message: ${retryMessage}`); // Debug log

          await speak(retryMessage, selectedVoice);

          // Start listening again after speaking
          setTimeout(() => {
            startListening();
          }, 500);
        } else {
          // Too many retries, use default value and move on
          const defaultValue = getDefaultValue(questionKey);
          console.log(`Using default value: ${defaultValue}`); // Debug log

          setFormState((prev) => ({
            ...prev,
            [questionKey]: defaultValue,
          }));

          await speak(
            `I'll use ${defaultValue} for ${getFieldDisplayName(
              questionKey
            )} and move on.`,
            selectedVoice
          );

          // Reset for next question
          setRetryCount(0);
          setRecognitionError(false);

          // Move to next question
          const questionOrder = [
            "name",
            "quantity",
            "dayHours",
            "nightHours",
            "wattage",
          ];
          const currentIndex = questionOrder.indexOf(questionKey);

          if (currentIndex < questionOrder.length - 1) {
            setTimeout(() => {
              askQuestion(questionOrder[currentIndex + 1]);
            }, 500);
          } else {
            finishConversation();
          }
        }
      } catch (error) {
        console.error("Error during speech:", error);
        // Recovery logic - move to next question if too many errors
        if (newRetryCount >= MAX_RETRIES) {
          const questionOrder = [
            "name",
            "quantity",
            "dayHours",
            "nightHours",
            "wattage",
          ];
          const currentIndex = questionOrder.indexOf(questionKey);

          setRetryCount(0);
          if (currentIndex < questionOrder.length - 1) {
            setTimeout(() => {
              askQuestion(questionOrder[currentIndex + 1]);
            }, 1000);
          } else {
            finishConversation();
          }
        } else {
          // Try listening again
          setTimeout(() => {
            startListening();
          }, 1000);
        }
      }
    }
  };

  // Helper functions for better UX
  const getFieldDisplayName = (key) => {
    const displayNames = {
      name: "appliance name",
      quantity: "quantity",
      dayHours: "daytime hours",
      nightHours: "nighttime hours",
      wattage: "wattage",
    };
    return displayNames[key] || key;
  };

  const getRetryMessage = (key, retryNumber) => {
    const firstRetryMessages = {
      name: "I didn't catch the appliance name. Could you please repeat it?",
      quantity: "I need a number for the quantity. How many do you have?",
      dayHours:
        "I didn't catch the hours. How many hours will you use it during the day?",
      nightHours:
        "I didn't catch the hours. How many hours will you use it at night?",
      wattage: "I need a number for the wattage. What's the wattage in watts?",
    };

    const secondRetryMessages = {
      name: "Sorry, I still didn't catch that. Please say the name of the appliance clearly.",
      quantity:
        "I still need a number for quantity. Just say a number like 1, 2, or 3.",
      dayHours:
        "Let's try again. Please say a number between 0 and 24 for daytime hours.",
      nightHours:
        "Let's try again. Please say a number between 0 and 24 for nighttime hours.",
      wattage:
        "Let's try once more. What's the power consumption in watts? For example, 500 watts.",
    };

    if (retryNumber === 0) return firstRetryMessages[key];
    return secondRetryMessages[key];
  };

  const getDefaultValue = (key) => {
    const defaults = {
      name: "Unknown Appliance",
      quantity: "1",
      dayHours: "8",
      nightHours: "0",
      wattage: "100",
    };
    return defaults[key];
  };
  // Finish the conversation
  const finishConversation = async () => {
    await speak(
      "Thank you! You can now review and confirm the details.",
      selectedVoice
    );
    setConversationActive(false);
    setIsAnimating(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    if (!formState.name) {
      alert("Please enter an appliance name");
      return;
    }

    // Create the appliance object
    const newAppliance = {
      id: Date.now().toString(),
      name: formState.name.trim(),
      quantity: parseInt(formState.quantity) || 1,
      dayHours: parseInt(formState.dayHours) || 0,
      nightHours: parseInt(formState.nightHours) || 0,
      wattage: parseInt(formState.wattage) || 0,
    };

    // Add the appliance to the state
    actions.addAppliance(newAppliance);

    // Store ONLY the current appliances, don't append to existing
    try {
      // Get current appliances from state and add the new one
      const updatedAppliances = [...state.appliances, newAppliance];

      // Save to localStorage (replacing the entire array)
      localStorage.setItem(
        "solarAppliances",
        JSON.stringify(updatedAppliances)
      );

      // Get recommendation only for this single appliance
      getRecommendations(newAppliance);
    } catch (error) {
      console.error("Error saving appliances to localStorage:", error);
    }

    // Reset the form
    setFormState({
      name: "",
      quantity: "",
      dayHours: "",
      nightHours: "",
      wattage: "",
    });

    // Stop any ongoing voice interaction
    stopListening();
    setConversationActive(false);
    setIsAnimating(false);

    // Show system recommendations
    setShowForm(false);
    setShowSystems(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modify the handleBack function to clear recommendations when going back
  const handleBack = () => {
    // Stop any ongoing speech or listening
    stopListening();
    setIsAnimating(false);
    setConversationActive(false);

    // Clear recommendations
    clearRecommendations();

    // Reset the form without navigating away
    setFormState({
      name: "",
      quantity: "",
      dayHours: "",
      nightHours: "",
      wattage: "",
    });

    // Show the form view again
    setShowSystems(false);
    setShowForm(true);

    // Reset the retry counter and error states
    setRetryCount(0);
    setRecognitionError(false);

    // Provide feedback that the process was canceled
    console.log("Voice interaction canceled");
  };

  // Handle system selection
  const handleSelectSystem = (systemId) => {
    actions.setSelectedSystem(systemId);
    actions.setView("checkout"); // Or whatever the next view should be
  };

  const handleSettingsClick = () => {
    actions.setView("voiceSelection");
  };

  const handleClearAllData = () => {
    // Clear all recommendations
    clearRecommendations();

    // Clear all appliances from state
    actions.setAppliances([]);

    // Clear localStorage
    localStorage.removeItem("solarAppliances");
    localStorage.removeItem("solarRecommendations");

    // Reset UI
    setShowSystems(false);
    setShowForm(true);
  };

  const handleGoToLanding = () => {
    // Stop any ongoing speech or listening
    stopListening();
    setIsAnimating(false);
    setConversationActive(false);

    // Navigate to the landing page
    actions.setView("landing"); // Assuming "landing" is the view name for your landing page
  };

  return (
    <div className="fixed inset-0 bg-[#F5C13C] flex flex-col items-center justify-start p-4 z-50 overflow-y-auto">
      <div className="absolute top-4 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 flex items-center">
        <button
          onClick={handleGoToLanding}
          className="text-gray-700 rounded-full p-2 transition-colors"
          aria-label="Back to Home"
        >
          <HouseIcon />
        </button>
        <button
          onClick={handleSettingsClick}
          className="text-gray-700 rounded-full p-2 transition-colors"
          aria-label="Settings"
        >
          <img src="/settings.svg" alt="" />
        </button>
      </div>

      {/* Voice visualization */}
      <div className="bg-white rounded-full w-[202px] h-[202px] flex items-center justify-center shadow-lg mt-[70px]">
        <div className="flex items-center space-x-1">
          {[22, 34, 50, 69, 50, 34, 22].map((height, index) => {
            const baseHeight = height;
            const animatedHeight = isAnimating
              ? baseHeight +
                Math.sin(animationTime / 200 + index) * (baseHeight * 0.4)
              : baseHeight;

            return (
              <div
                key={index}
                className="bg-[#B78A16] w-2 rounded-full transition-all duration-100"
                style={{
                  height: `${animatedHeight}px`,
                  margin: "0 2px",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* <div className="mt-6 flex justify-center">
        <button
          onClick={handleClearAllData}
          className="bg-red-500 text-white rounded-full px-6 py-2 hover:bg-red-600 transition-colors text-sm"
        >
          Clear All Data
        </button>
      </div>

      <button
        onClick={() => {
          testApiConnection().then((result) => {
            console.log("API Test Result:", result);
            if (result.ok) {
              alert("API test successful!");
            } else {
              alert(`API test failed: ${JSON.stringify(result)}`);
            }
          });
        }}
        className="mt-4 bg-blue-500 text-white rounded-full px-4 py-2 text-sm"
      >
        Test API Connection
      </button> */}

      {/* Voice control buttons - with added visual feedback */}
      <div className="flex space-x-[40px] mt-6 mb-8">
        <button
          onClick={handleBack}
          className="bg-[#F3B921] hover:scale-[1.03] hover:shadow-md duration-300 ease-linear rounded-full p-4 transition-colors"
          aria-label="Cancel"
        >
          <X className="text-[#374646]" size={20} />
        </button>
        <button
          onClick={conversationActive ? stopListening : startConversation}
          className={`${
            isListening
              ? "bg-red-500 animate-pulse" // Clearly show it's listening
              : "bg-[#F3B921] hover:scale-[1.03] hover:shadow-md duration-300 ease-linear"
          } rounded-full p-4 transition-colors`}
          aria-label={isListening ? "Listening..." : "Start listening"}
        >
          <Mic
            className={`${isListening ? "text-white" : "text-[#374646]"}`}
            size={20}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-[56px] lg:px-0">
        {/* Recognition error indicator */}
        {recognitionError && (
          <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md text-sm">
            I'm having trouble understanding. Please speak clearly and try
            again.
          </div>
        )}
        {/* Appliance Form */}
        {showForm && (
          <div className="bg-[#F8F6F4] border-2 border-[#F3B921] rounded-lg p-[32px] w-[526px] mx-auto shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="space-y-[24px]">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[65%]">
                    <label className="block text-[#3D3E3E] font-[600] mb-1">
                      Name of Item
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder:text-sm
                      hover:outline-none
                      value={formState.name}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#A6A0A3] rounded-[8px] text-[#3D3E3E] font-[700] placeholder:text-sm hover:outline-none h-[44px] px-[11px] py-[10px]"
                      placeholder="Freezer"
                    />
                  </div>
                  <div className="w-[35%]">
                    <label className="block text-[#3D3E3E] font-[600] mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formState.quantity}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#A6A0A3] rounded-[8px] text-[#3D3E3E] font-[700] placeholder:text-sm hover:outline-none h-[44px] px-[11px] py-[10px]"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-[24px] justify-between">
                  <div className="w-[137px]">
                    <label className="block text-[#3D3E3E] font-[600] mb-1">
                      Day Hours
                    </label>
                    <input
                      type="number"
                      name="dayHours"
                      value={formState.dayHours}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#A6A0A3] rounded-[8px] text-[#3D3E3E] font-[700] placeholder:text-sm hover:outline-none h-[44px] px-[11px] py-[10px]"
                      placeholder="8 hours"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div className="w-[137px]">
                    <label className="block text-[#3D3E3E] font-[600] mb-1">
                      Night Hours
                    </label>
                    <input
                      type="number"
                      name="nightHours"
                      value={formState.nightHours}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#A6A0A3] rounded-[8px] text-[#3D3E3E] font-[700] placeholder:text-sm hover:outline-none h-[44px] px-[11px] py-[10px]"
                      placeholder="3 hours"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div className="w-[137px]">
                    <label className="block text-[#3D3E3E] font-[600] mb-1">
                      Wattage
                    </label>
                    <input
                      type="number"
                      name="wattage"
                      value={formState.wattage}
                      onChange={handleInputChange}
                      className="w-full border-2 border-[#A6A0A3] rounded-[8px] text-[#3D3E3E] font-[700] placeholder:text-sm hover:outline-none h-[44px] px-[11px] py-[10px]"
                      placeholder="800 W"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#E8F2F2] text-[#3D3E3E] font-[700] rounded-full border-2 border-[#736C59] px-6 h-[36px] transition-colors min-w-[171px]"
                >
                  {t.confirmButton}
                </button>
              </div>
            </form>
          </div>
        )}
        {showSystems && (
          <div className="space-y-4 max-h-[500px] lg:max-h-[300px] w-full lg:w-[555px] mx-auto overflow-y-auto pr-0 lg:pr-2 hide-scrollbar">
            {loading ? (
              <div className="bg-white rounded-lg p-6 flex justify-center items-center">
                <p>Loading recommendations...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-6">
                <p className="text-red-500">
                  Error fetching recommendations. Please try again.
                </p>
                <button
                  onClick={handleBack}
                  className="mt-4 bg-gray-800 text-white rounded-full px-6 py-2 hover:bg-gray-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : recommendations ? (
              // First try to render all recommendations from all entries in localStorage
              (Array.isArray(recommendations)
                ? recommendations.flatMap((rec) => rec.recommendations || [])
                : recommendations.recommendations || []
              ).map((system, index) => (
                <div
                  key={index}
                  className="bg-[#F8F6F4] p-[24px] h-max lg:h-[148px] border border-[#F3B921] shadow-md rounded-[16px] flex flex-col lg:flex-row items-start justify-between lg:items-center w-full"
                >
                  <div className="flex-1 mr-4 text-sm lg:text-base">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[#3D3E3E] font-[600] leading-[24px] capitalize">
                        {system.panel}
                      </p>
                      <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                        {system.panelQuantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[#3D3E3E] font-[600] leading-[24px] capitalize">
                        {system.inverter || system.generator}
                      </p>
                      <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                        {system.inverterQuantity || system.generatorQuantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#3D3E3E] font-[600] leading-[24px] capitalize">
                        {system.battery}
                      </p>
                      <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                        {system.batteryQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="w-full lg:w-max flex flex-row lg:flex-col justify-between items-center lg:items-end mt-[24px]">
                    <div>
                      <p className="font-bold text-[#3D3E3E] text-lg leading-[24px]">
                        N{system.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#3D3E3E] font-[600] mb-2">
                        Installation included
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectSystem(index)}
                      className="bg-[#E8F2F2] font-bold min-w-[96px] h-[36px] border-2 border-[#374646] rounded-full px-[24px] py-[10px] text-[#202D2D] flex items-center justify-center"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 flex justify-center items-center">
                <p>No recommendations available. Please add an appliance.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display current transcript if available */}
      {transcript && isListening && (
        <div className="mt-4 bg-white bg-opacity-80 p-4 rounded-lg max-w-md shadow-md">
          <p className="text-[#3D3E3E] text-center">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
