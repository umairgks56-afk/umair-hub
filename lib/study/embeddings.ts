export async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EDEN_AI_API_KEY;
  if (!apiKey) throw new Error("EDEN_AI_API_KEY is not configured.");
  const response = await fetch("https://api.edenai.run/v2/text/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ providers: "openai", text }),
  });
  if (!response.ok) throw new Error(`Embedding provider failed: ${response.status}`);
  const data = await response.json();
  const vector = data?.openai?.embedding ?? data?.openai?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error("Embedding response did not contain a vector.");
  return vector.map(Number);
}
