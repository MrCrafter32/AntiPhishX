import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("No user found");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login", // Adjust to match your login route
    error: "/auth/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isFirstLogin = user.isFirstLogin;  // Attach isFirstLogin to token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.isFirstLogin = token.isFirstLogin;  // Attach isFirstLogin to session

      // No need to update the user here as it's done in middleware now

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const GET = NextAuth(authOptions)
export const POST = NextAuth(authOptions)
