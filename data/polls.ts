import type { CompanionId } from "./mapping";

export interface PollOption {
  id: string; // redis-key-safe, stable
  label: string;
  emoji: string;
}

export interface Poll {
  id: string; // redis-key-safe, stable; NEVER rename (breaks counters)
  question: string;
  kicker: string; // little meme framing line
  options: [PollOption, PollOption];
}

// One "recast the ending" hot take per companion — fan-bait + story-roadmap research.
export const COMPANION_POLLS: Record<CompanionId, Poll> = {
  heisenberg: {
    id: "heisenberg-fate",
    question: "Walter White went out on his own terms. The verdict?",
    kicker: "say it with your chest",
    options: [
      { id: "earned", label: "He earned that exit", emoji: "👑" },
      { id: "worse", label: "He deserved so much worse", emoji: "💀" },
    ],
  },
  oppenheimer: {
    id: "oppenheimer-fate",
    question: "Knowing everything: Should Oppenheimer have walked away and refused to build it?",
    kicker: "the question that cannot be unanswered",
    options: [
      { id: "walk", label: "Yes — walk away", emoji: "🚶" },
      { id: "inevitable", label: "No — someone would've", emoji: "⚛️" },
    ],
  },
  moriarty: {
    id: "moriarty-fate",
    question: "Moriarty faked his death once already. Should he stay dead?",
    kicker: "every story needs a good old-fashioned villain",
    options: [
      { id: "revive", label: "Bring him back — chaos is fun", emoji: "🃏" },
      { id: "rest", label: "Let him rest, finally", emoji: "⚰️" },
    ],
  },
  villanelle: {
    id: "villanelle-fate",
    question: "Killing Eve killed off Villanelle. Should she live on so the story keeps going?",
    kicker: "the hot take we actually need settled",
    options: [
      { id: "live", label: "Yes — let her live!", emoji: "💅" },
      { id: "rightful", label: "No, that ending was right", emoji: "🔪" },
    ],
  },
  snape: {
    id: "snape-fate",
    question: "Severus Snape: misunderstood tragic hero, or just kind of a bully?",
    kicker: "always.™",
    options: [
      { id: "hero", label: "Misunderstood hero", emoji: "🕯️" },
      { id: "bully", label: "Still a bully, sorry", emoji: "😬" },
    ],
  },
  olivia: {
    id: "olivia-fate",
    question: "Fringe's timeline endings were… a lot. Want a cleaner continuation for Olivia?",
    kicker: "across the multiverse and back",
    options: [
      { id: "more", label: "Yes — more Olivia", emoji: "🔵" },
      { id: "asis", label: "Leave it as it is", emoji: "🌀" },
    ],
  },
  zhenhuan: {
    id: "zhenhuan-fate",
    question: "Zhen Huan won the palace but lost almost everyone. A happy ending?",
    kicker: "the throne is cold",
    options: [
      { id: "bittersweet", label: "A bittersweet win", emoji: "🏯" },
      { id: "rewrite", label: "Too tragic — rewrite it", emoji: "🥀" },
    ],
  },
  iggy: {
    id: "iggy-fate",
    question: "Iggy's heroic sacrifice broke everyone. Should the good boy have survived?",
    kicker: "he deserved the whole world",
    options: [
      { id: "live", label: "LET THE DOG LIVE", emoji: "🐶" },
      { id: "noble", label: "It was noble as-is", emoji: "🫡" },
    ],
  },
};

// Shown to everyone — directly validates Wave Particle's living-story roadmap.
export const UNIVERSAL_POLLS: Poll[] = [
  {
    id: "living-story",
    question: "Would you want your companion's story to keep evolving across every work session?",
    kicker: "this one's a real product question, btw",
    options: [
      { id: "yes", label: "Yes — a living, ongoing story", emoji: "📖" },
      { id: "no", label: "No — keep it simple", emoji: "✂️" },
    ],
  },
  {
    id: "would-it-work",
    question: "Be honest: would a fictional menace actually help you finish your to-do list?",
    kicker: "no wrong answers (there's one wrong answer)",
    options: [
      { id: "unironically", label: "Unironically, yes", emoji: "🔥" },
      { id: "clearly", label: "I need the help, clearly", emoji: "😅" },
    ],
  },
];

export function pollsForCompanion(id: CompanionId): Poll[] {
  return [COMPANION_POLLS[id], ...UNIVERSAL_POLLS];
}

export const ALL_POLLS: Poll[] = [
  ...Object.values(COMPANION_POLLS),
  ...UNIVERSAL_POLLS,
];

export function pollById(id: string): Poll | undefined {
  return ALL_POLLS.find((p) => p.id === id);
}
