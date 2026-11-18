import { createFileRoute } from "@tanstack/react-router";
import { APP_MANIFEST } from "@/lib/app-manifest";

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: () => new Response(JSON.stringify(APP_MANIFEST), {
        headers: { "Content-Type": "application/manifest+json" },
      }),
    },
  },
});