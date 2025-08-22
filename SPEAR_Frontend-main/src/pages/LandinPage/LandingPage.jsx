import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/imgs/logo-dark.png";
import Home from "./Home";

const LandingPage = () => {
  const [openNav, setOpenNav] = useState(false);
  const homeRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) setOpenNav(false); // Close nav on larger screens
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <nav className="bg-white w-full px-4 py-2 lg:px-8 lg:py-4 shadow-md">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img src={logo} alt="Brand Logo" className="w-12 h-12" />

          {/* Text */}
          <p className="text-teal font-medium pl-4 hidden lg:block">
            Student Peer Evaluation and Review System
          </p>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex ml-auto space-x-6">
            <Link to="/login">
              <button className="bg-teal text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors">
                Go to App
              </button>
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="ml-auto lg:hidden h-6 w-6 text-blue-gray-900"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation (Dropdown) */}
        {openNav && (
          <div className="lg:hidden mt-2 space-y-2">
            <Link to="/login">
              <button className="block w-full bg-gray-100 text-blue-gray-900 py-2 rounded hover:bg-gray-200 transition-colors">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded hover:from-blue-600 hover:to-purple-600 transition-all">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* Home Section */}
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        ref={homeRef}
      >
        <Home />
      </div>
    </div>
  );
};

export default LandingPage;
