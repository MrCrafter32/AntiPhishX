"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Sidebar({ email, name, userId }) {
  const [imapDetails, setImapDetails] = useState({
    imapHost: "",
    imapPort: "",
    imapSSL: "",
    imapEmail: "",
  });

  useEffect(() => {
    const fetchIntegrationDetails = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/integration/${userId}`);
          if (response.ok) {
            const details = await response.json();
            setImapDetails(details);
          } else {
            console.error("Failed to fetch integration details.");
          }
        } catch (error) {
          console.error("Error fetching IMAP details:", error);
        }
      }
    };
    fetchIntegrationDetails();
  }, [userId]);

  const { imapHost, imapPort, imapSSL, imapEmail } = imapDetails;

  return (
    <div className="h-full rounded-2xl p-6 bg-white/5 backdrop-blur-md shadow-md border border-white/10 flex flex-col justify-between">
      <SignedIn>
        <div className="text-center">
          <div className="text-md font-bold break-words">{name}</div>
          <div className="text-sm font-bold mb-6 break-words">{email}</div>
          <div className="mb-4">
            <Link href="/login">
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl transition text-white font-semibold">
                Connect Google (SSO)
              </button>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-400 break-words">IMAP Details</p>
            <p className="text-sm text-gray-400 break-words">IMAP Host: {imapHost}</p>
            <p className="text-sm text-gray-400 break-words">IMAP Port: {imapPort}</p>
            <p className="text-sm text-gray-400 break-words">IMAP User: {imapEmail}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <UserButton afterSignOutUrl="/login" />
        </div>
      </SignedIn>
    </div>
  );
}
