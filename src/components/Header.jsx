import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Mobile Header - Always visible */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm px-[35px] py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="w-1/3">
            <img src="/boostylogo.svg" alt="Boosty" className="h-8 w-[98px]" />
          </Link>

          <div className="w-1/3 flex justify-center">
            <button
              onClick={toggleMenu}
              className="px-4 py-2 relative z-50 text-[#202D2D] text-[15px] font-bold"
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              Menu
            </button>
          </div>

          <div className="w-1/3 flex justify-end">
            <Link
              to="/cart"
              className="relative z-50 flex items-center justify-center gap-1"
            >
              <img src="/boostyCart.svg" alt="" className="w-[28px] h-[28px]" />
              <span className="text-black text-[15px] font-bold">Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Menu Overlay - Animated */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingTop: "60px" }} // Add space for the header
      >
        <div className="flex flex-col w-full h-full">
          {/* Menu Items - Animated with staggered entrance */}
          <div className="flex flex-col px-6 py-8 space-y-6">
            {[
              { path: "/", label: "Home" },
              { path: "/become-a-partner", label: "Become a partner" },
              {
                path: "/fund-solar-projects",
                label: "Want to fund solar projects?",
              },
              {
                path: "/sign-in",
                label: "Sign In",
                className: "pt-6 border-t border-yellow-400",
              }, // Modified this line
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-all duration-500 transform ${
                  menuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-10 opacity-0"
                } ${isActive(item.path) ? "font-bold" : "font-normal"} ${
                  item.className || ""
                }`}
                style={{ transitionDelay: `${index * 100 + 100}ms` }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Additional menu content if needed */}
          <div
            className={`mt-auto p-6 border-t border-gray-100 transition-opacity duration-500 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <p className="text-gray-500">
              Powering Nigeria, One Solar System at a Time
            </p>
          </div>
        </div>
      </div>

      {/* Add padding to main content for fixed header */}
      <div style={{ paddingTop: "60px" }}></div>
    </>
  );
};

// You can use this conditional render approach in your main layout
const Header = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return mobile or desktop header based on screen size
  return isMobile ? <MobileHeader /> : <DesktopHeader />;
};

// Your existing desktop header
const DesktopHeader = () => {
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="h-[65px] flex items-center justify-center px-32 py-10 shadow-lg shadow-black/5 ipad:px-16 fixed top-0 left-0 w-full bg-white z-50">
      <nav className="flex items-center justify-between w-full">
        <img src="/boostylogo.svg" alt="Boosty" />
        <ul className="flex items-center justify-center gap-10 w-[65%]">
          <li>
            <Link
              to="/"
              className={
                isActive("/")
                  ? "font-bold"
                  : "font-normal hover:font-medium duration-200 transition-all ease-linear"
              }
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/become-a-partner"
              className={
                isActive("/become-a-partner")
                  ? "font-bold"
                  : "font-normal hover:font-medium duration-200 transition-all ease-linear"
              }
            >
              Become a partner
            </Link>
          </li>
          <li>
            <Link
              to="/fund-solar-projects"
              className={
                isActive("/fund-solar-projects")
                  ? "font-bold"
                  : "font-normal hover:font-medium duration-200 transition-all ease-linear"
              }
            >
              Want to fund solar projects?
            </Link>
          </li>
        </ul>
        <button className="w-max h-[36px] px-[24px] font-bold py-[10px] rounded-full border-2 border-boosty_green hover:border-boosty_yellow flex items-center justify-center duration-200 bg-[#E8F2F2] leading-[24px]">
          Sign In
        </button>
      </nav>
    </header>
  );
};

export default Header;
