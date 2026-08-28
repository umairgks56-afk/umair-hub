import { studyPrompts } from "@/lib/ai/prompt-templates";

export type StudyAction = "notes" | "mcqs" | "tutor" | "presentation";

export function buildStudyPrompt(action: StudyAction, source: string, options: { question?: string; count?: number; difficulty?: string; topic?: string; slides?: number } = {}) {
  if (!source.trim()) throw new Error("Study material is required.");
  switch (action) {
    case "notes": return studyPrompts.notes(source);
    case "mcqs": return studyPrompts.mcqs(source, options.count ?? 20, options.difficulty ?? "mixed");
    case "tutor": return studyPrompts.tutor(source, options.question ?? "Explain the most important concepts.");
    case "presentation": return studyPrompts.presentation(source, options.topic ?? "Study Topic", options.slides ?? 10);
  }
}

export function validateGeneratedMCQs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => {
    if (!item || typeof item !== "object") return false;
    const x = item as Record<string, unknown>;
    return typeof x.question === "string" && Array.isArray(x.options) && x.options.length === 4 && typeof x.correctAnswer === "number";
  });
}
