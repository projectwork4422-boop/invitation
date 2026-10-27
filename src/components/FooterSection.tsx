"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { OrnamentalDivider } from "./IslamicOrnament";
import { ScrollReveal } from "./ScrollReveal";

export function FooterSection() {
  const { footer } = WEDDING_CONFIG;

  return (
    <footer className="relative w-full py-20 px-4 sm:px-6 bg-[#EAE2D2] text-[#29251F] text-center">
      <ScrollReveal delay={150} className="max-w-4xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#FAF7F0] border border-[#DDCFB9] warm-card-shadow transition-all duration-300 hover:border-[#b89b63] hover:shadow-xl">
          
          {/* “See You On 10-01-2027” */}
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#7A7366] font-semibold block mb-3">
            {footer.heading}
          </span>

          {/* Couple Name: AL-SHAKHOF ♥ FATHIMA AFNAAN in gold */}
          <h2 className="font-cormorant text-2xl sm:text-3xl md:text-4xl text-[#B89B63] font-normal tracking-wider uppercase my-4">
            {footer.coupleText}
          </h2>

          <OrnamentalDivider variant="gold" className="my-4" />

          {/* “10-01-2027 · The Beginning of Forever” */}
          <p className="font-cormorant italic text-lg sm:text-xl text-[#29251F] tracking-wider my-2">
            {footer.subheading}
          </p>

          {/* “With love & infinite blessings” */}
          <p className="font-sans text-xs tracking-widest uppercase text-[#7A7366] font-semibold mt-4">
            {footer.closingBlessing}
          </p>

        </div>
      </ScrollReveal>

      <ScrollReveal delay={300} className="mt-8 text-center text-[11px] text-[#8C8275] font-sans tracking-wider">
        In the sacred bond of Nikāh • We warmly anticipate your presence
      </ScrollReveal>
    </footer>
  );
}
