import React from "react";

export function BismillahSvg({ className = "w-64 h-auto" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <span
        lang="ar"
        dir="rtl"
        className="font-amiri text-2xl sm:text-3xl md:text-4xl text-inherit tracking-widest leading-relaxed select-none font-normal"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
    </div>
  );
}

export function OrnamentalDivider({
  className = "",
  variant = "gold",
}: {
  className?: string;
  variant?: "gold" | "white" | "dark";
}) {
  const lineClasses = {
    gold: "bg-[#B89B63]/40",
    white: "bg-white/20",
    dark: "bg-[#29251F]/20",
  }[variant];

  const diamondClasses = {
    gold: "bg-[#B89B63]",
    white: "bg-white",
    dark: "bg-[#29251F]",
  }[variant];

  return (
    <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
      <div className={`h-[1px] w-12 sm:w-20 md:w-28 ${lineClasses}`} />
      <div className={`w-1.5 h-1.5 rotate-45 ${diamondClasses}`} />
      <div className={`h-[1px] w-12 sm:w-20 md:w-28 ${lineClasses}`} />
    </div>
  );
}

export function InfinityIcon({ className = "w-8 h-8 text-inherit" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Infinity"
    >
      <path
        d="M 30,12 
           C 15,12 8,25 25,38 
           C 42,50 58,0 75,12 
           C 92,25 85,38 70,38 
           C 55,38 45,25 30,12 Z"
      />
    </svg>
  );
}

export function CornerArabesque({
  position = "top-left",
  className = "w-10 h-10 text-[#B89B63]/50",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const rotation = {
    "top-left": "rotate-0",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`${rotation} ${className}`}
      aria-hidden="true"
    >
      <path d="M 0 0 L 0 45 C 10 40, 20 30, 25 25 C 30 20, 40 10, 45 0 Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M 0 0 L 0 50 C 15 45, 25 35, 35 25 C 45 15, 50 0, 50 0" />
      <path d="M 5 5 L 5 35 C 12 30, 20 22, 28 15 C 32 10, 35 5, 35 5" />
      <circle cx="18" cy="18" r="3" fill="currentColor" />
    </svg>
  );
}
