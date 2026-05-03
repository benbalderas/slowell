import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getPublicProfile } from "@/lib/profile";

export const runtime = "nodejs"; // need fs for font files
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "slowell profile";

// Satori (next/og) supports .woff but not .woff2 — using the .woff variants
// from /public/fonts. Bold is intentionally absent (project uses Book + Medium only).
const fontsDir = join(process.cwd(), "public", "fonts");
const neueBook = readFileSync(join(fontsDir, "PPNeueMontreal-Book.woff"));
const neueMedium = readFileSync(join(fontsDir, "PPNeueMontreal-Medium.woff"));
const neueBit = readFileSync(join(fontsDir, "PPNeueBit-Regular.woff"));

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function Image({ params }: Props) {
  const { handle: paramHandle } = await params;
  const profile = await getPublicProfile(paramHandle);

  const handle = profile?.user.handle ?? paramHandle;
  const name = profile?.user.displayName ?? `@${handle}`;
  const total = profile?.stats.total ?? 0;
  const covers = (profile?.items ?? []).slice(0, 9).map((i) => i.cover);
  while (covers.length < 9) covers.push(null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#EEF1F1",
          fontFamily: "Neue Montreal",
          padding: 64,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 540,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                width: 96,
                height: 16,
                backgroundColor: "#D3FB67",
                borderRadius: 8,
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 500,
                color: "#000000",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            {profile?.user.displayName ? (
              <div style={{ display: "flex", fontSize: 28, color: "#798686" }}>
                @{handle}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Neue Bit",
                fontSize: 56,
                color: "#000000",
              }}
            >
              {String(total)}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Neue Montreal",
                fontSize: 28,
                color: "#798686",
              }}
            >
              {total === 1 ? "album" : "albums"}
            </div>
          </div>
        </div>

        {/* Satori doesn't support display: grid — flex rows + flex cells. */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {[0, 3, 6].map((rowStart) => (
            <div
              key={rowStart}
              style={{ display: "flex", gap: 8, flex: 1 }}
            >
              {covers.slice(rowStart, rowStart + 3).map((cover, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(121,134,134,0.24)",
                    borderRadius: 8,
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  {cover ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img
                      src={cover}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Neue Montreal", data: neueBook, weight: 400, style: "normal" },
        { name: "Neue Montreal", data: neueMedium, weight: 500, style: "normal" },
        { name: "Neue Bit", data: neueBit, weight: 400, style: "normal" },
      ],
    },
  );
}
