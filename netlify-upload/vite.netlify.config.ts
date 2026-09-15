import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Netlify build servers are not the Lovable sandbox, so this preset is respected.
  // Produces a Netlify Functions-compatible bundle plus static assets in dist/.
  nitro: {
    preset: "netlify",
  },
  tanstackStart: {
    // Keep the same SSR entry wrapper used for Hostinger/development.
    server: { entry: "server" },
  },
});
