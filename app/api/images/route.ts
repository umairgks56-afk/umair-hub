import { NextResponse } from "next/server";
import { getImageProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "An image prompt is required." }, { status: 400 });
    }
    const result = await getImageProvider().generate({ prompt: body.prompt, size: body.size });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
