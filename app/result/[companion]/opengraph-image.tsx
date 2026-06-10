import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  ALL_COMPANIONS,
  buddyFor,
  clusterForCompanion,
  isCompanionId,
} from "@/data/mapping";

export const runtime = "nodejs";
export const alt = "Your Wave Particle study buddy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender all 8 share cards at build time so social crawlers get them instantly.
export function generateStaticParams() {
  return ALL_COMPANIONS.map((companion) => ({ companion }));
}

// Satori (the OG renderer) can't decode the .webp avatars, so the card reads the
// pre-rendered PNG derivatives from public/companions/og/ instead.
async function avatarSrc(id: string): Promise<string | null> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/companions/og", `${id}.png`),
      "base64",
    );
    return `data:image/png;base64,${data}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ companion: string }>;
}) {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  const valid = isCompanionId(id);
  const buddy = valid ? buddyFor(id) : null;
  const cluster = valid ? clusterForCompanion(id) : null;
  const accent = buddy?.accent ?? "#ff735a";
  const name = buddy?.name ?? "Wave Particle";
  const origin = buddy?.origin ?? "AI goal companion";

  const [anton, inter, interBold, avatar] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Anton-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf")),
    buddy ? avatarSrc(buddy.id) : Promise.resolve(null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "44px 56px 36px",
          background:
            `radial-gradient(700px 700px at 88% 38%, ${accent}59, transparent 70%), ` +
            `radial-gradient(500px 360px at 0% 0%, ${accent}26, transparent 70%), ` +
            "linear-gradient(160deg, #0b0a09, #18120e)",
          color: "#f6eee1",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          {/* Left: the result, spelled out */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: avatar ? 690 : "100%",
              paddingRight: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 21,
                letterSpacing: 5,
                color: `${accent}cc`,
                fontWeight: 700,
              }}
            >
              MY WAVE PARTICLE STUDY BUDDY
            </div>

            {cluster ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 26,
                  fontSize: 28,
                  color: "#f6eee1cc",
                }}
              >
                <span style={{ fontWeight: 700, color: accent }}>
                  {cluster.emoji} {cluster.name}
                </span>
                <span style={{ marginLeft: 12 }}>→ paired with</span>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                fontFamily: "Anton",
                fontSize: name.length > 11 ? 88 : 104,
                lineHeight: 1.04,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginTop: 10,
                textShadow: `0 0 60px ${accent}66`,
              }}
            >
              {name}
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: `2px solid ${accent}`,
                  color: accent,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {buddy ? `${buddy.emoji} ` : ""}
                {origin}
              </div>
            </div>

            {buddy ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 26,
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "#f6eee1",
                }}
              >
                “{buddy.quote}”
              </div>
            ) : null}

            {buddy ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 24,
                  fontSize: 21,
                  lineHeight: 1.4,
                  color: "#f6eee1b3",
                }}
              >
                <div style={{ display: "flex" }}>
                  <span style={{ marginRight: 10 }}>✅</span>
                  <span style={{ display: "flex", flex: 1 }}>{buddy.greenFlag}</span>
                </div>
                <div style={{ display: "flex", marginTop: 8 }}>
                  <span style={{ marginRight: 10 }}>😅</span>
                  <span style={{ display: "flex", flex: 1 }}>{buddy.redFlag}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: the buddy, in the flesh */}
          {avatar ? (
            <div
              style={{
                display: "flex",
                flex: 1,
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  width: 400,
                  height: 400,
                  borderRadius: 999,
                  background: `radial-gradient(circle, ${accent}4d 0%, ${accent}1a 55%, transparent 72%)`,
                  border: `2px solid ${accent}40`,
                }}
              />
              <img
                src={avatar}
                alt=""
                width={440}
                height={440}
                style={{ objectFit: "contain" }}
              />
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 22,
            borderTop: "1px solid #f6eee126",
            fontSize: 22,
            color: "#f6eee18c",
          }}
        >
          <div style={{ display: "flex" }}>
            Which fictional menace would finish YOUR to-do list? →
          </div>
          <div style={{ display: "flex", fontWeight: 700, color: "#f6eee1d9" }}>
            waveparticle.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  );
}
