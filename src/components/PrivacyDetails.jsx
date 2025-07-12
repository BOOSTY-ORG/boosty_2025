import React from "react";

const PrivacyDetails = () => {
  return (
    <section className="px-6 lg:px-[230px] py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Information We Collect</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            We may collect the following types of information:
            <li>
              Personal Information: Name, email address, phone number, and
              business details.
            </li>
            <li>
              Usage Data: Information on how you interact with our website,
              including cookies and analytics data
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">
            How We Use Your Information
          </h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            Your information is used to:
            <li className="mt-2">Provide and improve our services.</li>
            <li>Process partnership or investment inquiries.</li>
            <li>Communicate updates and promotional offers.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Sharing Your Information</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            We may share your information with third parties:
            <li>To comply with legal obligations</li>
            <li>With trusted partners to deliver services.</li>
            <li>In cases of business transfers or mergers.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Data Protection</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            We implement industry-standard measures to secure your data,
            including:
            <li className="mt-2">Encryption and secure storage.</li>
            <li>Regular monitoring for vulnerabilities.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Your Rights</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            You have the right to:
            <li className="mt-2">Access and review your personal data.</li>
            <li>Request corrections to inaccurate information.</li>
            <li>Opt-out of marketing communications.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Cookies</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            Our website uses cookies to enhance user experience. By using the
            site, you consent to our use of cookies. You can disable cookies in
            your browser settings.
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Changes to this Policy</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            We may update this Privacy Policy periodically. Users will be
            notified of significant changes via email or website updates
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PrivacyDetails;
