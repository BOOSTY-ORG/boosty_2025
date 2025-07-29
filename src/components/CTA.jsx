import React from "react";
import AIAssistantCard from "./AiAssitant";

const CTA = () => {
  const showConsole = () => {
    console.log("CTA AI Assitant Clicked");
  };
  return (
    <section className="min-h-[392px] bg-boostyCTABG rounded-l-lg py-16 md:py-24 lg:py-[96px] pl-6 md:pl-[108px] lg:pl-[100px] pr-6 md:pr-[108px] lg:pr-[270px] shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center justify-center">
      <div>
        <h2 className="font-bold text-[40px] w-full lg:w-[75%]">
          Have more questions? The assistant can help you in seconds.
        </h2>
      </div>
      {/* <div className="min-w-screen lg:min-w-[460px] bg-white px-6 lg:px-[40px] py-[48px] rounded-2xl shadow-lg ">
        <div className="flex items-center justify-center gap-1 lg:gap-6">
          <img
            src="/boosty_eye.gif"
            alt="Boosty Watches Out For Yah!!!"
            className="w-11 sm:w-[59px] h-11 sm:h-[59px]"
          />

          <div className="bg-boostyBlack text-boostyYellow min-h-[44px] min-w-[296px] flex items-center justify-center gap-0 lg:gap-2 rounded-full">
            <img src="/soundwave.svg" alt="Interact with our AI" />
            <span className="text-lg font-bold leading-7 w-max">
              Talk to me, my friend
            </span>
          </div>
        </div>
      </div> */}
      <AIAssistantCard
        buttonText="Tap here to fill in your appliances"
        onStartTalking={() => {
          showConsole();
        }}
      />
    </section>
  );
};

export default CTA;
