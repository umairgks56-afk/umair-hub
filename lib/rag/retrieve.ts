import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function retrieveMaterialContext(userId: string, embedding: number[], count = 8) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("match_material_chunks", {
    query_embedding: embedding,
    match_threshold: 0.35,
    match_count: count,
    requested_user_id: userId,
  });
  if (error) throw new Error(`RAG retrieval failed: ${error.message}`);
  return data ?? [];
}
