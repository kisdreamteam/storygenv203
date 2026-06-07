import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function middlewareConfigError(message: string, status = 503) {
  // #region agent log
  console.error("[StoryGen:middleware] config error", { message, status });
  // #endregion
  return new NextResponse(message, { status });
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // #region agent log
  console.info("[StoryGen:middleware] env check", {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    urlHasRestV1: supabaseUrl?.includes("/rest/v1") ?? false,
    path: request.nextUrl.pathname,
  });
  // #endregion

  if (!supabaseUrl || !supabaseAnonKey) {
    return middlewareConfigError(
      "Server misconfiguration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables, then redeploy."
    );
  }

  if (supabaseUrl.includes("/rest/v1")) {
    return middlewareConfigError(
      "Server misconfiguration: NEXT_PUBLIC_SUPABASE_URL must be https://your-project.supabase.co (no /rest/v1 path)."
    );
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname === "/login";
    const isApiRoute = pathname.startsWith("/api/");

    if (!user && !isLoginPage) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // #region agent log
    console.error("[StoryGen:middleware] uncaught error", {
      path: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    });
    // #endregion
    return new NextResponse("Authentication middleware error.", { status: 500 });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
