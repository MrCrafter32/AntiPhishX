"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InboxTable from "@/components/InboxTable";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { NextRequest } from "next/server";
import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mails, setMails] = useState([]);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkImapSetup = async () => {
      try {
        const res = await fetch("/api/setup/imap");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch IMAP setup");
        }
        const data = await res.json();
        setIsFirstLogin(data.isFirstLogin.isFirstLogin);
      } catch (error) {
        console.error("Error checking IMAP setup:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    checkImapSetup();
  }, []);

  useEffect(() => {
    if (!loading && !isFirstLogin) {
      fetch("/api/imap/fetch-inbox")
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to fetch inbox");
          }
          return response.json();
        })
        .then(data => {
          setMails(data);
        })
        .catch(error => {
          console.error("Error fetching emails:", error);
          setError(error.message);
        });
    }
  }, [loading, isFirstLogin]);

  if (isFirstLogin) {
    redirect("/setup");
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a1a1a] to-[#0f0f0f] text-white">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-[#1a1a1a] to-[#0f0f0f] text-white overflow-hidden">
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#1a1a1a]/60 backdrop-blur-md shadow-md flex-shrink-0">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <UserButton />
      </div>

      <div className="flex flex-1 overflow-hidden relative p-2 gap-2">
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
      </div>
    </div>
  );
}
