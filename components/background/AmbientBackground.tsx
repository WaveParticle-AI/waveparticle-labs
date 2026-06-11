"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";

const Scene = dynamic(() => import("./WaveParticleScene"), { ssr: false });

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useReducedMotion(): boolean | null {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => null
  );
}

export default function AmbientBackground() {
  const reducedMotion = useReducedMotion();
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion !== false) return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setIdle(true));
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), 250);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  if (reducedMotion !== false) return null;

  return (
    <div
      className={`ambient-bg${ready ? " is-ready" : ""}`}
      aria-hidden="true"
    >
      {idle ? <Scene onReady={() => setReady(true)} /> : null}
    </div>
  );
}
