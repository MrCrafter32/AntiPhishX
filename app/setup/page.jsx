"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession hook

export default function SetupPage() {
  const [type, setType] = useState("IMAP");
  const [imapDetails, setImapDetails] = useState({
    imapHost: "",
    imapPort: 993,
    imapSSL: true,
    imapEmail: "",
    imapPassword: ""
  });

  const router = useRouter();
  const { data: session, status } = useSession(); // Fetch session data

  useEffect(() => {
    // If session is loading or user is not logged in, don't proceed
    if (status === "loading") return;

    // Check if the user is logged in and if it's their first login
    if (session && session.user && !session.user.isFirstLogin) {
      router.push("/dashboard"); // Redirect if it's not the first login
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

    const res = await fetch("/api/setup/imap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imapDetails)
    });

    if (res.ok) {
      session.isFirstLogin= false;
      session.user.isFirstLogin = false;
      console.log(session)
      router.push("/dashboard");
    } else {
      alert("Setup failed. Check your details.");
    }
  };

  // If session status is still loading, show loading screen
  if (status === "loading") {
    return <div>Loading...</div>; // You can customize this part as needed
  }

  return (
    <main className="max-w-sm mx-auto mt-16 p-4 border rounded-lg shadow-md bg-white transition-all duration-300 ease-in-out transform hover:scale-105">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800 transition-all duration-300 ease-in-out hover:text-blue-600">
        Setup Your Mail Integration
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
            type === "IMAP" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
          } hover:bg-blue-700 hover:text-white`}
          onClick={() => setType("IMAP")}
        >
          IMAP
        </button>
      </div>

      {type === "IMAP" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full sm:w-80 mx-auto">
          <input
            name="imapHost"
            placeholder="IMAP Host"
            value={imapDetails.imapHost}
            onChange={handleChange}
            className="border p-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            required
          />
          <input
            name="imapPort"
            placeholder="IMAP Port"
            type="number"
            value={imapDetails.imapPort}
            onChange={handleChange}
            className="border p-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="imapSSL"
              checked={imapDetails.imapSSL}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-0"
            />
            Use SSL
          </label>
          <input
            name="imapEmail"
            placeholder="Email"
            type="email"
            value={imapDetails.imapEmail}
            onChange={handleChange}
            className="border p-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            required
          />
          <input
            name="imapPassword"
            placeholder="Password"
            type="password"
            value={imapDetails.imapPassword}
            onChange={handleChange}
            className="border p-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white text-sm px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
            Submit
          </button>
        </form>
      )}
    </main>
  );
}
