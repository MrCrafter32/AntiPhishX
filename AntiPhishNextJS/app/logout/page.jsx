"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      await signOut({ redirect: false }); // don't redirect immediately
      router.push("/login"); // manually send to login page
    }, 2000); // 2 seconds delay for animation

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Logging you out...</p>
      </div>
    </div>
  );
}
