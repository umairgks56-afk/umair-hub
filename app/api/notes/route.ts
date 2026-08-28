import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function getUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function GET(request: Request) {
  const user = await getUser(request); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await createSupabaseAdminClient().from("study_notes").select("id,course_id,title,content,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function PATCH(request: Request) {
  const user = await getUser(request); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null); if (!body?.id) return NextResponse.json({ error: "Note id is required." }, { status: 400 });
  const patch: Record<string,string> = {}; if (typeof body.title === "string") patch.title = body.title.trim(); if (typeof body.content === "string") patch.content = body.content;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  patch.updated_at = new Date().toISOString();
  const { data, error } = await createSupabaseAdminClient().from("study_notes").update(patch).eq("id", body.id).eq("user_id", user.id).select("id,course_id,title,content,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}

export async function DELETE(request: Request) {
  const user = await getUser(request); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null); if (!body?.id) return NextResponse.json({ error: "Note id is required." }, { status: 400 });
  const { error } = await createSupabaseAdminClient().from("study_notes").delete().eq("id", body.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
