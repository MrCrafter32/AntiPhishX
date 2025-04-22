import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/profile", "/setup"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // If the user is not authenticated and trying to access a protected route
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If the user is authenticated and trying to access login/register page, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If the user is logged out and trying to access a protected page, ensure they go to login
  if (!token && (pathname === "/logout")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Define routes where the middleware should apply
export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/profile/:path*", "/setup/:path"],
};
