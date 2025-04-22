'use client'

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login"); // Redirect to login page after logout
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
