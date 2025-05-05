import { useSolarAssistant } from "../context/SolarAssistantContext";

export const useWebSpeech = () => {
  const { state, actions } = useSolarAssistant();
  const { language, isListening } = state;

  // Map our app languages to Web Speech API language codes
  const getLanguageCode = () => {
    switch (language) {
      case "pidgin":
        // Web Speech API doesn't support Pidgin directly, use Nigerian English
        return "en-NG";
      case "english":
      default:
        return "en-NG"; // Nigerian English
    }
  };

  /**
   * Start voice recognition using Web Speech API
   */
  const startListening = async () => {
    // Don't start if already listening
    if (isListening) return;

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser");
        // For demo purposes, fall back to mock responses
        useMockSpeechRecognition();
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.lang = getLanguageCode();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        actions.setTranscript(transcript);
        processUserSpeech(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Web Speech API error:", event.error);
        actions.setListening(false);
      };

      recognition.onend = () => {
        actions.setListening(false);
      };

      actions.setListening(true);
      recognition.start();
    } catch (error) {
      console.error("Speech recognition failed:", error);
      actions.setListening(false);

      // Fall back to mock responses for demo purposes
      useMockSpeechRecognition();
    }
  };

  /**
   * Use mock responses for development/demo purposes
   */
  const useMockSpeechRecognition = () => {
    actions.setListening(true);

    setTimeout(() => {
      const mockTranscript = getMockTranscript();
      actions.setTranscript(mockTranscript);
      processUserSpeech(mockTranscript);
      actions.setListening(false);
    }, 2000);
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    actions.setListening(false);
  };

  /**
   * Process user speech to detect intents and entities
   */
  const processUserSpeech = (transcript) => {
    // Basic intent recognition for demo purposes
    const lowerTranscript = transcript.toLowerCase();

    // Check for appliance mentions
    if (lowerTranscript.includes("freezer")) {
      actions.addAppliance({
        id: Date.now().toString(),
        name: "Freezer",
        quantity: 1,
        dayHours: 8,
        nightHours: 3,
        wattage: 800,
      });
    }

    if (
      lowerTranscript.includes("tv") ||
      lowerTranscript.includes("television")
    ) {
      actions.addAppliance({
        id: Date.now().toString(),
        name: "Television",
        quantity: 1,
        dayHours: 6,
        nightHours: 4,
        wattage: 120,
      });
    }

    if (
      lowerTranscript.includes("fridge") ||
      lowerTranscript.includes("refrigerator")
    ) {
      actions.addAppliance({
        id: Date.now().toString(),
        name: "Refrigerator",
        quantity: 1,
        dayHours: 12,
        nightHours: 12,
        wattage: 150,
      });
    }

    // Check for address information
    if (
      lowerTranscript.includes("address") ||
      lowerTranscript.includes("live")
    ) {
      // Extract address (simplified)
      const addressMatch = transcript.match(
        /(?:address is|live at|live in) (.*)/i
      );
      if (addressMatch && addressMatch[1]) {
        actions.updateOrderDetails({
          address: {
            ...state.orderDetails.address,
            street: addressMatch[1].trim(),
          },
        });
      }
    }

    // Navigate based on speech
    if (
      lowerTranscript.includes("checkout") ||
      lowerTranscript.includes("pay")
    ) {
      actions.setView("checkout");
    } else if (
      lowerTranscript.includes("system") ||
      lowerTranscript.includes("package")
    ) {
      actions.setView("systemSelection");
    }
  };

  /**
   * Mock function for demo purposes
   */
  const getMockTranscript = () => {
    const mockResponses = [
      "I want solar for my freezer that runs 8 hours during the day and 3 hours at night",
      "My address is 123 Lagos Street, Ikeja",
      "I want to power my TV, AC, and refrigerator",
      "I have a budget of 3 million naira",
    ];

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  /**
   * Text to speech function using Web Speech API
   */
  const speak = async (text) => {
    try {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a Nigerian English voice if available
        const voices = window.speechSynthesis.getVoices();

        // Select voice based on user preference and available system voices
        let voice;

        // Try to find a Nigerian English voice first
        voice = voices.find((v) => v.lang === "en-NG");

        // If no Nigerian voice, try any English voice
        if (!voice) {
          voice = voices.find((v) => v.lang.startsWith("en"));
        }

        // If found a voice, use it
        if (voice) {
          utterance.voice = voice;
        }

        // Adjust voice based on selected personality
        switch (state.selectedVoice) {
          case "sonny":
            utterance.pitch = 0.9;
            utterance.rate = 0.9;
            break;
          case "bright":
            utterance.pitch = 1.1;
            utterance.rate = 1.1;
            break;
          case "lucky":
            utterance.pitch = 1.2;
            utterance.rate = 1.0;
            break;
          default:
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
        }

        window.speechSynthesis.speak(utterance);
      } else {
        // For browsers that don't support speech synthesis
        console.log("Speech synthesis not supported in this browser");
        console.log("AI would say:", text);
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error);
    }
  };

  return {
    startListening,
    stopListening,
    speak,
  };
};
