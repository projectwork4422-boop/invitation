"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { OrnamentalDivider } from "./IslamicOrnament";
import { ScrollReveal } from "./ScrollReveal";

export function InvitationSection() {
  const { couple, islamicText } = WEDDING_CONFIG;

  return (
    <section id="invitation" className="relative w-full py-24 px-4 sm:px-6 md:px-8 bg-[#EFE7D8] text-[#29251F]">
      <div className="relative max-w-4xl mx-auto text-center space-y-12 sm:space-y-14">
        
        {/* Arabic Bismillah */}
        <ScrollReveal delay={100} className="flex flex-col items-center justify-center text-center">
          <h2
            lang="ar"
            dir="rtl"
            className="font-amiri text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-[#b89b63] leading-[1.7] sm:leading-[1.8] select-none font-normal text-center w-full px-2"
          >
            {islamicText.bismillahArabic}
          </h2>
          <p className="font-cormorant italic text-base sm:text-lg md:text-xl text-[#b89b63] tracking-wide leading-relaxed max-w-2xl mx-auto mt-4 sm:mt-5 text-center">
            {islamicText.bismillahEnglish}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <OrnamentalDivider variant="gold" className="my-8 sm:my-10 opacity-90" />
        </ScrollReveal>

        {/* “We warmly invite you” Heading & Message */}
        <ScrollReveal delay={300} className="space-y-5 sm:space-y-6 max-w-3xl mx-auto">
          <h3 className="font-cormorant text-4xl sm:text-5xl md:text-6xl lg:text-[62px] text-[#29251F] font-normal tracking-wide leading-[1.2] sm:leading-[1.25]">
            {islamicText.invitationHeading}
          </h3>

          {/* Nikah Invitation Message */}
          <p className="font-sans text-lg sm:text-xl md:text-[22px] text-[#5F5A52] leading-[1.8] sm:leading-[1.85] font-light max-w-3xl mx-auto">
            {islamicText.invitationMessage}
          </p>
        </ScrollReveal>

        {/* Wedding Blessing Quote (Surah Ar-Rum 30:21) */}
        {islamicText.blessingQuote && (
          <ScrollReveal delay={400} className="pt-8 sm:pt-10 border-t border-[#E5DCCB] max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
            <span className="font-sans text-xs sm:text-sm tracking-[0.25em] uppercase text-[#7A7366] font-semibold block mb-6 sm:mb-7 leading-normal text-center">
              {islamicText.blessingQuote.reference}
            </span>
            
            {/* Arabic script with proper Quranic break, ample leading and vertical breathing room */}
            <div
              lang="ar"
              dir="rtl"
              className="font-amiri text-xl sm:text-2xl md:text-3xl lg:text-[34px] text-[#29251F] leading-[2.6] sm:leading-[2.8] md:leading-[3] font-normal text-center w-full px-2 space-y-3 sm:space-y-4"
            >
              {islamicText.blessingQuote.arabic.includes("وَجَعَلَ") ? (
                <>
                  <p className="block">
                    {islamicText.blessingQuote.arabic.split("وَجَعَلَ")[0].trim()}
                  </p>
                  <p className="block">
                    وَجَعَلَ {islamicText.blessingQuote.arabic.split("وَجَعَلَ")[1].trim()}
                  </p>
                </>
              ) : (
                <p className="block">{islamicText.blessingQuote.arabic}</p>
              )}
            </div>
            
            {/* English translation */}
            <p className="font-cormorant italic text-base sm:text-lg md:text-xl text-[#5F5A52] leading-[1.8] sm:leading-[1.9] max-w-2xl mx-auto mt-6 sm:mt-8 text-center text-balance">
              &ldquo;{islamicText.blessingQuote.translation}&rdquo;
            </p>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
