"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { InfinityIcon, OrnamentalDivider } from "./IslamicOrnament";
import { ArrowRight } from "lucide-react";

interface OpeningScreenProps {
  onEnter: () => void;
  isEntering?: boolean;
}

export function OpeningScreen({ onEnter, isEntering = false }: OpeningScreenProps) {
  const { couple, event, islamicText } = WEDDING_CONFIG;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black text-white">
      {/* Editorial Centered Invitation Content */}
      <div className="relative w-full max-w-lg mx-auto py-6 sm:py-10 text-center">
        
        {/* Note: Wedding date at top section has been removed as requested */}

        {/* 1. Arabic Bismillah */}
        <div className="my-5">
          <h1
            lang="ar"
            dir="rtl"
            className="font-amiri text-2xl sm:text-3xl md:text-4xl text-[#b89b63] tracking-wider leading-relaxed select-none font-normal drop-shadow-sm"
          >
            {islamicText.bismillahArabic}
          </h1>
        </div>

        {/* 2. Infinity Icon */}
        <div className="flex justify-center items-center my-3">
          <InfinityIcon className="w-8 h-4 text-[#b89b63]" />
        </div>

        {/* 3. “We Choose Forever” */}
        <div className="my-4">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-zinc-300 font-medium">
            “{couple.tagline}”
          </p>
        </div>

        <OrnamentalDivider variant="white" className="my-5 opacity-40" />

        {/* 4. Couple Names in UPPERCASE: AL-SHAKHOF & FATHIMA AFNAAN */}
        <div className="my-6 space-y-2">
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal tracking-wider text-white uppercase leading-tight">
            {couple.groom.name}
          </h2>
          <div className="flex items-center justify-center gap-3 my-1">
            <span className="h-[1px] w-8 bg-[#b89b63]/40" />
            <span className="font-sans text-xs uppercase tracking-widest text-[#b89b63] font-medium">&amp;</span>
            <span className="h-[1px] w-8 bg-[#b89b63]/40" />
          </div>
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal tracking-wider text-white uppercase leading-tight">
            {couple.bride.name}
          </h2>
        </div>

        {/* 5. Numerical Date: 5-01-2027 */}
        <div className="my-5">
          <span className="font-sans text-xs sm:text-sm tracking-[0.25em] font-semibold text-[#b89b63]">
            {event.dateBullets}
          </span>
        </div>

        {/* 6. “Enter Invitation” Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onEnter}
            disabled={isEntering}
            type="button"
            className="group inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-lg bg-white hover:bg-[#b89b63] text-black hover:text-white font-sans text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#b89b63]/30 min-h-[46px] disabled:opacity-70 disabled:pointer-events-none"
          >
            <span>Enter Invitation</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-white transition-all duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}
