import { NextResponse } from "next/server";
import { getTextProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }
    const result = await getTextProvider().generate({
      prompt: body.prompt,
      system: body.system,
      temperature: body.temperature,
    });
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
