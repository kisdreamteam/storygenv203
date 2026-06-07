import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function yesNo(value: string | undefined): "yes" | "no" {
  return value && value.trim() !== "" ? "yes" : "no";
}

export default async function SupabaseDebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  let dbStatus = "not tested";
  let dbDetail = "";

  if (yesNo(supabaseUrl) === "yes" && yesNo(anonKey) === "yes") {
    const { data, error } = await supabase
      .from("series_memory")
      .select("id")
      .eq("id", "nina-nino")
      .maybeSingle();

    if (error) {
      dbStatus = "error";
      dbDetail = error.message;
    } else if (data) {
      dbStatus = "ok";
      dbDetail = "series_memory row readable";
    } else {
      dbStatus = "missing row";
      dbDetail = "series_memory id nina-nino not found";
    }
  } else {
    dbStatus = "skipped";
    dbDetail = "Missing URL or anon key";
  }

  const urlLooksValid =
    supabaseUrl && !supabaseUrl.includes("/rest/v1") ? "yes" : "no";

  return (
    <main className="mx-auto min-h-screen max-w-xl p-8">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        ← Back to home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Supabase connection debug</h1>
      <p className="mt-2 text-sm text-gray-600">
        Safe diagnostics only. No secret values are shown.
      </p>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-gray-700">Framework</dt>
          <dd className="text-gray-900">Next.js (App Router)</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Supabase URL present</dt>
          <dd className="text-gray-900">{yesNo(supabaseUrl)}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">URL format valid (no /rest/v1)</dt>
          <dd className="text-gray-900">{urlLooksValid}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Anon/publishable key present</dt>
          <dd className="text-gray-900">{yesNo(anonKey)}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Service role key present (server)</dt>
          <dd className="text-gray-900">{yesNo(serviceRoleKey)}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Current session present</dt>
          <dd className="text-gray-900">{user ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">Authenticated user id</dt>
          <dd className="break-all text-gray-900">{user?.id ?? "—"}</dd>
        </div>
        {authError && (
          <div>
            <dt className="font-medium text-gray-700">Auth error</dt>
            <dd className="text-red-700">{authError.message}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-700">Database read test</dt>
          <dd className="text-gray-900">
            {dbStatus}
            {dbDetail ? ` — ${dbDetail}` : ""}
          </dd>
        </div>
      </dl>
    </main>
  );
}
