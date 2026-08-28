export type TextChunk = { index: number; content: string };

export function chunkText(text: string, maxChars = 1800, overlap = 250): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];
  const step = Math.max(1, maxChars - overlap);
  const chunks: TextChunk[] = [];
  for (let start = 0; start < normalized.length; start += step) {
    const content = normalized.slice(start, start + maxChars).trim();
    if (content) chunks.push({ index: chunks.length, content });
    if (start + maxChars >= normalized.length) break;
  }
  return chunks;
}
