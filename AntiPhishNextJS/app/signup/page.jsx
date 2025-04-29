"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        const data = await res.json();
        // router.push("/login");
        const response = await signIn("credentials", {
              redirect: false,
              email,
              password,
            });
        router.push("/");
      } else {
        alert("Signup failed!");
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark bg-400% relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark opacity-60 blur-2xl"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full p-8 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl space-y-6 border border-white/10 animate-fade-in">
        <h2 className="text-3xl font-semibold text-center text-white">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-white/70">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-white/20 bg-white/5 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white/70">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-white/20 bg-white/5 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white/70">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-white/20 bg-white/5 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all ease-in-out"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline hover:text-purple-300 transition-all">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
