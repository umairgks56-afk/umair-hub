import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function authenticatedUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("courses").select("id,title,code,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ courses: data ?? [] });
}

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string" || !body.title.trim()) return NextResponse.json({ error: "title is required." }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data: course, error } = await supabase.from("courses").insert({ user_id: user.id, title: body.title.trim(), code: body.code ? String(body.code).trim() : null }).select("id,title,code,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ course }, { status: 201 });
}
