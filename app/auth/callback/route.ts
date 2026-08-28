import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirectPath = next && next.startsWith("/") ? next : "/";
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
