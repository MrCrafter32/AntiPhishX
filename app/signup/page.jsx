"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        // Redirect to home after successful signup
        router.push("/");
      } else {
        // Handle errors
        alert("Signup failed!");
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-700">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-600">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:outline-none text-gray-600 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-all ease-in-out"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
