import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CustomUserMenu = ({ scrollY }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef(null);

  // Memoize event handlers to prevent recreation on every render
  const handleSignOut = useCallback(() => {
    signOut();
    setIsDropdownOpen(false);
  }, [signOut]);

  const handleCartClick = useCallback(() => {
    // Placeholder for cart functionality
    console.log("Cart clicked - implement cart functionality here");
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  // Close dropdown when scrolling up
  useEffect(() => {
    if (scrollY < lastScrollY && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
    setLastScrollY(scrollY);
  }, [scrollY, lastScrollY, isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Memoize expensive animation variants
  const dropdownVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scale: 0.95,
        y: -10,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8,
          staggerChildren: 0.05,
          delayChildren: 0.1,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        x: -20,
      },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 25,
        },
      },
    }),
    []
  );

  // Memoize menu items array
  const menuItems = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/become-a-partner", label: "Become a partner" },
      {
        to: "/want-to-fund-solar-projects",
        label: "Want to fund solar projects?",
      },
    ],
    []
  );

  // Memoize animation styles
  const avatarAnimateProps = useMemo(
    () => ({
      borderColor: isDropdownOpen ? "#F5C13C" : "#374646",
      boxShadow: isDropdownOpen
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        : "0 0 0 0 rgba(0, 0, 0, 0)",
    }),
    [isDropdownOpen]
  );

  // Memoize class names
  const avatarClassName = useMemo(
    () =>
      `w-9 h-9 rounded-full border-2 ${
        isDropdownOpen
          ? "border-boostyYellow shadow-md"
          : "border-boostyFooterBG"
      }`,
    [isDropdownOpen]
  );

  // Memoize click handlers for menu items
  const handleMenuItemClick = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleManageAccountClick = useCallback(() => {
    setIsDropdownOpen(false);
    console.log("Manage account clicked");
  }, []);

  return (
    <div className="flex items-center space-x-4">
      {/* Cart Icon with hover animation */}
      <motion.button
        onClick={handleCartClick}
        className="relative p-2 hover:bg-boostyLightGray rounded-full transition-colors"
        title="Shopping Cart"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingCart className="w-6 h-6 text-boostyBlack" />
        {/* Cart badge - uncomment when implementing cart count */}
        {/* <motion.span 
          className="absolute -top-1 -right-1 bg-boostyYellow text-boostyBlack text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          0
        </motion.span> */}
      </motion.button>

      {/* User Menu with better positioning */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 focus:outline-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.img
            src={user?.imageUrl || "/default-avatar.png"}
            alt={user?.fullName || "User"}
            className={avatarClassName}
            animate={avatarAnimateProps}
            transition={{ duration: 0.2 }}
          />
        </motion.button>

        {/* Dropdown with framer motion */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-20 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleMenuItemClick}
              />

              <motion.div
                className="absolute right-0 mt-2 w-80 sm:w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ originX: 1, originY: 0 }}
              >
                {/* Menu Header */}
                <motion.div
                  className="p-4 border-b border-gray-100"
                  variants={itemVariants}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.imageUrl || "/default-avatar.png"}
                      alt={user?.fullName || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-boostyBlack">
                        {user?.fullName || "User"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Links with stagger animation */}
                <div className="py-1">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      variants={itemVariants}
                      custom={index}
                    >
                      <Link
                        to={item.to}
                        onClick={handleMenuItemClick}
                        className="flex items-center px-4 py-3 text-boostyBlack hover:bg-boostyLightGray transition-colors border-b border-gray-50 group"
                      >
                        <motion.span
                          className="font-medium"
                          whileHover={{ x: 4 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Account Management with animations */}
                <div className="py-1 border-t border-gray-100">
                  <motion.button
                    onClick={handleManageAccountClick}
                    className="flex items-center w-full px-4 py-3 text-boostyBlack hover:bg-boostyLightGray transition-colors text-left group"
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">Manage account</span>
                  </motion.button>

                  <motion.button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-3 text-boostyBlack hover:bg-boostyLightGray transition-colors text-left group"
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">Sign out</span>
                  </motion.button>
                </div>

                {/* Footer */}
                <motion.div
                  className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100"
                  variants={itemVariants}
                >
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <span>Secured by</span>
                    <img
                      src="/clerk-logo.svg"
                      alt="Clerk"
                      className="h-4"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "inline";
                      }}
                    />
                    <span style={{ display: "none" }}>🔒 Clerk</span>
                  </div>
                  <div className="text-center text-xs text-boostyYellow font-semibold mt-1">
                    Development mode
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(CustomUserMenu);
