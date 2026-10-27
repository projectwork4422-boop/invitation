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

  // Split strings into individual words for staggered word-by-word reveal
  const bismillahWords = islamicText.bismillahArabic.split(" ");
  const taglineWords = couple.tagline.split(" ");
  const groomWords = couple.groom.name.split(" ");
  const brideWords = couple.bride.name.split(" ");

  // Staggered timing orchestration (in milliseconds)
  const bismillahStart = 150;
  const bismillahStep = 130;
  const infinityDelay = bismillahStart + bismillahWords.length * bismillahStep + 40; // ~710ms
  const taglineStart = infinityDelay + 120; // ~830ms
  const taglineStep = 120;
  const dividerDelay = taglineStart + taglineWords.length * taglineStep + 80; // ~1270ms
  const groomStart = dividerDelay + 130; // ~1400ms
  const groomStep = 120;
  const ampersandDelay = groomStart + groomWords.length * groomStep + 50; // ~1570ms
  const brideStart = ampersandDelay + 130; // ~1700ms
  const brideStep = 130;
  const dateDelay = brideStart + brideWords.length * brideStep + 80; // ~2040ms
  const buttonDelay = dateDelay + 150; // ~2190ms

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black text-white">
      {/* Editorial Centered Invitation Content */}
      <div className="relative w-full max-w-lg mx-auto py-6 sm:py-10 text-center">
        
        {/* 1. Arabic Bismillah - Words appear one by one right-to-left */}
        <div className="my-5">
          <h1
            lang="ar"
            dir="rtl"
            className="font-amiri text-2xl sm:text-3xl md:text-4xl text-[#b89b63] tracking-wider leading-relaxed select-none font-normal drop-shadow-sm"
          >
            {bismillahWords.map((word, idx) => (
              <React.Fragment key={idx}>
                <span
                  className="animate-opening-word"
                  style={{ animationDelay: `${bismillahStart + idx * bismillahStep}ms` }}
                >
                  {word}
                </span>
                {idx < bismillahWords.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>
        </div>

        {/* 2. Infinity Icon - Smooth golden scale & fade entrance */}
        <div className="flex justify-center items-center my-3">
          <div
            className="animate-opening-scale"
            style={{ animationDelay: `${infinityDelay}ms` }}
          >
            <InfinityIcon className="w-8 h-4 text-[#b89b63]" />
          </div>
        </div>

        {/* 3. “We Choose Forever” - Tagline words appear one by one */}
        <div className="my-4">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-zinc-300 font-medium">
            {taglineWords.map((word, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === taglineWords.length - 1;
              const formattedWord = `${isFirst ? "“" : ""}${word}${isLast ? "”" : ""}`;
              return (
                <React.Fragment key={idx}>
                  <span
                    className="animate-opening-word"
                    style={{ animationDelay: `${taglineStart + idx * taglineStep}ms` }}
                  >
                    {formattedWord}
                  </span>
                  {idx < taglineWords.length - 1 && " "}
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* 4. Delicate Ornamental Divider */}
        <div
          className="animate-opening-divider"
          style={{ animationDelay: `${dividerDelay}ms` }}
        >
          <OrnamentalDivider variant="white" className="my-5 opacity-40" />
        </div>

        {/* 5. Couple Names in UPPERCASE: AL-SHAKHOF & FATHIMA AFNAAN */}
        <div className="my-6 space-y-2">
          {/* Groom Name */}
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal tracking-wider text-white uppercase leading-tight">
            {groomWords.map((word, idx) => (
              <React.Fragment key={idx}>
                <span
                  className="animate-opening-word"
                  style={{ animationDelay: `${groomStart + idx * groomStep}ms` }}
                >
                  {word}
                </span>
                {idx < groomWords.length - 1 && " "}
              </React.Fragment>
            ))}
          </h2>

          {/* Golden Ampersand Divider */}
          <div
            className="animate-opening-scale flex items-center justify-center gap-3 my-1"
            style={{ animationDelay: `${ampersandDelay}ms` }}
          >
            <span className="h-[1px] w-8 bg-[#b89b63]/40" />
            <span className="font-sans text-xs uppercase tracking-widest text-[#b89b63] font-medium">&amp;</span>
            <span className="h-[1px] w-8 bg-[#b89b63]/40" />
          </div>

          {/* Bride Name - Words appear one by one (e.g., FATHIMA then AFNAAN) */}
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal tracking-wider text-white uppercase leading-tight">
            {brideWords.map((word, idx) => (
              <React.Fragment key={idx}>
                <span
                  className="animate-opening-word"
                  style={{ animationDelay: `${brideStart + idx * brideStep}ms` }}
                >
                  {word}
                </span>
                {idx < brideWords.length - 1 && " "}
              </React.Fragment>
            ))}
          </h2>
        </div>

        {/* 6. Numerical Date: 10-01-2027 */}
        <div className="my-5">
          <span
            className="animate-opening-word font-sans text-xs sm:text-sm tracking-[0.25em] font-semibold text-[#b89b63]"
            style={{ animationDelay: `${dateDelay}ms` }}
          >
            {event.dateBullets}
          </span>
        </div>

        {/* 7. “Enter Invitation” Button */}
        <div
          className="animate-opening-button mt-8 flex justify-center"
          style={{ animationDelay: `${buttonDelay}ms` }}
        >
          <button
            onClick={onEnter}
            disabled={isEntering}
            type="button"
            className="group inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-lg bg-white hover:bg-[#b89b63] text-black hover:text-white font-sans text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#b89b63]/30 min-h-[46px] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            <span>Enter Invitation</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:text-white transition-all duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}
