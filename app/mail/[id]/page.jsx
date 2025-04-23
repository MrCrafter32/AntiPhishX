"use client";

import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import ScoreMeter from "@/components/ScoreMeter"; // Adjust the path if needed

export default function Mail({ params }) {
    const [loading, setLoading] = useState(true);
    const [predictLoading, setPredictLoading] = useState(false);
    const [htmlBody, setHtmlBody] = useState("");
    const [plainBody, setPlainBody] = useState("");
    const [score, setScore] = useState(null);
    const [label, setLabel] = useState("");
    const [error, setError] = useState(null);

    // Fetch email data
    useEffect(() => {
        async function fetchMail() {
            try {
                const { id } = params;
                const response = await fetch(`/api/imap/fetch-mail?id=${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch mail");
                }

                const data = await response.json();
                setHtmlBody(data.htmlBody);
                setPlainBody(data.plainBody);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMail();
    }, [params]);

    // Trigger prediction after plainBody is set
    useEffect(() => {
        if (!plainBody) return;

        async function predictPhishing() {
            try {
                setPredictLoading(true);
                const res = await fetch("/api/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: plainBody }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Prediction failed");
                }

                const { confidence, label } = await res.json();
                setScore(confidence);
                setLabel(label);
            } catch (err) {
                setError(err.message);
            } finally {
                setPredictLoading(false);
            }
        }

        predictPhishing();
    }, [plainBody]);

    if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar & Content */}
            <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center mb-4">
                    <Link href="/" className="mr-4 text-gray-700 hover:text-black">
                        <Home className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-semibold">Email Analysis</h1>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
                    <h2 className="text-lg font-bold mb-2">Subject : This is a test email Subject</h2>
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>From:</strong> Tim Travis &lt;timtravis@phishingmail.com&gt;
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>To:</strong> Victim &lt;victimmail@erripuk.com&gt;
                    </p>
                    <h3 className="text-md font-semibold mb-2">Body:</h3>
                    <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: String(htmlBody) }} />
                </div>
            </div>

            {/* Prediction Panel */}
            <div className="w-64 bg-white border-l shadow-inner flex flex-col items-center justify-center p-6">
                {predictLoading ? (
                    <p className="text-gray-500 text-sm">Analyzing...</p>
                ) : (
                    <>
                        <ScoreMeter score={score ?? 0} />
                        <p className="text-sm font-medium text-gray-700 mt-4">{label}</p>
                    </>
                )}
                <p className="text-sm text-gray-500 mt-2">Email Analysed in 3 sec</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                    ReAnalyse
                </button>
            </div>
        </div>
    );
}
