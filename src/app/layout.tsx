import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Cormorant_Garamond,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AL-SHAKHOF & FATHIMA AFNAAN | Wedding Invitation",
  description:
    "Two Souls · One Journey · Infinite Love. Join us in celebrating the Nikāh of AL-SHAKHOF & FATHIMA AFNAAN on 10-01-2027 at Bava Kasim Waliyullah Community Hall.",
  keywords: [
    "AL-SHAKHOF",
    "FATHIMA AFNAAN",
    "Wedding Invitation",
    "Muslim Wedding",
    "Nikah",
    "Bava Kasim Waliyullah Community Hall",
    "Nagercoil",
  ],
  openGraph: {
    title: "AL-SHAKHOF & FATHIMA AFNAAN — We Choose Forever",
    description: "10-01-2027 • Bava Kasim Waliyullah Community Hall",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${amiri.variable} ${cormorant.variable} ${playfair.variable} ${jakarta.variable}`}
    >
      <body className="antialiased bg-black text-white selection:bg-white selection:text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
