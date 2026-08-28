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

function parseQuestions(value: string) {
  try {
    const parsed = JSON.parse(value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [];
    return list.filter((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const x = item as Record<string, unknown>;
      return typeof x.question === "string" && Array.isArray(x.options) && x.options.length === 4 && x.options.every((o) => typeof o === "string") && typeof x.correctAnswer === "number" && x.correctAnswer >= 0 && x.correctAnswer < 4;
    });
  } catch { return []; }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!actions.has(body?.action)) return NextResponse.json({ error: "Unsupported study action." }, { status: 400 });
    const user = await authenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    let source = typeof body?.source === "string" ? body.source.trim() : "";
    let courseId: string | null = typeof body?.courseId === "string" ? body.courseId : null;
    const supabase = createSupabaseAdminClient();

    if (body?.materialId) {
      const { data: material, error } = await supabase.from("materials").select("id,course_id,extracted_text,status").eq("id", body.materialId).eq("user_id", user.id).single();
      if (error || !material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
      if (material.status !== "ready" || !material.extracted_text?.trim()) return NextResponse.json({ error: "This material is not ready for generation yet." }, { status: 409 });
      source = material.extracted_text.trim(); courseId = material.course_id;
    }

    if (!source) return NextResponse.json({ error: "Study material is required." }, { status: 400 });
    if (source.length > 120000) source = source.slice(0, 120000);
    const prompt = buildStudyPrompt(body.action, source, body.options ?? {});
    const result = await getTextProvider().generate({ prompt, temperature: 0.2 });

    if (body.action === "notes" && courseId) {
      const { data: note, error } = await supabase.from("study_notes").insert({ user_id: user.id, course_id: courseId, title: body.title?.trim() || "AI Study Notes", content: result }).select("id,title,content,created_at,updated_at").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ action: body.action, result, note });
    }

    if (body.action === "mcqs" && courseId) {
      const questions = parseQuestions(result);
      if (!questions.length) return NextResponse.json({ error: "The AI returned an invalid question set. Please try again." }, { status: 502 });
      const { data: quiz, error } = await supabase.from("quizzes").insert({ user_id: user.id, course_id: courseId, title: body.title?.trim() || "AI Practice Quiz", questions, question_count: questions.length }).select("id,title,questions,question_count,created_at").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ action: body.action, result: JSON.stringify(questions), questions, quiz });
    }

    return NextResponse.json({ action: body.action, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
