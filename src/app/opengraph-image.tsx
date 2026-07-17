import { ImageResponse } from "next/og";

export const alt = "Oniel Alejo Feliz, Full-Stack Developer in Tampa, Florida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f2f0eb",
        color: "#151815",
        padding: "64px 72px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        <span>ONIEL ALEJO FELIZ</span>
        <span style={{ color: "#315bd6" }}>PORTFOLIO / 2026</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 84,
            lineHeight: 0.98,
            letterSpacing: -4,
            maxWidth: 900,
          }}
        >
          Full-Stack Developer
        </div>
        <div style={{ width: 170, height: 7, background: "#315bd6" }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 25,
        }}
      >
        <span>Tampa, Florida</span>
        <span style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 20,
              background: "#315bd6",
            }}
          />{" "}
          Featuring CareerFlow
        </span>
      </div>
    </div>,
    size,
  );
}
