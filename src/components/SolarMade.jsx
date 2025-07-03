import React from "react";

const SolarMade = () => {
  return (
    <section className="py-24 lg:py-[120px] px-5 md:px-[103px] lg:px-[229px] grid grid-cols-1 lg:grid-cols-2 items-center md:justify-center lg:justify-between text-boostyBlack gap-6 lg:gap-0">
      <div>
        <img
          src="/image_1.svg"
          alt="Our hardware engineers working on your fix"
          className="w-full lg:w-auto"
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold leading-10 w-full md:w-[90%]">
          Solar Made Easy with Help From Our AI Assistant
        </h2>
        <p className="mt-4 text-[#3D3E3E] leading-6 font-semibold w-full md:w-[95%]">
          We know going solar can feel confusing. That’s why we built a smart
          assistant to help you choose the right system, find payment options
          that work for you, and get installed, all in one place.
        </p>
      </div>
    </section>
  );
};

export default SolarMade;
