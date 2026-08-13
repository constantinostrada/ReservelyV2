import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Proxied so the client calls same-origin paths and nothing has to know a
  // port. Whether the API stays behind /api is open.
  server: { proxy: { "/api": { target: "http://localhost:3100", rewrite: (p) => p.replace(/^\/api/, "") } } },
});
