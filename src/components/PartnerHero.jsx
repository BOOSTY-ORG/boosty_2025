import React, { useState } from "react";
import { IoCheckmark } from "react-icons/io5";

const PartnerHero = () => {
  const [selectedRole, setSelectedRole] = useState("Retailer/Distributor");

  return (
    <div className="h-max bg-boostyYellow pt-4 lg:pt-16 pb-20 pl-6 lg:pl-[229px] pr-6 lg:pr-[136px] grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-32 justify-center">
      <div className="mt-10">
        <h1 className="text-[#2B2D2C] text-3xl lg:text-[40px] leading-10 font-bold pt-16">
          Who Can Become a Partner?
        </h1>
        <p className="pt-4 pb-8">
          Boosty partners with businesses and individuals dedicated to advancing
          solar energy in Nigeria. You can join us if you are:
        </p>
        <div className="space-y-8">
          <div className="flex items-start justify-center gap-6">
            <img src="/partner1.svg" alt="Fixed" />
            <div>
              <h3 className="leading-none mb-3 font-bold">Solar Manufacturers</h3>
              <p className="w-full lg:w-[70%]">
                Provide high-quality solar panels, inverters, or batteries to
                power homes and businesses.
              </p>
            </div>
          </div>
          <div className="flex items-start justify-center gap-6">
            <img src="/partner2.svg" alt="Fixed" />
            <div>
              <h3 className="leading-none mb-3 font-bold">Solar Retailers</h3>
              <p className="w-full lg:w-[70%]">
                Sell solar products online or in stores and want to integrate
                with Boosty.
              </p>
            </div>
          </div>
          <div className="flex items-start justify-center gap-6">
            <img src="/partner3.svg" alt="Fixed" />
            <div>
              <h3 className="leading-none mb-3 font-bold">Solar Installers</h3>
              <p className="w-full lg:w-[70%]">
                Offer professional installation services with a commitment to
                quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="w-full lg:w-[568px] bg-white rounded-3xl py-10 px-8 mt-16 shadow-lg">
          <h2 className="text-[25px] leading-9 lg:leading-6 w-[80%] font-bold mb-6">
            Submit Your Details and We Will Reach You
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
            <div className="flex flex-col lg:flex-row items-center justify-between gap-7">
              <div>
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
            {/* Radio Buttons */}
            <div className="pt-10">
              <label className="font-bold" htmlFor="business-email">
                Which one are you?
                <span className="font-bold text-[#B78A16]">*</span>
              </label>

              {/* Radio */}
              {/* Radio Options */}
              <div className="flex flex-col lg:flex-row flex-wrap gap-0 lg:gap-6">
                {/* Manufacturer Option */}
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="Manufacturer"
                      checked={selectedRole === "Manufacturer"}
                      onChange={() => setSelectedRole("Manufacturer")}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === "Manufacturer"
                          ? "border-[#374646] bg-[#374646]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedRole === "Manufacturer" && (
                        <IoCheckmark className="w-3 h-3 text-[#F3B921]" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700">Manufacturer</span>
                </label>

                {/* Installer Option */}
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="Installer"
                      checked={selectedRole === "Installer"}
                      onChange={() => setSelectedRole("Installer")}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === "Installer"
                          ? "border-[#374646] bg-[#374646]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedRole === "Installer" && (
                        <IoCheckmark className="w-3 h-3 text-[#F3B921]" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700">Installer</span>
                </label>

                {/* Retailer/Distributor Option */}
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="Retailer/Distributor"
                      checked={selectedRole === "Retailer/Distributor"}
                      onChange={() => setSelectedRole("Retailer/Distributor")}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === "Retailer/Distributor"
                          ? "border-[#374646] bg-[#374646]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedRole === "Retailer/Distributor" && (
                        <IoCheckmark className="w-3 h-3 text-[#F3B921]" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700">Retailer/Distributor</span>
                </label>
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
    </div>
  );
};

export default PartnerHero;
