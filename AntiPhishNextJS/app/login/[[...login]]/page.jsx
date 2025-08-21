import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark bg-400% px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-dark bg-400% opacity-60 blur-2xl"></div>

      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </div>
  );
}


