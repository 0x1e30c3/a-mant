import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CHAPTER_TYPE_LABELS = ["REBALANCE", "PROTECTION", "MILESTONE", "YIELD CLAIM", "DEPOSIT"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Chapter";
    const type = parseInt(searchParams.get("type") || "0");
    const impact = searchParams.get("impact") || "0";

    const impactNum = parseFloat(impact) / 1e18;
    const hasImpact = impactNum > 0;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #0a0a0f 0%, #14141a 100%)",
            padding: "60px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Top section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Logo & Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "rgba(194,138,30,0.2)",
                  border: "2px solid rgba(194,138,30,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  color: "#ffefc5",
                }}
              >
                ⚡
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#ffefc5",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  a-MANT
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,239,197,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  {CHAPTER_TYPE_LABELS[type] || "CHAPTER"}
                </div>
              </div>
            </div>

            {/* Chapter title */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: "600",
                color: "#faf8f3",
                lineHeight: "1.2",
                maxWidth: "900px",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "100%",
            }}
          >
            {/* Impact badge */}
            {hasImpact && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 24px",
                  borderRadius: "16px",
                  background: "rgba(64,200,120,0.15)",
                  border: "2px solid rgba(64,200,120,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                    color: "#40c878",
                  }}
                >
                  +${impactNum.toFixed(4)}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "rgba(64,200,120,0.8)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Portfolio Impact
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "16px",
                color: "rgba(255,239,197,0.5)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#40c878",
                }}
              />
              Protected by Axiom on Mantle Network
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
