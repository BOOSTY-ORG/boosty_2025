import React from "react";
import { PiInstagramLogo, PiLinkedinLogo } from "react-icons/pi";
import { Link } from "react-router-dom";
import { getCurrentYear } from "../utils/getCurrentYear";

const Footer = () => {
  return (
    <footer className="min-h-max bg-boostyFooterBG text-boostyFooterTxt px-8 lg:px-[80px] py-[48px]">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 lg:gap-[80px] border-b-[0.5px] border-[#B78A16] pb-12">
        <div>
          <h3 className="text-xl font-bold leading-6">
            Subscribe to Newsletter
          </h3>
          <div className="relative w-full max-w-xs mt-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full h-12 px-4 py-3 border-2 border-[#CECDCD] rounded-lg placeholder:text-gray-400 placeholder:font-normal text-gray-700 focus:outline-none focus:border-[#CECDCD] bg-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <img src="/send.svg" alt="Join our newsletter" />
            </button>
          </div>
        </div>

        <div>
          <p className="font-bold text-xl leading-6 mb-6">Company</p>
          <div className="space-y-3 flex flex-col items-start justify-start font-semibold leading-6">
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              Solar Assistant
            </Link>
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              Become a Partner
            </Link>
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              Fund Solar Projects
            </Link>
          </div>
        </div>

        <div>
          <p className="font-bold text-xl leading-6 mb-6">Resources & Legal</p>
          <div className="space-y-3 flex flex-col items-start justify-start font-semibold leading-6">
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              FAQs
            </Link>
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              Terms & conditions
            </Link>
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="/"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <div>
          <p className="font-bold text-xl leading-6 mb-6">Contact Us</p>
          <div className="space-y-3 flex flex-col items-start justify-start font-semibold leading-6">
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="mailto:boostytech50@gmail.com"
            >
              boostytech50@gmail.com{" "}
            </Link>
            <Link
              className="hover:underline underline-offset-4 duration-300 transition-all ease-linear"
              to="tel:+23490888888"
            >
              +234 9088 8888
            </Link>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between pt-12">
        <img src="/footer_logo.svg" alt="" />

        <div className=" flex flex-col items-end justify-end gap-9">
          <div className="flex items-center justify-center gap-4">
            <PiLinkedinLogo
              size={25}
              className="hover:scale-[1.05] cursor-pointer duration-300 transition-all ease-in-out"
            />
            <PiInstagramLogo
              size={25}
              className="hover:scale-[1.05] cursor-pointer duration-300 transition-all ease-in-out"
            />
          </div>

          <p className="font-light text-sm">Boosty &copy; {getCurrentYear()}</p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
