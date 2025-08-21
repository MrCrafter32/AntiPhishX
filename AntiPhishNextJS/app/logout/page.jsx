"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ redirectUrl: '/' });
    }, 1000);

    return () => clearTimeout(timer); 
  }, [router, signOut]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Logging you out...</p>
      </div>
    </div>
  );
}
