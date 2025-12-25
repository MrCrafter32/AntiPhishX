"use client";

import { useEffect, useMemo, useState } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import ScoreMeter from "@/components/ScoreMeter";
import { toast } from "sonner";
import DOMPurify from "dompurify";

export default function Mail({ params }) {
    const [loading, setLoading] = useState(true);
    const [predictLoading, setPredictLoading] = useState(false);
    const [htmlBody, setHtmlBody] = useState("");
    const [plainBody, setPlainBody] = useState("");
    const [score, setScore] = useState(null);
    const [label, setLabel] = useState("");
    const [error, setError] = useState(null);
    const [analysisTime, setAnalysisTime] = useState(null);
    const [isAnalyzed, setIsAnalyzed] = useState(false);

    const [subject, setSubject] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const { id } = params; 
    const sanitizedHtml = useMemo(
        () => DOMPurify.sanitize(htmlBody || ""),
        [htmlBody]
    );
    const meta = [
        { label: "Subject", value: subject || "No subject" },
        { label: "From", value: from || "Unknown sender" },
        { label: "To", value: to || "Unknown recipient" },
    ];

    useEffect(() => {
        async function fetchMail() {
            try {
                const response = await fetch(`/api/imap/fetch-mail/${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch mail");
                }

                const data = await response.json();
                setHtmlBody(data.htmlBody);
                setPlainBody(data.textBody);
                setSubject(data.subject);
                setFrom(data.from);
                setTo(data.to);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMail();
    }, [id]);

    async function handleReanalyze() {
        try {
            setPredictLoading(true);
            const startTime = Date.now();
            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email_text: plainBody }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Prediction failed");
            }

            const { confidence, prediction } = await res.json();
            setScore(confidence * 100);
            setLabel(prediction);

            const endTime = Date.now();
            setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
            setIsAnalyzed(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setPredictLoading(false);
        }
    }

    async function handleReportFalseAnalysis() {
        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailBody: plainBody, analysis: { score, label } }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to report false analysis");
            }

            toast.success("False analysis reported successfully");
        } catch (err) {
            toast.error("Failed to report false analysis: " + err.message);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0f0f0f]">
                <p className="animate-pulse text-white text-2xl font-bold">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0f0f0f]">
                <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#0f0f0f] text-white overflow-hidden font-sans">
            <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center mb-4">
                    <Link href="/" className="mr-4 text-white hover:text-gray-300">
                        <Home className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl text-white font-bold">Email Analysis</h1>
                </div>

                <div className="flex-1 rounded-2xl p-6 backdrop-blur-md bg-white/5 shadow-md border border-white/10 overflow-auto space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        {meta.map((item) => (
                            <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                                <p className="text-sm text-white mt-1 break-words">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <h3 className="text-md text-gray-300 font-semibold mb-2">HTML Body</h3>
                            <div
                                className="text-sm text-gray-200 prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                            />
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-md text-gray-300 font-semibold">Plain Text</h3>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-300">
                                    Read-only
                                </span>
                            </div>
                            <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-3 border border-white/5 h-[320px] overflow-y-auto">
                                {plainBody || "No text content available"}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-80 bg-white/5 backdrop-blur-md border-l border-white/10 shadow-md flex flex-col items-center justify-center p-6 rounded-l-2xl space-y-3">
                <h2 className="text-xl font-semibold text-white">Phishing Analysis</h2>

                {predictLoading ? (
                    <p className="text-gray-400 text-sm">Analyzing...</p>
                ) : (
                    <>
                        {isAnalyzed && score !== null && (
                            <ScoreMeter score={score ?? 0} label={label} />
                        )}
                        {isAnalyzed && (
                            <p className="text-sm font-medium text-gray-300 mt-4">{label}</p>
                        )}
                    </>
                )}

                <div className="text-xs text-gray-400">
                    {analysisTime ? (
                        <>Email analyzed in {analysisTime} sec</>
                    ) : (
                        <>Not analyzed yet</>
                    )}
                </div>

                <button
                    onClick={handleReanalyze}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-md w-full transition-colors"
                >
                    {isAnalyzed ? "Reanalyze" : "Analyze"}
                </button>

                {isAnalyzed && score !== null && (
                    <button
                        onClick={handleReportFalseAnalysis}
                        className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md w-full transition-colors"
                    >
                        Report False Analysis
                    </button>
                )}
            </div>
        </div>
    );
}
