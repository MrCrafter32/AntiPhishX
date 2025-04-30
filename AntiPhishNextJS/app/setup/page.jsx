"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

export default function SetupPage() {
  const [type, setType] = useState("IMAP");
  const [imapDetails, setImapDetails] = useState({
    imapHost: "",
    imapPort: 993,
    imapSSL: true,
    imapEmail: "",
    imapPassword: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (session && session.user && session.user.isFirstLogin === false) {
      router.push("/");
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setImapDetails((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/setup/imap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imapDetails)
    });

    setIsSubmitting(false);

    if (res.ok) {
      toast.success("Setup successful! Redirecting...");

      session.isFirstLogin = false;
      session.user.isFirstLogin = false;

      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push("/");
      }, 3000);
    } else {
      toast.error("Setup failed. Check your details.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark opacity-60 blur-2xl"></div>

      {/* Main Content */}
      <main className="relative z-10 max-w-md w-full p-8 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl space-y-6 border border-white/10 animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Setup Your Mail Integration
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
              type === "IMAP" ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
            } hover:bg-blue-700`}
            onClick={() => setType("IMAP")}
          >
            IMAP
          </button>
        </div>

        {type === "IMAP" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="imapHost"
              placeholder="IMAP Host"
              value={imapDetails.imapHost}
              onChange={handleChange}
              className="border border-white/20 bg-white/5 text-white p-3 rounded-md placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <input
              name="imapPort"
              placeholder="IMAP Port"
              type="number"
              value={imapDetails.imapPort}
              onChange={handleChange}
              className="border border-white/20 bg-white/5 text-white p-3 rounded-md placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <label className="flex items-center gap-2 text-white/70 text-sm">
              <input
                type="checkbox"
                name="imapSSL"
                checked={imapDetails.imapSSL}
                onChange={handleChange}
                className="h-4 w-4 text-purple-500 focus:ring-0"
              />
              Use SSL
            </label>
            <input
              name="imapEmail"
              placeholder="Email"
              type="email"
              value={imapDetails.imapEmail}
              onChange={handleChange}
              className="border border-white/20 bg-white/5 text-white p-3 rounded-md placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <input
              name="imapPassword"
              placeholder="Password"
              type="password"
              value={imapDetails.imapPassword}
              onChange={handleChange}
              className="border border-white/20 bg-white/5 text-white p-3 rounded-md placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />

            <button
              type="submit"
              className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-6 py-3 rounded-md font-medium transition-all ease-in-out transform hover:scale-105 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
