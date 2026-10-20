import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Cormorant Garamond", "Playfair Display", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        amiri: ["var(--font-amiri)", "Amiri", "Traditional Arabic", "serif"],
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        warmIvory: "#F7F1E6",
        softBeige: "#EFE6D6",
        deepBrown: "#29251F",
        mutedBrown: "#5F5A52",
        secondaryText: "#666057",
        goldAccent: "#B89B63",
        champagneGold: "#C8A96B",
        borderFamily: "#DDD0B9",
        borderEvents: "#D8C8AB",
        footerSecondary: "#BDB3A3",
      },
      animation: {
        "fade-in": "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "bounce-slow": "bounceSlow 2.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
