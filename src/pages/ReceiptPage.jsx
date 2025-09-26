import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mic, MicOff } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useVoiceSettings } from "../context/VoiceSettingsContext";
import { API_ENDPOINTS } from "../config/api";
import {
  downloadReceiptImage,
  downloadReceiptPDF,
} from "../utils/receiptGenerator";

const ReceiptPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { settings, getVoiceConfig, getBestVoice } = useVoiceSettings();

  // Voice AI States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showVoiceUI, setShowVoiceUI] = useState(true);
  const [hasSpokenInitialMessage, setHasSpokenInitialMessage] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Data States
  const [recommendationData, setRecommendationData] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // References
  const synthRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    if (!synthRef.current) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadPageData();
  }, []);

  // Start initial voice message
  useEffect(() => {
    if (
      recommendationData &&
      !hasSpokenInitialMessage &&
      showVoiceUI &&
      !isMuted
    ) {
      setTimeout(() => {
        speakInitialMessage();
      }, 1000);
    }
  }, [recommendationData, hasSpokenInitialMessage, showVoiceUI, isMuted]);

  const loadPageData = () => {
    try {
      // Load recommendation data
      const savedRecommendation = localStorage.getItem(
        "boosty_recommendation_results"
      );
      if (savedRecommendation) {
        const parsedRecommendation = JSON.parse(savedRecommendation);
        setRecommendationData(parsedRecommendation);
      }

      // Load address data
      const savedAddress = localStorage.getItem("boosty_user_address");
      if (savedAddress) {
        const parsedAddress = JSON.parse(savedAddress);
        setUserAddress(parsedAddress);
      }

      // Generate order details
      const orderNumber = generateOrderNumber();
      const invoiceNumber = generateInvoiceNumber();
      const currentDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      setOrderDetails({
        orderNumber,
        invoiceNumber,
        dateCreated: currentDate,
        dateInitiated: currentDate,
      });
    } catch (error) {
      console.error("Failed to load page data:", error);
    }
  };

  const generateOrderNumber = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateInvoiceNumber = () => {
    const prefix = "BOOST";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const suffix = Math.floor(10 + Math.random() * 90);
    return `${prefix}${randomNum}A-${suffix}`;
  };

  const speakTextWithGoogleTTS = async (text) => {
    try {
      console.log("🎙️ Trying Google Cloud TTS...");

      const response = await fetch(API_ENDPOINTS.TTS_SPEAK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceType: settings.voiceType,
          gender: settings.gender,
          language: settings.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        currentAudioRef.current = audio;

        audio.onplay = () => {
          console.log("🎵 Google TTS speech started!");
        };

        audio.onended = () => {
          console.log("✅ Google TTS speech ended");
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onerror = (error) => {
          console.error("❌ Audio playback error:", error);
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          reject(error);
        };

        audio.onpause = () => {
          console.log("⏸️ Google TTS speech cancelled");
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.log("❌ Google TTS failed:", error.message);
      throw error;
    }
  };

  const speakTextWithWebSpeech = async (text) => {
    console.log("🔊 Using Web Speech API (free fallback)");

    if (!synthRef.current) {
      throw new Error("Web Speech API not available");
    }

    return new Promise((resolve) => {
      const naturalText = text
        .replace(/\./g, "... ")
        .replace(/,/g, ", ")
        .replace(/!/g, "! ")
        .replace(/\?/g, "? ");

      const utterance = new SpeechSynthesisUtterance(naturalText);
      const voiceConfig = getVoiceConfig();
      const bestVoice = getBestVoice();

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = volume;
      utterance.lang = voiceConfig.lang;

      utterance.onstart = () => {
        console.log("🔊 Web Speech started");
      };

      utterance.onend = () => {
        console.log("✅ Web Speech ended");
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("❌ Web Speech error:", error);
        resolve();
      };

      synthRef.current.cancel();
      setTimeout(() => {
        synthRef.current.speak(utterance);
      }, 100);
    });
  };

  const speakText = async (text) => {
    if (isMuted || !settings.voiceEnabled || !showVoiceUI) {
      console.log("🔇 Speech blocked - muted, disabled, or UI hidden");
      return Promise.resolve();
    }

    setIsSpeaking(true);

    try {
      try {
        await speakTextWithGoogleTTS(text);
        setIsSpeaking(false);
        return;
      } catch (error) {
        console.log("🔄 Google TTS failed, falling back to Web Speech API");
      }

      await speakTextWithWebSpeech(text);
      setIsSpeaking(false);
    } catch (error) {
      console.error("❌ All TTS methods failed:", error);
      setIsSpeaking(false);
    }
  };

  const speakInitialMessage = async () => {
    setHasSpokenInitialMessage(true);

    const message =
      settings.language === "Pidgin"
        ? "Congratulations! Your order don successfully place. We don assign you one dedicated solar panel specialist wey go contact you within the next 24 to 48 hours to schedule your installation. Please download your invoice for your records."
        : "Congratulations! Your order has been successfully placed. You've been assigned a dedicated solar panel specialist who will contact you within the next 24 to 48 hours to schedule your installation. Please download your invoice for your records.";

    await speakText(message);
  };

  const handleMicClick = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stop current speech when muting
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsSpeaking(false);
    }
  };

  const handleVoiceXClick = () => {
    // Stop any current speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);

    // Hide the voice UI
    setShowVoiceUI(false);
  };

  const handleTapToTalk = () => {
    setShowVoiceUI(true);
    setIsMuted(false);
  };

  const handleReceiptClose = () => {
    // Navigate back to home or wherever appropriate
    navigate("/");
  };

  const handleDownloadInvoice = async () => {
    // Change from downloadReceiptImage to downloadReceiptPDF
    const success = await downloadReceiptPDF(
      orderDetails,
      pricing,
      recommendation,
      userAddress
    );

    if (success) {
      console.log("✅ Receipt PDF downloaded successfully!");
    } else {
      console.error("❌ Receipt PDF download failed");

      // Fallback to image if PDF fails
      console.log("🔄 Trying image download as fallback...");
      const imageSuccess = await downloadReceiptImage(
        orderDetails,
        pricing,
        recommendation,
        userAddress
      );

      if (imageSuccess) {
        console.log("✅ Receipt image downloaded as fallback");
      } else {
        console.error("❌ Both PDF and image downloads failed");
      }
    }
  };

  if (!recommendationData || !orderDetails) {
    return (
      <div className="fixed inset-0 bg-yellow-400 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-boostyBlack border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { recommendation } = recommendationData;
  const { pricing } = recommendation;

  return (
    <div className="fixed inset-0 bg-yellow-400 overflow-x-hidden py-16">
      {/* Settings Button */}
      <button className="absolute top-6 right-6 w-10 h-10 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
        <img src="/settings.svg" alt="" className="w-7 h-7" />
      </button>

      {/* Tap to Talk Button - Only show when voice UI is hidden */}
      {!showVoiceUI && (
        <button
          onClick={handleTapToTalk}
          className="absolute top-6 left-6 bg-[#E8F2F2] border-[2px] border-[#374646] rounded-full min-w-[140px] h-[38px] px-4 py-2 text-lg flex items-center space-x-2 hover:bg-opacity-90 transition-all"
        >
          <img src="/tap.svg" alt="" />
          <span className="text-[#2B2D2C] font-semibold">Tap to talk</span>
        </button>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Voice Circle - Only show when voice UI is visible */}
        {showVoiceUI && (
          <div className="flex flex-col items-center mb-8">
            <div
              className={`relative bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                isSpeaking
                  ? "w-52 h-52 shadow-2xl scale-105"
                  : "w-48 h-48 shadow-lg scale-100"
              }`}
            >
              {/* Soundwave Bars */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((bar) => {
                  const baseHeight =
                    bar === 3 ? 8 : bar === 2 || bar === 4 ? 6 : 4;
                  const animatedHeight = isSpeaking
                    ? bar === 3
                      ? 12
                      : bar === 2 || bar === 4
                      ? 10
                      : 6
                    : baseHeight;

                  return (
                    <div
                      key={bar}
                      className={`w-2 bg-yellow-600 rounded-full transition-all duration-200 ${
                        isSpeaking ? "soundwave-animate" : ""
                      }`}
                      style={{
                        height: `${animatedHeight * 4}px`,
                        animationDelay: isSpeaking ? `${bar * 0.1}s` : "0s",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-6 mt-8">
              <button
                onClick={handleVoiceXClick}
                className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <X size={20} className="text-boostyBlack" />
              </button>

              <button
                onClick={handleMicClick}
                className="w-14 h-14 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                {isMuted ? (
                  <MicOff size={20} className="text-boostyBlack" />
                ) : (
                  <Mic size={20} className="text-boostyBlack" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={handleReceiptClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* Order Header */}
          <h2 className="text-xl font-bold text-[#2B2D2C] mb-6">
            Order #{orderDetails.orderNumber}
          </h2>

          {/* Pricing Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-[#3D3E3E]">Items + installation:</span>
              <span>₦{pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3D3E3E]">Total before tax:</span>
              <span>₦{pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3D3E3E]">Tax:</span>
              <span>₦{pricing.vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Order Total:</span>
              <span>₦{pricing.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Company & Address */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <p className="font-semibold text-[#2B2D2C]">Boosty Solar</p>
            {userAddress ? (
              <p className="text-sm text-[#3D3E3E]">
                {userAddress.fullAddress ||
                  `${userAddress.street}, ${userAddress.city}, ${userAddress.state}, ${userAddress.country}`}
              </p>
            ) : (
              <p className="text-sm text-[#3D3E3E]">
                888 Abundance Rd, Ikeja, Lagos, 11222
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-[#3D3E3E] mb-1">Date created</p>
              <p className="font-medium">{orderDetails.dateCreated}</p>
            </div>
            <div>
              <p className="text-[#3D3E3E] mb-1">Invoice number</p>
              <p className="font-medium">{orderDetails.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-[#3D3E3E] mb-1">Date initiated</p>
              <p className="font-medium">{orderDetails.dateInitiated}</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadInvoice}
              className="bg-[#202D2D] text-[#F3B921] px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors"
            >
              Download Invoice & Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Soundwave Animation Styles */}
      <style>{`
        @keyframes soundwave-bounce {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .soundwave-animate {
          animation: soundwave-bounce 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;
