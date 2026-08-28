import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function getUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const courseId = new URL(request.url).searchParams.get("courseId");
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("presentations").select("id,title,course_id,material_id,slides,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ presentations: data ?? [] });
}

export async function PATCH(request: Request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Presentation id is required." }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (Array.isArray(body.slides)) patch.slides = body.slides;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  patch.updated_at = new Date().toISOString();
  const { data, error } = await createSupabaseAdminClient().from("presentations").update(patch).eq("id", body.id).eq("user_id", user.id).select("id,title,course_id,material_id,slides,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ presentation: data });
}

export async function DELETE(request: Request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Presentation id is required." }, { status: 400 });
  const { error } = await createSupabaseAdminClient().from("presentations").delete().eq("id", body.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
