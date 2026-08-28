import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkText } from "@/lib/study/chunking";
import { createEmbedding } from "@/lib/study/embeddings";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { materialId } = await request.json().catch(() => ({}));
  if (!materialId) return NextResponse.json({ error: "materialId is required." }, { status: 400 });

  const { data: material, error } = await supabase.from("materials").select("id,storage_path,status").eq("id", materialId).eq("user_id", user.id).single();
  if (error || !material) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  const { data: file, error: downloadError } = await supabase.storage.from("study-materials").download(material.storage_path);
  if (downloadError || !file) return NextResponse.json({ error: "Unable to download material." }, { status: 502 });

  // Text extraction is deliberately isolated: binary PDF/PPTX/DOCX parsing can be plugged in here
  // without changing the RAG persistence contract.
  const text = await file.text();
  if (!text.trim()) return NextResponse.json({ error: "No text could be extracted from this file." }, { status: 422 });

  const chunks = chunkText(text);
  await supabase.from("materials").update({ extracted_text: text, status: "processing" }).eq("id", materialId).eq("user_id", user.id);
  await supabase.from("material_chunks").delete().eq("material_id", materialId).eq("user_id", user.id);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content);
    const { error: insertError } = await supabase.from("material_chunks").insert({ material_id: materialId, user_id: user.id, chunk_index: chunk.index, content: chunk.content, embedding });
    if (insertError) {
      await supabase.from("materials").update({ status: "failed" }).eq("id", materialId).eq("user_id", user.id);
      return NextResponse.json({ error: "Failed to index material." }, { status: 500 });
    }
  }

  await supabase.from("materials").update({ status: "ready" }).eq("id", materialId).eq("user_id", user.id);
  return NextResponse.json({ materialId, chunks: chunks.length, status: "ready" });
}
