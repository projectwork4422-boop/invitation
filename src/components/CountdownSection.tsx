"use client";

import React, { useEffect, useState } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { Clock } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownSection() {
  const { event, couple } = WEDDING_CONFIG;
  const targetDate = new Date(event.targetIsoDate).getTime();

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="relative w-full py-20 sm:py-24 px-4 sm:px-6 text-center overflow-hidden">
      {/* Background Image scoped strictly to Countdown Section with 60% Black Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/couple%203.avif"
          alt="Wedding Countdown"
          className="w-full h-full object-cover object-center filter contrast-[105%]"
        />
        {/* Semi-transparent black overlay ~60% opacity */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="mb-10 sm:mb-12">
          <span className="font-sans text-xs sm:text-sm tracking-[0.25em] uppercase text-[#b89b63] font-semibold block mb-2 drop-shadow-sm">
            Until We Say Forever • <span className="whitespace-nowrap">{event.dateDots}</span>
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl text-white font-normal tracking-wide drop-shadow-md">
            Counting Every Moment
          </h2>
        </ScrollReveal>

        {/* Countdown Grid - 3 items on row 1 (Days, Hours, Minutes) and centered Seconds on row 2 for mobile/tablet; 4 in a row on desktop */}
        {mounted && timeLeft.isExpired ? (
          <ScrollReveal delay={200} className="p-6 max-w-md mx-auto text-center">
            <Clock className="w-8 h-8 text-[#b89b63] mx-auto mb-3 drop-shadow-sm" />
            <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-normal drop-shadow-md">
              Alhamdulillah! The Celebration Has Begun
            </h3>
            <p className="font-sans text-xs sm:text-sm text-zinc-300 mt-2">
              Mubarak to {couple.groom.name} &amp; {couple.bride.name}!
            </p>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-6 lg:grid-cols-4 gap-x-2 sm:gap-x-6 lg:gap-x-8 gap-y-6 sm:gap-y-8 max-w-3xl mx-auto items-center">
            {units.map((unit, idx) => {
              const isSeconds = idx === 3;
              return (
                <ScrollReveal
                  key={idx}
                  delay={150 + idx * 100}
                  className={`group flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-transform duration-300 hover:scale-105 cursor-default ${
                    isSeconds
                      ? "col-span-2 col-start-3 lg:col-span-1 lg:col-start-auto"
                      : "col-span-2 lg:col-span-1"
                  }`}
                >
                  <div className="font-cormorant text-[36px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-normal tracking-tight text-white leading-none drop-shadow-md select-none group-hover:brightness-110 transition-all duration-200">
                    {mounted ? String(unit.value).padStart(2, "0") : "--"}
                  </div>
                  <div className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.25em] text-[#b89b63] group-hover:text-[#d4af37] mt-2 sm:mt-3 font-semibold drop-shadow-sm transition-colors duration-200">
                    {unit.label}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
