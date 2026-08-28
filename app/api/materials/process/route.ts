import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { extractDocument } from "@/lib/documents/extract";
import { chunkText } from "@/lib/study/chunking";
import { createEmbedding } from "@/lib/study/embeddings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(auth.slice(7));
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  const { materialId } = await request.json().catch(() => ({}));
  if (!materialId) return NextResponse.json({ error: "materialId is required." }, { status: 400 });
  const { data: material, error } = await supabase.from("materials").select("id,storage_path,status,name,mime_type").eq("id", materialId).eq("user_id", userData.user.id).single();
  if (error || !material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
  const { data: file, error: downloadError } = await supabase.storage.from("study-materials").download(material.storage_path);
  if (downloadError || !file) return NextResponse.json({ error: "Unable to download material." }, { status: 502 });
  try {
    await supabase.from("materials").update({ status: "processing" }).eq("id", materialId).eq("user_id", userData.user.id);
    const extracted = await extractDocument(new File([await file.arrayBuffer()], material.name, { type: material.mime_type }));
    if (!extracted.text.trim()) throw new Error("No text could be extracted from this file.");
    const chunks = chunkText(extracted.text);
    await supabase.from("materials").update({ extracted_text: extracted.text, status: "processing" }).eq("id", materialId).eq("user_id", userData.user.id);
    await supabase.from("material_chunks").delete().eq("material_id", materialId).eq("user_id", userData.user.id);
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.content);
      const { error: insertError } = await supabase.from("material_chunks").insert({ material_id: materialId, user_id: userData.user.id, chunk_index: chunk.index, content: chunk.content, embedding });
      if (insertError) throw new Error(`Failed to index material: ${insertError.message}`);
    }
    await supabase.from("materials").update({ status: "ready" }).eq("id", materialId).eq("user_id", userData.user.id);
    return NextResponse.json({ materialId, chunks: chunks.length, status: "ready" });
  } catch (error) {
    await supabase.from("materials").update({ status: "failed" }).eq("id", materialId).eq("user_id", userData.user.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Material processing failed." }, { status: 422 });
  }
}
