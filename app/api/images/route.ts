import { NextResponse } from "next/server";
import { getConfiguredImageProvider } from "@/lib/ai/xai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.prompt || typeof body.prompt !== "string") return NextResponse.json({ error: "An image prompt is required." }, { status: 400 });
    const result = await getConfiguredImageProvider().generate({ prompt: body.prompt, size: body.size });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image generation failed." }, { status: 503 });
  }
}
