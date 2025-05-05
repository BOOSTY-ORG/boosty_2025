import React from "react";
import Footer from "../components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <div>
        {/* Hero Section */}
        <div className="h-[290px] bg-boosty_yellow mt-0 lg:mt-[64px] grid grid-cols-1 lg:grid-cols-2 place-items-center place-content-center px-[20px] md:px-[109px] lg:px-[229px] py-[40px] lg:py-20 lg:pt-0">
          <div className="mt-2 lg:mt-20">
            <h1 className="text-body_text text-[40px] leading-tight lg:text-[45px] lg:leading-[50px] font-bold w-full">
              Privacy Policy
            </h1>
            <p className="mt-5 w-[85%] font-[600]">
              Boosty values your privacy. This Privacy Policy outlines how we
              collect, use, and protect your information when you use our
              website and services.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-[20px] md:px-[109px] lg:px-[229px] py-14 lg:py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <div>
            <h2 className="font-bold text-[30px]">Information We Collect</h2>
            <p className="mt-2">
              We may collect the following types of information:
            </p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>
                Personal Information: Name, email address, phone number, and
                business details.
              </li>
              <li>
                Usage Data: Information on how you interact with our website,
                including cookies and analytics data.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">
              How We Use Your Information
            </h2>
            <p className="mt-2">Your information is used to:</p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Provide and improve our services.</li>
              <li>Process partnership or investment inquiries.</li>
              <li>Communicate updates and promotional offers.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Sharing Your Information</h2>
            <p className="mt-2">
              We may share your information with third parties:
            </p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>To comply with legal obligations.</li>
              <li>With trusted partners to deliver services.</li>
              <li>In cases of business transfers or mergers.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Data Protection</h2>
            <p className="mt-2">
              We implement industry-standard measures to secure your data,
              including:
            </p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Encryption and secure storage.</li>
              <li>Regular monitoring for vulnerabilities.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Your Rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="pl-4 list-disc mt-2 space-y-3">
              <li>Access and review your personal data.</li>
              <li>Request corrections to inaccurate information.</li>
              <li>Opt-out of marketing communications.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Cookies</h2>
            <p className="mt-2">
              Our website uses cookies to enhance user experience. By using the
              site, you consent to our use of cookies. You can disable cookies
              in your browser settings.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-[30px]">Changes to this Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy periodically. Users will be
              notified of significant changes via email or website updates
            </p>
          </div>
        </div>
      </div>
      <Footer hasFAQ={false} />
    </>
  );
};

export default PrivacyPolicy;
