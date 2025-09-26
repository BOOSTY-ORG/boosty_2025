import { API_ENDPOINTS } from "../config/api";

export class VoiceAssistantUtils {
  constructor(dependencies) {
    // Store all the dependencies we need from the component
    this.settings = dependencies.settings;
    this.synthRef = dependencies.synthRef;
    this.currentAudioRef = dependencies.currentAudioRef;
    this.timeoutRef = dependencies.timeoutRef;
    this.formCompleteTimer = dependencies.formCompleteTimer;
    this.conversation = dependencies.conversation;
    this.navigate = dependencies.navigate;
    this.getVoiceConfig = dependencies.getVoiceConfig;
    this.getBestVoice = dependencies.getBestVoice;
    this.getFieldGuidance = dependencies.getFieldGuidance;

    // State setters
    this.setIsSpeaking = dependencies.setIsSpeaking;
    this.setIsNavigating = dependencies.setIsNavigating;
    this.setIsNavigatingToSettings = dependencies.setIsNavigatingToSettings;
    this.setIsListening = dependencies.setIsListening;
    this.setHasPromptedSubmit = dependencies.setHasPromptedSubmit;
    this.setFormCompleteTimer = dependencies.setFormCompleteTimer;

    // State getters
    this.isNavigating = dependencies.isNavigating;
    this.volume = dependencies.volume;
    this.ttsStatus = dependencies.ttsStatus;
    this.setTtsStatus = dependencies.setTtsStatus;
  }

