import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse
) {
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.signOut();
  clearSupabaseAuthCookies(request, response);

  return response;
}
