import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const token = auth.slice(7);
  const supabase = createSupabaseAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const courseId = String(form.get("courseId") ?? "");
  if (!(file instanceof File) || !courseId) return NextResponse.json({ error: "file and courseId are required." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds the 50 MB limit." }, { status: 413 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

  const { data: course } = await supabase.from("courses").select("id").eq("id", courseId).eq("user_id", userData.user.id).maybeSingle();
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._()\- ]/g, "_");
  const path = `${userData.user.id}/${courseId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("study-materials").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: material, error: materialError } = await supabase.from("materials").insert({ user_id: userData.user.id, course_id: courseId, name: file.name, mime_type: file.type, size: file.size, storage_path: path, status: "uploaded" }).select().single();
  if (materialError) {
    await supabase.storage.from("study-materials").remove([path]);
    return NextResponse.json({ error: materialError.message }, { status: 500 });
  }
  return NextResponse.json({ material }, { status: 201 });
}
