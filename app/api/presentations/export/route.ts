import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data: userData } = await supabase.auth.getUser(auth.slice(7));
  if (!userData.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Presentation id is required." }, { status: 400 });
  const { data: presentation, error } = await supabase.from("presentations").select("title,slides").eq("id", id).eq("user_id", userData.user.id).single();
  if (error || !presentation) return NextResponse.json({ error: "Presentation not found." }, { status: 404 });

  const pptx = new PptxGenJS();
  pptx.author = "UMAIR HUB";
  pptx.subject = presentation.title;
  pptx.title = presentation.title;
  pptx.company = "UMAIR HUB";
  pptx.layout = "LAYOUT_WIDE";
  const slides = Array.isArray(presentation.slides) ? presentation.slides : [];
  for (const item of slides as Array<{ title?: string; keyPoints?: string[]; speakerNotes?: string }>) {
    const slide = pptx.addSlide();
    slide.background = { color: "F8FAFC" };
    slide.addText(item.title || "Untitled", { x: 0.6, y: 0.5, w: 12, h: 0.6, fontSize: 26, bold: true, color: "0F172A" });
    const points = Array.isArray(item.keyPoints) ? item.keyPoints : [];
    slide.addText(points.map((point) => ({ text: point, options: { bullet: { indent: 18 } } })), { x: 0.8, y: 1.5, w: 11.5, h: 4.5, fontSize: 20, color: "334155", breakLine: true, valign: "top" });
    if (item.speakerNotes) slide.addNotes(item.speakerNotes);
  }
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  return new Response(buffer, { status: 200, headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Content-Disposition": `attachment; filename="${String(presentation.title).replace(/[^a-z0-9-_]+/gi, "-").slice(0, 80)}.pptx"`, "Cache-Control": "private, no-store" } });
}
