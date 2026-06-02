import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Deploys to Vercel: nitro emits a Vercel-compatible build under .vercel/output.
// Server entry stays at src/server.ts (our SSR error wrapper).
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
