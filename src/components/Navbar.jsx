import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 min-h-[65px] flex items-center justify-between px-7 sm:px-14 lg:px-32 py-4 bg-white transition-all duration-300 ${
        isScrolled ? "border-b border-gray-200 shadow-md" : ""
      }`}
    >
      {/* Logo - Always visible */}
      <img src="/boosty_logo.svg" alt="Boosty's Company Logo" />

      {/* Navigation Links - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:flex space-x-[24px]">
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

      {/* Auth Buttons - Always visible */}
      <AuthButtons scrollY={scrollY} />
    </nav>
  );
};

export default React.memo(Navbar);
