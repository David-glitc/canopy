import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Canopy: Digital Matter Markets",
    short_name: "Canopy",
    description: "Collect tokenized public and private market positions as Digital Matter on Solana.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d0c10",
    theme_color: "#17151b",
    orientation: "portrait-primary",
    categories: ["finance", "games"],
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
