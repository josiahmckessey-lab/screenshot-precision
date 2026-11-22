export const STARTER_GROUPS = ["Out of curiosity", "For someone else", "Everyday life", "When something is hard"] as const;
export type StarterQuestion = { text: string; slug: string; group?: typeof STARTER_GROUPS[number] };

export const STARTER_QUESTIONS: readonly StarterQuestion[] = [
  { group: "Out of curiosity", slug: "topic-01", text: "Why do people stick with what is familiar even when something better is offered?" },
  { group: "Out of curiosity", slug: "topic-02", text: "How is knowing something different from being able to do it?" },
  { group: "Out of curiosity", slug: "topic-03", text: "How well do people know their own minds?" },
  { group: "Out of curiosity", slug: "topic-05", text: "How long does it take for a habit to stick?" },
  { group: "Out of curiosity", slug: "topic-11", text: "Why can wanting something and enjoying it come apart?" },
  { group: "Out of curiosity", slug: "topic-13", text: "Is a person fixed, or can people really change?" },
  { group: "For someone else", slug: "topic-08", text: "How can a friend stay steady with someone going through a lot?" },
  { group: "For someone else", slug: "topic-18", text: "How can someone tell if another person's change is real?" },
  { group: "For someone else", slug: "topic-19", text: "How can a group tell whether it is healthy?" },
  { group: "For someone else", slug: "topic-12", text: "Why do some ideas bounce off people?" },
  { group: "Everyday life", slug: "topic-04", text: "Why is it easier to stay steady in some moments than others?" },
  { group: "Everyday life", slug: "topic-17", text: "What does it mean to head the right way, not just get far?" },
  { group: "Everyday life", slug: "topic-20", text: "Where do the words people use about themselves come from?" },
  { group: "Everyday life", slug: "topic-16", text: "Does a person have to earn a place before belonging?" },
  { text: "Why can understanding something and changing it be two different things?", slug: "topic-02" },
  { text: "What does it mean that a person is a seed, not a stamp or clay?", slug: "topic-13" },
  { text: "Why can a good thing feel less safe than a familiar hard one?", slug: "topic-01" },
  { text: "What is the difference between wanting something and liking it?", slug: "topic-11" },
  { text: "How does a small choice today change a later one?", slug: "topic-05" },
  { text: "What makes coming back to the same place different from starting over?", slug: "topic-07" },
  { text: "What is a guide, and what does a guide do?", slug: "topic-08" },
  { text: "What happens in the body before a thought forms?", slug: "topic-04" },
].map((question) => ({ ...question, group: question.group ?? "When something is hard" })) as readonly StarterQuestion[];