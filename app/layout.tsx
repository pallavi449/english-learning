import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn English",
  description: "Daily spoken English for Hindi speakers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111111] min-h-screen">
        <nav className="bg-blue-600 px-7 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-semibold text-lg">
            Learn English
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-white/90 text-sm hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/lessons" className="text-white/90 text-sm hover:text-white transition-colors">
              Lessons
            </Link>
            <Link href="/quiz" className="text-white/90 text-sm hover:text-white transition-colors">
              Quiz
            </Link>
            <Link href="/vocab" className="text-white/90 text-sm hover:text-white transition-colors">
              Vocab
            </Link>
              <LogoutButton />
            {/* Admin link is intentionally hidden from navbar */}
            {/* Access admin at: localhost:3000/admin */}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
