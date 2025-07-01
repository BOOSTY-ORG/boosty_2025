import React from "react";
import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  return (
    <nav className="min-h-[65px] flex items-center justify-between px-[128px] py-4">
      <img src="/boosty_logo.svg" alt="Boosty's Company Logo" />

      <div className="space-x-[24px]">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          Home
        </Link>
        <Link
          to="/become-a-partner"
          className="hover:text-gray-600 transition-colors"
        >
          Become A Partner
        </Link>
        <Link
          to="/want-to-fund-solar-projects"
          className="hover:text-gray-600 transition-colors"
        >
          Want to fund solar projects?
        </Link>
      </div>

      <AuthButtons />
    </nav>
  );
};

export default Navbar;
