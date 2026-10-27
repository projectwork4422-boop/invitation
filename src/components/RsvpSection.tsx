"use client";

import React, { useState } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { Send, AlertCircle } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

function SmilingFaceAnimation() {
  return (
    <div
      aria-label="Smiling joyful face"
      className="relative shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#2E2516] via-[#1F190E] to-[#120F08] border border-[#B89B63]/80 shadow-lg shadow-[#B89B63]/25 animate-smile-bounce"
    >
      <svg
        viewBox="0 0 50 50"
        className="w-8 h-8 sm:w-9 sm:h-9 text-[#B89B63]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Face Outline */}
        <circle
          cx="25"
          cy="25"
          r="21"
          stroke="currentColor"
          strokeWidth="2.2"
          className="opacity-90"
        />

        {/* Happy Crescent Smiling Eyes */}
        <path
          d="M 15 20 Q 19 14 23 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-eye-pulse"
        />
        <path
          d="M 27 20 Q 31 14 35 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-eye-pulse"
        />

        {/* Soft Golden Cheeks */}
        <circle cx="14" cy="25" r="2.5" fill="currentColor" opacity="0.35" />
        <circle cx="36" cy="25" r="2.5" fill="currentColor" opacity="0.35" />

        {/* Warm Smiling Arc */}
        <path
          d="M 16 27 Q 25 38 34 27"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="animate-smile-draw"
        />
      </svg>

      {/* Twinkling Golden Star */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B89B63] opacity-40" />
        <svg
          viewBox="0 0 24 24"
          className="relative w-4 h-4 text-[#D4AF37] animate-sparkle-spin"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </span>
    </div>
  );
}

function SadFaceAnimation() {
  return (
    <div
      aria-label="Compassionate sad face"
      className="relative shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#222026] via-[#17151C] to-[#0E0D12] border border-zinc-500/70 shadow-lg shadow-black/50 animate-sad-sway"
    >
      <svg
        viewBox="0 0 50 50"
        className="w-8 h-8 sm:w-9 sm:h-9 text-zinc-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Face Outline */}
        <circle
          cx="25"
          cy="25"
          r="21"
          stroke="currentColor"
          strokeWidth="2.2"
          className="opacity-90"
        />

        {/* Gentle Compassionate Brows */}
        <path
          d="M 15 16 Q 19 14 23 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 35 16 Q 31 14 27 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Soft Caring Eyes */}
        <circle cx="19" cy="22" r="2.2" fill="currentColor" />
        <circle cx="31" cy="22" r="2.2" fill="currentColor" />

        {/* Downturned Sad Mouth */}
        <path
          d="M 17 33 Q 25 26 33 33"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Gentle Falling Tear */}
        <path
          d="M 32 25 C 32 25 30.5 27.5 30.5 29 C 30.5 30.1 31.4 31 32.5 31 C 33.6 31 34.5 30.1 34.5 29 C 34.5 27.5 32 25 32 25 Z"
          fill="#93C5FD"
          className="animate-tear-drop"
        />
      </svg>

      {/* Gentle Dua / Hands in Prayer Badge */}
      <span
        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 border border-zinc-600 text-[10px] shadow-sm select-none"
        aria-hidden="true"
      >
        🤲
      </span>
    </div>
  );
}

