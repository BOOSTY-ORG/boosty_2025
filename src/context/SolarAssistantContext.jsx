import React, { createContext, useContext, useReducer, useEffect } from "react";

// Initial state for the Solar Assistant application
const initialState = {
  view: localStorage.getItem("solarAssistantView") || "landing",
  language: localStorage.getItem("solarAssistantLanguage") || "english",
  selectedVoice: localStorage.getItem("solarAssistantVoice") || "bright",
  isListening: false,
  transcript: "",
  orderDetails: {
    items: [],
    address: {
      name: "Brite Solari",
      street: "888 Abundance Rd",
      city: "Ikeja",
      state: "Lagos",
      zipCode: "111222",
    },
    totalBeforeTax: 0, // Will be updated from API recommendation
    tax: 0, // Will be calculated based on recommendation
    orderTotal: 0, // Will be updated from API recommendation
    paymentMethod: null,
    invoiceNumber: "", // Will be generated when order is placed
    orderNumber: "", // Will be generated when order is placed
    dateCreated: "", // Will be set when order is created
    datePaid: "", // Will be set when payment is made
  },
  selectedSystem: null, // Will store the API response recommendation
  appliances: [],
  recognitionSupported: false,
  lastComponent: localStorage.getItem("lastComponent") || "landing", // For persistence
};

// Action types
const ActionTypes = {
  SET_VIEW: "SET_VIEW",
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_VOICE: "SET_VOICE",
  SET_LISTENING: "SET_LISTENING",
  SET_TRANSCRIPT: "SET_TRANSCRIPT",
  UPDATE_ORDER_DETAILS: "UPDATE_ORDER_DETAILS",
  SET_SELECTED_SYSTEM: "SET_SELECTED_SYSTEM",
  ADD_APPLIANCE: "ADD_APPLIANCE",
  UPDATE_APPLIANCE: "UPDATE_APPLIANCE",
  REMOVE_APPLIANCE: "REMOVE_APPLIANCE",
  UPDATE_PRODUCT_QUANTITY: "UPDATE_PRODUCT_QUANTITY",
  SET_RECOGNITION_SUPPORTED: "SET_RECOGNITION_SUPPORTED",
  SET_LAST_COMPONENT: "SET_LAST_COMPONENT",
};

// Reducer function to handle state updates
const solarAssistantReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_VIEW:
      localStorage.setItem("solarAssistantView", action.payload);
      return { ...state, view: action.payload };
    case ActionTypes.SET_LANGUAGE:
      localStorage.setItem("solarAssistantLanguage", action.payload);
      return { ...state, language: action.payload };
    case ActionTypes.SET_VOICE:
      localStorage.setItem("solarAssistantVoice", action.payload);
      return { ...state, selectedVoice: action.payload };
    case ActionTypes.SET_LISTENING:
      return { ...state, isListening: action.payload };
    case ActionTypes.SET_TRANSCRIPT:
      return { ...state, transcript: action.payload };
    case ActionTypes.UPDATE_ORDER_DETAILS:
      return {
        ...state,
        orderDetails: { ...state.orderDetails, ...action.payload },
      };
    case ActionTypes.SET_SELECTED_SYSTEM:
      return { ...state, selectedSystem: action.payload };
    case ActionTypes.ADD_APPLIANCE:
      return {
        ...state,
        appliances: [...state.appliances, action.payload],
      };
    case ActionTypes.SET_APPLIANCES:
      return { ...state, appliances: action.payload };
    case ActionTypes.UPDATE_APPLIANCE:
      return {
        ...state,
        appliances: state.appliances.map((appliance) =>
          appliance.id === action.payload.id
            ? { ...appliance, ...action.payload.data }
            : appliance
        ),
      };
    case ActionTypes.REMOVE_APPLIANCE:
      return {
        ...state,
        appliances: state.appliances.filter(
          (appliance) => appliance.id !== action.payload
        ),
      };
    case ActionTypes.UPDATE_PRODUCT_QUANTITY:
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id
            ? { ...product, quantity: action.payload.quantity }
            : product
        ),
      };
    case ActionTypes.SET_RECOGNITION_SUPPORTED:
      return { ...state, recognitionSupported: action.payload };
    case ActionTypes.SET_LAST_COMPONENT:
      localStorage.setItem("lastComponent", action.payload);
      return { ...state, lastComponent: action.payload };

    default:
      return state;
  }
};

// Create the context
const SolarAssistantContext = createContext();

