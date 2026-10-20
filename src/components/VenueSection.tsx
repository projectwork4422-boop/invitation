"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { MapPin, ExternalLink } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function VenueSection() {
  const { event } = WEDDING_CONFIG;

  return (
    <section id="venue" className="relative w-full py-20 px-4 sm:px-6 bg-[#F8F3EA] text-[#29251F]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#7A7366] font-semibold block mb-2">
            Directions &amp; Location
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl text-[#29251F] font-normal tracking-wide">
            The Venue
          </h2>
        </ScrollReveal>

        {/* Venue Card */}
        <ScrollReveal delay={250} className="max-w-2xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[#E5DCCB] warm-card-shadow text-center hover:border-[#B89B63] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="inline-block mb-3">
              <span className="font-sans text-[11px] uppercase tracking-widest text-[#29251F] font-semibold bg-[#EDE4D3] px-3.5 py-1 rounded-full border border-[#DDD0B9] transition-colors duration-200 hover:border-[#B89B63]/60">
                Wedding &amp; Reception Venue
              </span>
            </div>

            <h3 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#29251F] mb-3">
              {event.venueName}
            </h3>

            <p className="font-sans text-sm text-[#5F5A52] leading-relaxed mb-8 max-w-md mx-auto font-light">
              {event.address}
            </p>

            <a
              href={event.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#B89B63] hover:bg-[#A68A52] text-white font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-300 min-h-[46px] shadow-md shadow-[#B89B63]/20 hover:shadow-lg hover:shadow-[#B89B63]/30 hover:scale-[1.02] active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:scale-110" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-90 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
