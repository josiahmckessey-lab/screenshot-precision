export const STARTER_QUESTIONS = [
  { text: "Why can understanding something and changing it be two different things?", slug: "topic-02" },
  { text: "What does it mean that a person is a seed, not a stamp or clay?", slug: "topic-13" },
  { text: "Why can a good thing feel less safe than a familiar hard one?", slug: "topic-01" },
  { text: "What is the difference between wanting something and liking it?", slug: "topic-11" },
  { text: "How does a small choice today change a later one?", slug: "topic-05" },
  { text: "What makes coming back to the same place different from starting over?", slug: "topic-07" },
  { text: "What is a guide, and what does a guide do?", slug: "topic-08" },
  { text: "What happens in the body before a thought forms?", slug: "topic-04" },
] as const;

export type StarterQuestion = (typeof STARTER_QUESTIONS)[number];

export function pickStarterQuestions(previous: readonly StarterQuestion[] = [], random = Math.random): StarterQuestion[] {
  const remaining = STARTER_QUESTIONS.filter((question) => !previous.includes(question));
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