"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  if (!loggedIn) return null; // 👈 hide if not logged in

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