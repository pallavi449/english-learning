"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.message) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#1a1f2e] min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-semibold mb-1">Create an account</h1>
          <p className="text-[#8b9cb8] text-sm">Start learning English for free</p>
        </div>

        <div className="bg-[#252d3d] border border-[#2d3748] rounded-2xl p-7">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#2d3748] text-[#e2e8f0] placeholder-[#4a5568] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#2d3748] text-[#e2e8f0] placeholder-[#4a5568] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className="w-full bg-[#1a1f2e] border border-[#2d3748] text-[#e2e8f0] placeholder-[#4a5568] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </div>

        <p className="text-center text-[#8b9cb8] text-sm mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}