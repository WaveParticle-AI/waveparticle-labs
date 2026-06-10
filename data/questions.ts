import type { AxisId, Pole } from "./mapping";

// Each option carries one or more "effects" — a vote for a pole on an axis. A
// single option can feed multiple axes (e.g. Q4 informs both EX and TM), and ER
// questions offer three choices. Scoring tallies these votes; see lib/scoring.ts.
export interface OptionEffect {
  axis: AxisId;
  pole: Pole;
}

export interface QuizOption {
  emoji: string;
  label: string;
  effects: OptionEffect[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  // Meme-template explainer shown under the prompt: a top caption, a CC0 Open
  // Doodle illustration (public/illustrations/<id>.svg), and a bottom caption.
  illustration: string;
  memeTop: string;
  memeBottom: string;
  options: QuizOption[];
}

// Shorthand helpers for readable effect lists.
const e = (axis: AxisId, pole: Pole): OptionEffect => ({ axis, pole });

export const QUESTIONS: QuizQuestion[] = [
  // ---- SE · Social Energy : presence vs solitude --------------------------
  {
    id: "q1",
    prompt: "It's crunch time. What's the move?",
    illustration: "/illustrations/q1.svg",
    memeTop: "deadline: tomorrow",
    memeBottom: "me, sprinting at 2am like an olympic athlete",
    options: [
      { emoji: "📣", label: "Open a call, narrate my whole plan out loud, feed off the energy", effects: [e("SE", "presence")] },
      { emoji: "🚪", label: "Phone face-down, door shut, become completely unreachable", effects: [e("SE", "solitude")] },
    ],
  },
  {
    id: "q2",
    prompt: "You hit a wall mid-task. You…",
    illustration: "/illustrations/q2.svg",
    memeTop: "brain.exe has stopped working",
    memeBottom: "rebooting… please hold…",
    options: [
      { emoji: "🦆", label: "Rubber-duck it out loud / spam the group chat instantly", effects: [e("SE", "presence")] },
      { emoji: "🧠", label: "Go quiet and grind it out inside my own head first", effects: [e("SE", "solitude")] },
    ],
  },
  {
    id: "q3",
    prompt: "Your real focus environment is…",
    illustration: "/illustrations/q3.svg",
    memeTop: "i can ONLY focus",
    memeBottom: "in a café that charges me $7 for the privilege",
    options: [
      { emoji: "☕", label: "Loud café / coworking buzz. Silence is genuinely creepy", effects: [e("SE", "presence")] },
      { emoji: "🎧", label: "Noise-cancelling everything. Just me and the void.", effects: [e("SE", "solitude")] },
    ],
  },

  // ---- EX + TM · Execution Style & Thinking Mode --------------------------
  {
    id: "q4",
    prompt: "Handed a vague project, you FIRST…",
    illustration: "/illustrations/q4.svg",
    memeTop: "the brief: 'just make it good'",
    memeBottom: "me: googling how to start literally anything",
    options: [
      { emoji: "📋", label: "Write the literal, boring, beautiful step-by-step checklist", effects: [e("EX", "checklist"), e("TM", "structured")] },
      { emoji: "🌌", label: "Sketch the big vision and the vibe cause details are future-me's problem", effects: [e("EX", "flow"), e("TM", "intuitive")] },
    ],
  },
  {
    id: "q5",
    prompt: "When in doubt, you trust…",
    illustration: "/illustrations/q5.svg",
    memeTop: "my gut vs the spreadsheet",
    memeBottom: "one of them is definitely lying to me",
    options: [
      { emoji: "📖", label: "What worked last time. Proven recipe, follow it.", effects: [e("TM", "structured")] },
      { emoji: "🔮", label: "A hunch about where this could actually go", effects: [e("TM", "intuitive")] },
    ],
  },
  {
    id: "q6",
    prompt: "The brief says 'be creative.' You…",
    illustration: "/illustrations/q6.svg",
    memeTop: "'be creative,' they said",
    memeBottom: "me, floating into 47 unrelated tangents",
    options: [
      { emoji: "🧱", label: "Need one concrete example to anchor on. Show me.", effects: [e("TM", "structured")] },
      { emoji: "🪁", label: "Am already five wild tangents deep into possibilities", effects: [e("TM", "intuitive")] },
    ],
  },

  // ---- ER · Emotional Regulation : self / accountability / supported (3-way)
  {
    id: "q7",
    prompt: "What actually keeps you moving on a hard task?",
    illustration: "/illustrations/q7.svg",
    memeTop: "what actually keeps me going?",
    memeBottom: "be honest — it's probably not 'discipline'",
    options: [
      { emoji: "🚀", label: "Nothing fancy, I lock in and drive myself", effects: [e("ER", "self")] },
      { emoji: "👮", label: "Knowing someone's checking. Don't make me look bad.", effects: [e("ER", "accountability")] },
      { emoji: "🫶", label: "Someone in my corner going 'you've got this'", effects: [e("ER", "supported")] },
    ],
  },
  {
    id: "q8",
    prompt: "Motivation has fully left the building. What brings it back?",
    illustration: "/illustrations/q8.svg",
    memeTop: "motivation: 0%",
    memeBottom: "fully horizontal and weirdly at peace with it",
    options: [
      { emoji: "🧗", label: "I white-knuckle it solo. My problem to solve.", effects: [e("ER", "self")] },
      { emoji: "⏰", label: "A hard deadline and people waiting on me", effects: [e("ER", "accountability")] },
      { emoji: "☕", label: "A pep talk and a little company", effects: [e("ER", "supported")] },
    ],
  },
  {
    id: "q9",
    prompt: "The finish-line feeling you secretly chase…",
    illustration: "/illustrations/q9.svg",
    memeTop: "the task is finally DONE",
    memeBottom: "now do i want a trophy, a report, or a 'yay you'?",
    options: [
      { emoji: "🏁", label: "Quiet private satisfaction. I know what I did.", effects: [e("ER", "self")] },
      { emoji: "📊", label: "Reporting it DONE to someone who held me to it", effects: [e("ER", "accountability")] },
      { emoji: "🌟", label: "Someone genuinely glad I pulled it off", effects: [e("ER", "supported")] },
    ],
  },

  // ---- EX + ER · how you respond to structure / deadlines -----------------
  {
    id: "q10",
    prompt: "Deadline is Friday. Realistically you finish…",
    illustration: "/illustrations/q10.svg",
    memeTop: "due friday",
    memeBottom: "me: 'friday is basically next week'",
    options: [
      { emoji: "🗓️", label: "Comfortably Wednesday. Planned it Monday, obviously.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🔥", label: "11:58pm Friday. Gloriously. On pure adrenaline.", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },
  {
    id: "q11",
    prompt: "Your to-do list is…",
    illustration: "/illustrations/q11.svg",
    memeTop: "my to-do list:",
    memeBottom: "sacred scripture, or fictional suggestion?",
    options: [
      { emoji: "🛐", label: "Sacred. Sorted, dated, checked off with deep joy.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🌀", label: "A vague suggestion I keep rewriting and ignoring", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },
  {
    id: "q12",
    prompt: "Plans change last-minute. You feel…",
    illustration: "/illustrations/q12.svg",
    memeTop: "the plan just changed",
    memeBottom: "thriving? or quietly unraveling? pick one.",
    options: [
      { emoji: "😤", label: "Personally attacked. I had a SYSTEM.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🕊️", label: "Free, honestly. Improvising is when I'm actually good.", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },

  // ---- SI · Story Immersion : narrative vs ignore (the moat) --------------
  {
    id: "q13",
    prompt: "When you're working, your companion should feel like…",
    illustration: "/illustrations/q13.svg",
    memeTop: "a study buddy should be…",
    memeBottom: "a cold efficient tool, or a whole bonded character?",
    options: [
      { emoji: "🔧", label: "A tool that helps me finish tasks, efficiently", effects: [e("SI", "ignore")] },
      { emoji: "🎭", label: "A character I actually build a bond with over time", effects: [e("SI", "narrative"), e("ER", "supported")] },
    ],
  },
  {
    id: "q14",
    prompt: "You're stuck. You want your companion to…",
    illustration: "/illustrations/q14.svg",
    memeTop: "stuck and spiraling",
    memeBottom: "want orders, or want to vibe it out together?",
    options: [
      { emoji: "🧭", label: "Give me the direct next step and structure my move", effects: [e("ER", "accountability"), e("EX", "checklist")] },
      { emoji: "🗣️", label: "Talk it through with me and evolve the plan together", effects: [e("ER", "supported"), e("EX", "flow")] },
    ],
  },
  {
    id: "q15",
    prompt: "You finish a task. You want your companion to…",
    illustration: "/illustrations/q15.svg",
    memeTop: "task complete!",
    memeBottom: "just tick it off or unlock new lore?",
    options: [
      { emoji: "✔️", label: "Just confirm it's done and move to the next thing", effects: [e("SI", "ignore")] },
      { emoji: "🌍", label: "Update the story world based on what I just did", effects: [e("SI", "narrative")] },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
