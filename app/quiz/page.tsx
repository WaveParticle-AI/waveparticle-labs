"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/data/questions";
import { score, encodeVector, type Answers } from "@/lib/scoring";
import { buddyFor } from "@/data/mapping";
import { getSessionId, track } from "@/lib/analytics";
import { quizProgress } from "@/lib/scene-signals";

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[index];
  const progress = Math.round((index / TOTAL_QUESTIONS) * 100);

  // Guards against double-fired events: the exiting card stays tappable for
  // ~240ms (AnimatePresence), and its onClick closes over the OLD question —
  // indexRef always holds the current index, so stale taps are dropped.
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Drive the ambient background: wave-ness ramps with quiz progress.
  useEffect(() => {
    quizProgress.set(index / (TOTAL_QUESTIONS - 1));
  }, [index]);
  useEffect(() => () => quizProgress.set(0), []);
  const finishingRef = useRef(false);

  function choose(optionIndex: number) {
    // Drop taps on a card that's animating out, or after the quiz is finishing.
    if (finishingRef.current || QUESTIONS[indexRef.current].id !== q.id) return;
    const next: Answers = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    // Log the selection (anonymous) — captures partial/abandoned runs too.
    track({
      sessionId: getSessionId(),
      type: "answer",
      questionId: q.id,
      optionIndex,
      optionLabel: q.options[optionIndex].label,
    });
    if (index < TOTAL_QUESTIONS - 1) {
      setIndex(index + 1);
    } else {
      void finish(next);
    }
  }

  async function finish(final: Answers) {
    if (finishingRef.current) return; // double-tap on the last option
    finishingRef.current = true;
    setSubmitting(true);
    const { companion, cluster, mode, vector } = score(final);
    const buddy = buddyFor(companion.id);
    // Event-level result row (Neon, anonymous) — connects answers -> result.
    track({
      sessionId: getSessionId(),
      type: "result",
      buddy: buddy.id,
      cluster: cluster.id,
      mode: mode.id,
    });
    // Fire-and-forget aggregate counter — never block the reveal on it.
    try {
      await fetch("/api/result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companion: companion.id, cluster: cluster.id, mode: mode.id }),
        keepalive: true,
      });
    } catch {
      /* analytics is best-effort */
    }
    const params = new URLSearchParams(encodeVector(vector));
    router.push(`/result/${companion.id}?${params.toString()}`);
  }

  if (submitting) {
    return (
      <main className="wrap screen center">
        <div className="spin" />
        <p className="kicker">Analyzing your work style…</p>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div style={{ height: 28 }} />
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">
        Question {index + 1} / {TOTAL_QUESTIONS}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          className="qcard"
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <h2 className="q-prompt">{q.prompt}</h2>

          <motion.figure
            className="q-meme-card"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.12 }}
          >
            <figcaption className="q-meme-top">{q.memeTop}</figcaption>
            <img className="q-meme-art" src={q.illustration} alt="" aria-hidden />
            <figcaption className="q-meme-bottom">{q.memeBottom}</figcaption>
          </motion.figure>

          <div className="options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className="option"
                onClick={() => choose(i)}
              >
                <span className="option-emoji">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="quiz-foot">
        <button
          className="linklike"
          onClick={() => index > 0 && setIndex(index - 1)}
          disabled={index === 0}
          style={{ opacity: index === 0 ? 0.35 : 1 }}
        >
          ← Back
        </button>
        <span className="linklike">no wrong answers</span>
      </div>

      <p className="doodle-credit">illustrations · Open Doodles (CC0)</p>
    </main>
  );
}
