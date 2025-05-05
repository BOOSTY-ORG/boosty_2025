import React from "react";
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

const SolarAssistantApp = (props) => {
  // The view routing is handled within the context
  return (
    <SolarAssistantProvider>
      <AppContent {...props} />
    </SolarAssistantProvider>
  );
};

const AppContent = ({ buttonVariant }) => {
  // Import the hook from our context
  const { state } = useSolarAssistant();

  // Based on the current view in the state, render the appropriate component
  switch (state.view) {
    case "landing":
      return <LandingComponent variant={buttonVariant} />;
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
      return <LandingComponent variant={buttonVariant} />;
  }
};

export default SolarAssistantApp;
