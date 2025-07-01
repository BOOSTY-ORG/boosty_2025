import React from "react";

const SolarMade = () => {
  return (
    <section className="py-[120px] px-[229px] grid grid-cols-2 items-center justify-between text-boostyBlack">
      <div>
        <img
          src="/image_1.svg"
          alt="Our hardware engineers working on your fix"
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold leading-10 w-[90%]">
          Solar Made Easy with Help From Our AI Assistant
        </h2>
        <p className="mt-4 text-[#3D3E3E] leading-6 font-semibold w-[90%]">
          We know going solar can feel confusing. That’s why we built a smart
          assistant to help you choose the right system, find payment options
          that work for you, and get installed, all in one place.
        </p>
      </div>
    </section>
  );
};

export default SolarMade;
