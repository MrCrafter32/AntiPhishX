import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;


  if (!token && pathname !== "/login" && pathname !== "/signup") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && token.isFirstLogin && pathname !== "/setup") {
    console.log('User is first-time login, redirecting to setup page');
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/","/login", "/signup", "/dashboard", "/setup"],
};
