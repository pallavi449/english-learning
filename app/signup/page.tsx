"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return "Full name is required";
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email address";
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const validateAll = (): boolean => {
    const errors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true });
    return !errors.name && !errors.email && !errors.password;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validators = {
      name: () => validateName(name),
      email: () => validateEmail(email),
      password: () => validatePassword(password),
    };
    setFieldErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  };

  const handleChange = (
    field: keyof FieldErrors,
    value: string,
    setter: (v: string) => void
  ) => {
    setter(value);
    if (touched[field]) {
      const validators = {
        name: () => validateName(value),
        email: () => validateEmail(value),
        password: () => validatePassword(value),
      };
      setFieldErrors((prev) => ({ ...prev, [field]: validators[field]() }));
    }
  };

  const handleSignup = async () => {
    setError(null);
    if (!validateAll()) return;

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

  const inputClass = (field: keyof FieldErrors) =>
    `w-full bg-[#1a1f2e] border text-[#e2e8f0] placeholder-[#4a5568] rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
      touched[field] && fieldErrors[field]
        ? "border-red-500 focus:border-red-400"
        : "border-[#2d3748] focus:border-blue-500"
    }`;

  const FieldError = ({ field }: { field: keyof FieldErrors }) =>
    touched[field] && fieldErrors[field] ? (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        {fieldErrors[field]}
      </p>
    ) : null;

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

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => handleChange("name", e.target.value, setName)}
              onBlur={() => handleBlur("name")}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className={inputClass("name")}
            />
            <FieldError field="name" />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => handleChange("email", e.target.value, setEmail)}
              onBlur={() => handleBlur("email")}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className={inputClass("email")}
            />
            <FieldError field="email" />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-[#a0aec0] text-xs font-medium mb-2 block uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handleChange("password", e.target.value, setPassword)}
              onBlur={() => handleBlur("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className={inputClass("password")}
            />
            <FieldError field="password" />
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