import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Homepage from "./pages/Homepage";
import Header from "./components/Header";
import BecomeAPartner from "./pages/BecomeAPartner";
import FundSolarProjects from "./pages/FundSolarProjects";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { SolarAssistantProvider } from "./context/SolarAssistantContext";

const App = () => {
  return (
    <div className="font-openSans overflow-x-hidden">
      <SolarAssistantProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/become-a-partner" element={<BecomeAPartner />} />
            <Route
              path="/fund-solar-projects"
              element={<FundSolarProjects />}
            />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </Router>
      </SolarAssistantProvider>
    </div>
  );
};

export default App;
