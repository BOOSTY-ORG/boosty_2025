import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X } from "lucide-react";

const VoiceAIAssistant = ({ user, onClose, onApplianceConfirmed }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionState, setRecognitionState] = useState("stopped"); // 'stopped', 'starting', 'listening'
  const [conversation, setConversation] = useState([]);
  const [applianceData, setApplianceData] = useState({
    name: "",
    quantity: "",
    dayHours: "",
    nightHours: "",
    wattage: "",
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech services
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-NG"; // Nigerian English

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        if (event.results[event.results.length - 1].isFinal) {
          handleUserSpeech(transcript);
        }
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setRecognitionState("listening");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setRecognitionState("stopped");
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setRecognitionState("stopped");

        if (event.error === "not-allowed") {
          alert(
            "Microphone access denied. Please enable microphone permissions and try again."
          );
        } else if (event.error === "aborted") {
          // This is normal when we stop recognition, don't show error
          console.log("Speech recognition was aborted");
        }
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []); // Empty dependency array to run only once

  // Separate effect for greeting
  useEffect(() => {
    if (!hasIntroduced) {
      const timer = setTimeout(() => {
        greetUser();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasIntroduced]);

  const greetUser = () => {
    const greeting = `Hello ${
      user?.firstName || "there"
    }! I'm Boosty, your energy assistant. What appliances would you like to add to your energy calculation today?`;
    speakText(greeting, true); // Auto-start listening after initial greeting
    setConversation([{ type: "ai", text: greeting }]);
    setHasIntroduced(true);
  };

  const speakText = (text, shouldAutoListen = false) => {
    if (synthRef.current) {
      // Stop any current listening while speaking
      stopListening();

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);

      // Try to get Nigerian English voice or fallback to British English
      const voices = synthRef.current.getVoices();
      const nigerianVoice =
        voices.find((voice) => voice.lang.includes("en-NG")) ||
        voices.find((voice) => voice.lang.includes("en-GB")) ||
        voices.find((voice) => voice.lang.includes("en"));

      if (nigerianVoice) {
        utterance.voice = nigerianVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      utterance.onend = () => {
        setIsSpeaking(false);
        // Only auto-start listening for the very first greeting
        if (shouldAutoListen && !hasIntroduced) {
          setTimeout(() => {
            startListening();
          }, 1500);
        }
      };

      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || isSpeaking || isProcessing) {
      return;
    }

    // Always stop first to clear any stuck state
    if (recognitionState !== "stopped") {
      stopListening();
      // Wait a bit before starting again
      setTimeout(() => {
        startListening();
      }, 500);
      return;
    }

    try {
      setRecognitionState("starting");
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
      setRecognitionState("stopped");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && recognitionState !== "stopped") {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
      setIsListening(false);
      setRecognitionState("stopped");
    }
  };

  const handleUserSpeech = async (transcript) => {
    setConversation((prev) => [...prev, { type: "user", text: transcript }]);
    setIsProcessing(true);

    try {
      // Use AI to process the speech and extract appliance information
      const response = await processUserInputWithAI(transcript);
      speakText(response.aiResponse);

      setConversation((prev) => [
        ...prev,
        { type: "ai", text: response.aiResponse },
      ]);

      // Update form if appliance data was extracted
      if (response.applianceData) {
        setApplianceData((prev) => ({
          ...prev,
          ...response.applianceData,
        }));
      }
    } catch (error) {
      console.error("Error processing speech:", error);
      const fallbackResponse =
        "Sorry, I didn't catch that. Could you please repeat what appliance you'd like to add?";
      speakText(fallbackResponse);
      setConversation((prev) => [
        ...prev,
        { type: "ai", text: fallbackResponse },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserInputWithAI = async (userInput) => {
    const lowerInput = userInput.toLowerCase();

    // Extract appliance information using pattern matching
    const extractedData = {
      name: null,
      quantity: null,
      dayHours: null,
      nightHours: null,
      wattage: null,
    };

    // Extract appliance names (more comprehensive list)
    const appliancePatterns = [
      // Common appliances
      { pattern: /(?:deep\s+)?freez(?:er|e)/i, name: "freezer" },
      { pattern: /(?:refrig(?:erator)?|fridge)/i, name: "refrigerator" },
      {
        pattern: /(?:air\s+condition(?:er|ing)?|ac\b)/i,
        name: "air conditioner",
      },
      { pattern: /(?:washing\s+machine|washer)/i, name: "washing machine" },
      { pattern: /(?:television|tv\b)/i, name: "television" },
      { pattern: /(?:ceiling\s+)?fan/i, name: "fan" },
      { pattern: /microwave/i, name: "microwave" },
      { pattern: /(?:electric\s+)?stove/i, name: "electric stove" },
      { pattern: /(?:water\s+)?heater/i, name: "water heater" },
      { pattern: /(?:dish\s*)?washer/i, name: "dishwasher" },
      { pattern: /(?:clothes\s+)?dryer/i, name: "dryer" },
      { pattern: /(?:electric\s+)?kettle/i, name: "electric kettle" },
      { pattern: /blender/i, name: "blender" },
      { pattern: /(?:electric\s+)?iron/i, name: "electric iron" },
      { pattern: /(?:vacuum\s+)?cleaner/i, name: "vacuum cleaner" },
    ];

    // Find matching appliance
    for (const { pattern, name } of appliancePatterns) {
      if (pattern.test(userInput)) {
        extractedData.name = name;
        break;
      }
    }

    // Extract numbers and their context
    const numberMatches = userInput.match(/\d+(?:\.\d+)?/g);
    const numbers = numberMatches ? numberMatches.map(Number) : [];

    if (numbers.length > 0) {
      // Extract wattage
      if (/(\d+(?:\.\d+)?)\s*(?:watts?|w\b)/i.test(userInput)) {
        const wattMatch = userInput.match(/(\d+(?:\.\d+)?)\s*(?:watts?|w\b)/i);
        extractedData.wattage = wattMatch[1];
      }

      // Extract hours
      if (/(\d+(?:\.\d+)?)\s*hours?/i.test(userInput)) {
        const hourMatches = userInput.match(/(\d+(?:\.\d+)?)\s*hours?/gi);
        if (hourMatches.length === 1) {
          // Single hour mention - split between day and night
          const totalHours = parseFloat(hourMatches[0]);
          if (totalHours === 24) {
            extractedData.dayHours = "12";
            extractedData.nightHours = "12";
          } else if (totalHours > 12) {
            extractedData.dayHours = Math.ceil(totalHours / 2).toString();
            extractedData.nightHours = Math.floor(totalHours / 2).toString();
          } else {
            extractedData.dayHours = totalHours.toString();
            extractedData.nightHours = "0";
          }
        } else if (hourMatches.length >= 2) {
          // Multiple hour mentions
          extractedData.dayHours = parseFloat(hourMatches[0]).toString();
          extractedData.nightHours = parseFloat(hourMatches[1]).toString();
        }
      }

      // Extract quantity if mentioned
      if (
        /(\d+)\s*(?:of|pieces?|units?)/i.test(userInput) ||
        numbers[0] <= 10
      ) {
        extractedData.quantity = numbers[0].toString();
      } else {
        extractedData.quantity = "1"; // Default to 1
      }
    }

    // Generate conversational response based on what was extracted
    let aiResponse = "";

    if (extractedData.name) {
      if (
        extractedData.wattage &&
        (extractedData.dayHours || extractedData.nightHours)
      ) {
        aiResponse = `Perfect! I've got your ${extractedData.name} using ${
          extractedData.wattage
        } watts, running ${
          extractedData.dayHours || "0"
        } hours during the day and ${
          extractedData.nightHours || "0"
        } hours at night. The form is all filled out - you can confirm these details or tell me about another appliance.`;
      } else if (extractedData.wattage) {
        aiResponse = `Great! I've noted your ${extractedData.name} with ${extractedData.wattage} watts. How many hours do you typically use it during the day and at night?`;
      } else if (extractedData.dayHours || extractedData.nightHours) {
        aiResponse = `I see you want to add a ${
          extractedData.name
        } that runs for ${
          extractedData.dayHours || extractedData.nightHours
        } hours. What's the wattage or power consumption of this appliance?`;
      } else {
        aiResponse = `Nice! I've noted your ${extractedData.name}. Can you tell me its wattage and how many hours you use it during day and night?`;
      }
    } else if (numbers.length > 0) {
      if (/watts?|w\b/i.test(userInput)) {
        aiResponse = `I caught the wattage details. Which appliance are you referring to?`;
      } else if (/hours?/i.test(userInput)) {
        aiResponse = `Got the usage hours. What appliance is this for and what's its wattage?`;
      } else {
        aiResponse = `I heard some numbers. Can you tell me which appliance you're adding and its power details?`;
      }
    } else if (
      lowerInput.includes("yes") ||
      lowerInput.includes("correct") ||
      lowerInput.includes("right")
    ) {
      aiResponse = `Excellent! Your appliance details have been confirmed. Would you like to add another appliance or are we good to go?`;
    } else if (
      lowerInput.includes("no") ||
      lowerInput.includes("wrong") ||
      lowerInput.includes("incorrect")
    ) {
      aiResponse = `No problem! Please tell me the correct details for your appliance.`;
    } else if (
      lowerInput.includes("done") ||
      lowerInput.includes("finished") ||
      lowerInput.includes("that's all")
    ) {
      aiResponse = `Perfect! I've helped you add your appliances. Your energy calculation is ready!`;
    } else {
      aiResponse = `I want to help you add that appliance. Can you tell me the name of the appliance, its wattage, and how many hours you use it?`;
    }

    // Only return non-null values
    const cleanedData = {};
    Object.keys(extractedData).forEach((key) => {
      if (extractedData[key] !== null) {
        cleanedData[key] = extractedData[key];
      }
    });

    return {
      aiResponse,
      applianceData: Object.keys(cleanedData).length > 0 ? cleanedData : null,
    };
  };

  const confirmDetails = () => {
    if (!applianceData.name || !applianceData.wattage) {
      const errorText =
        "Please make sure we have at least the appliance name and wattage before confirming.";
      speakText(errorText);
      return;
    }

    const confirmText = `Perfect! I've added your ${applianceData.name} with ${applianceData.wattage} watts, running ${applianceData.dayHours} hours during day and ${applianceData.nightHours} hours at night. Your appliance has been saved!`;
    speakText(confirmText);

    // Pass the appliance data back to parent component
    if (onApplianceConfirmed) {
      onApplianceConfirmed(applianceData);
    }
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 z-50 flex flex-col items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
      >
        <X size={20} className="text-yellow-800" />
      </button>

      {/* Main listening circle */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`relative w-48 h-48 bg-white rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
            isListening
              ? "animate-pulse shadow-2xl scale-110"
              : isProcessing
              ? "shadow-xl scale-105"
              : "shadow-lg"
          }`}
        >
          {/* Soundwave icon */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-2 bg-yellow-600 rounded-full transition-all duration-200 ${
                  isListening
                    ? `h-${4 + bar} animate-bounce`
                    : isProcessing
                    ? "h-6 animate-pulse"
                    : "h-4"
                }`}
                style={{
                  animationDelay: isListening ? `${bar * 0.1}s` : "0s",
                  animationDuration: isListening ? "0.6s" : "1s",
                }}
              />
            ))}
          </div>

          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 border-4 border-yellow-300 rounded-full animate-ping opacity-30"></div>
              <div
                className="absolute inset-4 border-2 border-yellow-400 rounded-full animate-ping opacity-50"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute inset-2 border-2 border-blue-400 rounded-full animate-spin opacity-60"></div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
          >
            <X size={20} className="text-yellow-800" />
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? "bg-red-500 hover:bg-red-400 text-white"
                : isProcessing
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-yellow-300 hover:bg-yellow-200 text-yellow-800"
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {/* Appliance form */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Item
            </label>
            <input
              type="text"
              value={applianceData.name}
              onChange={(e) =>
                setApplianceData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Freezer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={applianceData.quantity}
              onChange={(e) =>
                setApplianceData((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day Hours
            </label>
            <input
              type="text"
              value={applianceData.dayHours}
              onChange={(e) =>
                setApplianceData((prev) => ({
                  ...prev,
                  dayHours: e.target.value,
                }))
              }
              placeholder="8 hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Night Hours
            </label>
            <input
              type="text"
              value={applianceData.nightHours}
              onChange={(e) =>
                setApplianceData((prev) => ({
                  ...prev,
                  nightHours: e.target.value,
                }))
              }
              placeholder="3 hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wattage
            </label>
            <input
              type="text"
              value={applianceData.wattage}
              onChange={(e) =>
                setApplianceData((prev) => ({
                  ...prev,
                  wattage: e.target.value,
                }))
              }
              placeholder="800 W"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <button
          onClick={confirmDetails}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
        >
          Confirm details
        </button>
      </div>

      {/* Status indicator */}
      <div className="mt-4 text-center">
        <p className="text-yellow-800 font-medium">
          {isSpeaking
            ? "Boosty is speaking..."
            : isListening
            ? "Listening..."
            : isProcessing
            ? "Processing..."
            : hasIntroduced
            ? "Tap microphone to respond"
            : "Initializing..."}
        </p>
      </div>
    </div>
  );
};

export default VoiceAIAssistant;
