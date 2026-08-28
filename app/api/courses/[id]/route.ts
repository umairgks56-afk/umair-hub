import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function userFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: course, error } = await supabase.from("courses").select("id,title,code,created_at").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const { data: materials, error: materialsError } = await supabase.from("materials").select("id,name,mime_type,size,status,created_at").eq("course_id", id).eq("user_id", user.id).order("created_at", { ascending: false });
  if (materialsError) return NextResponse.json({ error: materialsError.message }, { status: 500 });
  return NextResponse.json({ course, materials: materials ?? [] });
}
