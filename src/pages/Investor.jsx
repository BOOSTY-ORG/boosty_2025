import React from "react";
import InvestorHero from "../components/InvestorHero";
import FAQ from "../components/FAQ";

const Investor = () => {
  const solarFAQs = [
    {
      question: "What is the ROI and payout period?",
      answer:
        "Eligibility is determined by the vetting process of our financial partners. Start by using the Solar Assistant and selecting the BNPL ('pay small-small') option to begin the process.",
    },
    {
      question: "How does Boosty ensure project success?",
      answer:
        "Approvals typically take 1-3 business days once all required documents are submitted.",
    },
    {
      question: "What risks exist, and how are they managed?",
      answer: "Yes, Boosty serves both residential and commercial customers.",
    },
    {
      question: "How can I track my investment?",
      answer:
        "The Energy Assistant calculates your energy needs, recommends the right solar system, and helps you manage payments.",
    },
    {
      question: "What if a customer defaults?",
      answer: "Yes, you can pay off your loan early without any penalties.",
    },
  ];
  return (
    <>
      <InvestorHero />
      <div className="pl-0 lg:pl-32 my-10 lg:my-20">
        <div
          className="bg-[#F3F8F8] flex items-center justify-start pl-6 pr-6 lg:pl-24 lg:pr-0 py-16 rounded-l-lg 
       shadow-none lg:shadow-md w-full"
        >
          <FAQ
            title="Frequently Asked Questions"
            titleClassName="font-bold mb-[18px] text-boostyBlack"
            faqs={solarFAQs}
            allowMultipleOpen={false}
            containerClassName="border border-boostyBlack bg-[#F3F8F8]"
          />
        </div>
      </div>
    </>
  );
};

export default Investor;
