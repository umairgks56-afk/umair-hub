export type ExtractedDocument = { name: string; type: string; text: string; pages?: Array<{ page: number; text: string }>; };

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type || "application/octet-stream";
  if (type === "text/plain" || file.name.endsWith(".txt")) return { name: file.name, type, text: buffer.toString("utf8") };

  if (type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return {
        name: file.name,
        type,
        text: result.text,
        pages: result.pages?.map((page, index) => ({ page: index + 1, text: page.text })) ?? [{ page: 1, text: result.text }],
      };
    } finally {
      await parser.destroy();
    }
  }

  if (type.includes("wordprocessingml") || file.name.toLowerCase().endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { name: file.name, type, text: result.value };
  }

  throw new Error("This file type is not supported for text indexing yet. Please upload PDF, DOCX or TXT.");
}
