// app/setup/page.js
"use client";

import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();

  const handleIMAPSetup = () => {
    router.push("/setup/imap"); // Redirect to IMAP setup page
  };

  const handleGoogleSetup = () => {
    router.push("/setup/google"); // Redirect to Google OAuth setup
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl">Set up your email account</h1>
      <p>Choose how you want to fetch your emails:</p>
      <button
        onClick={handleIMAPSetup}
        className="bg-blue-500 text-white p-2 rounded"
      >
        IMAP Setup
      </button>
      <button
        onClick={handleGoogleSetup}
        className="bg-red-500 text-white p-2 rounded"
      >
        Google OAuth Setup
      </button>
    </div>
  );
}
