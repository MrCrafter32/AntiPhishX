"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import IMAPEdit from "./IMAPEdit";

export default function Sidebar({ email }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [imapDetails, setImapDetails] = useState({
    imapHost: "",
    imapPort: "",
    imapSSL: "",
    imapEmail: "",
  });

  const userId = session?.user?.id;
  const name = session?.user?.name;
  // console.log(session)

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

  const handleLogout = () => {
    router.push("/logout");
  };

  return (
    <div className="h-full rounded-2xl p-6 bg-white/5 backdrop-blur-md shadow-md border border-white/10 flex flex-col justify-between">
      <div className="text-center">
      <div className="text-md font-bold break-words">{name}</div>

        <div className="text-sm font-bold mb-6 break-words">{email}</div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-400 break-words">IMAP Details</p>
          <p className="text-sm text-gray-400 break-words">IMAP Host: {imapHost}</p>
          <p className="text-sm text-gray-400 break-words">IMAP Port: {imapPort}</p>
          <p className="text-sm text-gray-400 break-words">IMAP User: {imapEmail}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <IMAPEdit />
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition text-white font-semibold"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
