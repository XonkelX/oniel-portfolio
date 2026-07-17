import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#151815",
        color: "#f2f0eb",
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: -2,
      }}
    >
      OA
    </div>,
    size,
  );
}