// Provider component
export const SolarAssistantProvider = ({ children }) => {
  const [state, dispatch] = useReducer(solarAssistantReducer, initialState);

  // Check if speech recognition is supported on mount
  useEffect(() => {
    const isSpeechRecognitionSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

    dispatch({
      type: ActionTypes.SET_RECOGNITION_SUPPORTED,
      payload: isSpeechRecognitionSupported,
    });
  }, []);

  // Actions
  const actions = {
    setView: (view) => dispatch({ type: ActionTypes.SET_VIEW, payload: view }),

    setLanguage: (language) =>
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: language }),

    setVoice: (voice) =>
      dispatch({ type: ActionTypes.SET_VOICE, payload: voice }),

    setListening: (isListening) =>
      dispatch({ type: ActionTypes.SET_LISTENING, payload: isListening }),

    setTranscript: (transcript) =>
      dispatch({ type: ActionTypes.SET_TRANSCRIPT, payload: transcript }),

    updateOrderDetails: (details) =>
      dispatch({ type: ActionTypes.UPDATE_ORDER_DETAILS, payload: details }),

    setSelectedSystem: (system) =>
      dispatch({ type: ActionTypes.SET_SELECTED_SYSTEM, payload: system }),

    addAppliance: (appliance) =>
      dispatch({ type: ActionTypes.ADD_APPLIANCE, payload: appliance }),

    updateAppliance: (id, data) =>
      dispatch({ type: ActionTypes.UPDATE_APPLIANCE, payload: { id, data } }),

    removeAppliance: (id) =>
      dispatch({ type: ActionTypes.REMOVE_APPLIANCE, payload: id }),

    updateProductQuantity: (id, quantity) =>
      dispatch({
        type: ActionTypes.UPDATE_PRODUCT_QUANTITY,
        payload: { id, quantity },
      }),
    setLastComponent: (component) => {
      dispatch({ type: ActionTypes.SET_LAST_COMPONENT, payload: component });
    },
    setAppliances: (appliances) =>
      dispatch({ type: ActionTypes.SET_APPLIANCES, payload: appliances }),
  };

  // Translations based on the selected language
  const translations = {
    english: {
      welcomeMessage: "What do you want to use Solar for?",
      confirmButton: "Confirm details",
      chooseVoice: "Choose a voice",
      done: "Done",
      cancel: "Cancel",
      orderSummary: "Order Summary",
      itemsInstallation: "Items + installation:",
      totalBeforeTax: "Total before Tax:",
      tax: "Tax(7.5%):",
      orderTotal: "Order Total:",
      address: "Address",
      paymentMethod: "Payment Method",
      reviewItems: "Review Items",
      placeOrder: "Place Order",
      continueApplication: "Continue to Application",
      tapHereToTalk: "Tap here to start talking",
      addDebitCard: "Add a debit card",
      paySmallSmall: "Pay small-small",
      change: "Change",
      recalculate: "Recalculate",
      warranty: "year warranty",
      quantity: "Qty",
      installationMessage:
        "Your installation will be in 1 - 2 weeks max. Available dates will be sent to your email.",
      applyFinancing: "Apply for financing with our partner.",
      downloadInvoice: "Download Invoice & Receipt",
    },
    pidgin: {
      welcomeMessage: "Wetin you wan use Solar do?",
      confirmButton: "Confam details",
      chooseVoice: "Choose voice",
      done: "Done",
      cancel: "Cancel",
      orderSummary: "Order Summary",
      itemsInstallation: "Items + installation:",
      totalBeforeTax: "Total before Tax:",
      tax: "Tax(7.5%):",
      orderTotal: "Order Total:",
      address: "Address",
      paymentMethod: "How you wan Pay",
      reviewItems: "Check your Items",
      placeOrder: "Buy Now",
      continueApplication: "Continue to Application",
      tapHereToTalk: "Tap here make you talk",
      addDebitCard: "Add your card",
      paySmallSmall: "Pay small-small",
      change: "Change",
      recalculate: "Calculate again",
      warranty: "year warranty",
      quantity: "Qty",
      installationMessage:
        "We go install am for 1 - 2 weeks time. We go send you email with the dates.",
      applyFinancing: "Make you apply for money from our people wey dey help.",
      downloadInvoice: "Download Invoice & Receipt",
    },
  };

  return (
    <SolarAssistantContext.Provider
      value={{
        state,
        actions,
        t: translations[state.language],
      }}
    >
      {children}
    </SolarAssistantContext.Provider>
  );
};

// Custom hook to use the Solar Assistant context
export const useSolarAssistant = () => {
  const context = useContext(SolarAssistantContext);
  if (!context) {
    throw new Error(
      "useSolarAssistant must be used within a SolarAssistantProvider"
    );
  }
  return context;
};