  // TTS Functions
  async speakTextWithGoogleTTS(text) {
    try {
      console.log("🎙️ Trying Google Cloud TTS...");

      const response = await fetch(API_ENDPOINTS.TTS_SPEAK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceType: this.settings.voiceType,
          gender: this.settings.gender,
          language: this.settings.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        if (this.isNavigating || !this.synthRef.current) {
          URL.revokeObjectURL(audioUrl);
          resolve();
          return;
        }

        const audio = new Audio(audioUrl);
        audio.volume = this.volume;
        this.currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (this.currentAudioRef.current === audio) {
            this.currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          if (this.currentAudioRef.current === audio) {
            this.currentAudioRef.current = null;
          }
          reject(error);
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.log("❌ Google TTS failed:", error.message);
      throw error;
    }
  }

  async speakTextWithWebSpeech(text) {
    console.log("🔊 Using Web Speech API (free fallback)");

    if (!this.synthRef.current) {
      throw new Error("Web Speech API not available");
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceConfig = this.getVoiceConfig();
      const bestVoice = this.getBestVoice();

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = this.volume;
      utterance.lang = voiceConfig.lang;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("❌ Web Speech error:", error);
        resolve(); // Don't fail, just resolve
      };

      if (this.synthRef.current) {
        this.synthRef.current.cancel();
        this.synthRef.current.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  async speakText(text, isMuted, voiceEnabled) {
    if (isMuted || !voiceEnabled || this.isNavigating) {
      return Promise.resolve();
    }

    this.setIsSpeaking(true);

    try {
      // Try Google TTS first, fallback to Web Speech
      if (this.ttsStatus !== "free") {
        try {
          await this.speakTextWithGoogleTTS(text);
          this.setIsSpeaking(false);
          return;
        } catch (error) {
          this.setTtsStatus("free");
        }
      }

      await this.speakTextWithWebSpeech(text);
      this.setIsSpeaking(false);
    } catch (error) {
      console.error("❌ All TTS methods failed:", error);
      this.setIsSpeaking(false);
    }
  }

  // Navigation Functions
  async handleExitClick() {
    console.log("🛑 Exiting to homepage...");

    this.setIsNavigating(true);
    this.setIsSpeaking(false);
    this.setIsListening(false);

    // Stop all audio
    if (this.synthRef.current) {
      this.synthRef.current.cancel();
    }
    if (this.currentAudioRef.current) {
      this.currentAudioRef.current.pause();
      this.currentAudioRef.current = null;
    }
    if (this.conversation && this.conversation.isCurrentlyListening()) {
      this.conversation.stopListening();
    }

    // Clean up timers
    if (this.timeoutRef.current) {
      clearTimeout(this.timeoutRef.current);
    }
    if (this.formCompleteTimer) {
      clearTimeout(this.formCompleteTimer);
      this.setFormCompleteTimer(null);
    }

    // Stop all audio elements
    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      audio.src = "";
    });

    // Wait a bit then navigate
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.navigate("/");
  }

  async navigateToVoiceSettings() {
    console.log("🔧 Opening voice settings...");

    this.setIsNavigatingToSettings(true);
    this.setIsNavigating(true);

    // Stop audio
    if (this.synthRef.current) {
      this.synthRef.current.cancel();
    }
    if (this.currentAudioRef.current) {
      this.currentAudioRef.current.pause();
      this.currentAudioRef.current = null;
    }

    // Wait then navigate
    await new Promise((resolve) => setTimeout(resolve, 400));
    this.navigate("/voice-settings");
  }

  // Form Helper Functions
  isFormComplete(applianceData) {
    return (
      applianceData.name.trim() !== "" && applianceData.wattage.trim() !== ""
    );
  }

  resetFormTimer(applianceData, currentPhase, promptFormSubmission) {
    if (this.formCompleteTimer) {
      clearTimeout(this.formCompleteTimer);
    }
    this.setHasPromptedSubmit(false);

    if (this.isFormComplete(applianceData) && currentPhase === "interactive") {
      const newTimer = setTimeout(() => {
        promptFormSubmission();
      }, 3000);
      this.setFormCompleteTimer(newTimer);
    }
  }

  async promptFormSubmission(hasPromptedSubmit, currentPhase, speakText) {
    if (hasPromptedSubmit || currentPhase !== "interactive") return;
    this.setHasPromptedSubmit(true);

    const promptText =
      this.settings.language === "Pidgin"
        ? "I see say you don fill all the important details. You wan submit am make I show you recommendations?"
        : "I see you've filled in all the essential details. Would you like to submit the form to see recommendations?";

    await speakText(promptText);
  }

  getFieldReadback(fieldName, value) {
    const { language } = this.settings;

    if (language === "Pidgin") {
      switch (fieldName) {
        case "name":
          return `You don write ${value} as your appliance name.`;
        case "quantity":
          return `You set the quantity to ${value} ${
            value === "1" ? "piece" : "pieces"
          }.`;
        case "dayHours":
          return `You don enter ${value} hours for day time usage.`;
        case "nightHours":
          return `You don enter ${value} hours for night time usage.`;
        case "wattage":
          return `You set the power consumption to ${value} watts.`;
        default:
          return `You don enter ${value} for this field.`;
      }
    } else {
      switch (fieldName) {
        case "name":
          return `You have entered ${value} as your appliance name.`;
        case "quantity":
          return `You have set the quantity to ${value} ${
            value === "1" ? "unit" : "units"
          }.`;
        case "dayHours":
          return `You've entered ${value} hours for daytime usage.`;
        case "nightHours":
          return `You've entered ${value} hours for nighttime usage.`;
        case "wattage":
          return `You've set the power consumption to ${value} watts.`;
        default:
          return `You have entered ${value} for this field.`;
      }
    }
  }

  async handleFieldFocus(
    fieldName,
    currentPhase,
    isSpeaking,
    applianceData,
    resetFormTimer,
    speakText
  ) {
    if (currentPhase !== "interactive" || isSpeaking) return;

    resetFormTimer();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fieldValue = applianceData[fieldName];
    let responseText;

    if (fieldValue && fieldValue.trim() !== "") {
      responseText = this.getFieldReadback(fieldName, fieldValue);
    } else {
      const baseGuidance = this.getFieldGuidance(fieldName);
      const conversationHint =
        this.settings.language === "Pidgin"
          ? " You fit also talk to me make I help you fill am."
          : " You can also speak to me and I'll help you fill it out.";
      responseText = baseGuidance + conversationHint;
    }

    await speakText(responseText);
  }

  async handleConfirmDetails(
    applianceData,
    submitAppliance,
    speakText,
    setShowError
  ) {
    setShowError(false);

    if (this.synthRef.current) {
      this.synthRef.current.cancel();
    }
    if (this.currentAudioRef.current) {
      this.currentAudioRef.current.pause();
      this.currentAudioRef.current = null;
    }
    this.setIsSpeaking(false);

    if (!applianceData.name || !applianceData.wattage) {
      const errorText =
        this.settings.language === "Pidgin"
          ? "Abeg make sure you write the appliance name and wattage before you confirm."
          : "Please make sure you enter the appliance name and wattage before confirming.";

      await speakText(errorText);
      return;
    }

    try {
      const result = await submitAppliance(applianceData);
      if (result) {
        this.navigate("/recommendation-results");
      }
    } catch (err) {
      console.error("Failed to get recommendations:", err);
      const errorText =
        this.settings.language === "Pidgin"
          ? "Sorry o, something happen when I dey try find your solar system. Make we try again."
          : "Sorry, something went wrong while finding your solar system. Please try again.";

      await speakText(errorText);
    }
  }

  // Speech Recognition Functions
  async startBasicSpeechRecognition() {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let hasResult = false;

      recognition.onresult = (event) => {
        hasResult = true;
        const transcript = event.results[0][0].transcript;
        resolve({ transcript: transcript.trim(), confidence: 85 });
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error("No speech detected"));
        }
      };

      recognition.start();

      // Auto-stop after 6 seconds
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
        }
      }, 6000);
    });
  }

  // UI Helper Functions
  getMicInstructions(
    currentPhase,
    pageReady,
    speechReady,
    isInConversationMode,
    isListening,
    isSpeaking,
    fallbackActive
  ) {
    if (currentPhase === "waiting" && pageReady && speechReady) {
      return "Click the mic when you're ready to begin";
    } else if (currentPhase === "interactive" && isInConversationMode) {
      if (isListening) {
        return fallbackActive
          ? "Listening... Basic voice help active"
          : "Listening... AI conversation active";
      } else if (isSpeaking) {
        return "Speaking... Click mic to mute";
      } else {
        const baseText = "Click mic to speak or ask questions";
        if (fallbackActive) {
          return `${baseText} (Basic assistant mode)`;
        }
        return baseText;
      }
    }
    return "";
  }

  // Update dependencies when component state changes
  updateDependencies(newDependencies) {
    Object.assign(this, newDependencies);
  }
}

// Export individual functions for easier importing
export const createVoiceAssistantUtils = (dependencies) => {
  return new VoiceAssistantUtils(dependencies);
};
