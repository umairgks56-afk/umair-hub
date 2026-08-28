const EMBEDDING_DIMENSIONS = Number(process.env.EDEN_AI_EMBEDDING_DIMENSIONS ?? 384);

export async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EDEN_AI_API_KEY;
  if (!apiKey) throw new Error("EDEN_AI_API_KEY is not configured.");

  const response = await fetch("https://api.edenai.run/v2/text/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      providers: "openai",
      texts: [text],
      response_as_dict: true,
      attributes_as_list: false,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) throw new Error(`Embedding provider failed: ${response.status}`);

  const data = await response.json();
  const provider = data?.openai;
  const vector = provider?.items?.[0]?.embedding ?? provider?.embedding ?? provider?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error("Embedding response did not contain a vector.");

  const normalized = vector.map(Number);
  if (normalized.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding dimension mismatch: received ${normalized.length}, expected ${EMBEDDING_DIMENSIONS}.`);
  }
  return normalized;
}
