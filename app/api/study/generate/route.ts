import { NextResponse } from "next/server";
import { getTextProvider } from "@/lib/ai/providers";
import { buildStudyPrompt, type StudyAction } from "@/lib/study/workflows";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const actions = new Set<StudyAction>(["notes", "mcqs", "tutor", "presentation"]);

async function authenticatedUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data } = await createSupabaseAdminClient().auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!actions.has(body?.action)) return NextResponse.json({ error: "Unsupported study action." }, { status: 400 });

    let source = typeof body?.source === "string" ? body.source.trim() : "";
    const user = await authenticatedUser(request);

    if (body?.materialId) {
      if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      const supabase = createSupabaseAdminClient();
      const { data: material, error } = await supabase
        .from("materials")
        .select("id,extracted_text,status")
        .eq("id", body.materialId)
        .eq("user_id", user.id)
        .single();
      if (error || !material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
      if (material.status !== "ready" || !material.extracted_text?.trim()) {
        return NextResponse.json({ error: "This material is not ready for generation yet." }, { status: 409 });
      }
      source = material.extracted_text.trim();
    }

    if (!source) return NextResponse.json({ error: "Study material is required." }, { status: 400 });
    if (source.length > 120000) source = source.slice(0, 120000);

    const prompt = buildStudyPrompt(body.action, source, body.options ?? {});
    const result = await getTextProvider().generate({ prompt, temperature: 0.2 });
    return NextResponse.json({ action: body.action, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
