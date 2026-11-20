import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const APP_MANIFEST = {
  name: APP_NAME,
  short_name: APP_NAME,
  description: APP_TAGLINE,
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#f8f4ea",
  theme_color: "#f8f4ea",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};