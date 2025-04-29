"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import InboxTable from "@/components/InboxTable";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMails = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        const userId = session.user.id;

        const response = await fetch(
          `http://mrcrafter.tech:3000/api/imap/fetch-inbox?sessionId=${userId}`,
          {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userId}`,
              },
          }
      );

        const data = await response.json();
        setMails(data);
      } catch (error) {
        console.error("Error fetching mails:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchMails();
    }
  }, [session, status]); // depend on session and status

  if (status === "loading") {
    return (
      <div className="h-screen flex justify-center items-center bg-[#0f0f0f]">
        <div className="animate-pulse text-white text-2xl font-bold">
          Authenticating...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#0f0f0f] text-white">
        You must be signed in.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-[#1a1a1a] to-[#0f0f0f] text-white overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#1a1a1a]/60 backdrop-blur-md shadow-md flex-shrink-0">
        <h1 className="text-2xl font-bold">Inbox</h1>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative p-2 gap-2">
        {/* Left */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-full rounded-2xl p-4 backdrop-blur-md bg-white/5 shadow-md border border-white/10">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <InboxTable mails={mails} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-1/4 flex flex-col">
          <Sidebar email={session.user.email} />
        </div>
      </div>
    </div>
  );
}
