import { APP_NAME } from "@/lib/brand";

export const WELCOME_HEADING = `Welcome to ${APP_NAME}`;
export const INTRO_LINES = [
  "Welcome to The Gift",
  "A person is one whole creature, not a pile of separate parts.",
  "Change happens in the whole of a person, one small choice at a time.",
] as const;
export const WELCOME_TEXT = "A person is one whole creature, not a pile of separate parts. Body, mind, memory, and meaning move together, and change happens in the whole of a person, one small choice at a time. This quiet library gathers those ideas, each one held in an image a person can carry, with a door to go deeper. Begin with a question below, or browse the topics.";
export const RESEARCH_HEADING = "A wellbeing library";
export const RESEARCH_TEXT = "The Gift is a wellbeing library for personal growth. It shares ideas about how people change, one topic at a time, and welcomes questions and feedback so the library can be made clearer and more useful. It is not a standalone source of help or guidance, and it is not professional care, crisis care, or medical advice. Questions, messages, and feedback are saved and read by a person later, to answer and to improve the library. Names and accounts are never asked for. An email address is kept only when someone chooses to leave one for a reply. Information is never sold and never shared for advertising. Anyone may stop using it at any time.";
export const ABOUT_HEADING = "About";
export const ABOUT_INTRO_HEADING = "What this is";
export const ABOUT_PARAGRAPHS = [
`${APP_NAME} rests on one picture: a person is a whole creature. Not a mind steering a body, not a wound with a person attached, not a case with a label. Body, memory, belief, relationships, and meaning all move together, and none of them changes in isolation.`,
"Every person is in transition, always. Old patterns still pull, new ones are still forming, and no one is ever finished. The model is built for that ordinary, ongoing stretch, whether the season is calm or hard. Change here is rarely one dramatic moment. A different choice made today leaves a trace that makes the next different choice a little easier. Change builds one small repeat at a time, like a path worn into a field.",
"The ideas draw on research in psychology and neuroscience, such as how habits form, how memories are rewritten when recalled, and why wanting something is different from enjoying it. They draw on long human wisdom about character and community, and on Scripture. Every idea carries an honest label showing how settled it is: Established, Supported, Contested, or Model synthesis. Technical terms appear only when they earn their place, and each is explained in plain words.",
"The people behind this library hold a Christian faith and say so openly. That faith shapes the view that every person has a real design, worth, and direction before doing anything to earn them. No one has to share that faith to use the library. Scripture sits in a closed section on each page, and love and help never depend on belief.",
"The model is held as an advisor, never a judge. When a model and a person disagree, the person wins, because a person is always more particular than any framework.",
"This library is not professional care, not crisis care, and not medical advice. It is a first thread, never an endpoint, and it points toward a guide: a steady person a little further along the same road."
];
export const FRAMEWORK_HEADING = "The framework in six parts";
export const FRAMEWORK_INTRO = "Each part has a picture, a short summary, and the questions people commonly bring to it. Each question opens its topic.";
export const FRAMEWORK_PARTS = [
  {
    "number": 1,
    "title": "The body keeps the lessons",
    "picture": "Picture: two drawers, one of letters and one of reflexes.",
    "summary": "Understanding something and living it are kept in different places. The mind keeps stories, and the body keeps lessons learned under pressure, which answer faster than any thought. A body in alarm cannot rewrite anything, so steadiness comes first. Pulls, cravings, and the draw of the familiar belong here, because wanting something is not the same as agreeing with it.",
    "topics": [
      4,
      2,
      1,
      11
    ]
  },
  {
    "number": 2,
    "title": "How change happens",
    "picture": "Picture: a rising spiral that looks like a circle from above.",
    "summary": "A different choice pays off at the next choice point, not the one just made. Coming back to a familiar place is a higher loop, not a return to the start. The past is not repaired by visiting it, because a memory changes when a present experience contradicts it. What matters most is the direction faced, and what a person does when no one is watching shows what is being written inside.",
    "topics": [
      5,
      7,
      6,
      17,
      18
    ]
  },
  {
    "number": 3,
    "title": "What gets in the way",
    "picture": "Picture: a pair of glasses held in the hand.",
    "summary": "Insight can become a hiding place when it describes a person without changing one. New ideas bounce off frames that were inherited and never chosen. Toughness built to survive is real strength aimed at the wrong target, not a flaw. Holding on to pain can feel like loyalty to what it cost.",
    "topics": [
      3,
      12,
      10,
      9
    ]
  },
  {
    "number": 4,
    "title": "What a person is",
    "picture": "Picture: a seed, not a stamp and not clay.",
    "summary": "A person is not a fixed stamp, and not blank clay shaped by whoever pushes. A person is a seed: a real nature and a real direction, still growing. When something falls away, it is the covering that goes, the way a painting is cleaned and not repainted. The words people use to describe themselves are borrowed glasses, and glasses can be examined and set down.",
    "topics": [
      13,
      14,
      20
    ]
  },
  {
    "number": 5,
    "title": "The road is shared",
    "picture": "Picture: two people on one road, one a half step ahead.",
    "summary": "Change travels best between people. A guide is a steady person a little further along, who walks with another in ordinary life and never takes the wheel. A good framework works like a trellis built from experience, not a mold pressed onto it. Any group that punishes questions or controls where a person goes is a warning sign.",
    "topics": [
      8,
      19
    ]
  },
  {
    "number": 6,
    "title": "The ground underneath",
    "picture": "Picture: being held before getting it right.",
    "summary": "For readers who bring faith, or who ask how faith fits, this part holds the ground under everything else. Love comes first, offered before anything is earned. Change is a participation more than a surrender: a dance in which one will moves with another's lead. Nothing in the library requires this part.",
    "topics": [
      16,
      15
    ]
  }
];
export const ABOUT_GUIDE_TEXT = "A message can go straight to Josiah, a guide.";

// Which framework part each topic belongs to, derived from FRAMEWORK_PARTS so
// the mapping lives in one place. Keyed by topic number.
export const PART_BY_TOPIC: Record<number, { number: number; title: string }> = Object.fromEntries(
  FRAMEWORK_PARTS.flatMap((part) => part.topics.map((topic) => [topic, { number: part.number, title: part.title }])),
);
