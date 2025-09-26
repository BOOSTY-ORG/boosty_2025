
import { API_ENDPOINTS } from "../config/api";

class ConversationEngine {
  constructor() {
    this.conversationHistory = [];
    this.sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.context = {};
    this.recognition = null;
  }

  // 1. IMPROVED SPEECH RECOGNITION with better error handling
  async startListening() {
    try {
      console.log("🎤 Starting speech recognition...");

      // First try Google Cloud Speech (more reliable)
      if (await this.tryGoogleCloudSpeech()) {
        return;
      }

      // Fallback to Web Speech API with better setup
      return await this.startWebSpeechRecognition();
    } catch (error) {
      console.error("All speech recognition methods failed:", error);
      throw new Error(
        "Speech recognition unavailable. Please try typing your message."
      );
    }
  }

  // Try Google Cloud Speech-to-Text (more reliable)
  async tryGoogleCloudSpeech() {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia not available, skipping Google Cloud Speech");
        return false;
      }

      console.log("🎤 Trying Google Cloud Speech...");

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];
      this.isListening = true;

      return new Promise((resolve, reject) => {
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(this.audioChunks, {
              type: "audio/webm",
            });
            const result = await this.processAudioWithGoogleCloud(audioBlob);

            // Stop microphone stream
            stream.getTracks().forEach((track) => track.stop());
            this.isListening = false;

            resolve(result);
          } catch (error) {
            console.error("Google Cloud processing failed:", error);
            stream.getTracks().forEach((track) => track.stop());
            this.isListening = false;
            reject(error);
          }
        };

        this.mediaRecorder.onerror = (error) => {
          console.error("MediaRecorder error:", error);
          stream.getTracks().forEach((track) => track.stop());
          this.isListening = false;
          reject(error);
        };

        // Start recording
        this.mediaRecorder.start();
        console.log("🎤 Recording started with Google Cloud Speech...");

        // Auto-stop after 10 seconds
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
          }
        }, 10000);
      });
    } catch (error) {
      console.log("Google Cloud Speech not available:", error.message);
      return false;
    }
  }

  // Process audio with Google Cloud Speech-to-Text
  async processAudioWithGoogleCloud(audioBlob) {
    try {
      // Convert audio blob to base64
      const audioBase64 = await this.blobToBase64(audioBlob);

      console.log("📤 Sending audio to Google Cloud Speech...");

      // Send to backend Speech-to-Text
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/conversation/speech-to-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioData: audioBase64.split(",")[1], // Remove data:audio/webm;base64, prefix
            audioFormat: "webm",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Speech API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.transcript && result.transcript.trim()) {
        console.log("✅ Google Cloud Speech result:", result.transcript);
        return {
          transcript: result.transcript,
          confidence: result.confidence || 85,
        };
      } else {
        throw new Error("No speech detected or low confidence");
      }
    } catch (error) {
      console.error("Google Cloud Speech processing failed:", error);
      throw error;
    }
  }

  // Improved Web Speech API fallback
  async startWebSpeechRecognition() {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported in this browser"));
        return;
      }

      console.log("🔊 Using Web Speech API fallback...");

      this.recognition = new SpeechRecognition();

      // Better configuration
      this.recognition.lang = "en-US";
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;
      this.recognition.continuous = false;

      // Add alternative languages for better recognition
      if (this.recognition.serviceURI) {
        this.recognition.lang = "en-NG"; // Nigerian English if supported
      }

      let hasResult = false;

      this.recognition.onstart = () => {
        console.log("🎤 Web Speech recognition started");
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        hasResult = true;
        const results = event.results;
        let bestTranscript = "";
        let bestConfidence = 0;

        // Find the best result
        for (let i = 0; i < results.length; i++) {
          for (let j = 0; j < results[i].length; j++) {
            const result = results[i][j];
            if (result.confidence > bestConfidence) {
              bestTranscript = result.transcript;
              bestConfidence = result.confidence;
            }
          }
        }

        console.log(
          "🎯 Web Speech result:",
          bestTranscript,
          "Confidence:",
          bestConfidence
        );

        if (bestTranscript.trim()) {
          this.isListening = false;
          resolve({
            transcript: bestTranscript.trim(),
            confidence: Math.round(bestConfidence * 100),
          });
        } else {
          this.isListening = false;
          reject(new Error("No clear speech detected"));
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Web Speech recognition error:", event.error);
        this.isListening = false;

        let errorMessage = "Speech recognition failed";
        switch (event.error) {
          case "network":
            errorMessage = "Network connection required for speech recognition";
            break;
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone permissions.";
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking clearly.";
            break;
          case "audio-capture":
            errorMessage =
              "Microphone not available. Please check your microphone.";
            break;
          case "service-not-allowed":
            errorMessage = "Speech service not available. Please try again.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        console.log("🔇 Web Speech recognition ended");
        this.isListening = false;

        if (!hasResult) {
          reject(
            new Error(
              "No speech was detected. Please try speaking more clearly."
            )
          );
        }
      };

      // Start recognition
      try {
        this.recognition.start();

        // Auto-stop after 8 seconds for Web Speech API
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            this.recognition.stop();
          }
        }, 8000);
      } catch (error) {
        this.isListening = false;
        reject(
          new Error("Failed to start speech recognition: " + error.message)
        );
      }
    });
  }

  // Stop listening method
  stopListening() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    this.isListening = false;
    console.log("🔇 Speech recognition stopped");
  }

  // 2. PROCESS USER MESSAGE (same as before)
  async processUserMessage(userMessage, additionalContext = {}) {
    try {
      console.log("💬 Processing user message:", userMessage);

      this.context = {
        ...this.context,
        ...additionalContext,
        timestamp: new Date(),
      };

      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/conversation/conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage,
            context: this.context,
            sessionId: this.sessionId,
            conversationHistory: this.conversationHistory,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        this.conversationHistory.push({
          user: userMessage,
          assistant: result.response,
          intent: result.intent,
          timestamp: new Date(),
          actions: result.actions,
        });

        console.log("🤖 AI Response:", result.response);
        console.log("🎯 Intent:", result.intent);
        console.log("⚡ Actions:", result.actions);

        return result;
      } else {
        throw new Error(result.message || "Conversation processing failed");
      }
    } catch (error) {
      console.error("Conversation processing error:", error);

      return {
        success: false,
        intent: "error",
        response: "I'm sorry, I didn't catch that. Could you please repeat?",
        actions: [],
        suggestions: ["Try speaking more clearly", "Check your connection"],
        needsMoreInfo: false,
      };
    }
  }

  // 3. EXECUTE ACTIONS (same as before)
  async executeActions(actions, formHandlers = {}) {
    const results = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case "fill_field":
            if (
              formHandlers.handleInputChange &&
              action.field &&
              action.value
            ) {
              formHandlers.handleInputChange(action.field, action.value);
              results.push({
                action: "fill_field",
                success: true,
                field: action.field,
                value: action.value,
              });
              console.log(`✅ Filled ${action.field} with ${action.value}`);
            }
            break;

          case "speak":
            if (formHandlers.speakText && action.text) {
              await formHandlers.speakText(action.text);
              results.push({
                action: "speak",
                success: true,
                text: action.text,
              });
            }
            break;

          case "ask_clarification":
            if (formHandlers.speakText && action.question) {
              await formHandlers.speakText(action.question);
              results.push({
                action: "ask_clarification",
                success: true,
                question: action.question,
              });
            }
            break;

          default:
            console.log("Unknown action type:", action.type);
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        results.push({
          action: action.type,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  // 4. SMART APPLIANCE RECOGNITION (same as before)
  async recognizeAppliance(userInput) {
    try {
      const response = await fetch(
        `${
          API_ENDPOINTS.BASE_URL
        }/api/conversation/appliances?search=${encodeURIComponent(userInput)}`
      );
      const result = await response.json();

      if (result.success && Object.keys(result.matches).length > 0) {
        return result.matches;
      }

      return null;
    } catch (error) {
      console.error("Appliance recognition failed:", error);
      return null;
    }
  }

  // 5. UTILITY METHODS
  updateContext(newContext) {
    this.context = {
      ...this.context,
      ...newContext,
    };
  }

  getHistory() {
    return this.conversationHistory;
  }

  clearConversation() {
    this.conversationHistory = [];
    this.context = {};
  }

  isCurrentlyListening() {
    return this.isListening;
  }

  // Utility: Convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default ConversationEngine;
