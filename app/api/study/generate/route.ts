import { NextResponse } from "next/server";
import { getConfiguredTextProvider } from "@/lib/ai/xai";
import { buildStudyPrompt, type StudyAction } from "@/lib/study/workflows";

const actions = new Set<StudyAction>(["notes", "mcqs", "tutor", "presentation"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!actions.has(body?.action)) return NextResponse.json({ error: "Unsupported study action." }, { status: 400 });
    if (typeof body?.source !== "string" || !body.source.trim()) return NextResponse.json({ error: "Study material is required." }, { status: 400 });
    const prompt = buildStudyPrompt(body.action, body.source, body.options ?? {});
    const result = await getConfiguredTextProvider().generate({ prompt, temperature: 0.2 });
    return NextResponse.json({ action: body.action, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
