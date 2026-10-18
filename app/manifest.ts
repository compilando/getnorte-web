import type { MetadataRoute } from "next";

/** What a phone or a browser shows when the site is pinned: the name and the compass. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "norte — two-pane file manager",
    short_name: "norte",
    description: "An open-source two-pane file manager for the terminal and the desktop.",
    start_url: "/",
    display: "browser",
    background_color: "#07090A",
    theme_color: "#07090A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
