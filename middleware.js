import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;

  // console.log('Token in middleware:', token);  // Debugging token data

  // If no token exists, the user is not logged in
  if (!token && pathname !== "/login" && pathname !== "/signup") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if the user is logging in for the first time and redirect to the setup page
  if (token && token.isFirstLogin && pathname !== "/setup") {
    console.log('User is first-time login, redirecting to setup page');
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // Redirect users who are already logged in to the dashboard if they try to access login or signup
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow all other routes to proceed as usual
  return NextResponse.next();
}

export const config = {
  matcher: ["/","/login", "/signup", "/dashboard", "/setup"],
};
