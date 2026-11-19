export const STARTER_QUESTIONS = [
  "Why can understanding something and changing it be two different things?",
  "What does it mean that a person is a seed, not a stamp or clay?",
  "Why can a good thing feel less safe than a familiar hard one?",
  "What is the difference between wanting something and liking it?",
  "How does a small choice today change a later one?",
  "What makes coming back to the same place different from starting over?",
  "What is a guide, and what does a guide do?",
  "What happens in the body before a thought forms?",
] as const;

export function pickStarterQuestions(previous: readonly string[] = [], random = Math.random): string[] {
  const remaining: string[] = STARTER_QUESTIONS.filter((question) => !previous.includes(question));
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = remaining[i];
    const b = remaining[j];
    if (a !== undefined && b !== undefined) {
      remaining[i] = b;
      remaining[j] = a;
    }
  }
  return remaining.slice(0, 4);
}