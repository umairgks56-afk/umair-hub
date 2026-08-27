export type StudyProgress = {
  attempted: number;
  correct: number;
  accuracy: number;
  masteredTopics: string[];
  weakTopics: string[];
  readiness: number;
};

export function calculateProgress(attempted: number, correct: number): StudyProgress {
  const safeAttempted = Math.max(0, attempted);
  const safeCorrect = Math.min(Math.max(0, correct), safeAttempted);
  const accuracy = safeAttempted ? Math.round((safeCorrect / safeAttempted) * 100) : 0;
  return { attempted: safeAttempted, correct: safeCorrect, accuracy, masteredTopics: [], weakTopics: [], readiness: accuracy };
}
