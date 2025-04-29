"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res.ok) {
      console.log(res);
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark bg-400% px-4 relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark bg-400% opacity-60 blur-2xl"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-white mb-8 text-center animate-fade-in-down">
          AntiphishX
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl animate-fade-in border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            Welcome Back!!
          </h2>

          <div className="flex flex-col gap-4 text-white">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full px-4 py-2 border border-white/20 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/70 transition-all"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full px-4 py-2 border border-white/20 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/70 transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition-all duration-400 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </div>

          {/* Sign up link text */}
          <div className="text-center mt-6 text-sm text-white/70">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={handleSignup}
              className="text-purple-400 hover:underline hover:text-purple-300 transition-all"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
