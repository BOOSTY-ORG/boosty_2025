import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Individual FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full px-10 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-[#3D3E3E] font-semibold text-sm md:text-base pr-4">
          {question}
        </span>
        <div className="flex-shrink-0 ml-2">
          <div
            className={`transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronDown className="w-6 h-6 text-boostyBlack" />
          </div>
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="px-10 pb-4 pt-1 w-[880px] bg-gray-50">
          <div className="text-boostyBlack text-sm md:text-base font-bold leading-relaxed w-[60%]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main FAQ Component
const FAQ = ({
  title = "Frequently Asked Questions",
  faqs = [],
  allowMultipleOpen = false,
  className = "",
  titleClassName = "",
  containerClassName = "",
}) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);

    if (allowMultipleOpen) {
      // Allow multiple items to be open
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
    } else {
      // Only allow one item to be open at a time
      if (newOpenItems.has(index)) {
        newOpenItems.clear();
      } else {
        newOpenItems.clear();
        newOpenItems.add(index);
      }
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className={`rounded-lg ${className}`}>
      <div className={` ${titleClassName}`}>
        <h2 className="text-[30px] font-bold text-boostyBlack">{title}</h2>
      </div>
      <div className={`min-w-[880px] ${containerClassName}`}>
        <div className="divide-y divide-boostyBlack">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItems.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
