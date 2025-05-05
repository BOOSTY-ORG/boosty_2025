import React from "react";
import Footer from "../components/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <div>
        {/* Hero Section */}
        <div className="h-[290px] bg-boosty_yellow mt-0 lg:mt-[64px] grid grid-cols-1 lg:grid-cols-2 place-items-center place-content-center px-[20px] lg:px-[229px] py-[40px] lg:py-20 lg:pt-0">
          <div className="mt-2 lg:mt-20">
            <h1 className="text-body_text text-[40px] leading-tight lg:text-[45px] lg:leading-[50px] font-bold w-full">
              Terms and Conditions
            </h1>
            <p className="mt-5 w-[85%] font-[600]">
              Welcome to Boosty. These Terms and Conditions govern your access
              to and use of our website and services. By accessing or using our
              platform, you agree to be bound by these Terms. If you do not
              agree, please discontinue use immediately.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-[20px] lg:px-[229px] py-14 lg:py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <div>
            <h2 className="font-bold text-[30px]">Eligibility</h2>
            <p className="mt-2">To use Boosty’s services, you must:</p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Be at least 18 years old.</li>
              <li>
                Provide accurate and complete information during registration or
                form submission.
              </li>
              <li> Comply with applicable laws and regulations.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Services</h2>
            <p className="mt-2">
              Boosty facilitates partnerships and investment opportunities in
              renewable energy projects. We provide tools to connect partners,
              investors, and solar adopters. Our services include but are not
              limited to:
            </p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Facilitating financing for solar energy projects.</li>
              <li>Offering tools to estimate energy needs.</li>
              <li>Connecting partners with customers.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">User Obligations</h2>
            <p className="mt-2">Users must:</p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Use the platform responsibly and ethically.</li>
              <li>
                Not misuse or exploit the platform for fraudulent purposes.
              </li>
              <li>Provide accurate and up-to-date information.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Payment Terms</h2>
            <p className="mt-2">
              For users engaging in investment or financing activities:
            </p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>
                Payment schedules will be facilitated through third-party
                lending solutions or partners, as agreed upon in the specific
                terms of the partnership or investment agreement..
              </li>
              <li>
                Late payments may be subject to penalties or additional terms as
                determined by the third-party lending partners and outlined in
                individual agreements.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Intellectual Property</h2>
            <p className="mt-2">
              All content on the Boosty platform, including logos, text,
              graphics, and design, is owned by Boosty and protected by
              copyright laws. Users may not copy, modify, or distribute any part
              of the platform without prior consent.{" "}
            </p>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Limitation of Liability</h2>
            <p className="mt-2">Boosty will not be liable for:</p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>
                Any indirect, incidental, or consequential damages arising from
                your use of the platform.
              </li>
              <li>Losses due to third-party actions or external factors.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Termination</h2>
            <p className="mt-2">
              We reserve the right to terminate or suspend access to our
              services for violations of these Terms or any applicable laws.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Governing Law</h2>
            <p className="mt-2">
              These Terms are governed by the laws of Nigeria. Any disputes
              arising will be subject to the jurisdiction of the courts in
              Nigeria.
            </p>
          </div>
        </div>
      </div>
      <Footer hasFAQ={false} />
    </>
  );
};

export default TermsAndConditions;
