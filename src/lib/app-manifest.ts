import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export const APP_MANIFEST = {
  name: APP_NAME,
  short_name: APP_NAME,
  description: APP_DESCRIPTION,
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#1B1511",
  theme_color: "#1B1511",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};