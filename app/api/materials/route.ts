import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function userFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const courseId = new URL(request.url).searchParams.get("courseId");
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("materials").select("id,course_id,name,mime_type,size,status,created_at,extracted_text").eq("user_id", user.id).order("created_at", { ascending: false });
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ materials: data ?? [] });
}

export async function DELETE(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const materialId = typeof body?.materialId === "string" ? body.materialId : "";
  if (!materialId) return NextResponse.json({ error: "materialId is required." }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data: material, error: lookupError } = await supabase.from("materials").select("id,storage_path").eq("id", materialId).eq("user_id", user.id).single();
  if (lookupError || !material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
  const { error: removeError } = await supabase.storage.from("study-materials").remove([material.storage_path]);
  if (removeError) return NextResponse.json({ error: `Storage deletion failed: ${removeError.message}` }, { status: 502 });
  const { error } = await supabase.from("materials").delete().eq("id", materialId).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
