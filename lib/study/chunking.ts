export type TextChunk = { index: number; content: string };

export function chunkText(text: string, maxChars = 4000, overlap = 400): TextChunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxChars, normalized.length);
    chunks.push({ index, content: normalized.slice(start, end) });
    if (end === normalized.length) break;
    start = Math.max(end - overlap, start + 1);
    index += 1;
  }
  return chunks;
}
