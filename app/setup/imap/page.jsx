// app/setup/imap/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IMAPSetup() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h1 className="text-xl">IMAP Setup</h1>
      <input
        type="text"
        placeholder="IMAP Host"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="IMAP Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Save Settings
      </button>
    </form>
  );
}
