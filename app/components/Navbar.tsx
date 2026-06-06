"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/lessons", label: "Lessons" },
    { href: "/quiz", label: "Quiz" },
    { href: "/vocab", label: "Vocab" },
    { href: "/story", label: "Story" },
    { href: "/grammar", label: "Grammar" },
  ];

  return (
    <nav className="bg-blue-600 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-white font-semibold text-lg">
          Learn English
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/90 text-sm hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <LogoutButton />
        </div>

        {/* Hamburger button - mobile only */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-1"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-blue-500 pt-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white/90 text-sm py-2 px-2 rounded hover:bg-blue-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}