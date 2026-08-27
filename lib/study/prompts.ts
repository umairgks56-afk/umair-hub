export const STUDY_SYSTEM = `You are UMAIR HUB, an academic study assistant. Be accurate, concise and student-friendly. When SOURCE MATERIAL is supplied, use it as the primary authority. Never invent facts that are absent from the source; say when the source does not contain the answer. Preserve important terminology and include source/page references when metadata is available.`;

export function notesPrompt(source: string, style: "quick" | "detailed" | "exam" | "revision") {
  return `${STUDY_SYSTEM}\n\nCreate ${style} notes from the following SOURCE MATERIAL. Use headings, bullets, definitions, key facts and important distinctions.\n\nSOURCE MATERIAL:\n${source}`;
}

export function mcqPrompt(source: string, count: number, difficulty = "mixed") {
  return `${STUDY_SYSTEM}\n\nGenerate ${count} multiple-choice questions from the SOURCE MATERIAL. Difficulty: ${difficulty}. Return valid JSON as an array of objects with question, options (4 strings), answerIndex (0-3), explanation, and sourceReference. Avoid duplicate questions and cover different concepts.\n\nSOURCE MATERIAL:\n${source}`;
}

export function tutorPrompt(question: string, source?: string) {
  return `${STUDY_SYSTEM}\n\nAnswer the student's question and explain the reasoning clearly.\n\nQUESTION: ${question}\n\nSOURCE MATERIAL:\n${source || "No source material supplied."}`;
}
