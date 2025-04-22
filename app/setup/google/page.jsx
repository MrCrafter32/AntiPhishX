// app/setup/google/page.js
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GoogleSetup() {
  const router = useRouter();

  const handleGoogleOAuth = async () => {
    const res = await signIn("google", { redirect: false });

    if (res.ok) {
      router.push("/dashboard"); // Redirect to dashboard after successful setup
    } else {
      alert("Failed to authenticate with Google");
    }
  };

  return (
    <div>
      <h1 className="text-xl">Google OAuth Setup</h1>
      <button
        onClick={handleGoogleOAuth}
        className="bg-red-500 text-white p-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
