import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "ka_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/careers/:path*",
    "/career/:path*",
    "/map/:path*",
    "/skills/:path*",
    "/tasks/:path*",
    "/task/:path*",
    "/chat/:path*",
    "/achievements/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
