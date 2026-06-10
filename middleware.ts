import { NextResponse, type NextRequest } from "next/server";
import { copyCookies, updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = pathname === "/";
  const isApiRoute = pathname.startsWith("/api/");
  const isSignOutRoute = pathname === "/auth/signout";

  if (pathname === "/login") {
    const { user, supabaseResponse } = await updateSession(request);
    const url = request.nextUrl.clone();
    url.pathname = user ? "/stories" : "/";
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  const { user, supabaseResponse } = await updateSession(request);

  if (!user && !isPublicPath && !isSignOutRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/";
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/stories";
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
