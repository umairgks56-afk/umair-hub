export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourceReference?: string;
};

export function createQuestionBank(count: number, seed = "umair-hub"): Question[] {
  const safeCount = Math.min(Math.max(Math.floor(count), 1), 10000);
  return Array.from({ length: safeCount }, (_, index) => ({
    id: `${seed}-${index + 1}`,
    question: `Question ${index + 1} will be generated from your selected study material.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0,
    explanation: "The final answer and explanation will be grounded in the selected source.",
  }));
}