export function RsvpSection() {
  const { rsvp } = WEDDING_CONFIG;
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState<"attending" | "declined">("attending");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [wishes, setWishes] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    attendance?: "attending" | "declined";
    title?: string;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const trimmedName = guestName.trim();
    if (!trimmedName) {
      setStatus({ type: "error", message: "Please enter your name." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: trimmedName,
          attendance,
          guest_count: attendance === "attending" ? guestCount : 0,
          message: wishes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.error || "Unable to submit RSVP. Please try again.",
        });
      } else {
        const isAttending = attendance === "attending";
        setStatus({
          type: "success",
          attendance,
          title: isAttending ? "Response Received" : `Thank you, ${trimmedName}`,
          message: isAttending
            ? `Alhamdulillah! Thank you, ${trimmedName}. We eagerly look forward to celebrating with you!`
            : "Please remember us in your duas and pray for our marriage.",
        });
        setGuestName("");
        setWishes("");
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="relative w-full py-20 px-4 sm:px-6 bg-[#000000] text-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <ScrollReveal delay={100} className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.25em] uppercase text-[#b89b63] font-semibold block mb-2 drop-shadow-sm">
            Response
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl text-white font-normal tracking-wide drop-shadow-md">
            {rsvp.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-zinc-300 mt-2 font-normal max-w-md mx-auto">
            {rsvp.subtitle}
          </p>
        </ScrollReveal>

        {/* RSVP Form Card */}
        <ScrollReveal delay={250} className="max-w-xl mx-auto">
          <div className="relative rounded-3xl bg-zinc-950 border border-white/15 p-6 sm:p-10 shadow-2xl">
            
            {/* Status Message with Animated Face on Success */}
            {status.type && (
              <div
                className={`mb-6 p-4 sm:p-5 rounded-2xl border transition-all duration-300 animate-fade-in ${
                  status.type === "success"
                    ? status.attendance === "attending"
                      ? "bg-gradient-to-r from-[#b89b63]/20 via-[#b89b63]/10 to-black/40 border-[#b89b63]/60 shadow-lg shadow-[#b89b63]/10 text-white"
                      : "bg-gradient-to-r from-zinc-800/40 via-zinc-900/30 to-black/40 border-zinc-700/60 shadow-lg text-white"
                    : "bg-red-950/40 border-red-500/40 text-red-200"
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {status.type === "success" ? (
                    status.attendance === "attending" ? (
                      <SmilingFaceAnimation />
                    ) : (
                      <SadFaceAnimation />
                    )
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold font-sans mb-1 text-white">
                      {status.type === "success"
                        ? status.title || "Response Received"
                        : "Notice"}
                    </p>
                    <p className="text-zinc-200 font-sans">
                      {status.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Name */}
              <div>
                <label
                  htmlFor="guest_name"
                  className="block font-sans text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold"
                >
                  Guest Name <span className="text-[#b89b63]">*</span>
                </label>
                <input
                  id="guest_name"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/20 hover:border-white/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#b89b63] focus:ring-1 focus:ring-[#b89b63] transition-colors duration-200"
                />
              </div>

              {/* Attendance Selection: “Joyfully Accepts” / “Regretfully Declines” */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold">
                  Attendance <span className="text-[#b89b63]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance("attending")}
                    className={`py-3.5 px-4 rounded-xl border font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 min-h-[46px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      attendance === "attending"
                        ? "bg-[#b89b63] hover:bg-[#a68a52] text-white border-[#b89b63] shadow-md shadow-[#b89b63]/20"
                        : "bg-zinc-900 border border-white/20 text-zinc-300 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {rsvp.acceptText}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendance("declined")}
                    className={`py-3.5 px-4 rounded-xl border font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 min-h-[46px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      attendance === "declined"
                        ? "bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600 shadow-md"
                        : "bg-zinc-900 border border-white/20 text-zinc-300 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {rsvp.declineText}
                  </button>
                </div>
              </div>

              {/* Guest Count (if attending) */}
              {attendance === "attending" && (
                <div className="animate-fade-in">
                  <label
                    htmlFor="guest_count"
                    className="block font-sans text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold"
                  >
                    Number of Guests Attending
                  </label>
                  <input
                    id="guest_count"
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/20 hover:border-white/40 text-white text-sm focus:outline-none focus:border-[#b89b63] focus:ring-1 focus:ring-[#b89b63] transition-colors duration-200"
                  />
                </div>
              )}

              {/* Wishes Textarea */}
              <div>
                <label
                  htmlFor="wishes"
                  className="block font-sans text-xs uppercase tracking-widest text-zinc-300 mb-2 font-semibold"
                >
                  Wishes &amp; Duas
                </label>
                <textarea
                  id="wishes"
                  rows={3}
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Leave a message, blessings, or prayers for the couple..."
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/20 hover:border-white/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#b89b63] focus:ring-1 focus:ring-[#b89b63] transition-colors duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-full bg-white hover:bg-zinc-100 text-black font-sans text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase active:scale-[0.98] hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 min-h-[46px] cursor-pointer"
              >
                {loading ? (
                  <span>Sending Response...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-black transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    <span>{rsvp.submitText}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
