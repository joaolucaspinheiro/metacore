import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(16,185,129,0.25), transparent 50%), radial-gradient(circle at 75% 75%, rgba(16,185,129,0.15), transparent 50%)",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: -2,
            display: "flex",
          }}
        >
          Meta<span style={{ color: "#10b981" }}>Core</span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 24,
            display: "flex",
          }}
        >
          Team Builder e Meta de Pokémon Champions VGC
        </div>
      </div>
    ),
    { ...size }
  );
}
