"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { HomeSection } from "./HomeSection";
import { InvitationSection } from "./InvitationSection";
import { CountdownSection } from "./CountdownSection";
import { FamilySection } from "./FamilySection";
import { EventsSection } from "./EventsSection";
import { VenueSection } from "./VenueSection";
import { PhotoGallery } from "./PhotoGallery";
import { RsvpSection } from "./RsvpSection";
import { FooterSection } from "./FooterSection";

export function MainInvitation() {
  return (
    <div className="relative min-h-screen w-full bg-[#F7F1E6] text-[#29251F] selection:bg-[#B89B63] selection:text-white">
      {/* 2. NAVIGATION */}
      <Navbar />

      <main className="relative z-10 w-full overflow-x-hidden">
        {/* 3. HOME / HERO */}
        <HomeSection />

        {/* 4. SACRED INVITATION */}
        <InvitationSection />

        {/* 5. COUNTDOWN */}
        <CountdownSection />

        {/* 6. FAMILY DETAILS */}
        <FamilySection />

        {/* 7. WEDDING DETAILS / CEREMONIES */}
        <EventsSection />

        {/* 8. THE VENUE */}
        <VenueSection />

        {/* 9. PHOTO GALLERY */}
        <PhotoGallery />

        {/* 10. RSVP */}
        <RsvpSection />

        {/* 11. CLOSING QUOTE & FOOTER */}
        <FooterSection />
      </main>
    </div>
  );
}
