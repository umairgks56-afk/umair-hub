export type StoredMaterial = {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  storageKey: string;
  extractedText?: string;
  createdAt: string;
  status: "uploaded" | "processing" | "ready" | "failed";
};

export type KnowledgeChunk = {
  id: string;
  materialId: string;
  page?: number;
  text: string;
  embedding?: number[];
};
