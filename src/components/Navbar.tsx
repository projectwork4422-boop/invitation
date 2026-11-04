"use client";

import React, { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Invitation", href: "#invitation" },
  { label: "Countdown", href: "#countdown" },
  { label: "Couple", href: "#couple" },
  { label: "Events", href: "#events" },
  { label: "Venue", href: "#venue" },
  { label: "RSVP", href: "#rsvp" },
  { label: "Responses", href: "/response" },
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
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#E0D3BC]/95 backdrop-blur-md border-b border-[#CBBCA0] shadow-md py-3"
          : "bg-[#E8DEC8]/90 backdrop-blur-md py-4 border-b border-[#D2C3A7]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="font-cormorant text-base sm:text-lg md:text-xl font-medium tracking-wider text-[#1C1915] uppercase hover:text-[#967A3E] transition-colors"
        >
          AL SHAKHOF &amp; FATHIMA AFNAAN
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="font-sans text-[13px] lg:text-[14px] text-[#453F36] hover:text-[#967A3E] tracking-wide transition-colors duration-200 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
