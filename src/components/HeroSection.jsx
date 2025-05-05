import React from "react";
import SolarAssistantApp from "./SolarAssistantApp";

const HeroSection = () => {
  return (
    <section className="bg-[#F3B921E0] px-[35px] md:px-[132px] lg:px-[229px] py-[80px] md:py-[96px] lg:py-[120px] mt-[10px] lg:mt-[80px] grid grid-cols-1 lg:grid-cols-2 place-items-center gap-[82px] text-body_text lg:h-[428px]">
      <div className="">
        <h1 className="text-[40px] font-[700] leading-tight">
          Need solar? Just talk to the AI assistant 👉🏾
        </h1>
        <p className="mt-[16px] leading-[24px] font-[600] text-[18px] w-[90%]">
          Say what you need. The assistant will help you choose a system, find
          payment options, and book your installation.
        </p>
      </div>

      <div id="solar-assistant" className="">
        <SolarAssistantApp buttonVariant="default" />
      </div>
    </section>
  );
};

export default HeroSection;
