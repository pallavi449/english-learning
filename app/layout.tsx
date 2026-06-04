import type { Metadata } from "next";
import Navbar from "./components/Navbar";       // ← add
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn English",
  description: "Daily spoken English for Hindi speakers",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111111] min-h-screen">
        <Navbar />                              {/* ← replace old nav */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}