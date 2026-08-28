export type User = { id: string; name: string; email: string; createdAt: string };
export type Course = { id: string; userId: string; title: string; code?: string; createdAt: string };
export type Material = { id: string; courseId: string; name: string; mimeType: string; size: number; storageKey: string; extractedTextKey?: string; status: "uploaded" | "processing" | "ready" | "failed"; createdAt: string };
export type StudyNote = { id: string; courseId: string; materialIds: string[]; title: string; content: string; createdAt: string; updatedAt: string };
export type Quiz = { id: string; courseId: string; materialIds: string[]; title: string; questionCount: number; createdAt: string };
export type StudyAttempt = { id: string; quizId: string; userId: string; score: number; correct: number; attempted: number; completedAt: string };

/** Storage/database boundary. Replace the in-memory adapter with Postgres/Supabase/Neon without changing UI/domain code. */
export interface DataStore {
  createCourse(input: Omit<Course, "id" | "createdAt">): Promise<Course>;
  createMaterial(input: Omit<Material, "id" | "createdAt">): Promise<Material>;
  getCourse(id: string): Promise<Course | null>;
  listMaterials(courseId: string): Promise<Material[]>;
}
