"use client";

import React, { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Invitation", href: "#invitation" },
  { label: "Countdown", href: "#countdown" },
  { label: "Family", href: "#family" },
  { label: "Events", href: "#events" },
  { label: "Venue", href: "#venue" },
  { label: "RSVP", href: "#rsvp" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#F8F4EB]/95 backdrop-blur-md border-b border-[#E5DCCB] shadow-sm py-3"
          : "bg-[#F8F4EB]/80 backdrop-blur-sm py-4 border-b border-[#E5DCCB]/60"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="font-cormorant text-base sm:text-lg md:text-xl font-medium tracking-wider text-[#29251F] uppercase hover:text-[#B89B63] transition-colors"
        >
          AL-SHAKHOF &amp; FATHIMA AFNAAN
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="font-sans text-[13px] lg:text-[14px] text-[#666057] hover:text-[#B89B63] tracking-wide transition-colors duration-200 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
