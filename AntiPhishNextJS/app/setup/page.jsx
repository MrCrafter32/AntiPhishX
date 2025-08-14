"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'https://mrcrafter.tech:3001/setup';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export default function SetupPage() {
    const [type, setType] = useState("IMAP");
    const [imapDetails, setImapDetails] = useState({
        type: "IMAP",
        imapHost: "",
        imapPort: 993,
        imapSSL: true,
        imapEmail: "",
        imapPassword: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [hasHandledAuth, setHasHandledAuth] = useState(false);
    const [hasGoogleOAuth, setHasGoogleOAuth] = useState(false);

    const router = useRouter();
    const { user, isSignedIn } = useUser();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        const handleGoogleCallback = async (authCode) => {
            if (!user?.id) {
                toast.error('User not authenticated. Please try again.');
                setIsSubmitting(false);
                return;
            }

            if (hasHandledAuth) {
                return;
            }

            setHasHandledAuth(true);

            setIsSubmitting(true);
            try {
                const tokenResponse = await fetch('/api/setup/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id, 
                        code: authCode,
                        redirectUri: REDIRECT_URI,
                    }),
                });

                if (tokenResponse.ok) {
                    toast.success("Google authentication successful! Redirecting...");
                    router.push("/");
                } else {
                    const { error } = await tokenResponse.json();
                    throw new Error(error || 'Failed to exchange code for tokens.');
                }
            } catch (e) {
                console.error("Google authentication failed:", e);
                toast.error("Google authentication failed. Please check your credentials.");
            } finally {
                setIsSubmitting(false);
                router.replace('/setup', undefined, { shallow: true });
            }
        };

        if (code && !hasHandledAuth) {
            handleGoogleCallback(code);
        } else {
            setCheckingAuth(false);
        }
    }, [router, user, hasHandledAuth]);

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
            router.push("/");
        } else {
            toast.error("Setup failed. Check your details.");
        }
    };

    const startGoogleOAuth = () => {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;
        window.location.href = authUrl;
    };

    if (!isSignedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark">
                <p className="text-white text-xl">Please sign in to continue.</p>
            </div>
        );
    }

    if (checkingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark">
                <div className="animate-pulse text-white text-2xl font-bold">
                    Checking authentication method...
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark opacity-60 blur-2xl"></div>

            <main className="relative z-10 max-w-md w-full p-8 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl space-y-6 border border-white/10 animate-fade-in">
                <h1 className="text-2xl font-bold text-center text-white mb-6">
                    Setup Your Mail Integration
                </h1>

                <div className="flex justify-center gap-4 mb-6">
                    <button
                        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${type === "IMAP" ? "bg-blue-600 text-white" : "bg-white/10 text-white/70"
                            } hover:bg-blue-700`}
                        onClick={() => setType("IMAP")}
                    >
                        IMAP
                    </button>
                    <button
                        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${type === "GOOGLE" ? "bg-amber-600 text-white" : "bg-white/10 text-white/70"
                            } hover:bg-amber-700`}
                        onClick={() => setType("GOOGLE")}
                    >
                        Google
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
                {type === "GOOGLE" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-white/80 text-sm text-center">
                            Sign in with your Google account to authorize this app to access your emails. You will only have to do this once.
                        </p>
                        <button
                            onClick={startGoogleOAuth}
                            disabled={isSubmitting}
                            className="flex justify-center items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm px-6 py-3 rounded-md font-medium transition-all ease-in-out transform hover:scale-105 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Redirecting...' : 'Sign in with Google'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
