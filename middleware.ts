import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = pathname === "/";
  const isApiRoute = pathname.startsWith("/api/");
  const hasSession = hasSupabaseAuthCookie(request);

  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = hasSession ? "/stories" : "/";
    return NextResponse.redirect(url);
  }

  if (!hasSession && !isPublicPath) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/stories";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
