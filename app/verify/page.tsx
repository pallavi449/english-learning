"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── Inner component uses useSearchParams — must be inside Suspense ──
function VerifyForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.message) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1800);
      } else {
        setError(data.error || "Verification failed");
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
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-semibold mb-1">Check your email</h1>
          <p className="text-[#8b9cb8] text-sm">We sent a 6-digit code to</p>
          {email && <p className="text-blue-400 text-sm font-medium mt-1">{email}</p>}
        </div>

        <div className="bg-[#252d3d] border border-[#2d3748] rounded-2xl p-7">
          {success && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-green-400 text-sm">✅ Account verified! Redirecting to login...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}

          <label className="text-[#a0aec0] text-xs font-medium mb-4 block uppercase tracking-wide text-center">
            Enter OTP
          </label>
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-semibold bg-[#1a1f2e] border rounded-xl text-[#e2e8f0] focus:outline-none transition-colors ${
                  digit ? "border-blue-500 text-blue-300" : "border-[#2d3748] focus:border-blue-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || success}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "Verifying..." : success ? "Verified ✅" : "Verify Account →"}
          </button>
        </div>

        <p className="text-center text-[#8b9cb8] text-sm mt-5">
          Wrong email?{" "}
          <Link href="/signup" className="text-blue-400 hover:underline">Go back to signup</Link>
        </p>
      </div>
    </main>
  );
}

// ── Outer page wraps VerifyForm in Suspense ──
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#1a1f2e]">
        <p className="text-[#8b9cb8] animate-pulse">Loading...</p>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}