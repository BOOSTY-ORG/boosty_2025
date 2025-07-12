import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import { scrollToTopOnPageLoad } from "./utils/scrollToTop";
import { useEffect } from "react";

const App = () => {
  function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
      // Smooth scroll for better UX
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, [pathname]); // Triggers every time route changes

    return null;
  }
  return (
    <div className="overflow-x-hidden font-openSans">
      <Provider store={store}>
        <ClerkAuthProvider>
          <Router>
            <Navbar />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/become-a-partner" element={<Partnerpage />} />
              <Route
                path="/want-to-fund-solar-projects"
                element={<Investor />}
              />
              <Route
                path="/terms-&-condition"
                element={<TermsAndConditionsPage />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            </Routes>
            <Footer />
          </Router>
        </ClerkAuthProvider>
      </Provider>
    </div>
  );
};

export default App;
