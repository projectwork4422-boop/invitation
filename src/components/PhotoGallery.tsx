"use client";

import React, { useState } from "react";
import { WEDDING_CONFIG, WeddingPhoto } from "@/config/wedding";
import { Camera, X, Maximize2 } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function PhotoGallery() {
  const { photos } = WEDDING_CONFIG;
  const [selectedPhoto, setSelectedPhoto] = useState<WeddingPhoto | null>(null);

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 bg-[#F4EFE6] text-[#29251F]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDE4D3] border border-[#DDD0B9] text-xs font-sans tracking-widest text-[#7A7366] uppercase mb-3 font-semibold transition-colors duration-200 hover:border-[#B89B63]/60 cursor-default">
            <Camera className="w-3.5 h-3.5 text-[#B89B63]" />
            <span>Sacred Moments</span>
          </div>
          <h3 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal text-[#29251F]">
            Our Journey in Frames
          </h3>
          <p className="text-xs sm:text-sm text-[#5F5A52] mt-2 font-sans tracking-wide max-w-md mx-auto">
            A timeless glimpse into our shared devotion, faith, and joy
          </p>
        </ScrollReveal>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.gallery.map((photo, index) => (
            <ScrollReveal key={photo.id} delay={150 + index * 100} className="h-full">
              <div
                onClick={() => setSelectedPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5DCCB] bg-[#FAF8F3] warm-card-shadow transition-all duration-300 hover:border-[#B89B63] hover:shadow-2xl hover:-translate-y-1 h-full"
              >
                {/* Image container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFE7D8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover object-center filter contrast-[103%] brightness-[92%] saturate-[95%] group-hover:scale-105 group-hover:brightness-100 transition-transform duration-500 ease-out"
                  />

                  {/* Romantic soft gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-70 transition-opacity duration-300" />

                  {/* Expand Icon */}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-[#FAF8F3]/90 border border-[#E5DCCB] text-[#29251F] opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5 text-[#B89B63]" />
                  </div>

                  {/* Bottom Caption */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col justify-end">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#DCC9A3] font-semibold">
                      Moment 0{index + 1}
                    </span>
                    <h4 className="font-cormorant text-lg sm:text-xl font-normal text-white group-hover:text-[#b89b63] transition-colors duration-200">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-[#EFE7D8] font-light mt-0.5 line-clamp-1">
                      {photo.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#29251F]/80 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden border border-[#E5DCCB] bg-[#FAF8F3] p-3 sm:p-4 shadow-2xl warm-card-shadow"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-[#FAF8F3]/90 border border-[#E5DCCB] text-[#29251F] hover:bg-[#B89B63] hover:text-white hover:scale-105 transition-all duration-200 shadow-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
              </button>

              {/* Modal Image */}
              <div className="relative max-h-[75vh] w-full overflow-hidden rounded-2xl bg-[#EFE7D8] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-auto object-contain filter contrast-[104%]"
                />
              </div>

              {/* Modal Caption */}
              <div className="p-4 sm:p-6 text-center">
                <h4 className="font-cormorant text-xl sm:text-2xl font-normal text-[#29251F]">
                  {selectedPhoto.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#5F5A52] mt-1 font-sans">
                  {selectedPhoto.subtitle}
                </p>
                <p className="text-[11px] text-[#B89B63] font-sans uppercase tracking-widest mt-2 font-medium">
                  AL-SHAKHOF &amp; FATHIMA AFNAAN • 10-01-2027
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
