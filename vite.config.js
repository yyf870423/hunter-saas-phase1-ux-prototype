import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/hunter-saas-phase1-ux-prototype/",
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ["react-markdown", "remark-gfm"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
