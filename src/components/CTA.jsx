import React from "react";

const CTA = () => {
  return (
    <section className="min-h-[392px] bg-boostyCTABG rounded-l-lg py-[96px] pl-[100px] pr-[270px] shadow-sm grid grid-cols-2 items-center justify-center">
      <div>
        <h2 className="font-bold text-[40px] w-[75%]">
          Have more questions? The assistant can help you in seconds.
        </h2>
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
              Talk to me, my friend
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
