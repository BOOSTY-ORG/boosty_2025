import { useState, useEffect, useCallback } from "react";

export const useWebSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Access the speech synthesis API
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices right away if they're already available
      loadVoices();

      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Set up speech recognition
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          console.log("Speech recognized:", transcriptText);
          setTranscript(transcriptText);
        };

        recognitionInstance.onerror = (event) => {
          console.error("Recognition error:", event.error);
        };

        recognitionInstance.onend = () => {
          console.log("Recognition ended");
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Configure different voice profiles based on the selected voice option
  const getVoiceConfig = (voiceId) => {
    // Default configuration
    const config = {
      voice: null, // Will be set based on available system voices
      rate: 1.0, // Normal speech rate
      pitch: 1.0, // Normal pitch
      volume: 1.0, // Full volume
    };

    // Customize based on selected voice with more pronounced differences
    switch (voiceId) {
      case "sonny":
        // Very calm, slow, deep voice
        config.rate = 0.85;
        config.pitch = 0.7;
        break;
      case "bright":
        // More energetic, faster, medium-high pitch
        config.rate = 1.15;
        config.pitch = 1.3;
        break;
      case "lucky":
        // Very lively, fastest, highest pitch
        config.rate = 1.3;
        config.pitch = 1.4;
        break;
      default:
        // Default - use bright settings
        config.rate = 1.15;
        config.pitch = 1.3;
        break;
    }

    // Select a voice based on the voice ID
    if (voices.length > 0) {
      // Try to select distinctly different voices if available
      switch (voiceId) {
        case "sonny":
          // Deep male voice for Sonny
          config.voice =
            voices.find(
              (voice) =>
                voice.name.toLowerCase().includes("male") ||
                voice.name.toLowerCase().includes("daniel") ||
                voice.name.toLowerCase().includes("david")
            ) || voices[0];
          break;

        case "bright":
          // Female voice for Bright
          config.voice =
            voices.find(
              (voice) =>
                voice.name.toLowerCase().includes("female") ||
                voice.name.toLowerCase().includes("samantha") ||
                voice.name.toLowerCase().includes("karen")
            ) || voices[0];
          break;

        case "lucky":
          // Different accent if possible
          config.voice =
            voices.find(
              (voice) =>
                voice.lang.includes("en-GB") ||
                voice.name.toLowerCase().includes("alex") ||
                voice.name.toLowerCase().includes("victoria")
            ) || voices[0];
          break;
      }

      // Fallback to any English voice or first voice
      if (!config.voice) {
        config.voice =
          voices.find((voice) => voice.lang.includes("en")) || voices[0];
      }
    }

    return config;
  };

  const speak = useCallback(
    (text, voiceId = "bright") => {
      if (!speechSynthesis) return;

      // Stop any current speech
      speechSynthesis.cancel();

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Apply voice configuration based on selected voice
      const voiceConfig = getVoiceConfig(voiceId);

      utterance.voice = voiceConfig.voice;
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = voiceConfig.volume;

      // For debugging
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Speaking with voice: ${utterance.voice?.name || "default"}, rate: ${
            utterance.rate
          }, pitch: ${utterance.pitch}`
        );
      }

      // Create a promise that resolves when speech ends
      return new Promise((resolve) => {
        utterance.onend = resolve;
        // Speak the text
        speechSynthesis.speak(utterance);
      });
    },
    [speechSynthesis, voices]
  );

  const startListening = useCallback(
    (errorCallback) => {
      if (recognition) {
        // Reset transcript
        setTranscript("");

        // Add error handling with callback
        recognition.onerror = (event) => {
          console.error("Recognition error:", event.error);

          // For no-speech errors, notify via callback but keep listening
          if (event.error === "no-speech") {
            console.log("No speech detected");
            if (errorCallback) {
              errorCallback("no-speech");
            }
            // Don't set isListening to false
          } else {
            setIsListening(false);
          }
        };

        // Start recognition
        recognition.start();
        setIsListening(true);
        return true;
      }
      return false;
    },
    [recognition]
  );

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      return true;
    }
    return false;
  }, [recognition, isListening]);

  return {
    speak,
    voices,
    isReady: speechSynthesis !== null && voices.length > 0,
    startListening,
    stopListening,
    isListening,
    transcript,
  };
};
