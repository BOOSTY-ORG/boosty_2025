import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import React, { useState } from "react";

const FAQ = ({
  items = [],
  title = "Frequently Asked Questions",
  className = "",
}) => {
  // State to track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle function to open/close FAQ items
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className={` ${className}`}>
      <div className="px-[35px] md:pl-[108px] md:pr-[59px] lg:px-[229px] py-[80px] md:py-[96px] lg:py-[120px] flex items-start flex-col justify-center">
        <h2 className="text-[35px] font-[700] mb-10">{title}</h2>

        <div className="space-y-0 border border-[#374646] w-full lg:w-[90%] rounded-md">
          {items.map((item, index) => (
            <div
              key={index}
              className={`py-6 px-[20px] lg:px-12 ${
                index < items.length - 1 ? "border-b border-[#374646]" : ""
              }`}
            >
              <div
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left text-[#3D3E3E] leading-[24px] font-[600] cursor-pointer text-sm lg:text-base"
              >
                {item.question}
                <FaChevronUp
                  className={`h-5 w-5 transition-transform duration-400 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openIndex === index && (
                <div className="mt-2 text-gray-600 text-sm lg:text-base font-[700] transition-all duration-700 ease-in-out leading-[24px] w-full lg:w-[70%]">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
