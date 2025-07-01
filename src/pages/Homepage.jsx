import React from "react";
import HomeHero from "../components/HomeHero";
import SolarMade from "../components/SolarMade";
import ThreeSteps from "../components/ThreeSteps";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";

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
      question: "Can I pay off my loan early?",
      answer: "Yes, you can pay off your loan early without any penalties.",
    },
  ];
  return (
    <section className="">
      <HomeHero />
      <SolarMade />
      <div className="pr-[128px]">
        <ThreeSteps />
      </div>
      <div className="py-[120px] px-[230px] flex items-center justify-start w-full">
        <FAQ
          title="Frequently Asked Questions"
          titleClassName="font-bold mb-[18px] text-boostyBlack"
          faqs={solarFAQs}
          allowMultipleOpen={false}
          containerClassName="border border-boostyBlack"
        />
      </div>
      <div className="pl-[128px] mb-[120px]">
        <CTA />
      </div>
    </section>
  );
};

export default Homepage;
