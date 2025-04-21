// app/login/page.js
"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="p-10">
      <h2 className="text-xl mb-4">Login</h2>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <button
        onClick={() =>
          signIn("credentials", {
            email: "your@email.com",
            password: "password",
          })
        }
      >
        Sign in with Credentials
      </button>
    </div>
  );
}
