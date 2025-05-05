import React from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink, useLocation } from "react-router-dom";

const Footer = ({ hasFAQ = false }) => {
  const year = new Date().getFullYear();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <footer className="bg-[#374646] px-[20px] md:px-[35px] lg:px-[128px] py-14 text-boosty_yellow font-[700]">
      <div className="border-b-[0.5px] border-boosty_yellow pb-14 grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="pr-7">
          <h3>Subscribe to Newsletter</h3>
          <div className="mt-3 relative w-max">
            <input
              type="text"
              className="w-[253px] h-[44px] placeholder:text-[#A6A0A3] px-4 rounded-md focus:outline-none text-boosty_green"
              placeholder="Enter Your Email"
            />
            <div className="absolute right-3 top-[25%] bg-boosty_green h-6 w-6 flex items-center justify-center rounded-full cursor-pointer  hover:bg-boosty_green border border-boosty_green hover:border-boosty_yellow duration-150 transition-all ease-linear ">
              <img src="/arrow.svg" alt="" className="" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <span>Company</span>
          <ul className="space-y-3 font-normal">
            <li>
              {isHomePage ? (
                <ScrollLink
                  to="solar-assistant"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:underline underline-offset-4 duration-150 transition-all cursor-pointer"
                >
                  Solar Assistant
                </ScrollLink>
              ) : (
                <RouterLink
                  to="#solar-assistant"
                  className="hover:underline underline-offset-4 duration-150 transition-all"
                >
                  Solar Assistant
                </RouterLink>
              )}
            </li>
            <li>
              <a
                href="/"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Become a Partner
              </a>
            </li>
            <li>
              <a
                href="/fund-solar-projects"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Fund Solar Projects
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <span>Resources & Legal</span>
          <ul className="space-y-3 font-normal">
            {hasFAQ && (
              <li>
                <ScrollLink
                  to="faq"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:underline underline-offset-4 duration-150 transition-all cursor-pointer"
                >
                  FAQ
                </ScrollLink>
              </li>
            )}
            <li>
              <a
                href="/terms-and-conditions"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Terms & conditions
              </a>
            </li>
            <li>
              <a
                href="/privacy-policy"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <span>Contact Us</span>
          <ul className="space-y-3 font-normal">
            <li>
              <a
                href="mailto:boostytech50@gmail.com"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Email: boostytech50@gmail.com{" "}
              </a>
            </li>
            <li>
              <a
                href="tel:+234 9088 8888"
                className="hover:underline underline-offset-4 duration-150 transition-all"
              >
                Tel: +234 9088 8888
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-10 flex items-center justify-between">
        <img src="/spcUniverse.svg" alt="" />

        <div className="font-normal flex flex-col items-end">
          <div className="flex gap-2 mb-2">
            <FaLinkedin size={19} />
            <FaInstagram size={19} />
          </div>
          <span className="text-sm font-light">Boosty @ {year}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
