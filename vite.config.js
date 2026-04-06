import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the package in node_modules
      allow: [".."],
    },
  },
  plugins: [react()],
});
