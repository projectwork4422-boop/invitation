"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { ScrollReveal } from "./ScrollReveal";

export function FamilySection() {
  const { couple } = WEDDING_CONFIG;

  return (
    <section id="family" className="relative w-full py-20 px-4 sm:px-6 bg-[#F8F5EE] text-[#29251F]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#7A7366] font-semibold block mb-2">
            Blessed Roots
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl text-[#29251F] font-normal tracking-wide">
            The Families
          </h2>
        </ScrollReveal>

        {/* Two-Column Family Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          
          {/* Groom's Family */}
          <ScrollReveal delay={200} className="h-full">
            <div className="h-full p-7 sm:p-9 rounded-3xl bg-[#FAF7F0] border border-[#E2D7C3] warm-card-shadow text-center transition-all duration-300 hover:border-[#b89b63] hover:shadow-xl hover:-translate-y-1">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-sans tracking-widest uppercase bg-[#EDE4D3] text-[#29251F] border border-[#DDD0B9] mb-4 font-semibold transition-colors duration-200 hover:border-[#b89b63]/60">
                Groom&apos;s Family
              </span>

              <h3 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#29251F] uppercase tracking-wider mb-4">
                {couple.groom.name}
              </h3>

              <div className="space-y-3 pt-2 text-center max-w-xs mx-auto">
                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Father</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.groom.father}</span>
                </div>

                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Mother</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.groom.mother}</span>
                </div>

                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Brother(s)</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.groom.brother}</span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm pt-0.5">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Sister(s)</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.groom.sister}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bride's Family */}
          <ScrollReveal delay={350} className="h-full">
            <div className="h-full p-7 sm:p-9 rounded-3xl bg-[#FAF7F0] border border-[#E2D7C3] warm-card-shadow text-center transition-all duration-300 hover:border-[#b89b63] hover:shadow-xl hover:-translate-y-1">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-sans tracking-widest uppercase bg-[#EDE4D3] text-[#29251F] border border-[#DDD0B9] mb-4 font-semibold transition-colors duration-200 hover:border-[#b89b63]/60">
                Bride&apos;s Family
              </span>

              <h3 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#29251F] uppercase tracking-wider mb-4">
                {couple.bride.name}
              </h3>

              <div className="space-y-3 pt-2 text-center max-w-xs mx-auto">
                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Father</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.bride.father}</span>
                </div>

                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Mother</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.bride.mother}</span>
                </div>

                <div className="border-b border-[#E5DCCB] pb-2 flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Brother(s)</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.bride.brother}</span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm pt-0.5">
                  <span className="font-sans uppercase tracking-wider text-[#7A7366] font-semibold">Sister(s)</span>
                  <span className="font-sans text-[#5F5A52] italic">{couple.bride.sister}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
