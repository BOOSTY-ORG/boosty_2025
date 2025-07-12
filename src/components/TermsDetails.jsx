import React from "react";

const TermsDetails = () => {
  return (
    <section className="px-6 lg:px-[230px] py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Eligibility</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            To use Boosty’s services, you must:
            <li>Be at least 18 years old.</li>
            <li>
              Provide accurate and complete information during registration or
              form submission
            </li>
            <li>Comply with applicable laws and regulations.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Services</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            Boosty facilitates partnerships and investment opportunities in
            renewable energy projects. We provide tools to connect partners,
            investors, and solar adopters. Our services include but are not
            limited to:
            <li className="mt-2">
              Facilitating financing for solar energy projects.
            </li>
            <li>Offering tools to estimate energy needs.</li>
            <li>Connecting partners with customers.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">User Obligations</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            Users must:
            <li>Use the platform responsibly and ethically.</li>
            <li>Not misuse or exploit the platform for fraudulent purposes.</li>
            <li>Provide accurate and up-to-date information.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Payment Terms</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            For users engaging in investment or financing activities:
            <li className="mt-2">
              Payment schedules will be facilitated through third-party lending
              solutions or partners, as agreed upon in the specific terms of the
              partnership or investment agreement.
            </li>
            <li>
              Late payments may be subject to penalties or additional terms as
              determined by the third-party lending partners and outlined in
              individual agreements.
            </li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Intellectual Property</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            All content on the Boosty platform, including logos, text, graphics,
            and design, is owned by Boosty and protected by copyright laws.
            Users may not copy, modify, or distribute any part of the platform
            without prior consent.
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Limitation of Liability</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            Boosty will not be liable for:
            <li className="mt-2">
              Any indirect, incidental, or consequential damages arising from
              your use of the platform.
            </li>
            <li>Losses due to third-party actions or external factors.</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-0 gap-8 mt-14">
        <div>
          <h2 className="text-3xl mb-4 font-bold">Termination</h2>
          <ul className="list-disc w-full lg:w-[85%]">
            We reserve the right to terminate or suspend access to our services
            for violations of these Terms or any applicable laws.
          </ul>
        </div>
        <div>
          <h2 className="text-3xl mb-4 font-bold">Governing Law</h2>
          <ul className="list-disc w-full lg:w-[85%] leading-6">
            These Terms are governed by the laws of Nigeria. Any disputes
            arising will be subject to the jurisdiction of the courts in
            Nigeria.
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TermsDetails;
