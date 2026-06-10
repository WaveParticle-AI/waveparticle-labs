"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  /** Same-origin URL of the result card image (the OG card) to attach when sharing. */
  imageUrl: string;
};

export default function ShareButtons({ text, imageUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Pre-fetch the card so navigator.share() runs inside the tap's user
  // activation window (Safari rejects share() if we await a fetch first).
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(imageUrl);
        if (!res.ok) return;
        const blob = await res.blob();
        if (!cancelled) {
          fileRef.current = new File([blob], "wave-particle-buddy.png", {
            type: blob.type || "image/png",
          });
        }
      } catch {
        /* image share degrades to link share */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  function currentUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text} ${currentUrl()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  /** Share the image card + caption via the system share sheet. Returns true if handled. */
  async function shareImage(): Promise<boolean> {
    const file = fileRef.current;
    if (!file || typeof navigator === "undefined") return false;
    const payload = {
      files: [file],
      title: "Wave Particle Quiz",
      text: `${text} ${currentUrl()}`,
    };
    if (!navigator.canShare?.({ files: [file] })) return false;
    try {
      await navigator.share(payload);
      return true;
    } catch (err) {
      // User dismissed the sheet — handled; anything else falls through.
      return err instanceof Error && err.name === "AbortError";
    }
  }

  function downloadImage(): boolean {
    const file = fileRef.current;
    if (!file) return false;
    const href = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(href);
    return true;
  }

  async function nativeShare() {
    if (await shareImage()) return;
    const url = currentUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Wave Particle Quiz", text, url });
      } catch {
        /* user dismissed */
      }
    } else {
      void copy();
    }
  }

  // Platform buttons: on devices that can share files (phones — where WhatsApp/
  // Instagram/X actually live) the image rides along via the share sheet. On
  // desktop we download the card and open the platform with the caption so the
  // user can attach it.
  async function shareTo(platform: "wa" | "x" | "ig") {
    if (await shareImage()) return;
    const downloaded = downloadImage();
    const t = encodeURIComponent(`${text} ${currentUrl()}`);
    if (platform === "ig") {
      // Instagram has no web share intent — give them the card + caption.
      void copy();
      flash(downloaded ? "Card saved + caption copied — paste it in Instagram!" : "Caption copied — paste it in Instagram!");
      return;
    }
    if (downloaded) flash("Card saved — attach it to your post!");
    const href =
      platform === "x"
        ? `https://twitter.com/intent/tweet?text=${t}`
        : `https://wa.me/?text=${t}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-row" role="group" aria-label="Share your result">
      <button className="share-btn" onClick={nativeShare}>
        📣 Share my card
      </button>
      <button className="share-btn" onClick={() => shareTo("wa")}>
        💬 WhatsApp
      </button>
      <button className="share-btn" onClick={() => shareTo("x")}>
        𝕏 Post
      </button>
      <button className="share-btn" onClick={() => shareTo("ig")}>
        📸 Instagram
      </button>
      <button className="share-btn" onClick={copy}>
        {copied ? "✓ Copied!" : "🔗 Copy link"}
      </button>
      {notice && <p className="share-note">{notice}</p>}
    </div>
  );
}
