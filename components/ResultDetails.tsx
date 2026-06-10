"use client";

/* eslint-disable @next/next/no-img-element */
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  BINARY_AXES,
  ER_STATES,
  ER_LABEL,
  ER_SUPPORT,
  companionForBuddy,
  isCompanionId,
  type BinaryAxisId,
  type CompanionId,
  type ErState,
} from "@/data/mapping";
import { decodeVector, deriveMode, profileToVector } from "@/lib/scoring";
import { getSessionId, track } from "@/lib/analytics";

// Plain-language, meme-y framing for each work-style axis. The data model keeps
// the dry names (Social Energy, etc.); this is purely how we present them so a
// first-time taker instantly gets what each meter means.
const AXIS_FUN: Record<
  BinaryAxisId,
  {
    title: string;
    left: { emoji: string; label: string };
    right: { emoji: string; label: string };
  }
> = {
  SE: {
    title: "Where you lock in",
    left: { emoji: "🤫", label: "Lone wolf" },
    right: { emoji: "🎧", label: "Crowd energy" },
  },
  EX: {
    title: "How you get it done",
    left: { emoji: "🌊", label: "Go with the flow" },
    right: { emoji: "✅", label: "Checklist gremlin" },
  },
  TM: {
    title: "How your brain solves it",
    left: { emoji: "🔮", label: "Gut & vibes" },
    right: { emoji: "📐", label: "Logic & systems" },
  },
  SI: {
    title: "Story or speedrun?",
    left: { emoji: "⚡", label: "Just the task" },
    right: { emoji: "📖", label: "Here for the story" },
  },
};

const ER_FUN: Record<ErState, { emoji: string; label: string }> = {
  self: { emoji: "🔥", label: "My own fire" },
  accountability: { emoji: "⏰", label: "Deadlines & check-ins" },
  supported: { emoji: "🫂", label: "Hype me up" },
};

export default function ResultDetails({ companionId }: { companionId: CompanionId }) {
  const searchParams = useSearchParams();
  const companion = COMPANIONS[companionId];
  const buddyId = companion.buddy; // the featured study buddy — what the grid highlights / picks

  // The taker's real vector rides in via query params; cold/shared links fall
  // back to this companion's own profile so the page is always meaningful.
  const decoded = decodeVector((k) => searchParams.get(k));
  const vector = decoded ?? profileToVector(companion.profile);
  const mode = deriveMode(vector);
  const picked = searchParams.get("picked") === "1";

  // The buddy the quiz matched you with. It rides along in `ab` once the user
  // starts picking their own, so the highlight always stays on the real match.
  const abParam = searchParams.get("ab");
  const assignedBuddyId: CompanionId =
    abParam && isCompanionId(abParam) ? abParam : buddyId;

  // Pick a different study buddy: the route is keyed on the matched companion, so
  // resolve which companion yields the chosen buddy. Preserve the vector params
  // and pin the originally assigned buddy.
  function pickBuddyHref(buddyChoice: CompanionId): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("picked", "1");
    params.set("ab", assignedBuddyId);
    const qs = params.toString();
    const target = companionForBuddy(buddyChoice);
    return qs ? `/result/${target}?${qs}` : `/result/${target}`;
  }

  return (
    <div className="details">
      <div className="badge-row">
        <span className="badge">{mode.emoji} {mode.name}</span>
        <span className="badge-note">{mode.blurb}</span>
      </div>

      <div className="stats">
        <div className="stats-head">
          <p className="stats-kicker">📊 your work-style stats</p>
          <p>How you actually operate — the real reason we paired you with {COMPANIONS[buddyId].name}.</p>
        </div>

        {BINARY_AXES.map((axis, i) => {
          const value = vector[axis];
          const pct = ((value + 1) / 2) * 100;
          const fun = AXIS_FUN[axis];
          return (
            <div className="stat" key={axis}>
              <p className="stat-title">{fun.title}</p>
              <div className="stat-row">
                <span className={`stat-pole ${value < 0 ? "win" : ""}`}>
                  <span className="e">{fun.left.emoji}</span>
                  {fun.left.label}
                </span>
                <div className="stat-track">
                  <motion.span
                    className="stat-thumb"
                    initial={{ left: "50%" }}
                    whileInView={{ left: `${pct}%` }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.08 }}
                  />
                </div>
                <span className={`stat-pole ${value > 0 ? "win" : ""}`}>
                  <span className="e">{fun.right.emoji}</span>
                  {fun.right.label}
                </span>
              </div>
            </div>
          );
        })}

        <div className="stat">
          <p className="stat-title">What keeps you going</p>
          <div className="er-states">
            {ER_STATES.map((state) => {
              const f = ER_FUN[state];
              return (
                <span key={state} className={`er-state ${state === vector.ER ? "win" : ""}`}>
                  {f.emoji} {f.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="setup-card">
        <span className="tag mono">your wave particle setup</span>
        <p>
          {mode.setup} And because you&apos;re {ER_LABEL[vector.ER].toLowerCase()},{" "}
          {ER_SUPPORT[vector.ER]}
        </p>
      </div>

      <div className="override">
        <p className="override-head">
          {picked ? "↑ that's your buddy now 💁" : "not your vibe? pick a different study buddy"}
        </p>
        <div className="override-grid">
          {ALL_COMPANIONS.map((id) => {
            const c = COMPANIONS[id];
            // Highlight pins to the quiz's match; the user's pick gets its own marker.
            const isAssigned = id === assignedBuddyId;
            const isPicked = picked && id === buddyId && !isAssigned;
            return (
              <Link
                key={id}
                href={pickBuddyHref(id)}
                className={`override-chip ${isAssigned ? "current" : ""} ${isPicked ? "picked" : ""}`}
                aria-current={id === buddyId ? "true" : undefined}
                // The user's OWN choice — the popularity signal (latest pick wins).
                onClick={() => track({ sessionId: getSessionId(), type: "buddy_pick", buddy: id })}
              >
                <img src={c.avatar} alt={c.name} />
                <span>{c.name}</span>
                {isAssigned && <span className="chip-tag">your match</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
