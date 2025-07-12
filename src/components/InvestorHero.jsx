import React from "react";

const InvestorHero = () => {
  // Sample data for dropdown options
  const investmentOptions = [
    "Home Solar Projects",
    "Commercial Solar Projects",
    "Solar Farm Development",
    "Battery Storage Systems",
    "Wind Energy Projects",
    "Hydroelectric Projects",
    "Green Building Development",
    "Electric Vehicle Infrastructure",
    "Smart Grid Technology",
    "Energy Efficiency Retrofits",
  ];

  return (
    <section className="h-max bg-boostyYellow pt-4 lg:pt-16 pb-20 px-6 lg:px-[229px] grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-32 justify-center">
      {/* Word */}
      <div className="mt-0 lg:mt-10 w-full lg:w-[80%] pt-3 lg:pt-12">
        <h1 className="text-[#2B2D2C] text-3xl lg:text-[40px] leading-[40px] lg:leading-[50px] font-bold pt-16">
          Join Us in Powering Nigeria
        </h1>
        <div className="space-y-3 mt-3 text-[#2B2D2C] font-semibold">
          <p>
            Fund clean energy adoption in Nigeria through Buy Now, Pay Later
            (BNPL) solar financing, offering up to 20% annual interest.
          </p>
          <p>
            Your investment powers homes, businesses, and essential services,
            creating meaningful social impact while generating competitive
            financial returns.
          </p>
          <p>
            For every $10,000 invested, you help reduce approximately 41,969 kg
            of CO2 emissions and save recipients around $10,198 annually on
            fossil fuel and grid energy costs.
          </p>
        </div>

        <img src="/spc_investor.svg" alt="company icon" className="mt-8" />
      </div>
      {/* Form */}
      <div>
        <div className="w-full lg:w-[568px] bg-white rounded-3xl py-10 px-8 mt-16 shadow-lg">
          <h2 className="text-[25px] leading-9 w-[80%] font-bold mb-6">
            Submit Your Details and We Will Send an Email
          </h2>

          <form className="space-y-6">
            {/* Business Email */}
            <div>
              <label className="font-bold" htmlFor="business-email">
                Business Email
                <span className="font-bold text-[#B78A16]">*</span>
              </label>
              <input
                type="email"
                placeholder="you@yourbusiness.com"
                className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
              />
            </div>
            {/* First Name & Last Name */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-7">
              <div>
                <label className="font-bold" htmlFor="business-email">
                  First Name
                  <span className="font-bold text-[#B78A16]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
                />
              </div>
              <div>
                <label className="font-bold" htmlFor="business-email">
                  Last Name
                  <span className="font-bold text-[#B78A16]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
                />
              </div>
            </div>
            {/* Company Name */}
            <div>
              <label className="font-bold" htmlFor="business-email">
                Company Name
              </label>
              <input
                type="text"
                placeholder="boosty"
                className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
              />
            </div>
            {/* Job Title */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-7 w-full">
              <div className="w-full">
                <label className="font-bold" htmlFor="business-email">
                  Job Title
                  <span className="font-bold text-[#B78A16]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Manager"
                  className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
                />
              </div>
              <div>
                <label className="font-bold" htmlFor="business-email">
                  Phone Number
                  <span className="font-bold text-[#B78A16]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+234 8833 4488"
                  className="border border-[#A6A0A3] w-full h-11 mt-1 py-3 px-4 rounded-md placeholder:text-[#3D3E3E]/70"
                />
              </div>
            </div>
            {/* // The dropdown input JSX */}
            <div className="w-full">
              <label className="block font-bold mb-2">
                Investment Interest Area
                <span className="text-[#B78A16]">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Home Solar Projects
                  </option>
                  {investmentOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex items-center justify-end ">
              <button className="bg-[#202D2D] text-[#F3B921] w-[106px] h-11 rounded-full">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InvestorHero;
