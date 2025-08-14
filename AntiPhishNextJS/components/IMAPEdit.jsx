import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function IMAPEdit() {
    const [imapHost, setImapHost] = useState("");
    const [imapPort, setImapPort] = useState("");
    const [imapEmail, setImapEmail] = useState("");
    const [imapPassword, setImapPassword] = useState("");
    const [useSSL, setUseSSL] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();
    const userId = user?.id;

    useEffect(() => {
        const fetchIMAPSettings = async () => {
            try {
                const response = await fetch('/api/integration/' + userId);
                if (!response.ok) {
                    throw new Error('Failed to fetch IMAP settings');
                }
                const data = await response.json();
                setImapHost(data.imapHost || "");
                setImapPort(data.imapPort || "");
                setImapEmail(data.imapEmail || "");
                setImapPassword(data.imapPassword || "");
                setUseSSL(data.useSSL || false);
            } catch (error) {
                console.error('Error fetching IMAP settings:', error);
            }
        };

        fetchIMAPSettings();
    }, []);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/imap/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imapHost,
                    imapPort,
                    imapEmail,
                    imapPassword,
                    useSSL,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update IMAP settings');
            }

            const data = await response.json();
            toast.success("IMAP settings updated successfully.");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            toast.error("Failed to update IMAP settings.");
            console.error('Error updating IMAP settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-12 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition text-white font-semibold">
                    Edit IMAP Details
                </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] text-white">
                <DialogHeader>
                    <DialogTitle>Edit IMAP Details</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Update your IMAP settings here.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400">IMAP Host</label>
                        <input
                            type="text"
                            value={imapHost}
                            onChange={(e) => setImapHost(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
                            placeholder="Enter IMAP Host"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">IMAP Port</label>
                        <input
                            type="text"
                            value={imapPort}
                            onChange={(e) => setImapPort(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
                            placeholder="Enter IMAP Port"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">IMAP Email</label>
                        <input
                            type="text"
                            value={imapEmail}
                            onChange={(e) => setImapEmail(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
                            placeholder="Enter IMAP Email"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">IMAP Password</label>
                        <input
                            type="password"
                            value={imapPassword}
                            onChange={(e) => setImapPassword(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white p-2 rounded-md border border-gray-600"
                            placeholder="Enter IMAP Password"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={useSSL}
                            onChange={(e) => setUseSSL(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-400">Use SSL</label>
                    </div>
                    <button
                        onClick={handleUpdate}
                        className={`px-4 py-2 rounded-xl transition text-white font-semibold ${
                            isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
