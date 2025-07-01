import React from "react";

const HomeHero = () => {
  return (
    <section className="bg-boostyYellow min-h-[428px] px-[229px] flex items-center justify-between gap-[82px]">
      <div>
        <h1 className="text-[40px] font-bold leading-[50px] text-[#2B2D2C]">
          Need solar? Just talk to the AI assistant 👉🏾
        </h1>
        <p className="text-lg font-semibold leading-6 mt-4 w-[90%]">
          Say what you need. The assistant will help you choose a system, find
          payment options, and book your installation.
        </p>
      </div>

      <div className="min-w-[460px] bg-white px-[40px] py-[48px] rounded-2xl shadow-lg ">
        <div className="flex items-center justify-center gap-6">
          <img
            src="/boosty_eye.gif"
            alt="Boosty Watches Out For Yah!!!"
            className="w-[59px] h-[59px]"
          />

          <div className="bg-boostyBlack text-boostyYellow min-h-[44px] min-w-[296px] flex items-center justify-center gap-2 rounded-full">
            <img src="/soundwave.svg" alt="Interact with our AI" />
            <span className="text-lg font-bold leading-7">
              Tap here to start talking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
