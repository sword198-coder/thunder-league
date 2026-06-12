import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPaths = ["/tournaments", "/account", "/dashboard", "/admin"];
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (user) {
      return NextResponse.redirect(new URL("/tournaments", request.url));
    }
    return response;
  }

  // Protected pages require login
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!user.email_confirmed_at && !pathname.startsWith("/verify-email")) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
