import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: logo "U" UMKM-AI warna merah (primary) di atas surface.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff6f6",
          color: "#db1a1a",
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        U
      </div>
    ),
    { ...size },
  );
}
