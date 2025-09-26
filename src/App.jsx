import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ClerkAuthProvider from "./providers/ClerkAuthProvider";
import { Provider } from "react-redux";
import { store } from "./store";
import Partnerpage from "./pages/Partnerpage";
import Investor from "./pages/Investor";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import VoiceAssistant from "./pages/VoiceAssistant";
import { useEffect } from "react";
import { VoiceSettingsProvider } from "./context/VoiceSettingsContext";
import VoiceSettings from "./pages/VoiceSettings";
import { RecommendationProvider } from "./context/RecommendationContext";
import RecommendationResults from "./pages/RecommendationResults";
import ErrorBoundary from "./components/ErrorBoundary";
import ReceiptPage from "./pages/ReceiptPage";

// Component that handles routing logic - INSIDE Router context
const AppContent = () => {
  const { pathname } = useLocation();

  function ScrollToTop() {
    useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, [pathname]);

    return null;
  }

  return (
    <>
      {pathname !== "/voice-assistant" &&
        pathname !== "/voice-settings" &&
        pathname !== "/recommendation-results" &&
        pathname !== "/receipt" && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/become-a-partner" element={<Partnerpage />} />
        <Route path="/want-to-fund-solar-projects" element={<Investor />} />
        <Route path="/terms-&-condition" element={<TermsAndConditionsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/voice-assistant" element={<VoiceAssistant />} />
        <Route path="/voice-settings" element={<VoiceSettings />} />
        <Route
          path="/recommendation-results"
          element={<RecommendationResults />}
        />
        <Route path="/receipt" element={<ReceiptPage />} />
      </Routes>
      {pathname !== "/voice-assistant" &&
        pathname !== "/voice-settings" &&
        pathname !== "/recommendation-results" &&
        pathname !== "/receipt" && <Footer />}
    </>
  );
};

// Main App component - provides Router context
const App = () => {
  return (
    <ErrorBoundary>
      <div className="overflow-x-hidden font-openSans">
        <Provider store={store}>
          <ClerkAuthProvider>
            <VoiceSettingsProvider>
              <RecommendationProvider>
                <Router>
                  <AppContent />
                </Router>
              </RecommendationProvider>
            </VoiceSettingsProvider>
          </ClerkAuthProvider>
        </Provider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
