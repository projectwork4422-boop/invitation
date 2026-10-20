"use client";

import React from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function EventsSection() {
  const { event } = WEDDING_CONFIG;

  return (
    <section id="events" className="relative w-full py-20 px-4 sm:px-6 text-[#29251F] overflow-hidden">
      {/* Background Image scoped strictly to Wedding Details (Events) Section with Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/hand.jpeg"
          alt="Wedding Ceremonies & Details"
          className="w-full h-full object-cover object-center filter contrast-[105%]"
        />
        {/* Semi-transparent dark overlay (~55% opacity) */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#b89b63] font-semibold block mb-2 drop-shadow-sm">
            Ceremonies
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl text-white font-normal tracking-wide drop-shadow-md">
            Wedding Details
          </h2>
        </ScrollReveal>

        {/* Events Two-Column Cards Grid - Transparent Box Backgrounds with Subtle Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          
          {/* Nikkah Event Card */}
          <ScrollReveal delay={200} className="h-full">
            <div className="h-full p-7 sm:p-9 rounded-3xl border border-white/25 hover:border-[#b89b63] hover:bg-white/[0.04] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                  <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-normal drop-shadow-sm">
                    {event.nikkah.title}
                  </h3>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#b89b63] font-semibold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-[#b89b63]/40 drop-shadow-sm transition-all duration-200 hover:border-[#b89b63] hover:bg-black/60">
                    Sacred Union
                  </span>
                </div>

                <div className="space-y-3.5 font-sans text-sm text-zinc-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#B89B63] shrink-0 drop-shadow-sm" />
                    <span className="text-white font-semibold drop-shadow-sm">{event.dateDots}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#B89B63] shrink-0 drop-shadow-sm" />
                    <span className="text-zinc-200 drop-shadow-sm">{event.nikkah.time}</span>
                  </div>

                  <div className="pt-1">
                    <a
                      href={event.nikkah.googleMapsUrl || event.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group text-zinc-200 hover:text-[#B89B63] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#B89B63] shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-sm" />
                      <span className="group-hover:underline drop-shadow-sm">{event.venueName}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Reception Event Card */}
          <ScrollReveal delay={350} className="h-full">
            <div className="h-full p-7 sm:p-9 rounded-3xl border border-white/25 hover:border-[#b89b63] hover:bg-white/[0.04] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                  <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-normal drop-shadow-sm">
                    {event.reception.title}
                  </h3>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#b89b63] font-semibold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-[#b89b63]/40 drop-shadow-sm transition-all duration-200 hover:border-[#b89b63] hover:bg-black/60">
                    Celebration &amp; Feast
                  </span>
                </div>

                <div className="space-y-3.5 font-sans text-sm text-zinc-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#B89B63] shrink-0 drop-shadow-sm" />
                    <span className="text-white font-semibold drop-shadow-sm">{event.dateDots}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#B89B63] shrink-0 drop-shadow-sm" />
                    <span className="text-zinc-200 drop-shadow-sm">{event.reception.time}</span>
                  </div>

                  <div className="pt-1">
                    <a
                      href={event.reception.googleMapsUrl || event.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group text-zinc-200 hover:text-[#B89B63] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#B89B63] shrink-0 mt-0.5 group-hover:scale-110 transition-transform drop-shadow-sm" />
                      <span className="group-hover:underline drop-shadow-sm">{event.venueName}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
