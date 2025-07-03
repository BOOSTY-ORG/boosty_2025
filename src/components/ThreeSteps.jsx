import React from "react";

const ThreeSteps = () => {
  return (
    <section className="bg-boostyFooterBG min-h-max lg:min-h-[495px] rounded-l-3xl lg:rounded-l-none rounded-r-none lg:rounded-r-xl text-white py-[96px] pr-8 md:pr-[59px] lg:pr-[102px] pl-8 md:pl-[108px] lg:pl-[230px] flex flex-col lg:flex-row items-start lg:items-center justify-between">
      <div>
        <h3 className="text-3xl capitalize leading-10 font-bold">
          From Calculation to Installation in 3 Simple Steps
        </h3>
        <div>
          <button className="capitalize font-bold leading-6 bg-boostyLightGray text-boostyBlack px-6 py-3 min-w-[237px] min-h-[44px] rounded-full mt-6">
            Start your journey now
          </button>
        </div>
      </div>

      <div className="border border-[#769090] rounded-md p-6 lg:p-[47px] space-y-[32px] mt-8 lg:mt-0 w-full lg:w-auto">
        <div className="flex items-center gap-4">
          <img src="/star_1.svg" alt="Step 1" />
          <p className="font-semibold leading-6 w-[80%]">
            Talk to the assistant about your energy needs.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <img src="/start_2.svg" alt="Step 1" />
          <p className="font-semibold leading-6 w-[80%]">
            Get a custom solar setup with payment options.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <img src="/star_3.svg" alt="Step 1" />
          <p className="font-semibold leading-6 w-[75%]">
            We handle the installation from start to finish. <i>No stress</i>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ThreeSteps;
