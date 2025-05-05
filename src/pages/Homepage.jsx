import React from "react";
import HeroSection from "../components/HeroSection";
import PowerNigeria from "../components/PowerNigeria";
import Calculation from "../components/Calculation";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import TalkAi from "../components/TalkAi";

const Homepage = () => {
  const solarFAQs = [
    {
      question: "Am I eligible for solar financing?",
      answer:
        "Eligibility is determined by the vetting process of our financial partners. Start by using the Solar Assistant and selecting the BNPL ('pay small-small') option to begin the process.",
    },
    {
      question: "How quickly can I get approved for financing?",
      answer:
        "Approvals typically take 1-3 business days once all required documents are submitted.",
    },
    {
      question: "Is Boosty available to residential?",
      answer: "Yes, Boosty serves both residential and commercial customers.",
    },
    {
      question: "How does the Energy Assistant work?",
      answer:
        "The Energy Assistant calculates your energy needs, recommends the right solar system, and helps you manage payments.",
    },
    {
      question: "Can I pay of my loan early?",
      answer: "Yes, you can pay off your loan early without any penalties.",
    },
    // More FAQ items...
  ];
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PowerNigeria />
      <Calculation />
      <FAQ items={solarFAQs} />
      <TalkAi />
      <Footer hasFAQ={true} />
    </div>
  );
};

export default Homepage;
