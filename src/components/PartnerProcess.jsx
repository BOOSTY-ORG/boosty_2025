import React from "react";

const PartnerProcess = () => {
  return (
    <div className="px-6 lg:px-[228px] py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center justify-center">
      <div>
        <img src="/processpartner.png" alt="" />
      </div>
      <div className="w-[85%]">
        <h2 className="font-bold leading-10 text-3xl">
          Process to Become a Partner
        </h2>
        <ul className="mt-4 list-disc pl-6 space-y-1">
          <li className="font-semibold">
            <span className="font-bold">Step 1: </span> Submit your business
            details using the partnership form.
          </li>
          <li className="font-semibold">
            <span className="font-bold">Step 2: </span> Our team will review
            your application and reach out.
          </li>
          <li className="font-semibold">
            <span className="font-bold">Step 3: </span> Onboarding and
            integration with Boosty’s platform.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PartnerProcess;
