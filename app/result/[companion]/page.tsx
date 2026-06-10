/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  buddyFor,
  clusterForCompanion,
  isCompanionId,
} from "@/data/mapping";
import { pollsForCompanion } from "@/data/polls";
import { appUrlFor } from "@/lib/constants";
import { deriveMode, profileToVector } from "@/lib/scoring";
import ShareButtons from "@/components/ShareButtons";
import HotTakePoll from "@/components/HotTakePoll";
import ResultDetails from "@/components/ResultDetails";
import Reveal from "@/components/Reveal";
import AppCtaButton from "@/components/AppCtaButton";

// Pre-render all 8 companion result pages as static HTML — perfect for share crawlers.
export function generateStaticParams() {
  return ALL_COMPANIONS.map((companion) => ({ companion }));
}

type Params = { params: Promise<{ companion: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  if (!isCompanionId(id)) return { title: "Unknown companion" };
  const cluster = clusterForCompanion(id);
  const buddy = buddyFor(id);
  const title = `${buddy.name} — your study buddy`;
  const description = `I'm ${cluster.name} ${cluster.emoji}, so Wave Particle paired me with ${buddy.name}: "${buddy.quote}" Which fictional menace would finish YOUR to-do list?`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Params) {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  if (!isCompanionId(id)) notFound();

  const companion = COMPANIONS[id]; // who you are — drives the archetype + the app handoff, not shown as a profile
  const cluster = clusterForCompanion(id);
  const buddy = buddyFor(id); // your study buddy — the complement who patches your weak loop (the featured character)
  const polls = pollsForCompanion(buddy.id); // Hot Takes are about your study buddy
  const accentStyle = { "--accent": buddy.accent } as CSSProperties;

  // Mode still derives from your own profile. The app handoff carries both who you
  // are (companion) and who you're paired with (buddy), even though only the buddy
  // is shown on the page.
  const mode = deriveMode(profileToVector(companion.profile));
  const ctaUrl = appUrlFor({ companion: id, buddy: buddy.id, cluster: companion.cluster, mode: mode.id });

  const shareText = `My Wave Particle study buddy is ${buddy.name} ${buddy.emoji} — paired to patch my weak spots. Which fictional menace would finish YOUR to-do list?`;

  return (
    <main className="wrap" style={accentStyle}>
      <article className="result-card">
        <p className="kicker center">your study buddy</p>
        <div className="center">
          <div className="cluster-emoji">{cluster.emoji}</div>
          <p className="type-blurb">
            Your work style is <strong>{cluster.name}</strong>. {cluster.blurb} So we&apos;d
            pair you with the companion who patches your weak loop:
          </p>
        </div>

        <Reveal>
          <div className="companion-avatar">
            <img src={buddy.avatar} alt={buddy.name} />
          </div>

          <div className="center">
            <div className="companion-name">{buddy.name}</div>
            <div className="companion-origin">{buddy.origin}</div>
          </div>

          <blockquote className="companion-quote">“{buddy.quote}”</blockquote>

          <p className="workstyle">
            <span className="tag mono">why them: </span>
            {companion.pairingPitch}
          </p>

          <p className="workstyle">
            <span className="tag mono">how they get you to finish: </span>
            {buddy.workStyle}
          </p>

          <div className="flag-grid">
            <div className="flag">
              <span className="tag">green flag ✅</span>
              {buddy.greenFlag}
            </div>
            <div className="flag">
              <span className="tag">the catch 😅</span>
              {buddy.redFlag}
            </div>
          </div>
        </Reveal>

        <Suspense fallback={<div className="spin" />}>
          <ResultDetails companionId={id} />
        </Suspense>

        <ShareButtons text={shareText} imageUrl={`/result/${id}/opengraph-image`} />
      </article>

      <section className="cta-app">
        <h3>Now go finish something with {buddy.name}.</h3>
        <p>
          {buddy.name} is a real companion inside Wave Particle — set a goal,
          get a timed plan, and let them push you to the finish line. They&apos;ll
          run <strong>{mode.name.toLowerCase()}</strong> mode for the way you work.
        </p>
        <AppCtaButton href={ctaUrl} buddy={buddy.id} label={`Start with ${buddy.name} →`} />
      </section>

      <div className="section-head">
        <h2>🔥 Hot Takes</h2>
        <p>Settle the debate about {buddy.name} — and tell us how the story should go.</p>
      </div>
      <HotTakePoll polls={polls} />

      <p className="foot-note">
        <Link href="/quiz">↺ Retake the test</Link> ·{" "}
        <Link href="/characters">Meet the whole cast</Link> · Fan-made &amp; not
        affiliated with the original rights holders.
      </p>
    </main>
  );
}
