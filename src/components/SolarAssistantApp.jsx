import React, { useEffect } from "react";
import {
  SolarAssistantProvider,
  useSolarAssistant,
} from "../context/SolarAssistantContext";
import LandingComponent from "./LandingComponent";
import VoiceSelectionScreen from "./VoiceSelectionScreen";
import VoiceInterface from "./VoiceInterface";
import SystemSelectionScreen from "./SystemSelectionScreen";
import CheckoutScreen from "./CheckoutScreen";
import ReceiptScreen from "./ReceiptScreen";
import ApplianceForm from "./ApplianceForm";

const addScrollbarStyle = () => {
  const styleEl = document.createElement("style");
  styleEl.id = "scrollbar-style";
  styleEl.innerHTML = `
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;     /* Firefox */
    }
    
    .hide-scrollbar::-webkit-scrollbar {
      display: none;             /* Chrome, Safari, Opera */
    }
  `;
  document.head.appendChild(styleEl);
};

const SolarAssistantApp = (props) => {
  useEffect(() => {
    // Add the CSS style if it doesn't exist
    if (!document.getElementById("scrollbar-style")) {
      addScrollbarStyle();
    }

    // Apply the class to the body element
    document.body.classList.add("hide-scrollbar");

    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <SolarAssistantProvider>
      <AppContent {...props} />
    </SolarAssistantProvider>
  );
};

const AppContent = ({ buttonVariant }) => {
  const { state, actions } = useSolarAssistant();

  useEffect(() => {
    // Add the class to hide scrollbars
    document.body.classList.add("hide-scrollbar");

    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  // Special handling to go straight to voice interface from landing
  useEffect(() => {
    // If it's the landing view from local storage but we want to go straight to voice
    if (
      state.view === "landing" &&
      localStorage.getItem("solarAssistantInitialized") === "true"
    ) {
      actions.setView("voice");
    }
  }, []);

  // If landing component is clicked, set the initialized flag
  const handleInitialize = () => {
    localStorage.setItem("solarAssistantInitialized", "true");
  };

  switch (state.view) {
    case "landing":
      return (
        <LandingComponent
          variant={buttonVariant}
          onInitialize={handleInitialize}
        />
      );
    case "voiceSelection":
      return <VoiceSelectionScreen />;
    case "voice":
      return <VoiceInterface />;
    case "systemSelection":
      return <SystemSelectionScreen />;
    case "checkout":
      return <CheckoutScreen />;
    case "receipt":
      return <ReceiptScreen />;
    case "appliance":
      return <ApplianceForm />;
    default:
      return (
        <LandingComponent
          variant={buttonVariant}
          onInitialize={handleInitialize}
        />
      );
  }
};

export default SolarAssistantApp;
