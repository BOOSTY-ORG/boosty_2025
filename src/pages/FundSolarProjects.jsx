import React, { useState } from "react";
import FAQ from "../components/FAQ";
import Select from "react-select";
import Footer from "../components/Footer";

const interestAreaOptions = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

// Custom styles to match your design
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: "#A6A0A3",
    borderWidth: "1.5px",
    borderRadius: "8px",
    padding: "4px",
    fontSize: "16px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#A6A0A3",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#A6A0A3",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#202D2D",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "4px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#555" : "#333",
    color: "#F9C74F", // Yellow text color
    cursor: "pointer",
    padding: "10px",
    "&:hover": {
      backgroundColor: "#555",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#333",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#333",
    "&:hover": {
      color: "#333",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

const FundSolarProjects = () => {
  const [selectedInterestArea, setSelectedInterestArea] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };
  const fundFAQs = [
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
      <div className="">
        <div className="bg-[#F3B921E0] px-[20px] md:px-[72px] lg:px-[229px] py-[32px] md:py-[96px] lg:py-[120px] grid grid-cols-1 lg:grid-cols-2 place-items-center gap-[32px] lg:gap-[82px] text-body_text lg:h-max">
          <div className="w-full md:w-[70%] lg:w-full">
            <h1 className="font-bold text-[30px] lg:text-[40px] leading-tight">
              Join Us in <br /> Powering Nigeria
            </h1>

            <div className="space-y-4 mt-3 lg:mt-8 mb-0 lg:mb-8 w-full lg:w-[85%] font-[600]">
              <div className="flex gap-[1rem]">
                <div>
                  <p className="mt-2">
                    Fund clean energy adoption in Nigeria through Buy Now, Pay
                    Later (BNPL) solar financing, offering up to 20% annual
                    interest.
                  </p>
                </div>
              </div>
              <div className="flex gap-[1rem]">
                <div>
                  <p className="mt-2">
                    Your investment powers homes, businesses, and essential
                    services, creating meaningful social impact while generating
                    competitive financial returns.
                  </p>
                </div>
              </div>
              <div className="flex gap-[1rem]">
                <div>
                  <p className="mt-2">
                    For every $10,000 invested, you help reduce approximately
                    41,969 kg of CO2 emissions and save recipients around
                    $10,198 annually on fossil fuel and grid energy costs.
                  </p>
                </div>
              </div>

              <div>
                <img
                  src="/spcUniverseBlack.svg"
                  alt=""
                  className="w-[85px] h-[80px]"
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <form
              className="bg-white w-full lg:w-max shadow-lg px-[25px] lg:px-[40px] py-[45px] rounded-[24px]"
              action="submit"
            >
              <h1 className="text-[19px] lg:text-[25px] font-[700] mb-4">
                Submit Your Details and We Will <br /> Send an Email
              </h1>
              <div className="text-base font-[600] my-[10px]">
                <label>
                  Business Email <span className="text-[#B78A16]">*</span>
                </label>
              </div>
              <input
                className="mb-[20px] p-[10px] border-[1.5px] border-[#A6A0A3] rounded-[8px] w-full"
                type="text"
                placeholder="you@yourbusiness.com"
                required
              />
              <div className="flex flex-col md:flex-row gap-[1rem] w-full">
                <div className="w-full md:w-1/2">
                  <div className="text-base font-[600] my-[10px]">
                    <label>
                      First Name <span className="text-[#B78A16]">*</span>
                    </label>
                  </div>
                  <input
                    className="p-[10px] placeholder:text-sm lg:placeholder:text-base border-[1.5px] border-[#A6A0A3] rounded-[8px] w-full"
                    type="text"
                    placeholder="Investor"
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <div className="text-base font-[600] my-[10px]">
                    <label>
                      Last Name <span className="text-[#B78A16]">*</span>
                    </label>
                  </div>

                  <input
                    className="p-[10px] placeholder:text-sm lg:placeholder:text-base border-[1.5px] border-[#A6A0A3] rounded-[8px] w-full"
                    type="text"
                    placeholder="Brite"
                  />
                </div>
              </div>
              <div className="text-base font-[600] my-[10px] mt-[30px]">
                <label>Company Name</label>
              </div>
              <input
                className="p-[10px] placeholder:text-sm lg:placeholder:text-base border-[1.5px] border-[#A6A0A3] rounded-[8px] w-full"
                type="text"
                placeholder="Boosty"
                required
              />
              <div className="flex gap-[1rem] mb-10">
                <div className="w-full">
                  <div className="text-base font-[600] my-[10px] mt-[30px]">
                    <label>
                      Investment Interest Area{" "}
                      <span className="text-[#B78A16]">*</span>
                    </label>
                  </div>
                  <Select
                    value={selectedInterestArea}
                    onChange={setSelectedInterestArea}
                    options={interestAreaOptions}
                    styles={customStyles}
                    placeholder="Select..."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end w-full">
                <div>
                  <button
                    type="button"
                    className="px-[24px] h-[44px] text-boosty_yellow text-lg font-medium bg-body_text rounded-full hover:bg-boosty_green border border-boosty_green hover:border-boosty_yellow duration-150 transition-all ease-linear"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="py-[40px] md:py-[80px] pl-0 lg:pl-[128px]">
          <div className="bg-[#F3F8F8] rounded-l-[16px] shadow-md">
            <FAQ items={fundFAQs} />
          </div>
        </div>
      </div>

      <Footer hasFAQ={true} />
    </>
  );
};

export default FundSolarProjects;
