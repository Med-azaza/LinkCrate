import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // This will not fail the build on TypeScript errors
    rollupOptions: {
      onwarn: () => {}, // Suppress warnings
    },
    outDir: "dist",
  },
  esbuild: {
    // Ignore TypeScript errors during build
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
