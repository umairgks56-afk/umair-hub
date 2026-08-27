export type ExtractedDocument = { name: string; type: string; text: string; pages?: Array<{ page: number; text: string }>; };

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type || "application/octet-stream";
  if (type === "text/plain" || file.name.endsWith(".txt")) return { name: file.name, type, text: buffer.toString("utf8") };
  if (type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdf = (await import("pdf-parse")).default;
    const result = await pdf(buffer);
    return { name: file.name, type, text: result.text, pages: [{ page: 1, text: result.text }] };
  }
  if (type.includes("wordprocessingml") || file.name.toLowerCase().endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { name: file.name, type, text: result.value };
  }
  throw new Error("This file type needs a dedicated parser/OCR provider before it can be indexed.");
}
