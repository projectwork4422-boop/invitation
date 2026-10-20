"use client";

import React, { useState, useRef } from "react";
import { OpeningScreen } from "@/components/OpeningScreen";
import { MainInvitation } from "@/components/MainInvitation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { InfinityIcon } from "@/components/IslamicOrnament";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function WeddingPage() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const transitioningRef = useRef(false);

  const { couple } = WEDDING_CONFIG;

  const handleEnterInvitation = () => {
    if (transitioningRef.current || hasEntered) return;
    transitioningRef.current = true;

    // 1. Immediately trigger audio playback on user click interaction
    setAudioStarted(true);

    // 2. Display the floating transition message (immediately replaces opening screen)
    setIsTransitioning(true);

    // 3. At 1500ms, mount the main invitation at top and start smooth dissolve of transition screen
    setTimeout(() => {
      setHasEntered(true);
      setIsFadingOut(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }, 1500);

    // 4. At 2000ms, clean up the transition overlay completely
    setTimeout(() => {
      setIsTransitioning(false);
      setIsFadingOut(false);
      transitioningRef.current = false;
    }, 2000);
  };

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 ${
        hasEntered
          ? "bg-[#F7F1E6] text-[#29251F] selection:bg-[#B89B63] selection:text-white"
          : "bg-black text-white selection:bg-white selection:text-black"
      }`}
    >
      {/* 1. Opening Screen - Immediately disappears when transition begins */}
      {!hasEntered && !isTransitioning && (
        <OpeningScreen
          onEnter={handleEnterInvitation}
          isEntering={isTransitioning}
        />
      )}

      {/* 2. Floating Transition Overlay: "LET'S SEE THE INVITATION" */}
      {isTransitioning && (
        <div
          aria-live="polite"
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black text-white px-6 text-center transition-opacity duration-500 ease-out ${
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="max-w-xl mx-auto flex flex-col items-center animate-float-gentle animate-fade-in">
            {/* Golden Infinity Symbol */}
            <div className="mb-4">
              <InfinityIcon className="w-10 h-5 text-[#b89b63] drop-shadow-sm" />
            </div>

            {/* "LET'S SEE THE INVITATION" Heading */}
            <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white drop-shadow-lg leading-tight select-none">
              LET&apos;S SEE THE INVITATION
            </h2>

            {/* Elegant Golden Line & Diamond Accent */}
            <div className="flex items-center justify-center gap-3 my-4">
              <span className="h-[1px] w-12 sm:w-16 bg-[#b89b63]/50" />
              <span className="w-1.5 h-1.5 rotate-45 bg-[#b89b63]" />
              <span className="h-[1px] w-12 sm:w-16 bg-[#b89b63]/50" />
            </div>

            {/* Couple Names */}
            <p className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-[#b89b63] font-medium drop-shadow-sm">
              {couple.groom.name} &amp; {couple.bride.name}
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Invitation */}
      {hasEntered && (
        <div className="animate-fade-in transition-opacity duration-700 bg-[#F7F1E6] text-[#29251F]">
          <MainInvitation />
        </div>
      )}

      {/* 4. Background Audio - Persists across transition and throughout invitation */}
      {audioStarted && <AudioPlayer shouldPlay={true} />}
    </div>
  );
}
