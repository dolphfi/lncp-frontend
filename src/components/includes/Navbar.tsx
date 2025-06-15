import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-scroll";
import { Menu, X, User, FileText } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        const mainHeight = mainContent.scrollHeight;
        const currentProgress = (window.scrollY / mainHeight) * 100;
        setScrollProgress(Math.min(currentProgress, 100));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { to: "home", label: "Accueil" },
    { to: "about", label: "À Propos" },
    { to: "programs", label: "Programmes" },
    { to: "staff", label: "Administration" },
    { to: "gallery", label: "Gallerie" },
    { to: "admissions", label: "Admissions" },
    { to: "contact", label: "Contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border border-gray-200 sticky top-0 z-40 ">
      <div className=" mx-auto px-6 md:px-16 lg:px-32">
        <div className="relative flex items-center justify-between h-20">
          {/* Left Column: Logo */}
          <div>
            <Link
              to="home"
              spy={true}
              smooth={true}
              offset={-64}
              duration={500}
              onSetActive={() => setActiveSection("home")}
              className={`font-medium text-xl cursor-pointer ${activeSection === "home" ? "text-blue-600" : "text-dark/70"
                }`}
            >
              LNCP
            </Link>
          </div>

          {/* Center Column: Links (Absolutely Centered) */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  onSetActive={() => setActiveSection(link.to)}
                  className={`text-dark/70 hover:text-blue-600 text-xs cursor-pointer duration-300 relative group `}
                >
                  <span
                    className={`relative z-10 ${activeSection === link.to ? "text-blue-600" : ""
                      }`}
                  >
                    {link.label}
                  </span>
                  <span
                    className={`absolute rounded-full -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${activeSection === link.to
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                      }`}
                  ></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Buttons & Mobile Toggle */}
          <div className="flex items-center">
            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center bg-secondary/10 text-secondary text-xs py-2 px-6 rounded-full hover:bg-secondary/20 transition-all duration-300 border border-secondary/20 hover:border-secondary/40"
              >
                <span>Connecter</span>
                <User className="h-4 w-4 ml-2" />
              </button>
              <button
                type="button"
                className="flex items-center bg-teal-500/10 text-teal-600 text-xs py-2 px-6 rounded-full hover:bg-teal-500/20 transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40"
              >
                <span>Résultats</span>
                <FileText className="h-4 w-4 ml-2" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden ml-4">
              <button
                ref={buttonRef}
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-dark hover:text-secondary focus:outline-none"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-screen w-full bg-white z-50 transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-dark hover:text-secondary focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-6 py-4 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-64}
                duration={500}
                onClick={toggleMenu}
                onSetActive={() => setActiveSection(link.to)}
                className={`text-dark hover:text-blue-600 block text-lg font-medium cursor-pointer ${activeSection === link.to ? "text-blue-600" : ""
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="p-6 space-y-4 border-t border-gray-200">
            <button
              type="button"
              className="w-full flex items-center justify-center bg-secondary/10 text-secondary text-sm py-3 px-4 rounded-full hover:bg-secondary/20 transition-all duration-300 border border-secondary/20 hover:border-secondary/40"
            >
              <span>Connecter</span>
              <User className="h-4 w-4 ml-2" />
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center bg-teal-500/10 text-teal-600 text-sm py-3 px-4 rounded-full hover:bg-teal-500/20 transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40"
            >
              <span>Résultats</span>
              <FileText className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div
        className="h-1 rounded-r-full bg-secondary transition-all duration-300 ease-out absolute"
        style={{ width: `${scrollProgress}%` }}
      />
    </nav>
  );
};

export default Navbar;