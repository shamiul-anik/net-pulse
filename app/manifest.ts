import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NetPulse",
    short_name: "NetPulse",
    description:
      "Professional real-time network diagnostics and speed intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#38bdf8",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
