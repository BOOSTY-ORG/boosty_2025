import React from "react";

const PowerNigeria = () => {
  return (
    <section className="py-[80px] md:py-[96px] lg:py-[120px] px-[35px] md:px-[108px] lg:px-[229px] grid grid-cols-1 lg:grid-cols-2 gap-[40px] lg:gap-[82px] place-items-center">
      <div className="">
        <img src="/powerSection.png" alt="Powering Nigeria" className="" />
      </div>
      <div className="">
        <h2 className="text-[30px] font-[700] leading-[40px] w-[95%]">
          Solar Made Easy with Help From Our AI Assistant
        </h2>
        <p className="mt-[16px] leading-[24px] font-[600] w-[95%]">
          We know going solar can feel confusing. That’s why we built a smart
          assistant to help you choose the right system, find payment options
          that work for you, and get installed, all in one place.
        </p>
      </div>
    </section>
  );
};

export default PowerNigeria;
