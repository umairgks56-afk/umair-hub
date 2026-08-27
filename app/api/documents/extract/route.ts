import { NextResponse } from "next/server";
import { extractDocument } from "@/lib/documents/extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Upload a file." }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Maximum file size is 25 MB." }, { status: 413 });
    const document = await extractDocument(file);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not extract document." }, { status: 422 });
  }
}
