"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-white/90 text-sm hover:text-white border border-white/30 px-3 py-1 rounded-lg hover:border-white/60 transition-colors"
    >
      Log out
    </button>
  );
}