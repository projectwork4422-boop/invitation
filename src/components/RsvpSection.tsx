"use client";

import React, { useState } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function RsvpSection() {
  const { rsvp } = WEDDING_CONFIG;
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState<"attending" | "declined">("attending");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [wishes, setWishes] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (!guestName.trim()) {
      setStatus({ type: "error", message: "Please enter your name." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName.trim(),
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
        setStatus({
          type: "success",
          message:
            attendance === "attending"
              ? `Alhamdulillah! Thank you, ${guestName.trim()}. We eagerly look forward to celebrating with you!`
              : `Thank you, ${guestName.trim()}. We will cherish your sincere prayers and duas for our marriage.`,
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
            
            {/* Status Message */}
            {status.type && (
              <div
                className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
                  status.type === "success"
                    ? "bg-[#b89b63]/15 border-[#b89b63]/50 text-white"
                    : "bg-red-950/40 border-red-500/40 text-red-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#b89b63] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs sm:text-sm leading-relaxed">
                  <p className="font-semibold font-sans mb-0.5 text-white">
                    {status.type === "success" ? "Response Received" : "Notice"}
                  </p>
                  <p className="text-zinc-200">{status.message}</p>
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
                  className={`py-3.5 px-4 rounded-xl border font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 min-h-[46px] hover:scale-[1.02] active:scale-[0.98] ${
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
                  className={`py-3.5 px-4 rounded-xl border font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 min-h-[46px] hover:scale-[1.02] active:scale-[0.98] ${
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
              className="group w-full py-3.5 rounded-full bg-white hover:bg-zinc-100 text-black font-sans text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase active:scale-[0.98] hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 min-h-[46px]"
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
