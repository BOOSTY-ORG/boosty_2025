import React from "react";
import SolarAssistantApp from "./SolarAssistantApp";

const TalkAi = () => {
  return (
    <section className="pl-0 lg:pl-[128px] pb-[80px] lg:pb-[120px]">
      <div className="bg-[#F3F8F8] text-white rounded-l-0 lg:rounded-l-[16px] py-[80px] md:py-[96px] lg:py-[96px] pl-[35px] md:pl-[108px] lg:pl-[101px] pr-[35px] md:pr-[108px] grid grid-cols-1 lg:grid-cols-2 items-center h-max lg:h-[495px] gap-[20px] lg:gap-[82px]">
        <h2 className="text-body_text text-[30px] lg:text-[40px] font-[700] leading-[40px] lg:leading-[50px] w-[90%] lg:w-[80%]">
          Have more questions? The assistant can help you in seconds.
        </h2>
        <div className="flex items-center justify-center">
          <SolarAssistantApp buttonVariant="friendly" />
        </div>
      </div>
    </section>
  );
};

export default TalkAi;
