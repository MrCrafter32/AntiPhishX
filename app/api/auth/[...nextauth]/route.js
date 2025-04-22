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
    signIn: "/auth/login",
    error: "/auth/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isFirstLogin = user.isFirstLogin; // Add this line
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
  
      if (token.isFirstLogin) {
        session.isFirstLogin = true;
  
        await prisma.user.update({
          where: { id: token.id },
          data: { isFirstLogin: false },
        });
  
        token.isFirstLogin = false;
      }
  
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const GET = NextAuth(authOptions)
export const POST = NextAuth(authOptions)
