"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { quizProgress } from "@/lib/scene-signals";
import { createScene, type SceneHandle } from "./createScene";

const CORAL = "#ff735a";
const AMBER = "#ffb000";

export default function WaveParticleScene({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Set by the mount effect below; effects run top-down, so the route effect
  // always sees a live handle (the scene persists across route changes).
  const sceneRef = useRef<SceneHandle | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lowTier =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.hardwareConcurrency ?? 8) <= 4;
    const scene = createScene(container, {
      particleCount: lowTier ? 3000 : 8000,
      dprCap: lowTier ? 1.5 : 1.75,
    });
    scene.start();
    sceneRef.current = scene;
    onReady?.();

    let detachPointer: (() => void) | undefined;
    if (window.matchMedia("(pointer: fine)").matches) {
      const onMove = (e: PointerEvent) => {
        scene.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          -((e.clientY / window.innerHeight) * 2 - 1)
        );
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      detachPointer = () => window.removeEventListener("pointermove", onMove);
    }

    return () => {
      detachPointer?.();
      sceneRef.current = null;
      scene.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (pathname === "/quiz") {
      scene.setColors(CORAL, AMBER);
      const apply = (p: number) => scene.setWaveTarget(0.15 + 0.8 * p);
      apply(quizProgress.get());
      return quizProgress.subscribe(apply);
    }

    if (pathname.startsWith("/result/")) {
      scene.setWaveTarget(0.95);
      // Deferred a frame so the new route's <main> (which carries the
      // per-buddy --accent override) is in the DOM before we read it.
      const raf = requestAnimationFrame(() => {
        const main = document.querySelector("main");
        const accent = main
          ? getComputedStyle(main).getPropertyValue("--accent").trim()
          : "";
        scene.setColors(accent || CORAL, AMBER);
      });
      return () => cancelAnimationFrame(raf);
    }

    scene.setColors(CORAL, AMBER);
    const breathe = () => {
      scene.setWaveTarget(
        0.25 + Math.sin((Date.now() / 20000) * Math.PI * 2) * 0.12
      );
    };
    breathe();
    const interval = window.setInterval(breathe, 250);
    return () => window.clearInterval(interval);
  }, [pathname]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
