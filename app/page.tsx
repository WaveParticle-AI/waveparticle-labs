/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { COMPANIONS } from "@/data/mapping";
import { SITE_TAGLINE } from "@/lib/constants";
import Reveal from "@/components/Reveal";

export default function Landing() {
  const companions = Object.values(COMPANIONS);

  return (
    <main className="wrap screen center">
      <Reveal>
        <p className="kicker">Wave Particle · personality lab</p>

        <h1 className="hero-title">
          Which <span className="pop">fictional menace</span> finishes your to-do list?
        </h1>

        <p className="lead">{SITE_TAGLINE} Take the 15 question test and meet your match.</p>
      </Reveal>

      <Reveal delay={0.12}>
        <Link href="/characters" className="companion-strip-link" aria-label="Meet the cast">
          <div className="companion-strip">
            {companions.map((c) => (
              <span className="chip" key={c.id}>
                <img src={c.avatar} alt={c.name} /> {c.name}
              </span>
            ))}
          </div>
        </Link>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="landing-cta">
          <Link href="/quiz" className="btn btn-primary btn-lg" prefetch>
            Start the test →
          </Link>
          <Link href="/characters" className="btn btn-lg">
            Meet the cast
          </Link>
        </div>

        <p className="social-proof">
          Your villain origin story starts with 15 questions.
        </p>
      </Reveal>

      <p className="disclaimer">
        A fan-made personality quiz that matches your work style to a character from
        Wave Particle — an AI goal companion that helps you actually finish things.
      </p>
    </main>
  );
}
