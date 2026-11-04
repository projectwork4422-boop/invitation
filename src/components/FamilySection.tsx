"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { ScrollReveal } from "./ScrollReveal";

export function FamilySection() {
  const { couple } = WEDDING_CONFIG;

  return (
    <section id="couple" className="relative w-full py-20 px-4 sm:px-6 bg-[#F8F5EE] text-[#29251F]">
      <span id="family" className="sr-only" />
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-10 sm:mb-12">
          <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#7A7366] font-semibold block mb-2">
            Blessed Union
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl text-[#29251F] font-normal tracking-wide">
            The Couple
          </h2>
        </ScrollReveal>

        {/* Two-Column Couple Layout without outer box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 max-w-4xl mx-auto">
          
          {/* Groom */}
          <ScrollReveal delay={200}>
            <div className="text-center flex flex-col items-center justify-center py-2 sm:py-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-sans tracking-widest uppercase bg-[#EDE4D3] text-[#29251F] border border-[#DDD0B9] mb-4 font-semibold transition-colors duration-200 hover:border-[#b89b63]/60">
                Groom
              </span>

              <h3 className="font-cormorant text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#29251F] uppercase tracking-wide whitespace-nowrap">
                {couple.groom.name}
              </h3>
            </div>
          </ScrollReveal>

          {/* Bride */}
          <ScrollReveal delay={350}>
            <div className="text-center flex flex-col items-center justify-center py-2 sm:py-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-sans tracking-widest uppercase bg-[#EDE4D3] text-[#29251F] border border-[#DDD0B9] mb-4 font-semibold transition-colors duration-200 hover:border-[#b89b63]/60">
                Bride
              </span>

              <h3 className="font-cormorant text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#29251F] uppercase tracking-wide whitespace-nowrap">
                {couple.bride.name}
              </h3>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
