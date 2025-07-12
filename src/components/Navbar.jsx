import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Memoize the scroll handler to prevent recreation on every render
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    setIsScrolled(currentScrollY > 10); // Add border after 10px scroll
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 min-h-[65px] flex items-center justify-between px-7 sm:px-14 lg:px-28 py-4 bg-white transition-all duration-300 ${
        isScrolled ? "border-b border-gray-200 shadow-md" : ""
      }`}
    >
      {/* Logo - Always visible */}
      <img src="/boosty_logo.svg" alt="Boosty's Company Logo" />

      {/* Navigation Links - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:flex space-x-[24px]">
        <Link
          to="/"
          className={`hover:text-gray-600 transition-colors ${
            isActiveLink("/") ? "font-bold" : ""
          }`}
        >
          Home
        </Link>
        <Link
          to="/become-a-partner"
          className={`hover:text-gray-600 transition-colors ${
            isActiveLink("/become-a-partner") ? "font-bold" : ""
          }`}
        >
          Become A Partner
        </Link>
        <Link
          to="/want-to-fund-solar-projects"
          className={`hover:text-gray-600 transition-colors ${
            isActiveLink("/want-to-fund-solar-projects") ? "font-bold" : ""
          }`}
        >
          Want to fund solar projects?
        </Link>
      </div>

      {/* Auth Buttons - Always visible */}
      <AuthButtons scrollY={scrollY} />
    </nav>
  );
};

export default React.memo(Navbar);
